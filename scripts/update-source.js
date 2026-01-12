const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 你的有效点播站数据
    const apiSites = {
        "iqiyizyapi.com": { "name": "🎬-爱奇艺-", "api": "https://iqiyizyapi.com/api.php/provide/vod" },
        "dbzy.tv": { "name": "🎬豆瓣资源", "api": "https://caiji.dbzy5.com/api.php/provide/vod" },
        "tyyszy.com": { "name": "🎬天涯影视", "api": "https://tyyszy.com/api.php/provide/vod" },
        "mtzy.me": { "name": "🎬茅台资源", "api": "https://caiji.maotaizy.cc/api.php/provide/vod" },
        "wolongzyw.com": { "name": "🎬卧龙资源", "api": "https://wolongzyw.com/api.php/provide/vod" },
        "ikunzy.com": { "name": "🎬iKun资源", "api": "https://ikunzyapi.com/api.php/provide/vod" },
        "cj.lzcaiji.com": { "name": "🎬量子资源", "api": "https://cj.lzcaiji.com/api.php/provide/vod" },
        "jszyapi.com": { "name": "🎬极速资源", "api": "https://jszyapi.com/api.php/provide/vod" },
        "ffzyapi.com": { "name": "🎬非凡资源", "api": "https://api.ffzyapi.com/api.php/provide/vod" },
        "bfzy.tv": { "name": "🎬暴风资源", "api": "https://bfzyapi.com/api.php/provide/vod" },
        "lovedan.net": { "name": "🎬艾旦影视", "api": "https://pz.v88.qzz.io/?url=https://lovedan.net/api.php/provide/vod" }
    };

    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        // 关键点：将数据转换为 DecoTV 能够识别的根字段 "sites"
        const sites = Object.keys(apiSites).map(key => {
            const item = apiSites[key];
            return {
                "key": key.replace(/\./g, '_'),
                "name": item.name,
                "type": 1,        // 1 代表 CMS 采集站
                "api": item.api,
                "searchable": 1,
                "quickSearch": 1,
                "filterable": 1,
                "ext": {
                    "threads": 32,      // 大吞吐量配置
                    "buffer_mb": 100    // 缓冲区 100MB
                }
            };
        });

        // 根结构必须包含 sites，DecoTV 才会填充“视频源”列表
        const finalConfig = {
            "sites": sites,
            "lives": [] 
        };

        const jsonStr = JSON.stringify(finalConfig);
        const encoded = bs58.encode(Buffer.from(jsonStr));
        
        fs.writeFileSync(SAVE_PATH, encoded);
        console.log(`✅ 成功！已将 ${sites.length} 个站点封装为 Base58 订阅。`);
    } catch (e) {
        console.error("❌ 失败:", e.message);
        process.exit(1);
    }
}
start();
