# Codex OS（Windows 95 Boot Simulator）

這是一個用於課程示範／操作練習的「Windows 95 風格」開機與桌面模擬器（網頁版）。

## 啟動方式（本機）

1. 安裝依賴：`npm install`
2. 啟動開發伺服器：`npm run dev`
3. 打開終端機顯示的網址（通常是 `http://localhost:5173`）

如果你在 Windows PowerShell 遇到「running scripts is disabled」錯誤，改用：

- `npm.cmd install`
- `npm.cmd run dev`

## GitHub Pages 部署

專案已包含 `.github/workflows/deploy.yml`，推到 `main` 分支後會自動：

- `npm ci`
- `npm run build`
- 將 `dist/` 部署到 GitHub Pages

## 課程模擬操作說明

進入頁面後會先看到「80586 主機面板」啟動前畫面（必須按到正確開關才會開機）。

1. （可選）先按 **Sound: OFF/ON** 切換音效（依課程需要決定是否開啟）。
2. 在面板上找到正確的電源開關後，才會開始播放開機流程。
2. 進入桌面後，從左下角 **Start** 開始操作。
3. 建議示範順序：
   - Dial-Up Networking（連線/斷線）
   - Internet Explorer（連線狀態差異）
   - Paint（簡單繪圖）
   - Notepad（文字輸入/儲存）
4. 要模擬離線狀態：在 Dial-Up 視窗按 **Disconnect**，再回到 IE 會看到離線提示。

## 專案結構（重點）

- `index.html`：入口
- `main.js`：主程式（UI/開機流程/視窗管理）
- `style.css`：主要樣式
- `images/`：桌布與課程用截圖/圖示素材

## 推到 GitHub 前注意

- `node_modules/` 已在 `.gitignore`，請不要提交到 GitHub。
