import React from "react";
import styles from "./ButtonRow.module.css";
import { useTranslation } from "react-i18next";

interface ButtonRowProps {
    isPaused: boolean;
    togglePause: () => void;
    renderMicrophoneButton: () => JSX.Element;
    setCustomTranscript: (text: string) => void;
}

const ButtonRow: React.FC<ButtonRowProps> = ({ isPaused, togglePause, renderMicrophoneButton, setCustomTranscript }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.buttonRow}>
            <button className={styles.avatarpauseBtn} onClick={togglePause} type="button">
                <i className={`fa ${isPaused ? "fa-play" : "fa-pause"} ${styles.faPlayPause}`}></i>
                <p className={styles.btnText}>{isPaused ? t("unpause") : t("pause")}</p>
            </button>

            {renderMicrophoneButton()}

            <button
                className={styles.avatarclearBtn}
                onClick={() => setCustomTranscript("")} // Clear the textarea
            >
                <i className={`fa fa-trash ${styles.faTrash}`}></i>
                <p className={styles.btnText}>{t("clear")}</p>
            </button>
        </div>
    );
};

export default ButtonRow;
