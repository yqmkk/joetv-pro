const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    const CMS_SOURCES = [
        { id: "iqiyi", name: "🚀极速-爱奇艺", api: "https://iqiyizyapi.com/api.php/provide/vod" },
        { id: "dbzy", name: "🚀极速-豆瓣", api: "https://caiji.dbzy5.com/api.php/provide/vod" },
        { id: "aidan", name: "🎬高码-艾旦", api: "https://pz.v88.qzz.io/?url=https://lovedan.net/api.php/provide/vod" },
        { id: "lzzy", name: "🎬量子资源", api: "https://cj.lzcaiji.com/api.php/provide/vod" },
        { id: "ffzy", name: "🎬非凡资源", api: "https://api.ffzyapi.com/api.php/provide/vod" },
        { id: "hnzy", name: "🎬红牛资源", api: "https://www.hongniuzy2.com/api.php/provide/vod" }
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
                // 针对 Web 播放引擎的极限优化
                ext: {
                    "flag": ["m3u8", "hls", "mp4"],
                    "threads": 64,                  // 将线程提升到 64，强制多切片并发
                    "buffer": 209715200,            // 缓冲区扩大到 200MB
                    "p2p": 1,                       // 尝试开启 p2p 加速（如果播放器支持）
                    "parse": 1,                     // 开启智能解析
                    "timeout": 15,                  // 缩短超时，快速切换线路
                    "headers": {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                        "Origin": item.api.split('/api.php')[0],
                        "Referer": item.api.split('/api.php')[0]
                    }
                }
            };
        });

        const finalConfig = {
            cache_time: 3600, // 减小缓存时间，保证源的活性
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
        
        const b58_encoded = bs58.encode(Buffer.from(JSON.stringify(finalConfig)));
        fs.writeFileSync(B58_PATH, b58_encoded);

        console.log(`✅ 加速版配置生成成功！共 ${Object.keys(api_site).length} 个资源点。`);
    } catch (e) {
        console.error("❌ 失败:", e.message);
        process.exit(1);
    }
}

start();
