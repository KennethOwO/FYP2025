import React, { useState, useEffect, memo } from "react";

const FPSCounter: React.FC = () => {
  const [fps, setFps] = useState("  FPS:   60");

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      const now = performance.now();
      const delta = now - lastTime;
      frameCount++;

      if (delta >= 1000) {
        const newFPS = Math.round((frameCount * 1000) / delta);
        setFps(`  FPS:   ${newFPS}`);
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  });

  return (
    <input className="fps-box" type="text" value={fps} readOnly />
  );
};

export default memo(FPSCounter);
