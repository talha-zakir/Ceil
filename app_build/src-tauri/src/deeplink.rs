use tauri::{AppHandle, Emitter};
use url::Url;
use log::{info, error};

pub fn handle_deep_link(app: &AppHandle, url_str: String) {
    info!("Received deep link: {}", url_str);
    if let Ok(url) = Url::parse(&url_str) {
        if url.scheme() == "apidash" && url.host_str() == Some("auth") {
            let token = url.query_pairs().find(|(k, _)| k == "token").map(|(_, v)| v.into_owned());
            if let Some(t) = token {
                info!("Extracted token from deep link");
                if let Err(e) = app.emit("auth-token-received", t) {
                    error!("Failed to emit auth token: {}", e);
                }
            } else {
                error!("No token found in auth deep link");
            }
        }
    } else {
        error!("Failed to parse deep link URL");
    }
}
