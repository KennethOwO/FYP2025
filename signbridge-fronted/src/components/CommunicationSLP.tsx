import React, { useState, useEffect, useRef } from "react";
import styles from "./CommunicationSLP.module.css";
import Button from "@mui/material/Button";
import { fetchGlossMatch, fetchJsonlFrames } from "../services/slp.service";

interface Frame {
    version: number;
    people: any[];
    gloss?: string;
    id?: string;
    frame_index?: number;
}

const CommunicationSLP: React.FC = () => {
    const [inputText, setInputText] = useState("");
    const [matchedGlosses, setMatchedGlosses] = useState<string[]>([]);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // 1️⃣ 发给新的后端 API
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/slp/match-and-connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: inputText }),
        });        
    
        const { combined_jsonl_path, matched } = await response.json();
        setMatchedGlosses(matched);
    
        if (!combined_jsonl_path) {
            console.log("没有匹配到 gloss");
            return;
        }
    
        // 2️⃣ 下载合并的 JSONL 文件
        const res = await fetch(import.meta.env.VITE_BACKEND_URL + combined_jsonl_path);
        const txt = await res.text();
        const lines = txt.trim().split("\n").map((line) => JSON.parse(line));
    
        setFrames(lines);
        setCurrentFrameIndex(0);
    };    

    useEffect(() => {
        if (frames.length === 0) return;
        const interval = setInterval(() => {
            setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
        }, 40);
        return () => clearInterval(interval);
    }, [frames]);

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="输入句子（会自动匹配 gloss）"
                    className={styles.textarea}
                />
                <Button type="submit" variant="contained">
                    匹配并播放
                </Button>
            </form>

            {matchedGlosses.length > 0 && (
                <div>
                    <p>匹配到的 Gloss: {matchedGlosses.join(", ")}</p>
                </div>
            )}

            <div className={styles.canvas}>
                <SLPFrameRenderer frame={frames[currentFrameIndex]} />
            </div>
        </div>
    );
};

// 骨架线定义
const posePairs = [
    [1, 8], [1, 2], [2, 3], [3, 4],
    [1, 5], [5, 6], [6, 7],
    [1, 0], [0, 14], [14, 16], [0, 15], [15, 17],
    [8, 9], [9, 10], [8, 12], [12, 13],
];
const handPairs = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
];

function chunk(arr: number[], size: number) {
    const res: number[][] = [];
    for (let i = 0; i + 1 < arr.length; i += size) {
        res.push([arr[i], arr[i + 1]]);
    }
    return res;
}
function valid(pt: number[]) {
    return Array.isArray(pt) && (pt[0] !== 0 || pt[1] !== 0);
}

const SLPFrameRenderer: React.FC<{ frame: Frame }> = ({ frame }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !frame) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 清除并设定黑色背景
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (frame.people?.[0]) {
            const person = frame.people[0];
            const pose = chunk(person.pose_keypoints_2d || [], 2);
            const left = chunk(person.hand_left_keypoints_2d || [], 2);
            const right = chunk(person.hand_right_keypoints_2d || [], 2);

            // 画 pose 骨架
            ctx.lineWidth = 2;
            ctx.strokeStyle = "blue";
            posePairs.forEach(([i, j]) => {
                const a = pose[i], b = pose[j];
                if (valid(a) && valid(b)) {
                    ctx.beginPath();
                    ctx.moveTo(a[0], a[1]);
                    ctx.lineTo(b[0], b[1]);
                    ctx.stroke();
                }
            });
            // pose 关键点
            ctx.fillStyle = "green";
            pose.forEach((pt) => {
                if (valid(pt)) {
                    ctx.beginPath();
                    ctx.arc(pt[0], pt[1], 4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });

            // 左手骨架
            ctx.strokeStyle = "red";
            handPairs.forEach(([i, j]) => {
                const a = left[i], b = left[j];
                if (valid(a) && valid(b)) {
                    ctx.beginPath();
                    ctx.moveTo(a[0], a[1]);
                    ctx.lineTo(b[0], b[1]);
                    ctx.stroke();
                }
            });
            // 左手点
            ctx.fillStyle = "yellow";
            left.forEach((pt) => {
                if (valid(pt)) {
                    ctx.beginPath();
                    ctx.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });

            // 右手骨架
            ctx.strokeStyle = "cyan";
            handPairs.forEach(([i, j]) => {
                const a = right[i], b = right[j];
                if (valid(a) && valid(b)) {
                    ctx.beginPath();
                    ctx.moveTo(a[0], a[1]);
                    ctx.lineTo(b[0], b[1]);
                    ctx.stroke();
                }
            });
            // 右手点
            ctx.fillStyle = "magenta";
            right.forEach((pt) => {
                if (valid(pt)) {
                    ctx.beginPath();
                    ctx.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        }
    }, [frame]);

    return <canvas ref={canvasRef} width={640} height={480} className={styles.canvasElement} />;
};

export default CommunicationSLP;
