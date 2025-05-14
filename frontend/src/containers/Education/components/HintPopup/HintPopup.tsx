import React, { useEffect, useRef } from "react";
import styles from "./HintPopup.module.css";
import buttonClickedSound from "/music/btnClicked.wav";

// AVATAR LIBRARIES
import { useThree } from "@react-three/fiber";
import { Canvas, useFrame } from "@react-three/fiber";
// @ts-ignore
import { CharacterAnimationsProvider } from "../../../../components/Avatar/CharacterAnimations";
// @ts-ignore
import Experience from "../../../../components/Avatar/Experience";
// @ts-ignore
import Man from "../../../../components/AvatarModels/Man";

interface HintPopupProps {
    onClose: () => void;
    title: string;
    animationKeyword: string;
}

const HintPopup: React.FC<HintPopupProps> = ({
    onClose,
    title,
    animationKeyword,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);

    // Function to play button clicked sound
    const playButtonClickedSound = () => {
        const audio = new Audio(buttonClickedSound);
        audio.play();
    };

    function CameraControl() {
        const { camera } = useThree();

        const x = -7.5; // Adjust these values according to your requirements
        const y = 140;
        const z = 215;
        const decimal = 1; // Adjust this value to control the speed of lerping

        useFrame(() => {
            camera.position.lerp({ x, y, z }, decimal);
            camera.lookAt(x, y, z);
        });

        return null;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className={styles.popup_container}>
            <div ref={popupRef} className={styles.popup_content}>
                <h3>{title}</h3>
                <button
                    className={styles.close_btn_pushable}
                    role="button"
                    onClick={() => {
                        onClose();
                        playButtonClickedSound();
                    }}
                >
                    <span className={styles.close_btn_shadow}></span>
                    <span className={styles.close_btn_edge}></span>
                    <span className={styles.close_btn_front}>
                        <i className={`${styles.fa_close_btn} fa fa-close`}></i>
                    </span>
                </button>

                <div className={`${styles.education_canvas_wrapper} ${styles.popup_details}`}>
                    <Canvas
                        camera={{
                            fov: 35,
                        }}
                    >
                        {/* Your 3D scene components */}
                        <directionalLight
                            intensity={1}
                            color="white"
                            position={[10, 10, 10]}
                        />
                        <CharacterAnimationsProvider>
                            <Experience />
                            <CameraControl />
                            <Man
                                animationKeyword={animationKeyword}
                                speed={""}
                                showSkeleton={""}
                                repeat={"Yes"}
                                isPaused={""}
                            />
                        </CharacterAnimationsProvider>
                    </Canvas>
                </div>
            </div>
        </div>
    );
};

export default HintPopup;
