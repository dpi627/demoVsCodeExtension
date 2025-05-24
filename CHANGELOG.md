# Copilot Config Manager - 更新記錄

## 版本 1.3.0 功能完整版
- ✅ **Activity Bar 定位功能** - 點擊 Activity Bar 中的配置項目可直接定位到對應的配置
- ✅ **移除檔案功能** - 新增刪除按鈕，可安全刪除配置檔案和對應的 VSCode 設定
- ✅ **智慧定位系統** - 支援從外部直接跳轉到特定配置項目並高亮顯示
- ✅ **完整的 Activity Bar 整合** - 專用的 Activity Bar 按鈕和樹狀視圖
- ✅ **安全確認機制** - 刪除檔案前會顯示確認對話框，避免意外操作

## 新功能詳情

### 🎯 Activity Bar 定位功能
- Activity Bar 中每個配置項目都可直接點擊
- 自動開啟配置管理器並定位到對應項目
- 視覺高亮效果，清楚指示目標配置

### 🗑️ 安全移除功能
- 每個配置項目都有獨立的「刪除檔案」按鈕
- 刪除前會顯示確認對話框，避免誤操作
- 同時清除檔案和對應的 VSCode 設定
- 刪除後自動恢復預設內容顯示

### 🔗 完整整合體驗
- Activity Bar 專用圖示和視圖
- 樹狀視圖直接連結到對應配置
- 統一的使用者界面和操作體驗

## 版本 1.2.6 Activity Bar 整合
- ✅ 新增 Activity Bar 專用按鈕和圖示
- ✅ 獨立的配置管理樹狀視圖
- ✅ 修復擴大編輯器 JavaScript 錯誤
- ✅ 移除擴大編輯器功能（簡化界面）
- ✅ 完善的 VSCode 設定同步機制
- ✅ 移除大尺寸 SVG 圖示檔案
- ✅ 採用優化後的 PNG 圖示 (18.22 KB)
- ✅ 檔案大小從 1.53 MB 大幅縮減至 38.54 KB
- ✅ 套件安裝和載入速度顯著提升

## 版本 1.2.0 重大更新
- ✅ 移除刪除檔案功能（避免意外刪除）
- ✅ 移除 textarea 右下角 resize 功能
- ✅ 新增放大編輯器功能 - 單獨視窗編輯大型配置檔案
- ✅ 新增檔案系統監控 - 在 Explorer 中刪除檔案時即時更新狀態
- ✅ 優化使用者體驗和介面設計

## 新功能詳情

### 🔍 放大編輯器
- 點擊配置項目標題旁的 "🔍 放大編輯" 按鈕
- 全螢幕編輯模式，提供更大的編輯空間
- 支援直接儲存或同步回原編輯器
- ESC 或點擊關閉按鈕退出

### 📁 即時檔案狀態監控
- 自動監控 `.github/` 資料夾變化
- 在 Explorer 中刪除檔案時立即顯示 "不存在" 狀態
- 新增檔案時自動更新狀態

### 🎨 介面優化
- 移除容易誤觸的刪除功能
- 固定 textarea 高度，避免意外調整
- 保留現代化滾動條設計

## 版本 1.1.2 修正
- ✅ 修正 VSCode 設定中的檔案路徑格式
- ✅ 將檔案路徑從 `filename` 改為 `.github\filename`
- ✅ 更新 console.log 訊息以反映正確的設定值

## 修正內容

### _updateVSCodeSettings 方法
修正前：
```typescript
const settingValue = [
    {
        "file": filename
    }
];
```

修正後：
```typescript
const settingValue = [
    {
        "file": `.github\\${filename}`
    }
];
```

## 效果
現在當儲存配置檔案時，VSCode 設定將會正確更新為：
```json
{
    "github.copilot.chat.commitMessageGeneration.instructions": [
        {
            "file": ".github\\copilot-commit-message-instructions.md"
        }
    ],
    "github.copilot.chat.reviewSelection.instructions": [
        {
            "file": ".github\\copilot-review-instructions.md"
        }
    ]
}
```

## 測試結果
- ✅ TypeScript 編譯成功
- ✅ ESLint 檢查通過
- ✅ VSIX 打包成功 (1.53 MB)
- ✅ 檔案結構正確包含 .github 資料夾

## 已生成檔案
- `copilot-config-manager-1.2.0.vsix` - 最新版本的擴充功能套件
