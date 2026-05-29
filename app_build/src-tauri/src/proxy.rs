use std::convert::Infallible;
use std::net::SocketAddr;
use hyper::{body::Bytes, Request, Response, server::conn::http1, service::service_fn};
use hyper_util::rt::TokioIo;
use tokio::net::TcpListener;
use tauri::{AppHandle, Emitter};
use log::{info, error};
use http_body_util::{BodyExt, Full};
use serde::Serialize;
use reqwest::Client;

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
    
    // If it's a relative URL, we need to know the target. 
    // We check for a custom header, or map based on path.
    if target_url.starts_with('/') {
        if let Some(target) = req.headers().get("x-proxy-target") {
            if let Ok(t) = target.to_str() {
                target_url = format!("{}{}", t, target_url);
            }
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
    
    for (key, value) in req.headers() {
        if key.as_str().to_lowercase() != "host" {
            req_builder = req_builder.header(key.as_str(), value.as_bytes());
        }
    }
    
    let body_bytes = match req.into_body().collect().await {
        Ok(b) => b.to_bytes(),
        Err(_) => Bytes::new(),
    };
    req_builder = req_builder.body(body_bytes);
    
    match req_builder.send().await {
        Ok(res) => {
            extract_and_emit_rate_limits(&res, &app_handle, &target_url);
            
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
