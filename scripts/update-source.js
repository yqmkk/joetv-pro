const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 1. 定义源列表（包含你的私有源和公开的全网源）
    const SOURCES = [
        { name: "私有源", url: "https://pz.v88.qzz.io?format=2&source=full", type: "auto" },
        { name: "全网聚合1", url: "https://raw.githubusercontent.com/fanmingming/live/main/tv/m3u/ipv6.m3u", type: "m3u" },
        { name: "全网聚合2", url: "https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u", type: "m3u" }
    ];

    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        let allChannels = [];

        for (const source of SOURCES) {
            try {
                console.log(`正在从 ${source.name} 抓取...`);
                const res = await axios.get(source.url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
                const content = res.data;

                if (source.type === "m3u" || (typeof content === 'string' && content.includes("#EXTM3U"))) {
                    // 解析 M3U 格式
                    const lines = content.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes("#EXTINF")) {
                            const nameMatch = lines[i].match(/,(.*)/);
                            const name = nameMatch ? nameMatch[1].trim() : "未命名频道";
                            const url = lines[i + 1] ? lines[i + 1].trim() : "";
                            if (url.startsWith('http')) {
                                allChannels.push({ name, url, group: source.name });
                            }
                        }
                    }
                } else {
                    // 解析 JSON 或 TXT 格式 (兼容你之前的逻辑)
                    const data = typeof content === 'string' ? content : JSON.stringify(content);
                    const lines = data.split(/\r?\n/);
                    lines.forEach(line => {
                        if (line.includes(',') && line.includes('://')) {
                            const [name, url] = line.split(',');
                            if (url && url.trim().startsWith('http')) {
                                allChannels.push({ name: name.trim() || "极速线路", url: url.trim(), group: source.name });
                            }
                        }
                    });
                }
            } catch (err) {
                console.warn(`跳过源 ${source.name}: ${err.message}`);
            }
        }

        // 2. 去重与精选 (确保每个都有名字，取前 100 个以保证大吞吐量)
        const uniqueChannels = [];
        const seenUrls = new Set();

        for (const ch of allChannels) {
            if (!seenUrls.has(ch.url)) {
                seenUrls.add(ch.url);
                uniqueChannels.push({
                    name: ch.name,
                    url: ch.url,
                    group: ch.group,
                    config: {
                        buffer: "100MB", // 针对高延迟线路的大缓存优化
                        timeout: 30000
                    }
                });
            }
            if (uniqueChannels.length >= 100) break; // 限制数量防止订阅文件过大
        }

        if (uniqueChannels.length === 0) throw new Error("全网抓取结束，未发现有效频道");

        // 3. 封装并 Base58 加密
        const finalOutput = {
            version: "3.0",
            updated: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
            list: uniqueChannels
        };

        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalOutput)));
        fs.writeFileSync(SAVE_PATH, encoded);
        
        console.log(`✅ 成功! 聚合了 ${uniqueChannels.length} 个全网频道。`);
    } catch (e) {
        console.error("❌ 任务彻底失败:", e.message);
        process.exit(1);
    }
}

start();
