// src/components/JsonlPlayer.jsx
import React, { useEffect, useRef, useState } from "react";

// Skeleton connection definitions
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

// Helpers
function chunk(arr, size) {
  const res = [];
  for (let i = 0; i + 1 < arr.length; i += size) {
    res.push([arr[i], arr[i + 1]]);
  }
  return res;
}
function valid(pt) {
  return Array.isArray(pt) && (pt[0] !== 0 || pt[1] !== 0);
}

const JsonlPlayer = ({
  glossKeyword,
  width = 640,
  height = 480,
  fps = 25,
}) => {
  const canvasRef = useRef(null);
  const [frames, setFrames] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!glossKeyword) return;

    const fileName = glossKeyword.toUpperCase().replace(/\s+/g, "_") + ".jsonl";
    const base = import.meta.env.VITE_BACKEND_URL || "";
    const url = `${base}/glosses/${fileName}`;

    console.log("Fetching JSONL from:", url);

    fetch(url, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((txt) => {
        if (txt.startsWith("<!DOCTYPE html")) throw new Error("Received HTML instead of JSONL");

        const lines = txt
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        setFrames(lines);
        setIdx(0);
      })
      .catch((err) => {
        console.error("JsonlPlayer failed to load JSONL:", err, url);
        setFrames([]);
      });
  }, [glossKeyword]);

  useEffect(() => {
    if (!frames.length) return;
    const iv = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, 1000 / fps);
    return () => clearInterval(iv);
  }, [frames, fps]);

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

    // Draw pose skeleton
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

    // Left hand
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

    // Right hand
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
