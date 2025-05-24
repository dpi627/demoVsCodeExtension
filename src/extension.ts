import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Copilot 配置檔案定義
interface CopilotConfig {
    filename: string;
    displayName: string;
    description: string;
    defaultContent: string;
    vscodeSetting?: string; // VSCode 設定鍵名
}

const COPILOT_CONFIGS: CopilotConfig[] = [
    {
        filename: 'copilot-instructions.md',
        displayName: 'Gerneral Instructions',
        description: '為 GitHub Copilot 設定通用的編程指令和偏好（僅在 .github 資料夾中儲存）',
        // 注意：此檔案不設定 vscodeSetting，僅在 .github 中產生檔案
        defaultContent: `# GitHub Copilot 通用指令

## 編程風格
- 使用清晰、簡潔的變數命名
- 添加適當的註解說明複雜邏輯
- 遵循專案的編碼規範

## 偏好設定
- 優先使用 TypeScript 語法
- 使用現代 ES6+ 語法特性
- 確保程式碼的可讀性和維護性`
    },
    {
        filename: 'copilot-commit-message-instructions.md',
        displayName: 'Commit Message Instructions',
        description: '設定 GitHub Copilot 生成 commit 訊息的格式和風格',
        vscodeSetting: 'github.copilot.chat.commitMessageGeneration.instructions',
        defaultContent: `# Commit 訊息指令

## 格式要求
- 使用傳統的 commit 格式：type(scope): description
- 第一行不超過 50 字元
- 使用繁體中文描述

## Commit 類型
- feat: 新功能
- fix: 修復 bug
- docs: 文件更新
- style: 程式碼格式調整
- refactor: 重構
- test: 測試相關
- chore: 建置或輔助工具變動

## 範例
\`\`\`
feat(auth): 新增使用者登入功能
fix(api): 修復資料驗證錯誤
docs(readme): 更新安裝說明
\`\`\``
    },
    {
        filename: 'copilot-review-instructions.md',
        displayName: 'Code Review Instructions',
        description: '設定 GitHub Copilot 進行程式碼審查的標準和重點',
        vscodeSetting: 'github.copilot.chat.reviewSelection.instructions',
        defaultContent: `# Code Review 指令

## 審查重點
- 檢查程式碼安全性漏洞
- 驗證錯誤處理機制
- 確認效能最佳化
- 檢查程式碼可讀性

## 審查標準
- 遵循 SOLID 原則
- 適當的錯誤處理
- 充分的測試覆蓋率
- 清晰的註解和文件

## 回饋格式
- 使用繁體中文提供建議
- 提供具體的改進方案
- 指出潛在的問題和風險`
    },
    {
        filename: 'copilot-code-instructions.md',
        displayName: 'Coding Style Instructions',
        description: '設定 GitHub Copilot 生成程式碼的風格和標準',
        vscodeSetting: 'github.copilot.chat.codeGeneration.instructions',
        defaultContent: `# 程式碼生成指令

## 編碼標準
- 使用 4 個空格縮排
- 函式名稱使用 camelCase
- 常數使用 UPPER_SNAKE_CASE
- 類別名稱使用 PascalCase

## 架構偏好
- 遵循 MVC 模式
- 使用依賴注入
- 實作適當的設計模式

## 品質要求
- 每個函式都應該有 JSDoc 註解
- 包含錯誤處理邏輯
- 撰寫對應的單元測試`
    },
    {
        filename: 'copilot-pullrequest-instructions.md',
        displayName: 'Pull Request Instructions',
        description: '設定 GitHub Copilot 生成 Pull Request 描述的格式和內容',
        vscodeSetting: 'github.copilot.chat.pullRequestDescriptionGeneration.instructions',
        defaultContent: `# Pull Request 描述指令

## 描述格式
- 使用清晰的標題總結變更
- 提供詳細的變更說明
- 列出相關的 Issue 編號

## 內容結構
### 變更摘要
- 簡述主要功能或修復
- 說明變更的影響範圍

### 測試說明
- 描述執行的測試
- 確認功能正常運作

### 檢查清單
- [ ] 程式碼已通過測試
- [ ] 文件已更新
- [ ] 符合編碼規範`
    },
    {
        filename: 'copilot-test-instructions.md',
        displayName: 'Test Instructions',
        description: '設定 GitHub Copilot 生成測試的標準和格式',
        vscodeSetting: 'github.copilot.chat.testGeneration.instructions',
        defaultContent: `# 測試生成指令

## 測試框架
- 使用 Jest 測試框架
- 遵循 AAA 模式 (Arrange, Act, Assert)
- 使用描述性的測試名稱

## 測試覆蓋
- 測試正常情況和邊界情況
- 包含錯誤處理測試
- 模擬外部依賴

## 測試結構
\`\`\`javascript
describe('功能模組', () => {
  test('應該在正常情況下返回預期結果', () => {
    // Arrange - 準備測試資料
    // Act - 執行被測試的功能
    // Assert - 驗證結果
  });
});
\`\`\``
    }
];

