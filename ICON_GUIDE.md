# 圖示添加指引

## 如何為擴充功能添加圖示

### 1. 圖示規格要求
- **檔案格式**: PNG（推薦）或 SVG
- **尺寸**: 128x128 像素
- **位置**: 專案根目錄
- **命名**: `icon.png` 或 `icon.svg`

### 2. 圖示設計建議
為了符合 GitHub Copilot Config Manager 的主題，建議圖示包含：
- **機器人元素**: 代表 GitHub Copilot AI 助手
- **齒輪/設定圖示**: 代表配置管理功能
- **GitHub 風格色彩**: 
  - 主色: #24292e (深灰)
  - 輔色: #58a6ff (藍色)
  - 背景: #f0f6fc (淺色) 或透明

### 3. 圖示來源選項

#### 選項 A: 使用線上圖示產生器
1. 訪問 [Canva](https://www.canva.com) 或 [Figma](https://www.figma.com)
2. 創建 128x128 的畫布
3. 結合機器人和齒輪元素
4. 匯出為 PNG 格式

#### 選項 B: 使用現成圖示庫
1. [Feather Icons](https://feathericons.com/) - 下載 `settings` 圖示
2. [Heroicons](https://heroicons.com/) - 下載 `cog-6-tooth` 圖示
3. [Octicons](https://primer.style/octicons/) - GitHub 官方圖示庫

#### 選項 C: AI 圖片產生器
使用 DALL-E、Midjourney 或其他 AI 工具：
提示詞: "Simple minimalist icon of a robot with a gear symbol, 128x128 pixels, flat design, GitHub color scheme"

### 4. 實作步驟

#### 步驟 1: 將圖示檔案放入專案
```
C:\dev\demoVsCodeExtension\
├── icon.png          ← 新增圖示檔案
├── package.json
└── src/
```

#### 步驟 2: 更新 package.json
在 `package.json` 中添加圖示設定：

```json
{
  "name": "copilot-config-manager",
  "displayName": "Copilot Config Manager",
  "description": "管理 GitHub Copilot 配置檔案的 VSCode 擴展",
  "version": "1.1.1",
  "publisher": "your-publisher-name",
  "icon": "icon.png",  ← 添加這一行
  ...
}
```

#### 步驟 3: 重新打包
```bash
cd C:\dev\demoVsCodeExtension
npx vsce package --out copilot-config-manager-1.1.2.vsix
```

### 5. 臨時解決方案
如果您現在需要快速添加圖示，可以：

1. **下載我提供的 SVG 圖示**：已經在專案中創建了 `icon.svg`
2. **轉換為 PNG**：使用線上轉換器如 [CloudConvert](https://cloudconvert.com/svg-to-png)
3. **或使用 VSCode 內建圖示**：暫時使用系統圖示

### 6. 當前狀態
✅ 已創建基本的 SVG 圖示檔案 (`icon.svg`)
✅ 已添加活動欄視圖功能
✅ 已添加命令圖示 (`$(gear)`)

### 下一步
1. 將 `icon.svg` 轉換為 `icon.png`
2. 在 `package.json` 中添加 `"icon": "icon.png"`
3. 重新打包擴充功能

### 測試圖示
安裝擴充功能後，圖示會顯示在：
- VSCode 擴充功能列表中
- 擴充功能市場中
- 活動欄的 Explorer 視圖中（Copilot Config 區塊）
