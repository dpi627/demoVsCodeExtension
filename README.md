# Copilot Config Manager

一個用於管理 GitHub Copilot 配置檔案的 Visual Studio Code 擴展。

## ⚠️ 重要說明

**此擴展僅管理當前工作空間專案的配置檔案，不會影響全域設定**

- ✅ 只操作當前專案目錄下的 `.github/` 資料夾
- ✅ 每個專案可以有獨立的 Copilot 行為設定
- ✅ 不會修改 GitHub Copilot 的全域配置
- ✅ 不會影響其他專案的 Copilot 設定

## 功能特色

- 🔧 **統一管理**：在一個界面中管理所有 Copilot 配置檔案
- 📝 **即時編輯**：直接在 VSCode 中編輯配置內容
- 🔍 **狀態檢查**：自動檢測配置檔案是否存在
- 💾 **一鍵儲存**：快速儲存或重設配置檔案
- 🌏 **繁體中文**：完整的繁體中文界面和預設內容

## 支援的配置檔案

### 1. copilot-instructions.md
- **用途**：GitHub Copilot 的通用指令設定
- **功能**：設定編程風格、語言偏好、程式碼規範等

### 2. copilot-commit-message-instructions.md
- **用途**：Commit 訊息生成指令
- **功能**：定義 commit 訊息的格式、類型和語言風格

### 3. copilot-review-instructions.md
- **用途**：程式碼審查指令
- **功能**：設定程式碼審查的標準和重點項目

### 4. copilot-chat-instructions.md
- **用途**：Copilot Chat 對話設定
- **功能**：定義 AI 對話的風格和回應方式

### 5. copilot-code-instructions.md
- **用途**：程式碼生成指令
- **功能**：設定程式碼生成的風格和標準

### 6. copilot-workspace-instructions.md
- **用途**：工作空間全域設定
- **功能**：針對整個專案的 Copilot 行為設定

## 安裝方式

1. 在 VSCode 中開啟擴展管理員 (Ctrl+Shift+X)
2. 搜尋 "Copilot Config Manager"
3. 點擊安裝

## 使用方法

### 開啟管理界面

有三種方式可以開啟 Copilot Config Manager：

1. **命令面板**：
   - 按 `Ctrl+Shift+P` 開啟命令面板
   - 輸入 "Copilot: Open Config Manager"
   - 選擇該命令

2. **資料夾右鍵選單**：
   - 在檔案總管中右鍵點擊任何資料夾
   - 選擇 "Open Copilot Config Manager"

3. **直接執行命令**：
   - 使用快捷鍵或設定自訂快捷鍵

### 管理配置檔案

1. **檢視狀態**：
   - 開啟管理界面後，會自動檢查各配置檔案的存在狀態
   - 綠色標籤表示檔案已存在
   - 橘色標籤表示檔案尚未建立

2. **編輯內容**：
   - 每個配置檔案都有專屬的文字編輯區域
   - 如果檔案已存在，會自動載入現有內容
   - 如果檔案不存在，會顯示預設的範本內容

3. **儲存檔案**：
   - 點擊 "儲存檔案" 按鈕將內容寫入 `.github` 資料夾
   - 如果 `.github` 資料夾不存在，會自動建立

4. **重設內容**：
   - 點擊 "重設為預設" 可以恢復預設的範本內容
   - 點擊 "重新載入" 可以從檔案重新載入內容

## 工作原理

### 專案層級配置
GitHub Copilot 支援專案層級的配置檔案，這些檔案位於專案根目錄的 `.github/` 資料夾中：

```
your-project/                    ← 當前工作空間
└── .github/                     ← 只在此資料夾內操作
    ├── copilot-instructions.md
    ├── copilot-commit-message-instructions.md
    ├── copilot-review-instructions.md
    ├── copilot-chat-instructions.md
    ├── copilot-code-instructions.md
    └── copilot-workspace-instructions.md
```

### 配置優先順序
1. **專案配置** (本擴展管理的檔案) - 優先級最高
2. **全域設定** - 當專案沒有特定配置時才使用
3. **預設行為** - Copilot 的內建預設值

### 安全性保證
- 需要開啟工作空間才能使用
- 路徑限制在當前工作空間內
- 檔案操作僅限於 `.github/` 資料夾
- 不會存取系統全域配置目錄

## 檔案結構

安裝後，擴展會在您的**當前專案**根目錄建立以下結構：

```
your-project/
└── .github/
    ├── copilot-instructions.md
    ├── copilot-commit-message-instructions.md
    ├── copilot-review-instructions.md
    ├── copilot-chat-instructions.md
    ├── copilot-code-instructions.md
    └── copilot-workspace-instructions.md
```

## 系統需求

- Visual Studio Code 1.74.0 或更新版本
- Node.js (用於開發)

## 開發說明

### 專案結構

```
copilot-config-manager/
├── src/
│   └── extension.ts      # 主要擴展邏輯
├── package.json          # 擴展配置
├── tsconfig.json         # TypeScript 配置
└── README.md            # 說明文件
```

### 本地開發

1. 複製專案：
```bash
git clone <repository-url>
cd copilot-config-manager
```

2. 安裝依賴：
```bash
npm install
```

3. 編譯 TypeScript：
```bash
npm run compile
```

4. 在 VSCode 中測試：
   - 按 F5 開啟擴展開發主機
   - 在新視窗中測試擴展功能

### 建置和發布

1. 編譯生產版本：
```bash
npm run vscode:prepublish
```

2. 打包擴展：
```bash
vsce package
```

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 這個專案
2. 建立您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

## 授權

本專案使用 MIT 授權 - 查看 [LICENSE](LICENSE) 檔案了解詳情。

## 更新日誌

### 1.0.0
- 初始版本發布
- 支援 6 種常見的 Copilot 配置檔案
- 提供繁體中文界面
- 包含預設範本內容

## 常見問題

### Q: 為什麼我的配置沒有生效？
A: 請確保：
1. 檔案儲存在正確的 `.github` 資料夾中
2. 檔案名稱完全正確（包含副檔名）
3. VSCode 已重新載入專案
4. 您使用的是最新版本的 GitHub Copilot

### Q: 可以自訂其他的配置檔案嗎？
A: 目前支援的是 GitHub Copilot 官方認可的配置檔案。如果有新的官方配置檔案，我們會在後續版本中新增支援。

### Q: 這個擴展支援多語言嗎？
A: 目前主要支援繁體中文，但您可以在配置檔案中使用任何語言編寫指令內容。

## 支援

如有問題或建議，請：
1. 在 GitHub 上提交 Issue
2. 透過 VSCode 內建的擴展回饋系統
3. 發送郵件至支援信箱

## 相關連結

- [GitHub Copilot 官方文件](https://docs.github.com/en/copilot)
- [VSCode 擴展開發指南](https://code.visualstudio.com/api)
- [專案 GitHub 頁面](https://github.com/your-username/copilot-config-manager)

---

**讓 GitHub Copilot 更懂您的需求，提升 AI 輔助編程效率！** 🚀