const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    const RAW_URL = "https://pz.v88.qzz.io?format=2&source=full";
    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        console.log("正在深度抓取有效源...");
        const res = await axios.get(RAW_URL, { timeout: 30000 });
        
        let channels = [];

        // 核心：智能解析不同格式
        if (typeof res.data === 'string') {
            // 如果返回的是 TXT 格式 (name,url)
            res.data.split('\n').forEach(line => {
                if (line.includes(',')) {
                    const [name, url] = line.split(',');
                    if (url && url.startsWith('http')) {
                        channels.push({ name: name.trim(), url: url.trim() });
                    }
                }
            });
        } else if (Array.isArray(res.data)) {
            channels = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
            channels = res.data.data;
        }

        // 筛选前20个，并注入“大吞吐量”强制缓存参数
        const processed = channels.slice(0, 20).map(item => ({
            name: `🚀 ${item.name || '极速线路'}`,
            url: item.url,
            group: "自动更新专区",
            // 针对 DecoTV 的播放器优化：强制启用大缓冲区
            config: {
                "cache": 104857600, // 100MB
                "header": "User-Agent:Mozilla/5.0",
                "timeout": 30000
            }
        }));

        if (processed.length === 0) throw new Error("抓取到了数据，但有效频道数量为 0");

        const finalOutput = {
            version: "1.0",
            urls: processed 
        };

        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalOutput)));
        fs.writeFileSync(SAVE_PATH, encoded);
        
        console.log(`✅ 成功! 写入了 ${processed.length} 个有效地址`);
    } catch (e) {
        console.error("❌ 失败:", e.message);
        process.exit(1);
    }
}
start();
