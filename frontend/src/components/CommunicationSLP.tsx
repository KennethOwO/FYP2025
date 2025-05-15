import React, { useState, useEffect, useRef } from "react";
import styles from "./CommunicationSLP.module.css";
import Button from "@mui/material/Button";

interface Frame {
    version: number;
    people: any[];
    gloss?: string;
    id?: string;
    frame_index?: number;
}



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

const CommunicationSLP: React.FC = () => {
    const [inputText, setInputText] = useState("");
    const [matchedGlosses, setMatchedGlosses] = useState<string[]>([]);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/slp/match-and-connect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ text: inputText })
        });

        const { combined_jsonl_path, matched } = await response.json();
        setMatchedGlosses(matched);

        if (!combined_jsonl_path) return;

        const res = await fetch(import.meta.env.VITE_BACKEND_URL + combined_jsonl_path, {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        const txt = await res.text();
        if (txt.startsWith("<!DOCTYPE html")) {
            console.error("Received HTML instead of JSONL:", txt);
            return;
        }
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
    
    const handleReset = () => {
    setInputText("");
    setMatchedGlosses([]);
    setFrames([]);
    setCurrentFrameIndex(0);
    };


    return (
        <div className={styles.containerwrapper}>
        <div className={styles.container}>
        <div className={styles.contentwrapper}>
        <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your sentence here..."
            className={styles.textarea}
            rows={3}
            />
            <div className={styles.buttonArea}>
            <Button type="submit" variant="contained" className={styles.playButton}>
            Match & Play
            </Button>
             <Button type="button" variant="outlined" className={styles.resetButton} onClick={handleReset}>
            Reset
            </Button>
            </div>
        </form>

        {matchedGlosses.length > 0 && (
            <p className={styles.matchedGlosses}>
            Gloss Matched: {matchedGlosses.join(", ")}
            </p>
        )}
        </div>

        
        <div className={styles.contentwrapper} id="slp-canvas">
            <SLPFrameRenderer frame={frames[currentFrameIndex]} />
        </div>
        </div>
        </div>

    );
};

const SLPFrameRenderer: React.FC<{ frame: Frame }> = ({ frame }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !frame) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const person = frame.people?.[0];
        if (!person) return;

        const pose = chunk(person.pose_keypoints_2d || [], 2);
        const left = chunk(person.hand_left_keypoints_2d || [], 2);
        const right = chunk(person.hand_right_keypoints_2d || [], 2);

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

        ctx.fillStyle = "green";
        pose.forEach((pt) => {
            if (valid(pt)) {
                ctx.beginPath();
                ctx.arc(pt[0], pt[1], 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

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

        ctx.fillStyle = "yellow";
        left.forEach((pt) => {
            if (valid(pt)) {
                ctx.beginPath();
                ctx.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

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

        ctx.fillStyle = "magenta";
        right.forEach((pt) => {
            if (valid(pt)) {
                ctx.beginPath();
                ctx.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }, [frame]);
    

    return <canvas ref={canvasRef} width={640} height={480} className={styles.canvasElement} />;
};

export default CommunicationSLP;
