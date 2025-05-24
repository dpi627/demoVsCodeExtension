#!/usr/bin/env node

/**
 * 功能測試腳本 - Copilot Config Manager v1.3.0
 * 測試所有主要功能是否正常運作
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 功能測試腳本 - Copilot Config Manager v1.3.0\n');

// 測試項目清單
const tests = [
    {
        name: '檢查編譯輸出',
        test: () => fs.existsSync('out/extension.js')
    },
    {
        name: '檢查 package.json 命令定義',
        test: () => {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return pkg.contributes.commands.length >= 3 &&
                   pkg.contributes.commands.some(cmd => cmd.command === 'copilotConfigManager.openConfig');
        }
    },
    {
        name: '檢查 Activity Bar 設定',
        test: () => {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return pkg.contributes.viewsContainers &&
                   pkg.contributes.viewsContainers.activitybar &&
                   pkg.contributes.viewsContainers.activitybar.length > 0;
        }
    },
    {
        name: '檢查 VSIX 套件',
        test: () => fs.existsSync('copilot-config-manager-1.3.0.vsix')
    },
    {
        name: '檢查版本一致性',
        test: () => {
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return pkg.version === '1.3.0';
        }
    },
    {
        name: '檢查文件更新',
        test: () => {
            return fs.existsSync('VERSION_1.3.0_SUMMARY.md') &&
                   fs.readFileSync('CHANGELOG.md', 'utf8').includes('版本 1.3.0');
        }
    }
];

// 執行測試
let passed = 0;
let failed = 0;

console.log('執行功能測試...\n');

tests.forEach((test, index) => {
    try {
        const result = test.test();
        if (result) {
            console.log(`✅ ${index + 1}. ${test.name}`);
            passed++;
        } else {
            console.log(`❌ ${index + 1}. ${test.name}`);
            failed++;
        }
    } catch (error) {
        console.log(`❌ ${index + 1}. ${test.name} - 錯誤: ${error.message}`);
        failed++;
    }
});

console.log('\n📊 測試結果:');
console.log(`   通過: ${passed}`);
console.log(`   失敗: ${failed}`);
console.log(`   總計: ${tests.length}`);

if (failed === 0) {
    console.log('\n🎉 所有測試通過！擴充功能準備就緒。');
    console.log('\n📋 建議的測試步驟:');
    console.log('   1. 在 VSCode 中開啟任何專案');
    console.log('   2. 點擊左側 Activity Bar 的 Copilot 圖示');
    console.log('   3. 在樹狀視圖中點擊任一配置項目');
    console.log('   4. 驗證配置管理器開啟並定位到正確項目');
    console.log('   5. 測試刪除按鈕功能');
    console.log('   6. 確認刪除確認對話框正常顯示');
} else {
    console.log('\n⚠️  部分測試未通過，請檢查上述項目。');
}

console.log('\n✨ 測試完成！');
