const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 聚合你提供的所有有效点播资源站
    const CMS_SOURCES = [
        { name: "🎬-爱奇艺-", api: "https://iqiyizyapi.com/api.php/provide/vod" },
        { name: "🎬豆瓣资源", api: "https://caiji.dbzy5.com/api.php/provide/vod" },
        { name: "🎬天涯影视", api: "https://tyyszy.com/api.php/provide/vod" },
        { name: "🎬茅台资源", api: "https://caiji.maotaizy.cc/api.php/provide/vod" },
        { name: "🎬卧龙资源", api: "https://wolongzyw.com/api.php/provide/vod" },
        { name: "🎬iKun资源", api: "https://ikunzyapi.com/api.php/provide/vod" },
        { name: "🎬电影天堂", api: "http://caiji.dyttzyapi.com/api.php/provide/vod" },
        { name: "🎬猫眼资源", api: "https://api.maoyanapi.top/api.php/provide/vod" },
        { name: "🎬量子资源", api: "https://cj.lzcaiji.com/api.php/provide/vod" },
        { name: "🎬360 资源", api: "https://360zyzz.com/api.php/provide/vod" },
        { name: "🎬极速资源", api: "https://jszyapi.com/api.php/provide/vod" },
        { name: "🎬非凡资源", api: "https://api.ffzyapi.com/api.php/provide/vod" },
        { name: "🎬暴风资源", api: "https://bfzyapi.com/api.php/provide/vod" },
        { name: "🎬最大资源", api: "https://api.zuidapi.com/api.php/provide/vod" },
        { name: "🎬无尽资源", api: "https://api.wujinapi.me/api.php/provide/vod" },
        { name: "🎬红牛资源", api: "https://www.hongniuzy2.com/api.php/provide/vod" },
        { name: "🎬艾旦影视", api: "https://pz.v88.qzz.io/?url=https://lovedan.net/api.php/provide/vod" }
    ];

    const SAVE_DIR = path.join(__dirname, '../data');
    const B58_PATH = path.join(SAVE_DIR, 'subscribe.b58');
    const JSON_PATH = path.join(SAVE_DIR, 'subscribe.json');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        console.log("🚀 开始抓取并生成双格式文件...");

        // 转换为 DecoTV 标准站点格式
        const sites = CMS_SOURCES.map((item, index) => ({
            key: `site_${index}_${Math.random().toString(36).slice(2, 5)}`,
            name: item.name,
            type: 1, // CMS 采集站
            api: item.api,
            searchable: 1,
            quickSearch: 1,
            filterable: 1,
            ext: {
                threads: 32,
                buffer: 104857600
            }
        }));

        // 根结构
        const finalData = {
            sites: sites,
            updated: new Date().toLocaleString()
        };

        const jsonStr = JSON.stringify(finalData, null, 2); // 格式化 JSON，增加可读性

        // 1. 保存为纯 JSON 文件
        fs.writeFileSync(JSON_PATH, jsonStr);
        console.log(`✅ JSON 格式已保存至: data/subscribe.json`);

        // 2. 保存为 Base58 编码文件
        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalData)));
        fs.writeFileSync(B58_PATH, encoded);
        console.log(`✅ Base58 格式已保存至: data/subscribe.b58`);

        console.log(`\n🎉 任务全部完成！共计聚合 ${sites.length} 个站点。`);
    } catch (e) {
        console.error("❌ 抓取脚本执行失败:", e.message);
        process.exit(1);
    }
}

start();
