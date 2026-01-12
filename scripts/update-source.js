const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    const apiSites = {
        "iqiyizyapi.com": { "name": "🎬-爱奇艺-", "api": "https://iqiyizyapi.com/api.php/provide/vod" },
        "dbzy.tv": { "name": "🎬豆瓣资源", "api": "https://caiji.dbzy5.com/api.php/provide/vod" },
        "lzcaiji.com": { "name": "🎬量子资源", "api": "https://cj.lzcaiji.com/api.php/provide/vod" },
        "ffzyapi.com": { "name": "🎬非凡资源", "api": "https://api.ffzyapi.com/api.php/provide/vod" },
        "lovedan.net": { "name": "🎬艾旦影视", "api": "https://pz.v88.qzz.io/?url=https://lovedan.net/api.php/provide/vod" }
    };

    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        const sites = Object.keys(apiSites).map(key => ({
            key: key.replace(/\./g, '_'),
            name: apiSites[key].name,
            type: 1,
            api: apiSites[key].api,
            searchable: 1,
            quickSearch: 1,
            ext: { threads: 32, buffer: 104857600 }
        }));

        // --- 核心修改：双重包裹结构 ---
        // 很多 DecoTV 版本实际上是在等待 "urls" 或者 "list" 字段
        const finalConfig = {
            "sites": sites,  // 格式 A
            "list": sites,   // 格式 B (TVBox常用)
            "urls": sites    // 格式 C (部分Deco重构版常用)
        };

        const jsonStr = JSON.stringify(finalConfig);
        const encoded = bs58.encode(Buffer.from(jsonStr));
        
        fs.writeFileSync(SAVE_PATH, encoded);
        console.log(`✅ 成功！已生成双重兼容格式，共 ${sites.length} 个站。`);
    } catch (e) {
        console.error("❌ 失败:", e.message);
        process.exit(1);
    }
}
start();
