const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 你刚才提供的有效 JSON 结构
    const rawConfig = {
        "cache_time": 7200,
        "api_site": {
            "iqiyizyapi.com": { "name": "🎬-爱奇艺-", "api": "https://iqiyizyapi.com/api.php/provide/vod" },
            "dbzy.tv": { "name": "🎬豆瓣资源", "api": "https://caiji.dbzy5.com/api.php/provide/vod" },
            "tyyszy.com": { "name": "🎬天涯影视", "api": "https://tyyszy.com/api.php/provide/vod" },
            "mtzy.me": { "name": "🎬茅台资源", "api": "https://caiji.maotaizy.cc/api.php/provide/vod" },
            "wolongzyw.com": { "name": "🎬卧龙资源", "api": "https://wolongzyw.com/api.php/provide/vod" },
            "ikunzy.com": { "name": "🎬iKun资源", "api": "https://ikunzyapi.com/api.php/provide/vod" },
            "dyttzyapi.com": { "name": "🎬电影天堂", "api": "http://caiji.dyttzyapi.com/api.php/provide/vod" },
            "www.maoyanzy.com": { "name": "🎬猫眼资源", "api": "https://api.maoyanapi.top/api.php/provide/vod" },
            "cj.lzcaiji.com": { "name": "🎬量子资源", "api": "https://cj.lzcaiji.com/api.php/provide/vod" },
            "360zy.com": { "name": "🎬360 资源", "api": "https://360zyzz.com/api.php/provide/vod" },
            "jszyapi.com": { "name": "🎬极速资源", "api": "https://jszyapi.com/api.php/provide/vod" },
            "ffzyapi.com": { "name": "🎬非凡资源", "api": "https://api.ffzyapi.com/api.php/provide/vod" },
            "bfzy.tv": { "name": "🎬暴风资源", "api": "https://bfzyapi.com/api.php/provide/vod" },
            "zuida.xyz": { "name": "🎬最大资源", "api": "https://api.zuidapi.com/api.php/provide/vod" },
            "xinlangapi.com": { "name": "🎬新浪资源", "api": "https://api.xinlangapi.com/xinlangapi.php/provide/vod" },
            "www.hongniuzy.com": { "name": "🎬红牛资源", "api": "https://www.hongniuzy2.com/api.php/provide/vod" },
            "lovedan.net": { "name": "🎬艾旦影视", "api": "https://pz.v88.qzz.io/?url=https://lovedan.net/api.php/provide/vod" }
        }
    };

    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        console.log("正在转换有效点播源格式...");
        
        // 转换格式为 DecoTV 识别的 sites 列表
        const sites = Object.keys(rawConfig.api_site).map(key => {
            const item = rawConfig.api_site[key];
            return {
                key: key,
                name: item.name,
                api: item.api,
                type: 1, // CMS 采集站类型
                searchable: 1,
                quickSearch: 1,
                // 注入你的高吞吐、不卡顿配置
                ext: {
                    threads: 32,
                    buffer: 104857600 // 100MB
                }
            };
        });

        const finalOutput = {
            sites: sites,
            msg: "聚合全网点播资源"
        };

        // 进行 Base58 编码
        const jsonStr = JSON.stringify(finalOutput);
        const encoded = bs58.encode(Buffer.from(jsonStr));
        
        fs.writeFileSync(SAVE_PATH, encoded);
        console.log(`✅ 转换成功！共计 ${sites.length} 个点播站点已编码。`);
    } catch (e) {
        console.error("❌ 转换失败:", e.message);
        process.exit(1);
    }
}
start();
