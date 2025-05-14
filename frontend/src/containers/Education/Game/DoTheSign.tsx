import React, { useState, useRef, useEffect } from "react";
import LoginRemindPopup from "../components/LoginRemindPopup/LoginRemindPopup";
import RulesPopup from "../components/RulesPopup/RulesPopup";
import HintPopup from "../components/HintPopup/HintPopup";
import InnerSetting from "../components/InnerSetting/InnerSetting";
import GameOverPopup from "../components/GameOver/GameOver";
import VideoRecorder from "../components/RecordVideo/VideoRecorder";
import styles from "./DoTheSign.module.css";
import heartImage from "/images/heart.png";
import backgroundMusic from "/music/gameMusic2.mp3";
import buttonClickedSound from "/music/btnClicked.wav";
import correctAnswerSound from "/music/correctMusic.mp3";
import wrongAnswerSound from "/music/wrongMusic.mp3";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSessionStorage } from "usehooks-ts";
import { SendResultToDoTheSign } from "@root/services/leaderboard.service";
import { GetUserByEmail } from "../../../services/account.service";
import { getAuth } from "firebase/auth";

interface GlossAnimation {
    keyword: string;
    animations: string[];
    category: string;
}

const playButtonClickedSound = () => {
    const audio = new Audio(buttonClickedSound);
    audio.play();
};

const playCorrectAnswerSound = () => {
    const audio = new Audio(correctAnswerSound);
    audio.play();
};

const playWrongAnswerSound = () => {
    const audio = new Audio(wrongAnswerSound);
    audio.play();
};

const loadAnimationKeywords = async (): Promise<GlossAnimation[] | null> => {
    try {
        const response = await fetch("/glosses/gloss.json");
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const data: GlossAnimation[] = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to load animation keywords:", error);
        return null;
    }
};

const pickRandomKeyword = async (setAnimationKeyword: React.Dispatch<React.SetStateAction<string>>) => {
    const data = await loadAnimationKeywords();

    if (data) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomKeyword = data[randomIndex].keyword;

        // Format each word to have the first letter capitalized
        const formattedKeyword = randomKeyword
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

        setAnimationKeyword(formattedKeyword); // Set the formatted keyword in state
    }
};

