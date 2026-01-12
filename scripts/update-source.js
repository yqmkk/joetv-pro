const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

async function start() {
    // 影视点播资源聚合列表 (涵盖全网蓝光/无水印源)
    const CMS_SOURCES = [
        { name: "我的私有源", url: "https://pz.v88.qzz.io?format=2&source=full" },
        { name: "量子资源", url: "https://cj.lziapi.com/api.php/provide/vod/at/xml/" },
        { name: "非凡资源", url: "http://cj.ffzyapi.com/api.php/provide/vod/at/xml/" },
        { name: "索尼资源", url: "https://suoniapi.com/api.php/provide/vod/at/xml/" },
        { name: "红牛资源", url: "https://www.hongniuzy2.com/api.php/provide/vod/at/xml/" },
        { name: "快车资源", url: "https://caiji.kczyapi.com/api.php/provide/vod/at/xml/" },
        { name: "樱花资源", url: "https://m3u8.apilyzy.com/api.php/provide/vod/at/xml/" }
    ];

    const SAVE_DIR = path.join(__dirname, '../data');
    const SAVE_PATH = path.join(SAVE_DIR, 'subscribe.b58');

    try {
        if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

        console.log("开始聚合全网点播资源...");
        let validProviders = [];

        for (const source of CMS_SOURCES) {
            try {
                // 验证源是否可用
                const res = await axios.get(source.url, { timeout: 8000 });
                if (res.status === 200) {
                    validProviders.push({
                        name: source.name,
                        api: source.url,
                        type: "cms",
                        // 注入大吞吐参数，对抗卡顿
                        parse: {
                            threads: 32,
                            buffer_mb: 100,
                            ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        }
                    });
                    console.log(`✅ 已连接: ${source.name}`);
                }
            } catch (err) {
                console.warn(`⚠️ 跳过失效源: ${source.name} (${err.message})`);
            }
        }

        if (validProviders.length === 0) throw new Error("所有资源站均不可访问，请检查网络！");

        // 构建 DecoTV 专用点播 JSON 结构
        const finalJson = {
            name: "全网点播聚合源",
            updated: new Date().toISOString(),
            // 这里是 DecoTV 点播所需的 key
            providers: validProviders, 
            // 兜底配置：大吞吐不卡顿策略
            config: {
                cache_size: "200MB",
                decode: "hardware",
                timeout: 30
            }
        };

        const encoded = bs58.encode(Buffer.from(JSON.stringify(finalJson)));
        fs.writeFileSync(SAVE_PATH, encoded);
        
        console.log(`\n🎉 任务完成！共计聚合 ${validProviders.length} 个有效点播源。`);
    } catch (e) {
        console.error("❌ 任务彻底失败:", e.message);
        process.exit(1); 
    }
}

start();
