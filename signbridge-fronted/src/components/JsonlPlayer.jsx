// src/components/JsonlPlayer.jsx
import React, { useEffect, useRef, useState } from "react";

// 骨架连线定义
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

// 辅助：把一维数组打包成 [ [x,y], [x,y], … ]
function chunk(arr, size) {
  const res = [];
  for (let i = 0; i + 1 < arr.length; i += size) {
    res.push([arr[i], arr[i + 1]]);
  }
  return res;
}
// 辅助：判断点是否有效
function valid(pt) {
  return Array.isArray(pt) && (pt[0] !== 0 || pt[1] !== 0);
}

const JsonlPlayer = ({
  glossKeyword,      // 例如 "ADIK PEREMPUAN"
  width = 640,
  height = 480,
  fps = 25,
}) => {
  const canvasRef = useRef(null);
  const [frames, setFrames] = useState([]);
  const [idx, setIdx] = useState(0);

  // —— 1) 加载 JSONL
  useEffect(() => {
    if (!glossKeyword) return;

    // 文件名：大写 + 空格→下划线 + .jsonl
    const fileName =
      glossKeyword.toUpperCase().replace(/\s+/g, "_") + ".jsonl";

    // 拼后端地址；若配置了 VITE_BACKEND_URL 就用它，否则走相对路径
    const base = import.meta.env.VITE_BACKEND_URL || "";
    const url = `${base}/glosses/${fileName}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((txt) => {
        const lines = txt
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        setFrames(lines);
        setIdx(0);
      })
      .catch((err) => {
        console.error("JsonlPlayer 加载 JSONL 失败:", err, url);
        setFrames([]);
      });
  }, [glossKeyword]);

  // —— 2) 播放定时器
  useEffect(() => {
    if (!frames.length) return;
    const iv = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, 1000 / fps);
    return () => clearInterval(iv);
  }, [frames, fps]);

  // —— 3) 渲染到 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frames.length) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    const data = frames[idx];
    const people = data.people || [];
    if (!people.length) return;
    const p = people[0];

    const pose = chunk(p.pose_keypoints_2d || [], 2);
    const left = chunk(p.hand_left_keypoints_2d || [], 2);
    const right = chunk(p.hand_right_keypoints_2d || [], 2);

    // Draw pose bones
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
    // Draw pose joints
    ctx.fillStyle = "green";
    pose.forEach((pt) => {
      if (valid(pt)) {
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw left hand bones
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
    // Draw left hand joints
    ctx.fillStyle = "yellow";
    left.forEach((pt) => {
      if (valid(pt)) {
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw right hand bones
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
    // Draw right hand joints
    ctx.fillStyle = "magenta";
    right.forEach((pt) => {
      if (valid(pt)) {
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [idx, frames, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ background: "#000", display: "block", margin: "0 auto" }}
    />
  );
};

export default JsonlPlayer;
