const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 影视资源站 API 列表 (AppleCMS 接口)
    const VOD_SOURCES = [
        { name: "私有资源", url: "https://pz.v88.qzz.io?format=2&source=full" },
        { name: "量子资源", url: "https://cj.lziapi.com/api.php/provide/vod/at/xml/" },
        { name: "非凡资源", url: "http://cj.ffzyapi.com/api.php/provide/vod/at/xml/" },
        { name: "索尼资源", url: "https://suoniapi.com/api.php/provide/vod/at/xml/" }
    ];

    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        let allResources = [];

        for (const source of VOD_SOURCES) {
            try {
                console.log(`正在抓取点播源: ${source.name}...`);
                // 影视站通常返回 XML 或 JSON，这里统一做基础连接测试
                const res = await axios.get(source.url, { timeout: 10000 });
                
                // 如果是你原本提供的那个源，它返回的可能直接是带名字的地址列表
                if (source.name === "私有资源") {
                    const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
                    data.split(/\r?\n/).forEach(line => {
                        if (line.includes(',') && line.includes('://')) {
                            const [name, url] = line.split(',');
                            allResources.push({
                                name: name.trim(),
                                url: url.trim(),
                                api: source.url,
                                type: "cms" // 标识为资源站
                            });
                        }
                    });
                } else {
                    // 通用资源站只记录接口地址，由 DecoTV 运行时去搜片
                    allResources.push({
                        name: source.name,
                        url: source.url,
                        type: "cms"
                    });
                }
            } catch (err) {
                console.warn(`源 ${source.name} 连接超时，跳过`);
            }
        }

        // 构造 DecoTV 点播配置文件
        const finalConfig = {
            version: "VOD-2.0",
            updated: new Date().toLocaleString('zh-CN'),
            // 影视资源必须包含的关键字段
            providers: allResources.map(item => ({
                name: item.name,
                api: item.url,
                // 注入大吞吐量参数：强制 64 线程下载缓冲
                download_config: {
                    threads: 64,
                    buffer_mb: 200, 
                    retry: 5
                }
            }))
        };

        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalConfig)));
        fs.writeFileSync(SAVE_PATH, encoded);
        
        console.log(`✅ 成功! 已聚合 ${allResources.length} 个全网影视点播源。`);
    } catch (e) {
        console.error("❌ 严重错误:", e.message);
        process.exit(1);
    }
}

start();
