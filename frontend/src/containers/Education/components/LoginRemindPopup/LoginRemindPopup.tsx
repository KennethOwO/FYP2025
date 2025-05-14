import React, { useEffect, useRef, useState } from "react";
import buttonClickedSound from "/music/btnClicked.wav";
import "nouislider/dist/nouislider.css";
import styles from "./LoginRemindPopup.module.css";
import { useTranslation } from "react-i18next";

interface LoginRemindPopupProps {
	onClose: () => void;
}

const SettingPopup: React.FC<LoginRemindPopupProps> = ({ onClose }) => {
	const { t, i18n } = useTranslation();
	const popupRef = useRef<HTMLDivElement>(null);

	const playButtonClickedSound = () => {
		const audio = new Audio(buttonClickedSound);
		audio.play();
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	return (
		<div className={styles.remind_container}>
			<div ref={popupRef} className={styles.remind_content}>
				<div className={styles.remind_details}>
					<h4 className={styles.remind_title}>⚠️{t('login_remind')}</h4>
                    <button
					className={styles.close_btn_pushable}
					role="button"
					onClick={() => {
						onClose();
						playButtonClickedSound();
					}}>
					<span className={styles.close_btn_shadow}></span>
					<span className={styles.close_btn_edge}></span>
					<span className={styles.close_btn_front}>
						<p>OK</p>
					</span>
				</button>
				</div>
			</div>
		</div>
	);
};

export default SettingPopup;
