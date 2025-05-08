import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import buttonClickedSound from "/music/btnClicked.wav";
import styles from "./GameOver.module.css";
import { useTranslation } from "react-i18next";

interface GameOverPopupProps {
    onClose: () => void;
    score: number;
}

const GameOverPopup: React.FC<GameOverPopupProps> = ({ score
}) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const popupRef = useRef<HTMLDivElement>(null);

    const playButtonClickedSound = () => {
        const audio = new Audio(buttonClickedSound);
        audio.play();
    };

    return (
        <div className={styles.gameover_container}>
            <div ref={popupRef} className={styles.gameover_content}>
                <h3>{t('game_over')}</h3>
                <div className={styles.gameover_details}>
                <p className={styles.scoreDisplay}>{t('your_score')}</p>
                <p className={styles.scoreValue}>{score}</p>
                        <button
                            className={styles.quit_btn}
                            type="button"
                            onClick={() => {
                                navigate("/education");
                                playButtonClickedSound();
                            }}
                        >
                            {t('quit_btn')}
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default GameOverPopup;
