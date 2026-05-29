use keyring::Entry;
use tauri::command;
use log::{info, error};

#[command]
pub fn save_api_key(service: String, key: String) -> Result<(), String> {
    let entry = Entry::new(&format!("ceil_dashboard_{}", service), "user").map_err(|e| e.to_string())?;
    entry.set_password(&key).map_err(|e| e.to_string())?;
    info!("Saved API key for {}", service);
    Ok(())
}

#[command]
pub fn get_api_key(service: String) -> Result<Option<String>, String> {
    let entry = Entry::new(&format!("ceil_dashboard_{}", service), "user").map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn delete_api_key(service: String) -> Result<(), String> {
    let entry = Entry::new(&format!("ceil_dashboard_{}", service), "user").map_err(|e| e.to_string())?;
    match entry.delete_password() {
        Ok(_) => {
            info!("Deleted API key for {}", service);
            Ok(())
        },
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