// 初始化同步現有配置檔案到 VSCode 設定
async function initializeSyncExistingFiles() {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        console.log('正在初始化同步現有配置檔案...');
        
        // 檢查每個配置檔案是否存在，如果存在則同步到 VSCode 設定
        for (const config of COPILOT_CONFIGS) {
            if (!config.vscodeSetting) {
                continue; // 跳過沒有 VSCode 設定的檔案（如 copilot-instructions.md）
            }

            const filePath = vscode.Uri.joinPath(workspaceFolder.uri, '.github', config.filename);
            
            try {
                await vscode.workspace.fs.stat(filePath);
                // 檔案存在，同步到 VSCode 設定
                await updateVSCodeSettingsForFile(config.filename);
                console.log(`已同步現有檔案: ${config.filename} -> ${config.vscodeSetting}`);
            } catch (error) {
                // 檔案不存在，跳過
                console.log(`檔案不存在，跳過: ${config.filename}`);
            }
        }
        
        console.log('現有配置檔案同步完成');
    } catch (error) {
        console.error('初始化同步過程中發生錯誤:', error);
    }
}

// 為指定檔案更新 VSCode 設定的輔助函數
async function updateVSCodeSettingsForFile(filename: string) {
    try {
        const config = COPILOT_CONFIGS.find(c => c.filename === filename);
        if (!config?.vscodeSetting) {
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        // 取得工作空間設定
        const workspaceConfig = vscode.workspace.getConfiguration('', workspaceFolder.uri);
          
        // 設定檔案參考 - 使用 .github\ 前綴
        const settingValue = [
            {
                "file": `.github\\${filename}`
            }
        ];

        // 使用 Workspace 範圍寫入 workspace settings.json
        const targetScope = vscode.ConfigurationTarget.Workspace;

        // 更新設定
        await workspaceConfig.update(
            config.vscodeSetting,
            settingValue,
            targetScope
        );

        console.log(`Updated VSCode setting (Workspace): ${config.vscodeSetting} -> .github\\${filename}`);
    } catch (error) {
        console.error(`Error updating VSCode settings for ${filename}:`, error);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Copilot Config Manager is now active');
    
    try {
        // 初始化同步現有配置檔案到 VSCode 設定
        initializeSyncExistingFiles();
          // 註冊主要命令
        const disposable = vscode.commands.registerCommand('copilotConfigManager.openManager', () => {
            try {
                CopilotConfigPanel.createOrShow(context.extensionUri);
            } catch (error) {
                console.error('Error opening Copilot Config Manager:', error);
                vscode.window.showErrorMessage('無法開啟 Copilot Config Manager：' + (error instanceof Error ? error.message : String(error)));
            }
        });        // 註冊手動同步現有檔案的命令
        const syncCommand = vscode.commands.registerCommand('copilotConfigManager.syncExistingFiles', async () => {
            try {
                await initializeSyncExistingFiles();
                vscode.window.showInformationMessage('現有配置檔案已同步到 VSCode 設定！');
            } catch (error) {
                console.error('Error syncing existing files:', error);
                vscode.window.showErrorMessage('同步現有檔案時發生錯誤：' + (error instanceof Error ? error.message : String(error)));
            }
        });

        // 註冊定位到特定配置項目的命令
        const openConfigCommand = vscode.commands.registerCommand('copilotConfigManager.openConfig', (filename: string) => {
            try {
                CopilotConfigPanel.createOrShow(context.extensionUri);
                // 等待面板創建後再發送定位訊息
                setTimeout(() => {
                    if (CopilotConfigPanel.currentPanel) {
                        CopilotConfigPanel.currentPanel.focusConfig(filename);
                    }
                }, 100);
            } catch (error) {
                console.error('Error opening config:', error);
                vscode.window.showErrorMessage('無法開啟配置：' + (error instanceof Error ? error.message : String(error)));
            }
        });// 建立並註冊樹狀視圖提供者 (Explorer 面板)
        const provider = new CopilotConfigProvider();
        const treeView = vscode.window.createTreeView('copilotConfigManager.view', {
            treeDataProvider: provider,
            showCollapseAll: false
        });

        // 建立並註冊 Activity Bar 視圖提供者
        const activityBarProvider = new CopilotConfigProvider();
        const activityBarTreeView = vscode.window.createTreeView('copilotConfigManager.mainView', {
            treeDataProvider: activityBarProvider,
            showCollapseAll: false
        });

        // 建立檔案系統監控器
        const fileWatcher = vscode.workspace.createFileSystemWatcher('**/.github/**');
        
        // 監控檔案變化並通知開啟的面板
        fileWatcher.onDidCreate(() => {
            if (CopilotConfigPanel.currentPanel) {
                CopilotConfigPanel.currentPanel.refreshFileStatus();
            }
        });
        
        fileWatcher.onDidDelete(() => {
            if (CopilotConfigPanel.currentPanel) {
                CopilotConfigPanel.currentPanel.refreshFileStatus();
            }
        });
        
        fileWatcher.onDidChange(() => {
            if (CopilotConfigPanel.currentPanel) {
                CopilotConfigPanel.currentPanel.refreshFileStatus();
            }
        });        context.subscriptions.push(disposable);
        context.subscriptions.push(syncCommand);
        context.subscriptions.push(openConfigCommand);
        context.subscriptions.push(treeView);
        context.subscriptions.push(activityBarTreeView);
        context.subscriptions.push(fileWatcher);
        console.log('Copilot Config Manager commands and views registered successfully');
    } catch (error) {
        console.error('Error activating Copilot Config Manager:', error);
        vscode.window.showErrorMessage('Copilot Config Manager 啟動失敗：' + (error instanceof Error ? error.message : String(error)));
    }
}

class CopilotConfigPanel {
    public static currentPanel: CopilotConfigPanel | undefined;
    public static readonly viewType = 'copilotConfigManager';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];    public static createOrShow(extensionUri: vscode.Uri) {
        try {
            const column = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;

            if (CopilotConfigPanel.currentPanel) {
                CopilotConfigPanel.currentPanel._panel.reveal(column);
                return;
            }

            const panel = vscode.window.createWebviewPanel(
                CopilotConfigPanel.viewType,
                'Copilot Config Manager',
                column || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [extensionUri],
                    retainContextWhenHidden: true
                }
            );

            CopilotConfigPanel.currentPanel = new CopilotConfigPanel(panel, extensionUri);
        } catch (error) {
            console.error('Error creating Copilot Config Panel:', error);
            vscode.window.showErrorMessage('無法建立 Copilot Config Manager 面板：' + (error instanceof Error ? error.message : String(error)));
        }
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'loadFile':
                        await this._loadFile(message.filename);
                        break;
                    case 'saveFile':
                        await this._saveFile(message.filename, message.content);
                        break;
                    case 'checkFileExists':
                        await this._checkFileExists(message.filename);
                        break;
                    case 'removeFile':
                        await this._removeFile(message.filename);
                        break;
                }
            },
            null,
            this._disposables
        );
    }    private async _loadFile(filename: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('請先開啟一個工作空間。此擴展僅管理當前專案的 .github 配置檔案，不會影響全域設定。');
            return;
        }

        // 只操作當前工作空間的 .github 資料夾
        const filePath = path.join(workspaceFolder.uri.fsPath, '.github', filename);
        
        try {
            if (!fs.existsSync(filePath)) {
                this._panel.webview.postMessage({
                    command: 'fileLoaded',
                    filename: filename,
                    content: '',
                    exists: false
                });
                return;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            this._panel.webview.postMessage({
                command: 'fileLoaded',
                filename: filename,
                content: content,
                exists: true
            });
        } catch (error) {
            console.error(`Error loading file ${filename}:`, error);
            vscode.window.showErrorMessage(`載入檔案 ${filename} 時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
            this._panel.webview.postMessage({
                command: 'fileLoaded',
                filename: filename,
                content: '',
                exists: false
            });
        }
    }    private async _saveFile(filename: string, content: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('請先開啟一個工作空間。此擴展僅管理當前專案的配置檔案。');
            return;
        }

        // 驗證檔案名稱安全性
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            vscode.window.showErrorMessage('無效的檔案名稱');
            return;
        }

        // 確保只在當前工作空間內操作
        const githubDir = path.join(workspaceFolder.uri.fsPath, '.github');
        const filePath = path.join(githubDir, filename);

        try {
            // 確保 .github 目錄存在
            if (!fs.existsSync(githubDir)) {
                fs.mkdirSync(githubDir, { recursive: true });
            }            fs.writeFileSync(filePath, content, 'utf8');
            
            // 同步更新 VSCode 設定
            await this._updateVSCodeSettings(filename);
            
            vscode.window.showInformationMessage(`已儲存 ${filename} 到當前專案的 .github 資料夾`);            
            
            this._panel.webview.postMessage({
                command: 'fileSaved',
                filename: filename,
                success: true
            });
        } catch (error) {
            console.error(`Error saving file ${filename}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`儲存 ${filename} 失敗: ${errorMessage}`);
            this._panel.webview.postMessage({
                command: 'fileSaved',
                filename: filename,
                success: false
            });
        }
    }    private async _checkFileExists(filename: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        try {
            const filePath = path.join(workspaceFolder.uri.fsPath, '.github', filename);
            const exists = fs.existsSync(filePath);

            this._panel.webview.postMessage({
                command: 'fileExistsResult',
                filename: filename,
                exists: exists
            });
        } catch (error) {
            console.error(`Error checking file existence for ${filename}:`, error);
            this._panel.webview.postMessage({
                command: 'fileExistsResult',
                filename: filename,
                exists: false
            });
        }
    }    private async _updateVSCodeSettings(filename: string) {
        try {
            const config = COPILOT_CONFIGS.find(c => c.filename === filename);
            if (!config?.vscodeSetting) {
                return;
            }

            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return;
            }

            // 取得工作空間設定
            const workspaceConfig = vscode.workspace.getConfiguration('', workspaceFolder.uri);
              
            // 設定檔案參考 - 使用 .github\ 前綴
            const settingValue = [
                {
                    "file": `.github\\${filename}`
                }
            ];

            // 所有需要寫入 workspace settings 的 GitHub Copilot 設定
            const workspaceScopeOnlySettings = [
                'github.copilot.chat.commitMessageGeneration.instructions',
                'github.copilot.chat.reviewSelection.instructions',
                'github.copilot.chat.codeGeneration.instructions',
                'github.copilot.chat.pullRequestDescriptionGeneration.instructions',
                'github.copilot.chat.testGeneration.instructions'
            ];
            
            // 使用 Workspace 範圍寫入 workspace settings.json
            const targetScope = vscode.ConfigurationTarget.Workspace;

            // 更新設定
            await workspaceConfig.update(
                config.vscodeSetting,
                settingValue,
                targetScope
            );

            console.log(`Updated VSCode setting (Workspace): ${config.vscodeSetting} -> .github\\${filename}`);
        } catch (error) {
            console.error(`Error updating VSCode settings for ${filename}:`, error);
            // 不顯示錯誤給用戶，因為這是額外功能
        }
    }    private async _removeVSCodeSettings(filename: string) {
        try {
            const config = COPILOT_CONFIGS.find(c => c.filename === filename);
            if (!config?.vscodeSetting) {
                return;
            }

            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return;
            }

            // 取得工作空間設定
            const workspaceConfig = vscode.workspace.getConfiguration('', workspaceFolder.uri);
            
            // 統一使用 Workspace 範圍 (與 _updateVSCodeSettings 保持一致)
            const targetScope = vscode.ConfigurationTarget.Workspace;

            // 移除設定
            await workspaceConfig.update(
                config.vscodeSetting,
                undefined,
                targetScope
            );

            console.log(`Removed VSCode setting (Workspace): ${config.vscodeSetting}`);        } catch (error) {
            console.error(`Error removing VSCode settings for ${filename}:`, error);
        }
    }

    private async _removeFile(filename: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('請先開啟一個工作空間。');
            return;
        }

        // 驗證檔案名稱安全性
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            vscode.window.showErrorMessage('無效的檔案名稱');
            return;
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, '.github', filename);

        try {
            // 檢查檔案是否存在
            if (!fs.existsSync(filePath)) {
                vscode.window.showInformationMessage(`檔案 ${filename} 不存在`);
                this._panel.webview.postMessage({
                    command: 'fileRemoved',
                    filename: filename,
                    success: false,
                    message: '檔案不存在'
                });
                return;
            }

            // 顯示確認對話框
            const choice = await vscode.window.showWarningMessage(
                `確定要刪除 ${filename} 嗎？此操作無法復原。`,
                { modal: true },
                '確定刪除',
                '取消'
            );

            if (choice !== '確定刪除') {
                return;
            }

            // 刪除檔案
            fs.unlinkSync(filePath);
            
            // 移除 VSCode 設定
            await this._removeVSCodeSettings(filename);
            
            vscode.window.showInformationMessage(`已刪除 ${filename}`);
            
            this._panel.webview.postMessage({
                command: 'fileRemoved',
                filename: filename,
                success: true
            });
        } catch (error) {
            console.error(`Error removing file ${filename}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`刪除 ${filename} 失敗: ${errorMessage}`);
            this._panel.webview.postMessage({
                command: 'fileRemoved',
                filename: filename,
                success: false,
                message: errorMessage
            });
        }
    }public refreshFileStatus() {
        // 重新檢查所有配置檔案的狀態
        COPILOT_CONFIGS.forEach(config => {
            this._checkFileExists(config.filename);
        });
    }

    public focusConfig(filename: string) {
        // 發送訊息到 webview 讓它定位到特定的配置項目
        this._panel.webview.postMessage({
            command: 'focusConfig',
            filename: filename
        });
    }

    public dispose() {
        CopilotConfigPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                try {
                    disposable.dispose();
                } catch (error) {
                    console.error('Error disposing resource:', error);
                }
            }
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Copilot Config Manager</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        .warning-banner {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
            color: var(--vscode-inputValidation-infoForeground);
        }
        .warning-banner strong {
            display: block;
            margin-bottom: 5px;
        }
        .config-item {
            margin-bottom: 20px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 15px;
            background-color: var(--vscode-editor-background);
        }
        .config-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .config-title {
            font-weight: bold;
            font-size: 16px;
            color: var(--vscode-textLink-foreground);
        }
        .config-description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 15px;
            font-size: 14px;
        }
        .file-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .exists {
            background-color: var(--vscode-inputValidation-infoBackground);
            color: var(--vscode-inputValidation-infoForeground);
        }
        .not-exists {
            background-color: var(--vscode-inputValidation-warningBackground);
            color: var(--vscode-inputValidation-warningForeground);
        }        .filename {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
            font-size: 12px;
        }
        .vscode-setting {
            color: var(--vscode-textLink-foreground);
            margin-bottom: 10px;
            font-size: 12px;
            font-style: italic;
        }
        .textarea-container {
            margin-top: 10px;        
        }
        
        textarea {
            width: 98%;
            min-height: 200px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 10px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            resize: none; /* 移除右下角調整大小功能 */
            /* 現代化滾動條樣式 */
            scrollbar-width: thin;
            scrollbar-color: var(--vscode-scrollbarSlider-background) var(--vscode-editor-background);
        }
        
        /* Webkit 瀏覽器滾動條樣式 */
        textarea::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        textarea::-webkit-scrollbar-track {
            background: var(--vscode-editor-background);
            border-radius: 4px;
        }
        
        textarea::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 4px;
            border: 2px solid var(--vscode-editor-background);
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-hoverBackground);
        }
        
        textarea::-webkit-scrollbar-thumb:active {
            background: var(--vscode-scrollbarSlider-activeBackground);
        }
        
        textarea::-webkit-scrollbar-corner {
            background: var(--vscode-editor-background);
        }
        .button-container {
            margin-top: 10px;
            display: flex;
            gap: 10px;
        }
        button {
            padding: 6px 14px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .secondary-button {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }        .secondary-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .remove-button {
            background-color: var(--vscode-errorForeground);
            color: var(--vscode-editor-background);
        }
        .remove-button:hover {
            background-color: var(--vscode-errorForeground);
            opacity: 0.8;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: var(--vscode-textLink-foreground);
        }        .subtitle {
            margin-bottom: 30px;
            color: var(--vscode-descriptionForeground);
        }    </style>
</head>
<body>
    <div class="title">GitHub Copilot 配置管理器</div>
    <div class="subtitle">管理您的 GitHub Copilot 指令檔案，提升 AI 輔助編程體驗</div>
      <div class="warning-banner">
        <strong>📁 專案範圍設定</strong>
        僅管理當前工作空間專案目錄下的 <code>.github/</code> 資料夾內的 <code>*.instructions.md</code> 配置檔案。<br>
        不會影響 GitHub Copilot 的 vscode 全域設定或其他專案的配置。每個專案都可以有獨立的 Copilot 行為設定。<br>
        儲存或刪除時，除了 <code>copilot-instructions.md</code> 之外，其餘檔案會自動新增或刪除 <code>.vscode/settings.json</code> 專案設定。<br>
    </div>
    
    <div id="configList">
        ${COPILOT_CONFIGS.map(config => `
            <div class="config-item" data-filename="${config.filename}">                <div class="config-header">
                    <div class="config-title">
                        ${config.displayName}
                    </div>
                    <div class="file-status" id="status-${config.filename}">檢查中...</div>
                </div><div class="config-description">${config.description}</div>
                <div class="filename">檔案名稱: <code>.github/${config.filename}</code></div>
                ${config.vscodeSetting ? `<div class="vscode-setting">VSCode 設定: <code>${config.vscodeSetting}</code></div>` : ''}
                <div class="textarea-container">
                    <textarea id="content-${config.filename}" placeholder="載入中...">${config.defaultContent}</textarea>
                </div>                <div class="button-container">
                    <button onclick="saveFile('${config.filename}')">儲存檔案</button>
                    <button class="secondary-button" onclick="loadFile('${config.filename}')">重新載入</button>
                    <button class="secondary-button" onclick="resetToDefault('${config.filename}')">重設為預設</button>
                    <button class="remove-button" onclick="removeFile('${config.filename}')">刪除檔案</button>
                </div>
            </div>
        `).join('')}
    </div>    <script>
        const vscode = acquireVsCodeApi();
        
        // 定義 COPILOT_CONFIGS 變數供 JavaScript 使用
        const COPILOT_CONFIGS = ${JSON.stringify(COPILOT_CONFIGS)};
        
        // 初始化時檢查所有檔案狀態並載入內容
        window.addEventListener('load', function() {
            ${COPILOT_CONFIGS.map(config => `
                checkFileExists('${config.filename}');
                loadFile('${config.filename}');
            `).join('')}
        });

        function checkFileExists(filename) {
            vscode.postMessage({
                command: 'checkFileExists',
                filename: filename
            });
        }

        function loadFile(filename) {
            vscode.postMessage({
                command: 'loadFile',
                filename: filename
            });
        }        function saveFile(filename) {
            try {
                const content = document.getElementById('content-' + filename).value;
                vscode.postMessage({
                    command: 'saveFile',
                    filename: filename,
                    content: content
                });
            } catch (error) {
                console.error('Error saving file:', error);
            }
        }        function resetToDefault(filename) {
            try {
                const defaultContents = {
                    ${COPILOT_CONFIGS.map(config => `'${config.filename}': \`${config.defaultContent.replace(/[`\\$]/g, '\\$&')}\``).join(',\n                    ')}
                };
                
                const textarea = document.getElementById('content-' + filename);
                if (textarea) {
                    textarea.value = defaultContents[filename] || '';
                }            } catch (error) {
                console.error('Error resetting to default:', error);
            }
        }

        function removeFile(filename) {
            vscode.postMessage({
                command: 'removeFile',
                filename: filename
            });
        }

        function focusOnConfig(filename) {
            const configItem = document.querySelector('[data-filename="' + filename + '"]');
            if (configItem) {
                configItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // 添加高亮效果
                configItem.style.transition = 'all 0.3s ease';
                configItem.style.transform = 'scale(1.02)';
                configItem.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                
                // 移除高亮效果
                setTimeout(() => {
                    configItem.style.transform = 'scale(1)';
                    configItem.style.boxShadow = 'none';
                }, 1000);
            }
        }

        // 處理來自擴展的訊息
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'fileLoaded':
                    const textarea = document.getElementById('content-' + message.filename);
                    const statusElement = document.getElementById('status-' + message.filename);
                    
                    if (message.exists) {
                        textarea.value = message.content;
                        statusElement.textContent = '已存在';
                        statusElement.className = 'file-status exists';
                    } else {
                        statusElement.textContent = '不存在';
                        statusElement.className = 'file-status not-exists';
                    }
                    break;
                      case 'fileSaved':
                    if (message.success) {
                        const statusElement = document.getElementById('status-' + message.filename);
                        statusElement.textContent = '已存在';
                        statusElement.className = 'file-status exists';
                    }
                    break;
                    
                case 'fileExistsResult':
                    const status = document.getElementById('status-' + message.filename);
                    if (message.exists) {
                        status.textContent = '已存在';
                        status.className = 'file-status exists';
                    } else {
                        status.textContent = '不存在';
                        status.className = 'file-status not-exists';
                    }
                    break;
                    
                case 'fileRemoved':
                    if (message.success) {
                        const statusElement = document.getElementById('status-' + message.filename);
                        statusElement.textContent = '不存在';
                        statusElement.className = 'file-status not-exists';
                        
                        // 清空內容區域，載入預設內容
                        resetToDefault(message.filename);
                    }
                    break;
                    
                case 'focusConfig':
                    focusOnConfig(message.filename);
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}

// 樹狀視圖項目
class CopilotConfigItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly config: CopilotConfig,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = config.description;
        this.contextValue = 'copilotConfigItem';
        this.iconPath = new vscode.ThemeIcon('gear');
    }
}

// 樹狀視圖提供者
class CopilotConfigProvider implements vscode.TreeDataProvider<CopilotConfigItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CopilotConfigItem | undefined | null | void> = new vscode.EventEmitter<CopilotConfigItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CopilotConfigItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CopilotConfigItem): vscode.TreeItem {
        return element;
    }    getChildren(element?: CopilotConfigItem): Thenable<CopilotConfigItem[]> {
        if (!element) {
            // 返回根級項目
            return Promise.resolve(COPILOT_CONFIGS.map(config => 
                new CopilotConfigItem(
                    config.displayName,
                    config,
                    vscode.TreeItemCollapsibleState.None,
                    {
                        command: 'copilotConfigManager.openConfig',
                        title: 'Open Config',
                        arguments: [config.filename]
                    }
                )
            ));
        }
        return Promise.resolve([]);
    }
}

export function deactivate() {
    // 清理資源
    if (CopilotConfigPanel.currentPanel) {
        CopilotConfigPanel.currentPanel.dispose();
    }
}