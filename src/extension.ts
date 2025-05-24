import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Copilot 配置檔案定義
interface CopilotConfig {
    filename: string;
    displayName: string;
    description: string;
    defaultContent: string;
}

const COPILOT_CONFIGS: CopilotConfig[] = [
    {
        filename: 'copilot-instructions.md',
        displayName: '通用指令',
        description: '為 GitHub Copilot 設定通用的編程指令和偏好',
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
        displayName: 'Commit 訊息指令',
        description: '設定 GitHub Copilot 生成 commit 訊息的格式和風格',
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
        displayName: 'Code Review 指令',
        description: '設定 GitHub Copilot 進行程式碼審查的標準和重點',
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
        filename: 'copilot-chat-instructions.md',
        displayName: 'Chat 對話指令',
        description: '設定 GitHub Copilot Chat 的對話風格和回應方式',
        defaultContent: `# Copilot Chat 指令

## 對話風格
- 使用繁體中文回應
- 保持專業但友善的語調
- 提供具體且實用的建議

## 技術偏好
- 優先推薦最佳實踐
- 解釋程式碼背後的原理
- 提供多種解決方案供選擇

## 回應格式
- 使用清晰的結構化回答
- 包含程式碼範例
- 提供相關文件連結`
    },
    {
        filename: 'copilot-code-instructions.md',
        displayName: '程式碼生成指令',
        description: '設定 GitHub Copilot 生成程式碼的風格和標準',
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
        filename: 'copilot-workspace-instructions.md',
        displayName: '工作空間指令',
        description: '設定整個工作空間的 GitHub Copilot 行為',
        defaultContent: `# 工作空間指令

## 專案架構
- 遵循專案的資料夾結構規範
- 使用相對路徑導入模組
- 保持檔案命名一致性

## 開發環境
- 針對 Node.js 和 TypeScript 優化
- 使用 ESLint 和 Prettier 規則
- 遵循專案的 package.json 依賴

## 團隊協作
- 遵循團隊的編碼規範
- 使用統一的程式碼格式
- 保持程式碼審查標準一致`
    }
];

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('copilotConfigManager.openManager', () => {
        CopilotConfigPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

class CopilotConfigPanel {
    public static currentPanel: CopilotConfigPanel | undefined;
    public static readonly viewType = 'copilotConfigManager';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
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
                localResourceRoots: [extensionUri]
            }
        );

        CopilotConfigPanel.currentPanel = new CopilotConfigPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
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
                }
            },
            null,
            this._disposables
        );
    }

    private async _loadFile(filename: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('請先開啟一個工作空間');
            return;
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, '.github', filename);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            this._panel.webview.postMessage({
                command: 'fileLoaded',
                filename: filename,
                content: content,
                exists: true
            });
        } catch (error) {
            this._panel.webview.postMessage({
                command: 'fileLoaded',
                filename: filename,
                content: '',
                exists: false
            });
        }
    }

    private async _saveFile(filename: string, content: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('請先開啟一個工作空間');
            return;
        }

        const githubDir = path.join(workspaceFolder.uri.fsPath, '.github');
        const filePath = path.join(githubDir, filename);

        try {
            // 確保 .github 目錄存在
            if (!fs.existsSync(githubDir)) {
                fs.mkdirSync(githubDir, { recursive: true });
            }

            fs.writeFileSync(filePath, content, 'utf8');
            vscode.window.showInformationMessage(`已儲存 ${filename}`);
            
            this._panel.webview.postMessage({
                command: 'fileSaved',
                filename: filename,
                success: true
            });
        } catch (error) {
            vscode.window.showErrorMessage(`儲存 ${filename} 失敗: ${error}`);
            this._panel.webview.postMessage({
                command: 'fileSaved',
                filename: filename,
                success: false
            });
        }
    }

    private async _checkFileExists(filename: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, '.github', filename);
        const exists = fs.existsSync(filePath);

        this._panel.webview.postMessage({
            command: 'fileExistsResult',
            filename: filename,
            exists: exists
        });
    }

    public dispose() {
        CopilotConfigPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
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
        }
        .textarea-container {
            margin-top: 10px;
        }
        textarea {
            width: 100%;
            min-height: 200px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 10px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            resize: vertical;
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
        }
        .secondary-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: var(--vscode-textLink-foreground);
        }
        .subtitle {
            margin-bottom: 30px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="title">GitHub Copilot 配置管理器</div>
    <div class="subtitle">管理您的 GitHub Copilot 指令檔案，提升 AI 輔助編程體驗</div>
    
    <div id="configList">
        ${COPILOT_CONFIGS.map(config => `
            <div class="config-item" data-filename="${config.filename}">
                <div class="config-header">
                    <div class="config-title">${config.displayName}</div>
                    <div class="file-status" id="status-${config.filename}">檢查中...</div>
                </div>
                <div class="config-description">${config.description}</div>
                <div class="filename">檔案名稱: <code>.github/${config.filename}</code></div>
                <div class="textarea-container">
                    <textarea id="content-${config.filename}" placeholder="載入中...">${config.defaultContent}</textarea>
                </div>
                <div class="button-container">
                    <button onclick="saveFile('${config.filename}')">儲存檔案</button>
                    <button class="secondary-button" onclick="loadFile('${config.filename}')">重新載入</button>
                    <button class="secondary-button" onclick="resetToDefault('${config.filename}')">重設為預設</button>
                </div>
            </div>
        `).join('')}
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
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
        }

        function saveFile(filename) {
            const content = document.getElementById('content-' + filename).value;
            vscode.postMessage({
                command: 'saveFile',
                filename: filename,
                content: content
            });
        }

        function resetToDefault(filename) {
            const defaultContents = {
                ${COPILOT_CONFIGS.map(config => `'${config.filename}': \`${config.defaultContent.replace(/`/g, '\\`')}\``).join(',\n                ')}
            };
            
            const textarea = document.getElementById('content-' + filename);
            textarea.value = defaultContents[filename] || '';
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
            }
        });
    </script>
</body>
</html>`;
    }
}

export function deactivate() {}