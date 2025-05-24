const fs = require('fs');
const path = require('path');

// 檢查重要檔案是否存在
const filesToCheck = [
    'out/extension.js',
    'package.json',
    'icon.png',
    'README.md',
    'LICENSE'
];

console.log('🔍 驗證 Copilot Config Manager v1.3.0...\n');

let allFilesExist = true;

filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file} - 存在`);
    } else {
        console.log(`❌ ${file} - 缺失`);
        allFilesExist = false;
    }
});

// 檢查 package.json 內容
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    console.log(`\n📦 套件資訊:`);
    console.log(`   名稱: ${packageJson.name}`);
    console.log(`   版本: ${packageJson.version}`);
    console.log(`   主檔案: ${packageJson.main}`);
    
    // 檢查命令數量
    const commands = packageJson.contributes?.commands || [];
    console.log(`   命令數量: ${commands.length}`);
    
    // 檢查視圖配置
    const views = packageJson.contributes?.views || {};
    const activityBarViews = views.copilotConfigManager?.length || 0;
    const explorerViews = views.explorer?.length || 0;
    console.log(`   Activity Bar 視圖: ${activityBarViews}`);
    console.log(`   Explorer 視圖: ${explorerViews}`);
    
} catch (error) {
    console.log(`❌ package.json 解析錯誤: ${error.message}`);
    allFilesExist = false;
}

// 檢查編譯輸出
try {
    const extensionJs = fs.readFileSync(path.join(__dirname, 'out', 'extension.js'), 'utf8');
    const hasActivateFunction = extensionJs.includes('function activate');
    const hasDeactivateFunction = extensionJs.includes('function deactivate');
    
    console.log(`\n🔧 擴充功能檢查:`);
    console.log(`   activate 函數: ${hasActivateFunction ? '✅' : '❌'}`);
    console.log(`   deactivate 函數: ${hasDeactivateFunction ? '✅' : '❌'}`);
    console.log(`   檔案大小: ${(extensionJs.length / 1024).toFixed(2)} KB`);
    
} catch (error) {
    console.log(`❌ extension.js 檢查錯誤: ${error.message}`);
    allFilesExist = false;
}

// 檢查 VSIX 檔案
const vsixFile = 'copilot-config-manager-1.3.0.vsix';
if (fs.existsSync(path.join(__dirname, vsixFile))) {
    const stats = fs.statSync(path.join(__dirname, vsixFile));
    console.log(`\n📦 VSIX 套件:`);
    console.log(`   檔案: ${vsixFile}`);
    console.log(`   大小: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
    console.log(`\n❌ VSIX 檔案不存在: ${vsixFile}`);
}

console.log(`\n${allFilesExist ? '🎉' : '⚠️'} 驗證${allFilesExist ? '成功' : '發現問題'}!`);

if (allFilesExist) {
    console.log('\n✨ Copilot Config Manager v1.3.0 已準備就緒！');
    console.log('\n📋 新功能摘要:');
    console.log('   🎯 Activity Bar 定位功能');
    console.log('   🗑️ 安全移除檔案功能');
    console.log('   🔗 完整的 Activity Bar 整合');
    console.log('\n🚀 安裝方式: 在 VSCode 中執行 Extensions: Install from VSIX');
}

process.exit(allFilesExist ? 0 : 1);
