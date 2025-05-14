const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const GLOSS_DIR = path.join(__dirname, "../public/glosses");
const CACHE_DIR = path.join(__dirname, "../public/cache");  // 合并 JSONL 输出位置

const SLPController = {

    // ✅ 这个 matchGloss 先保持不变（仍用旧的 tokenize）
    async matchGloss(req, res) {
        const { text } = req.body;

        // 🟢 调用 Python 获取 matched gloss（取代 tokenize）
        const pythonMatch = spawnSync("python", ["match_gloss.py", text]);

        if (pythonMatch.error) {
            console.error("Python 匹配执行失败:", pythonMatch.error);
            return res.status(500).json({ error: "Python matching failed" });
        }

        const matched = JSON.parse(pythonMatch.stdout.toString());
        return res.json({ glosses: matched });
    },

    async getFrames(req, res) {
        const { glosses } = req.body;
        if (!Array.isArray(glosses) || glosses.length === 0) {
            return res.status(400).json({ error: "No glosses provided" });
        }

        let allFrames = [];
        for (let gloss of glosses) {
            const glossPath = path.join(GLOSS_DIR, `${gloss}.jsonl`);
            if (!fs.existsSync(glossPath)) continue;
            const lines = fs.readFileSync(glossPath, "utf-8")
                .split("\n")
                .filter(Boolean)
                .map(line => JSON.parse(line));
            allFrames = allFrames.concat(lines);
        }

        return res.json({ frames: allFrames });
    },

    // ✅ 新的 API
    async matchAndConnect(req, res) {
        const { text } = req.body;

        // 🟢 1️⃣ 调用 Python 的 match_gloss.py 进行 gloss 匹配
        const pythonMatch = spawnSync("python", ["match_gloss.py", text]);
        console.log("收到的文本：", text);

        if (pythonMatch.error) {
            console.error("Python 匹配执行失败:", pythonMatch.error);
            return res.status(500).json({ error: "Python matching failed" });
        }
        if (pythonMatch.stderr.toString()) {
            console.error("Python 错误：", pythonMatch.stderr.toString());
        }        
        
        const matched = JSON.parse(pythonMatch.stdout.toString());

        if (matched.length === 0) {
            return res.json({ combined_jsonl_path: null, matched: [] });
        }

        // 2️⃣ 输出文件名固定
        const outputName = `combined.jsonl`;
        const outputPath = path.join(CACHE_DIR, outputName);

        // 3️⃣ 调用 connect_gloss_jsonl.py 合并 JSONL
        const python = spawnSync("python", [
            "connect_gloss_jsonl.py",
            ...matched,
            outputPath
        ]);

        if (python.error) {
            console.error("Python 执行失败:", python.error);
            return res.status(500).json({ error: "Python execution failed" });
        }
        if (python.stderr.toString()) {
            console.error("Python 错误:", python.stderr.toString());
        }

        console.log("Python 输出:", python.stdout?.toString());

        return res.json({
            combined_jsonl_path: `/cache/${outputName}`,
            matched
        });
    }
};

module.exports = SLPController;
