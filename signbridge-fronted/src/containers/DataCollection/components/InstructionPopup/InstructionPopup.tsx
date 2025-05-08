import React, { useEffect, useRef } from "react";
import styles from "./InstructionPopup.module.css";
import InstructionImage from "/images/Aaron-demo.jpg";
import { useTranslation } from "react-i18next";

interface InstructionPopupProps {
  showInstructionPopup: boolean;
  onClose: () => void;
}

const InstructionPopup: React.FC<InstructionPopupProps> = ({
  showInstructionPopup,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (showInstructionPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.classList.add(styles.noScroll);
    } else {
      document.body.classList.remove(styles.noScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove(styles.noScroll);
    };
  }, [showInstructionPopup, onClose]);

  return (
    <div
      className={`${styles["instruction-popup"]} ${
        showInstructionPopup ? styles["shown"] : ""
      }`}
      ref={popupRef}
    >
      <div className={styles.instruction_popup_header}>
        <h1 className={styles.instruction_title}>{t("instructions")}</h1>
        <i
          className={`${styles.fa} fa fa-close`}
          data-testid="click-close-btn"
          onClick={onClose}
        ></i>
      </div>
      <div className={styles.instruction_popup_details}>
        <div className={styles.instruction_popup_details_section1}>
          <p>
            <strong>1.</strong> {t("inslogin")}
          </p>
          <p>
            <strong>2.</strong> {t("insFillDetails")}
          </p>
          <p>
            <strong>3.</strong> {t("insUploadDemoVideo")}
          </p>
          <p>
            <strong>4.</strong> {t("insResetBtn")}
          </p>
        </div>
        {/* <hr className={styles.line_separator} /> */}
        <div className={styles.instruction_popup_details_section2}>
          <p className={styles.instruction_note}>{t("insNote")}</p>
          <div className={styles.instruction_popup_content_wrapper}>
            <div className={styles.instruction_popup_content}>
              <ul>
                <li>{t("insVideoBg")}</li>
                <li>{t("insVideoMp4")}</li>
                <li>{t("insVideoBody")}</li>
                <li>{t("insVideoPurpose")}</li>
              </ul>
            </div>
            <div className={styles.instruction_popup_details_image}>
              <img
                src={InstructionImage}
                alt="instruction-image"
                className={styles.instruction_image}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionPopup;
