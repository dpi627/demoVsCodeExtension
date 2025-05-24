# Copilot Config Manager - 更新記錄

## 版本 1.1.1 修正
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
- ✅ VSIX 打包成功 (13.22 KB)
- ✅ 檔案結構正確包含 .github 資料夾

## 已生成檔案
- `copilot-config-manager-1.1.1.vsix` - 修正後的擴充功能套件
