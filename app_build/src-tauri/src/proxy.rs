use std::convert::Infallible;
use std::net::SocketAddr;
use hyper::{body::Bytes, Request, Response, server::conn::http1, service::service_fn};
use hyper_util::rt::TokioIo;
use tokio::net::TcpListener;
use tauri::{AppHandle, Emitter, Manager, State};
use log::{info, error};
use http_body_util::{BodyExt, Full};
use serde::{Serialize, Deserialize};
use reqwest::Client;
use std::sync::Mutex;
use std::collections::HashMap;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct ProxyConfig {
    #[serde(rename = "failoverEnabled")]
    pub failover_enabled: bool,
    #[serde(rename = "fallbackRules")]
    pub fallback_rules: HashMap<String, String>,
}

pub struct AppState {
    pub config: Mutex<ProxyConfig>,
}

#[tauri::command]
pub fn update_proxy_config(
    config: ProxyConfig,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut current_config = state.config.lock().map_err(|e| e.to_string())?;
    *current_config = config;
    info!("Updated proxy configuration: {:?}", *current_config);
    Ok(())
}

#[derive(Serialize, Clone)]
pub struct RateLimitInfo {
    pub provider: String,
    pub limit: String,
    pub remaining: String,
    pub reset: String,
}

pub async fn start_proxy(app_handle: AppHandle) {
    let addr = SocketAddr::from(([127, 0, 0, 1], 9999));
    let listener = match TcpListener::bind(addr).await {
        Ok(l) => l,
        Err(e) => {
            error!("Failed to bind proxy listener: {}", e);
            return;
        }
    };
    info!("Proxy server listening on http://{}", addr);

    let client = Client::new();

    loop {
        let (stream, _) = match listener.accept().await {
            Ok(s) => s,
            Err(e) => {
                error!("Failed to accept connection: {}", e);
                continue;
            }
        };

        let io = TokioIo::new(stream);
        let app = app_handle.clone();
        let client_clone = client.clone();
        
        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(io, service_fn(move |req| handle_request(req, app.clone(), client_clone.clone())))
                .await
            {
                error!("Error serving connection: {}", err);
            }
        });
    }
}

async fn handle_request(
    req: Request<hyper::body::Incoming>,
    app_handle: AppHandle,
    client: Client,
) -> Result<Response<Full<Bytes>>, Infallible> {
    let method = req.method().clone();
    let mut target_url = req.uri().to_string();
    
    // Copy headers into an owned vector before consuming req body
    let req_headers: Vec<(String, Vec<u8>)> = req.headers()
        .iter()
        .map(|(k, v)| (k.as_str().to_string(), v.as_bytes().to_vec()))
        .collect();

    // If it's a relative URL, we need to know the target. 
    // We check for a custom header, or map based on path.
    if target_url.starts_with('/') {
        let target_header = req_headers.iter()
            .find(|(k, _)| k.to_lowercase() == "x-proxy-target")
            .and_then(|(_, v)| std::str::from_utf8(v).ok());
            
        if let Some(t) = target_header {
            target_url = format!("{}{}", t, target_url);
        } else if target_url.starts_with("/v1/") {
            // Default to OpenAI if no target specified and it looks like an OpenAI endpoint
            target_url = format!("https://api.openai.com{}", target_url);
        } else {
            let resp = Response::builder()
                .status(400)
                .body(Full::new(Bytes::from("Missing x-proxy-target header for relative URL")))
                .unwrap();
            return Ok(resp);
        }
    }
    
    info!("Proxying request to {}", target_url);

    let mut req_builder = client.request(
        reqwest::Method::from_bytes(method.as_str().as_bytes()).unwrap_or(reqwest::Method::GET),
        &target_url,
    );
    
    for (key, value) in &req_headers {
        if key.to_lowercase() != "host" {
            req_builder = req_builder.header(key, value.as_slice());
        }
    }
    
    let body_bytes = match req.into_body().collect().await {
        Ok(b) => b.to_bytes(),
        Err(_) => Bytes::new(),
    };
    
    req_builder = req_builder.body(body_bytes.clone());
    
    let res = req_builder.send().await;

    // Load proxy configuration state
    let mut config_failover_enabled = false;
    let mut fallback_rules = std::collections::HashMap::new();
    if let Some(state) = app_handle.try_state::<crate::AppState>() {
        if let Ok(cfg) = state.config.lock() {
            config_failover_enabled = cfg.failover_enabled;
            fallback_rules = cfg.fallback_rules.clone();
        }
    }

    match res {
        Ok(response) => {
            // Check for Rate Limit Exceeded status (429) and if failover is enabled
            if response.status() == reqwest::StatusCode::TOO_MANY_REQUESTS && config_failover_enabled {
                let current_provider = get_provider_from_url(&target_url);
                if let Some(fallback_provider) = fallback_rules.get(&current_provider) {
                    info!("Auto-failover triggered: {} is rate-limited. Trying fallback to {}", current_provider, fallback_provider);
                    
                    // Fetch fallback API key from Keychain
                    if let Ok(Some(fallback_api_key)) = crate::keychain::get_api_key(fallback_provider.clone()) {
                        let current_base = get_url_for_provider(&current_provider);
                        let fallback_base = get_url_for_provider(fallback_provider);
                        let rewritten_url = target_url.replace(&current_base, &fallback_base);
                        
                        let mut fallback_builder = client.request(
                            reqwest::Method::from_bytes(method.as_str().as_bytes()).unwrap_or(reqwest::Method::GET),
                            &rewritten_url,
                        );
                        
                        for (key, value) in &req_headers {
                            let name_str = key.to_lowercase();
                            if name_str != "host" {
                                if name_str == "authorization" || name_str == "api-key" || name_str == "x-api-key" {
                                    let auth_val = format_auth_header(fallback_provider, &fallback_api_key);
                                    fallback_builder = fallback_builder.header(key, &auth_val);
                                } else {
                                    fallback_builder = fallback_builder.header(key, value.as_slice());
                                }
                            }
                        }
                        
                        fallback_builder = fallback_builder.body(body_bytes);
                        if let Ok(fallback_res) = fallback_builder.send().await {
                            info!("Auto-failover request succeeded with status: {}", fallback_res.status());
                            
                            // Emit notification event to Next.js UI
                            let _ = app_handle.emit("failover-occurred", serde_json::json!({
                                "original": current_provider,
                                "fallback": fallback_provider
                            }));
                            
                            extract_and_emit_rate_limits(&fallback_res, &app_handle, &rewritten_url);
                            return build_hyper_response(fallback_res).await;
                        }
                    }
                }
            }

            extract_and_emit_rate_limits(&response, &app_handle, &target_url);
            build_hyper_response(response).await
        }
        Err(e) => {
            error!("Proxy request failed: {}", e);
            let response = Response::builder()
                .status(502)
                .body(Full::new(Bytes::from("Bad Gateway")))
                .unwrap();
            Ok(response)
        }
    }
}

