@echo off
npx @tauri-apps/cli init --ci --app-name ceil --window-title "Ceil Dashboard" --frontend-dist "../out" --dev-url "http://localhost:3000" --before-dev-command "npm run dev" --before-build-command "npm run build"
