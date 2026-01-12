const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 原始资源列表
    const CMS_SOURCES = [
        { id: "iqiyi", name: "🎬爱奇艺", api: "https://iqiyizyapi.com/api.php/provide/vod" },
        { name: "🎬豆瓣资源", id: "dbzy", api: "https://caiji.dbzy5.com/api.php/provide/vod" },
        { name: "🎬量子资源", id: "lzzy", api: "https://cj.lzcaiji.com/api.php/provide/vod" },
        { name: "🎬非凡资源", id: "ffzy", api: "https://api.ffzyapi.com/api.php/provide/vod" },
        { name: "🎬暴风资源", id: "bfzy", api: "https://bfzyapi.com/api.php/provide/vod" },
        { name: "🎬红牛资源", id: "hnzy", api: "https://www.hongniuzy2.com/api.php/provide/vod" },
        { name: "🎬最大资源", id: "zdzy", api: "https://api.zuidapi.com/api.php/provide/vod" },
        { name: "🎬无尽资源", id: "wjzy", api: "https://api.wujinapi.me/api.php/provide/vod" },
        { name: "🎬艾旦影视", id: "aidan", api: "https://pz.v88.qzz.io/?url=https://lovedan.net/api.php/provide/vod" }
    ];

    const SAVE_DIR = path.join(__dirname, '../data');
    const B58_PATH = path.join(SAVE_DIR, 'subscribe.b58');
    const JSON_PATH = path.join(SAVE_DIR, 'subscribe.json');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        // 1. 转换成 DecoTV 要求的 api_site 对象结构
        const api_site = {};
        CMS_SOURCES.forEach(item => {
            api_site[item.id] = {
                api: item.api,
                name: item.name,
                detail: item.api.split('/api.php')[0] // 自动推导 detail 链接
            };
        });

        // 2. 构建符合示例的完整配置文件
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

        // 保存纯 JSON 文件
        fs.writeFileSync(JSON_PATH, jsonStr);
        
        // 生成 Base58 编码文件
        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalConfig)));
        fs.writeFileSync(B58_PATH, encoded);

        console.log(`✅ 适配成功！共打包 ${Object.keys(api_site).length} 个站点。`);
        console.log(`请复制 data/subscribe.json 的内容到 DecoTV 后台。`);
    } catch (e) {
        console.error("❌ 转换失败:", e.message);
        process.exit(1);
    }
}

start();