const DoTheSign: React.FC = () => {
    const [lives, setLives, removeLives] = useSessionStorage("doTheSignLives", 3);
    const [score, setScore] = useSessionStorage("doTheSignScore", 0);
    const [level, setLevel] = useSessionStorage("doTheSignCurrentLevel", 1);
    const [hintUsedCount, setHintUsedCount] = useSessionStorage("doTheSignHintUsedCount", 0);
    const [animationKeyword, setAnimationKeyword] = useSessionStorage("animationKeyword", "");

    const { t, i18n } = useTranslation();
    const [isLoginRemindPopupVisible, setIsLoginRemindPopupVisible] = useState(false);
    const [isInnerSettingOpen, setIsInnerSettingOpen] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [recordingStarted, setRecordingStarted] = useState(false); // State to track if recording has started
    const [countdown, setCountdown] = useState(20);
    const [isCameraVisible, setIsCameraVisible] = useState(true); // State to control camera visibility
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const auth = getAuth();
    const user = auth.currentUser;
    useEffect(() => {
        if (!user) {
            setIsLoginRemindPopupVisible(true);
        }
    }, []);

    // Function to start countdown timer
    const startCountdown = () => {
        setRecordingStarted(true);
        timerRef.current = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 0) {
                    clearInterval(timerRef.current!);
                    return 20;
                } else {
                    return prevCountdown - 1;
                }
            });
        }, 1000);
    };

    useEffect(() => {
        const handleCountdownEnd = async () => {
            if (countdown === 0) {
                playWrongAnswerSound();
                toast.error(t("exceedTime"), {
                    icon: "⏰",
                });
                setLevel((prev) => prev + 1);
                setLives(lives - 1);
                if (lives === 1) {
                    setGameOver(true);
                    removeLives();

                    if (user) {
                        const res = await GetUserByEmail(user.email, user);
                        const data = {
                            score: score,
                            user_id: res.data.user_id,
                        };

                        await SendResultToDoTheSign(data, user);
                    }
                }
                pickRandomKeyword(setAnimationKeyword);
                stopCountdown();
                setRecordingStarted(false);
                setCountdown(20);
                setIsCameraVisible(false);
                setHintUsedCount(0);
                setTimeout(() => {
                    setIsCameraVisible(true);
                }, 100);
            }
        };

        handleCountdownEnd();
    }, [countdown]);

    // Function to stop countdown timer
    const stopCountdown = () => {
        setRecordingStarted(false); // Set recording started flag to false
        if (timerRef.current) {
            clearInterval(timerRef.current); // Clear the timer interval
        }
    };

    // Function to format time as MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const audioRef = useRef<HTMLAudioElement>(null);
    const updateBackgroundMusicVolume = (volume: number) => {
        if (audioRef.current) {
            const localVolumeValue = localStorage.getItem("volumeValue");
            if (localVolumeValue) {
                const volumeValue = parseInt(localVolumeValue, 10);
                audioRef.current.volume = volumeValue / 100;
            } else {
                audioRef.current.volume = volume;
            }
        }
    };

    const handleVideoData = (data: { return: string }) => {
        const dataString = data.return;
        const keywords = dataString.split(",").map((word) => word.trim());

        if (keywords.includes(animationKeyword)) {
            setScore((prevScore) => prevScore + 2);
            playCorrectAnswerSound();
            toast.success(t("correctSign"));
        } else {
            setLives(lives - 1);
            playWrongAnswerSound();
            toast.error(t("wrongSign"));

            if (lives <= 1) {
                setGameOver(true);
                const handleGameOver = async () => {
                    if (user) {
                        const res = await GetUserByEmail(user.email, user);
                        const data = {
                            score: score,
                            user_id: res.data.user_id,
                        };
                        await SendResultToDoTheSign(data, user);
                    }
                };
                handleGameOver();
            }
        }

        // Increase level and pick a new random keyword
        setLevel((prevLevel) => prevLevel + 1);
        pickRandomKeyword(setAnimationKeyword);

        // Reset the timer, camera, and hint used state
        setCountdown(20);
        setIsCameraVisible(false);
        setHintUsedCount(0);
        setTimeout(() => {
            setIsCameraVisible(true);
        }, 100);
    };

    // Function to render hearts for lives
    const renderLives = () => {
        return Array.from({ length: lives }, (_, i) => <img key={i} src={heartImage} alt="Heart" />);
    };

    useEffect(() => {
        if (!animationKeyword) {
            pickRandomKeyword(setAnimationKeyword);
        }
        updateBackgroundMusicVolume(1);
    }, []);

    return (
        <div className={styles.do_the_sign_layout}>
            {isLoginRemindPopupVisible && <LoginRemindPopup onClose={() => setIsLoginRemindPopupVisible(false)} />}
            {gameOver && <GameOverPopup score={score} onClose={() => setGameOver(false)} />}
            <div className={styles.do_the_sign_container}>
                <div className={styles.do_the_sign}>
                    <div className={styles.header}>
                        <div className={styles.button_header}>
                            <div>
                                <button
                                    className={`${styles.shared_btn} ${styles.shared_btn2} ${styles.rules_btn}`}
                                    type="button"
                                    onClick={() => {
                                        setShowRules(true);
                                        playButtonClickedSound();
                                    }}
                                >
                                    {t("rules")}
                                </button>
                                <button
                                    className={`${styles.shared_btn} ${styles.shared_btn2} ${styles.hint_btn}`}
                                    type="button"
                                    onClick={() => {
                                        if (hintUsedCount < 2) {
                                            setShowHint(true);
                                            setHintUsedCount(hintUsedCount + 1);
                                            playButtonClickedSound();
                                        } else {
                                            toast(t("hintError"), {
                                                icon: "🤪",
                                            });
                                        }
                                    }}
                                >
                                    {t("hint")}
                                </button>
                            </div>

                            <button
                                className={`${styles.shared_btn} ${styles.setting_btn}`}
                                type="button"
                                onClick={() => {
                                    playButtonClickedSound();
                                    setIsInnerSettingOpen(true);
                                }}
                            >
                                <img src="./images/setting.png" alt="Setting" />
                            </button>
                        </div>

                        <div className={styles.info_header}>
                            <h1 className={styles.level_title}>
                                {t("level")}: {level}
                            </h1>
                            <h2 className={styles.score_title}>
                                {t("score")}: {score}
                            </h2>
                            <div className={styles.lives_container}>{renderLives()}</div>
                            <h3 className={styles.timer_title}>{formatTime(countdown)}</h3>
                        </div>
                    </div>

                    {showRules && <RulesPopup onClose={() => setShowRules(false)} title={t("game_rules")} rules={[t("dts_rules1"), t("dts_rules2"), t("dts_rules3"), t("dts_rules4"), t("dts_rules5"), t("dts_rules6"), t("dts_rules7"), t("dts_rules8"), t("dts_rules9")]} />}
                    {showHint && <HintPopup onClose={() => setShowHint(false)} title={t("game_hint")} animationKeyword={animationKeyword} />}

                    <div className={styles.box_container}>
                        <div className={`${styles.box} ${styles.left_box}`}>{animationKeyword}</div>
                        <div className={`${styles.box} ${styles.right_box}`}>{isCameraVisible && <VideoRecorder countdown={countdown} onStartRecording={startCountdown} onStopRecording={stopCountdown} onVideoData={handleVideoData} />}</div>
                    </div>
                </div>
            </div>
            {/* Add audio player for background music */}
            <audio ref={audioRef} autoPlay loop>
                <source src={backgroundMusic} type="audio/mpeg" />
                {t("not_support_music")}
            </audio>
            {/* Render InnerSetting if isInnerSettingOpen is true */}
            {isInnerSettingOpen && <InnerSetting onClose={() => setIsInnerSettingOpen(false)} onVolumeChange={updateBackgroundMusicVolume} />}
        </div>
    );
};

export default DoTheSign;
