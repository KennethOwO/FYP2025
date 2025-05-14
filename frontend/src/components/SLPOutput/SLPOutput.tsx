// SLPOutput.tsx
import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import styles from "./SLPOutput.module.css";
// Import components for the experience
// @ts-ignore
import { CharacterAnimationsProvider } from "../Avatar/CharacterAnimations";
// @ts-ignore
import Experience from "../Avatar/Experience"; // Adjust the import path
// @ts-ignore
import Man from "../AvatarModels/Man";

interface SLPOutputProps {
  inputText: string;
  speed: number;
  showSkeleton: boolean;
  isPaused: boolean;
  updateCurrentAnimationName: (name: string) => void;
  updateCurrentSignFrame: (frame: number) => void;
  updateStatus: (status: string) => void;
  handFocus: boolean;
  currentAnimationName: string;
  isLoading: boolean;
}

const SLPOutput: React.FC<SLPOutputProps> = ({
  inputText,
  speed,
  showSkeleton,
  isPaused,
  updateCurrentAnimationName,
  updateCurrentSignFrame,
  updateStatus,
  handFocus,
  currentAnimationName,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.canvasWrapper}>
      {isLoading ? (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>{t("loading")}</p>
        </div>
      ) : (
        <Canvas camera={{ position: [0, 0, 225], fov: 50 }}>
          <directionalLight
            intensity={1}
            color="White"
            position={[10, 10, 10]}
          />
          <CharacterAnimationsProvider>
            <Experience />
            <Man
              animationKeyword={inputText}
              speed={speed}
              showSkeleton={showSkeleton}
              repeat={"No"}
              isPaused={isPaused}
              updateCurrentAnimationName={updateCurrentAnimationName}
              updateCurrentSignFrame={updateCurrentSignFrame}
              updateStatus={updateStatus}
            />
          </CharacterAnimationsProvider>
          {/*<FPSCounter onUpdateFPS={updateFPS} />*/}
          {/* @ts-ignore */}
          <OrbitControls />
        </Canvas>
      )}
    </div>
  );
};

export default SLPOutput;
