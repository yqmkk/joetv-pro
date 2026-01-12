const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

// 配置信息
const RAW_URL = "https://pz.v88.qzz.io?format=2&source=full";
const SAVE_DIR = path.join(__dirname, '../data');
const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

async function start() {
    try {
        // 确保目录存在
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR);

        console.log("正在从原始源获取数据...");
        const res = await axios.get(RAW_URL);
        const rawList = Array.isArray(res.data) ? res.data : [];

        // 筛选前 20 个并注入大吞吐参数
        const refinedList = rawList.slice(0, 20).map(item => ({
            name: item.name,
            url: item.url,
            logo: item.logo || "",
            group: "极速大吞吐专区",
            params: {
                // 核心：增加缓冲区大小和超时时间，对抗高延迟
                buffer_size: "100MB",
                connection_timeout: 30000,
                read_timeout: 60000
            }
        }));

        const finalJson = {
            version: "2.0",
            name: "自动更新源",
            updated_at: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
            channels: refinedList
        };

        // 转为 Base58 编码
        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalJson)));
        
        fs.writeFileSync(SAVE_PATH, encoded);
        console.log(`✅ 成功生成！共 ${refinedList.length} 个频道。`);
    } catch (e) {
        console.error("❌ 抓取失败:", e.message);
        process.exit(1);
    }
}
start();
