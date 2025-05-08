import React, { useEffect, useRef } from 'react';
import styles from './RulesPopup.module.css';
import buttonClickedSound from '/music/btnClicked.wav';

interface RulesPopupProps {
  onClose: () => void;
  title: string;
  rules: string[];
}

const RulesPopup: React.FC<RulesPopupProps> = ({ onClose, title, rules }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Function to play button clicked sound
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles.popup_container}>
      <div ref={popupRef} className={styles.popup_content}>
        <h3>{title}</h3>
        <button className={styles.close_btn_pushable} role="button" onClick={() => {
          onClose();
          playButtonClickedSound(); 
        }}>
          <span className={styles.close_btn_shadow}></span>
          <span className={styles.close_btn_edge}></span>
          <span className={styles.close_btn_front}>
            <i className={`${styles.fa_close_btn} fa fa-close`}></i>
          </span>
        </button>
        
        <div className={styles.popup_details}>
          {rules.map((rule, index) => (
            <p key={index}>&#8226; {rule}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RulesPopup;
