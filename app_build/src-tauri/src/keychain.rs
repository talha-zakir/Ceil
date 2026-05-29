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
