const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    const RAW_URL = "https://pz.v88.qzz.io?format=2&source=full";
    // 确保路径在根目录下的 data 文件夹
    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        // 1. 自动创建目录
        if (!fs.existsSync(SAVE_DIR)) {
            fs.mkdirSync(SAVE_DIR, { recursive: true });
        }

        console.log("正在连接源服务器...");
        const res = await axios.get(RAW_URL, { 
            timeout: 60000, // 60秒超时，应对高延迟
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        // 2. 格式校验与筛选
        let rawList = [];
        if (Array.isArray(res.data)) {
            rawList = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
            rawList = res.data.data;
        }

        // 筛选前20个，注入大吞吐参数
        const processed = rawList.slice(0, 20).map(item => ({
            name: item.name || "优质线路",
            url: item.url,
            logo: item.logo || "",
            group: "极速专区",
            // 注入符合 DecoTV 的播放优化参数
            meta: {
                ua: "Lavf/58.29.100",
                buffer: "100MB",
                timeout: 30000
            }
        }));

        const finalOutput = {
            status: "success",
            updated: new Date().toISOString(),
            data: processed
        };

        // 3. Base58 编码
        const jsonStr = JSON.stringify(finalOutput);
        const encoded = bs58.encode(Buffer.from(jsonStr));
        
        fs.writeFileSync(SAVE_PATH, encoded);
        console.log(`✅ 成功! 文件已写入: ${SAVE_PATH}`);
    } catch (e) {
        console.error("❌ 运行出错详情:");
        console.error(e.message);
        process.exit(1); 
    }
}

start();
