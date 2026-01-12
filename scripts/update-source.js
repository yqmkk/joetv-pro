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

        console.log("正在尝试连接原始源...");
        const res = await axios.get(RAW_URL, { 
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // 调试信息：打印返回的前100个字符，确认数据格式
        const sample = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        console.log("源数据样本:", sample.substring(0, 100));

        let channels = [];

        // 1. 尝试解析为 JSON 数组
        if (Array.isArray(res.data)) {
            channels = res.data;
        } 
        // 2. 尝试解析 JSON.data
        else if (res.data && Array.isArray(res.data.data)) {
            channels = res.data.data;
        } 
        // 3. 核心：处理 TXT 格式 (例如: 频道名,URL)
        else {
            const lines = sample.split(/\r?\n/);
            lines.forEach(line => {
                if (line.includes(',') && line.includes('://')) {
                    const parts = line.split(',');
                    const name = parts[0].trim();
                    const url = parts[parts.length - 1].trim();
                    if (url.startsWith('http')) {
                        channels.push({ name, url });
                    }
                }
            });
        }

        console.log(`初步解析到 ${channels.length} 个地址`);

        // 针对 DecoTV 进行数据清洗
        const processed = channels
            .filter(item => item.url && item.url.startsWith('http'))
            .slice(0, 20)
            .map(item => ({
                name: item.name || "极速线路",
                url: item.url,
                group: "自动更新",
                config: {
                    buffer: "100MB",
                    ua: "Mozilla/5.0",
                    timeout: 30000
                }
            }));

        if (processed.length === 0) {
            throw new Error("未能解析出任何有效的播放地址，请检查源格式");
        }

        // 包装为 DecoTV 兼容的 JSON 结构
        const finalOutput = {
            version: "1.0",
            time: new Date().toISOString(),
            list: processed // 这里根据你 DecoTV 要求的字段名可以改为 urls 或 channels
        };

        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalOutput)));
        fs.writeFileSync(SAVE_PATH, encoded);
        
        console.log(`✅ 成功! 写入了 ${processed.length} 个地址到 subscribe.b58`);
    } catch (e) {
        console.error("❌ 错误详情:", e.message);
        process.exit(1); 
    }
}
start();