fn get_provider_from_url(url: &str) -> String {
    if url.contains("api.openai.com") {
        "openai".to_string()
    } else if url.contains("api.anthropic.com") {
        "anthropic".to_string()
    } else if url.contains("generativelanguage.googleapis.com") {
        "gemini".to_string()
    } else {
        "unknown".to_string()
    }
}

fn get_url_for_provider(provider: &str) -> String {
    match provider {
        "openai" => "https://api.openai.com".to_string(),
        "anthropic" => "https://api.anthropic.com".to_string(),
        "gemini" => "https://generativelanguage.googleapis.com".to_string(),
        _ => "".to_string(),
    }
}

fn format_auth_header(provider: &str, api_key: &str) -> String {
    match provider {
        "openai" => format!("Bearer {}", api_key),
        "anthropic" => api_key.to_string(),
        "gemini" => api_key.to_string(),
        _ => api_key.to_string(),
    }
}

async fn build_hyper_response(res: reqwest::Response) -> Result<Response<Full<Bytes>>, Infallible> {
    let mut response = Response::builder()
        .status(res.status().as_u16());
        
    if let Some(headers) = response.headers_mut() {
        for (key, value) in res.headers() {
            if let Ok(name) = hyper::header::HeaderName::from_bytes(key.as_str().as_bytes()) {
                if let Ok(val) = hyper::header::HeaderValue::from_bytes(value.as_bytes()) {
                    headers.insert(name, val);
                }
            }
        }
    }
    
    let body_bytes = res.bytes().await.unwrap_or_default();
    Ok(response.body(Full::new(body_bytes)).unwrap())
}

fn extract_and_emit_rate_limits(res: &reqwest::Response, app: &AppHandle, url: &str) {
    let headers = res.headers();
    let mut provider = "Unknown".to_string();
    
    if url.contains("api.openai.com") {
        provider = "OpenAI".to_string();
    } else if url.contains("api.anthropic.com") {
        provider = "Anthropic".to_string();
    } else if url.contains("api.groq.com") {
        provider = "Groq".to_string();
    } else if url.contains("api.mistral.ai") {
        provider = "Mistral".to_string();
    } else if url.contains("generativelanguage.googleapis.com") {
        provider = "Gemini".to_string();
    }
    
    let limit = headers.get("x-ratelimit-limit-requests")
        .or_else(|| headers.get("x-ratelimit-limit"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();
        
    let remaining = headers.get("x-ratelimit-remaining-requests")
        .or_else(|| headers.get("x-ratelimit-remaining"))
        .or_else(|| headers.get("x-ratelimit-remaining-tokens"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();
        
    let reset = headers.get("x-ratelimit-reset-requests")
        .or_else(|| headers.get("x-ratelimit-reset"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    if !limit.is_empty() || !remaining.is_empty() {
        let info = RateLimitInfo {
            provider,
            limit,
            remaining,
            reset,
        };
        if let Err(e) = app.emit("rate-limit-updated", info) {
            error!("Failed to emit rate limit info: {}", e);
        }
    }
}
