use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

const PRODUCTIVITY_DATA_FILE: &str = "productivity-data.json";

fn productivity_data_path(app: &AppHandle) -> Result<PathBuf, String> {
  let app_data_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
  fs::create_dir_all(&app_data_dir).map_err(|error| error.to_string())?;
  Ok(app_data_dir.join(PRODUCTIVITY_DATA_FILE))
}

#[tauri::command]
fn load_productivity_data(app: AppHandle) -> Result<Option<String>, String> {
  let data_path = productivity_data_path(&app)?;

  if !data_path.exists() {
    return Ok(None);
  }

  fs::read_to_string(data_path)
    .map(Some)
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_productivity_data(app: AppHandle, json: String) -> Result<(), String> {
  let data_path = productivity_data_path(&app)?;
  fs::write(data_path, json).map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      load_productivity_data,
      save_productivity_data,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
