import React from "react";
import "./PopupModal.css";
import image from "/images/tick2.png";
import { useTranslation } from "react-i18next";

interface PopupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const handleConfirmClick = () => {
        onClose();
    };

    return (
        <div
            className={`popup-modal ${
                isOpen ? "open" : ""
            } modal-dialog-centered modal-lg`}
        >
            <img src={image} alt="" className="popup-tick img-fluid" />
            <div className="modal-content">
                <h2 className="modal-title">{t("insThankYou")}</h2>
                <p className="modal-body">{t("insProceedDetails")}</p>
                <button
                    className="btn btn-success"
                    onClick={handleConfirmClick}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default PopupModal;
