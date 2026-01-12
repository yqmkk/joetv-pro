const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 聚合资源站 - 优先挑选已知速度较快的 CMS
    const CMS_SOURCES = [
        { id: "iqiyi", name: "🎬爱奇艺", api: "https://iqiyizyapi.com/api.php/provide/vod" },
        { id: "dbzy", name: "🎬豆瓣资源", api: "https://caiji.dbzy5.com/api.php/provide/vod" },
        { id: "lzzy", name: "🎬量子资源", api: "https://cj.lzcaiji.com/api.php/provide/vod" },
        { id: "ffzy", name: "🎬非凡资源", api: "https://api.ffzyapi.com/api.php/provide/vod" },
        { id: "bfzy", name: "🎬暴风资源", api: "https://bfzyapi.com/api.php/provide/vod" },
        { id: "hnzy", name: "🎬红牛资源", api: "https://www.hongniuzy2.com/api.php/provide/vod" },
        { id: "zdzy", name: "🎬最大资源", api: "https://api.zuidapi.com/api.php/provide/vod" },
        { id: "wjzy", name: "🎬无尽资源", api: "https://api.wujinapi.me/api.php/provide/vod" },
        { id: "aidan", name: "🎬艾旦影视", api: "https://pz.v88.qzz.io/?url=https://lovedan.net/api.php/provide/vod" }
    ];

    const SAVE_DIR = path.join(__dirname, '../data');
    const B58_PATH = path.join(SAVE_DIR, 'subscribe.b58');
    const JSON_PATH = path.join(SAVE_DIR, 'subscribe.json');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        const api_site = {};
        CMS_SOURCES.forEach(item => {
            api_site[item.id] = {
                api: item.api,
                name: item.name,
                detail: item.api.split('/api.php')[0],
                // --- 核心优化参数注入 ---
                ext: {
                    "threads": 32,              // 开启 32 多线程下载
                    "buffer": 104857600,        // 缓冲区设为 100MB (1024*1024*100)
                    "sniff": 1,                 // 强制嗅探
                    "headers": {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                }
            };
        });

        const finalConfig = {
            cache_time: 7200,
            api_site: api_site,
            custom_category: [
                { name: "电影", type: "movie", query: "电影" },
                { name: "电视剧", type: "tv", query: "电视剧" },
                { name: "综艺", type: "variety", query: "综艺" },
                { name: "动漫", type: "anime", query: "动漫" }
            ]
        };

        const jsonStr = JSON.stringify(finalConfig, null, 2);
        fs.writeFileSync(JSON_PATH, jsonStr);
        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalData))); // 注意这里如果没定义 finalData 请改为 finalConfig
        // 修正逻辑，确保变量一致
        const b58_encoded = bs58.encode(Buffer.from(JSON.stringify(finalConfig)));
        fs.writeFileSync(B58_PATH, b58_encoded);

        console.log(`✅ 性能加速版配置已生成！`);
    } catch (e) {
        console.error("❌ 转换失败:", e.message);
        process.exit(1);
    }
}

start();
