mod keychain;
mod proxy;
mod deeplink;

use tauri::Listener;
use tauri::tray::TrayIconBuilder;
use tauri::menu::{Menu, MenuItem};
use std::sync::Mutex;
use std::collections::HashMap;

pub use proxy::{AppState, ProxyConfig, update_proxy_config};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            config: Mutex::new(ProxyConfig {
                failover_enabled: false,
                fallback_rules: HashMap::new(),
                daily_spend_limit: 0.0,
                rogue_loop_protection: false,
                max_requests_per_minute: 60,
            }),
            request_timestamps: Mutex::new(Vec::new()),
            daily_spend: Mutex::new(0.0),
            last_spend_reset: Mutex::new(std::time::SystemTime::now()),
        })
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let handle = app.handle().clone();
            
            // Listen for deep link events
            let dl_handle = handle.clone();
            app.listen("deep-link://new-url", move |event| {
                let payload = event.payload();
                if let Ok(urls) = serde_json::from_str::<Vec<String>>(payload) {
                    for url in urls {
                        deeplink::handle_deep_link(&dl_handle, url);
                    }
                } else if let Ok(url) = serde_json::from_str::<String>(payload) {
                    deeplink::handle_deep_link(&dl_handle, url);
                }
            });

            // Start Proxy Server
            let proxy_handle = handle.clone();
            tauri::async_runtime::spawn(async move {
                proxy::start_proxy(proxy_handle).await;
            });
            
            // Setup System Tray
            #[cfg(desktop)]
            {
                let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&quit_i])?;
                
                if let Some(icon) = app.default_window_icon().cloned() {
                    let _tray = TrayIconBuilder::new()
                        .menu(&menu)
                        .on_menu_event(|_app, event| {
                            if event.id.as_ref() == "quit" {
                                _app.exit(0);
                            }
                        })
                        .icon(icon)
                        .build(app)?;
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            keychain::save_api_key,
            keychain::get_api_key,
            keychain::delete_api_key,
            keychain::test_api_key,
            update_proxy_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
