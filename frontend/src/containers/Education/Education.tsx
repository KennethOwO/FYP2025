import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingPopup from "./components/SettingPopup/SettingPopup";
import LeaderboardPopup from "./components/LeaderboardPopup/LeaderboardPopup"
import styles from "./Education.module.css";
import backgroundMusic from "/music/gameMusic.mp3";
import buttonClickedSound from "/music/btnClicked.wav";
import { useTranslation } from "react-i18next";

export default function Education() {
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const [isLeaderboardPopupOpen, setIsLeaderboardPopupOpen] = useState(false);
	const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);

	// Function to play button clicked sound
	const playButtonClickedSound = () => {
		const audio = new Audio(buttonClickedSound);
		audio.play();
	};

	// Function to update background music volume
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

	useEffect(() => {
		updateBackgroundMusicVolume(1);
	}, []);

	return (
		<div className={styles.education_layout}>
			<div className={styles.education_container}>
				<div className={styles.education_game_mode}>
					<h1>{t('game_mode')}</h1>
					<button
						className={`${styles.game_btn} ${styles.leaderboard_btn}`}
						type="button"
						onClick={() => {
							playButtonClickedSound();
							setIsLeaderboardPopupOpen(true); // Open the leaderboard popup
						}}>
						<img className={styles.trophyImg} src="./images/trophy.png" alt="Leaderboard" />
					</button>
					<button
						className={`${styles.game_btn} ${styles.setting_btn}`} 
						type="button"
						onClick={() => {
							playButtonClickedSound();
							setIsSettingPopupOpen(true); // Open the setting popup
						}}>
						<img className={styles.settingImg} src="./images/setting.png" alt="Setting" />
					</button>
					<button
						className={`${styles.game_btn} ${styles.guess_the_word_btn}`} 
						type="button"
						onClick={() => {
							navigate("/guess-the-word");
							playButtonClickedSound();
						}}>
						{t('guess_the_word')}
					</button>
					<button
						className={`${styles.game_btn} ${styles.do_the_sign_btn}`}
						type="button"
						onClick={() => {
							navigate("/do-the-sign");
							playButtonClickedSound();
						}}>
						{t('do_the_sign')}
					</button>
				</div>
			</div>
			{/* Add audio player for background music */}
			<audio ref={audioRef} autoPlay loop>
				<source src={backgroundMusic} type="audio/mpeg" />
				{t('not_support_music')}
			</audio>
			{/* Render SettingPopup if isSettingPopupOpen is true */}
			{isSettingPopupOpen && <SettingPopup onClose={() => setIsSettingPopupOpen(false)} onVolumeChange={updateBackgroundMusicVolume} />}
			{isLeaderboardPopupOpen && (
				<LeaderboardPopup
					onClose={() => setIsLeaderboardPopupOpen(false)}
				/>
			)}
		</div>
	);
}
