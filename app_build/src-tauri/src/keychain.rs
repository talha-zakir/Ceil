use keyring::Entry;
use tauri::command;
use log::info;

#[command]
#[allow(non_snake_case)]
pub fn save_api_key(provider: String, apiKey: String) -> Result<(), String> {
    let entry = Entry::new(&format!("ceil_dashboard_{}", provider), "user").map_err(|e| e.to_string())?;
    entry.set_password(&apiKey).map_err(|e| e.to_string())?;
    info!("Saved API key for {}", provider);
    Ok(())
}

#[command]
pub fn get_api_key(provider: String) -> Result<Option<String>, String> {
    let entry = Entry::new(&format!("ceil_dashboard_{}", provider), "user").map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn delete_api_key(provider: String) -> Result<(), String> {
    let entry = Entry::new(&format!("ceil_dashboard_{}", provider), "user").map_err(|e| e.to_string())?;
    match entry.delete_credential() {
        Ok(_) => {
            info!("Deleted API key for {}", provider);
            Ok(())
        },
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub async fn test_api_key(provider: String, apiKey: String) -> Result<bool, String> {
    let client = reqwest::Client::new();
    match provider.as_str() {
        "openai" => {
            let res = client.get("https://api.openai.com/v1/models")
                .header("Authorization", format!("Bearer {}", apiKey))
                .send()
                .await
                .map_err(|e| e.to_string())?;
            Ok(res.status().is_success())
        }
        "anthropic" => {
            let res = client.post("https://api.anthropic.com/v1/messages")
                .header("x-api-key", &apiKey)
                .header("anthropic-version", "2023-06-01")
                .json(&serde_json::json!({
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 1,
                    "messages": [{"role": "user", "content": "Ping"}]
                }))
                .send()
                .await
                .map_err(|e| e.to_string())?;
            Ok(res.status() != reqwest::StatusCode::UNAUTHORIZED && res.status() != reqwest::StatusCode::FORBIDDEN)
        }
        "gemini" => {
            let res = client.get(format!("https://generativelanguage.googleapis.com/v1beta/models?key={}", apiKey))
                .send()
                .await
                .map_err(|e| e.to_string())?;
            Ok(res.status().is_success())
        }
        "groq" => {
            let res = client.get("https://api.groq.com/openai/v1/models")
                .header("Authorization", format!("Bearer {}", apiKey))
                .send()
                .await
                .map_err(|e| e.to_string())?;
            Ok(res.status().is_success())
        }
        "mistral" => {
            let res = client.get("https://api.mistral.ai/v1/models")
                .header("Authorization", format!("Bearer {}", apiKey))
                .send()
                .await
                .map_err(|e| e.to_string())?;
            Ok(res.status().is_success())
        }
        _ => Err("Unknown provider".to_string()),
    }
}
