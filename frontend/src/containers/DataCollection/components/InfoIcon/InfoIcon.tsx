import React from "react";
import { BiSolidInfoSquare } from "react-icons/bi";
import { IconContext } from "react-icons";
import { useTranslation } from "react-i18next";
import "./InfoIcon.css";

interface InfoIconProps {
    onClick: () => void;
}

const InfoIcon: React.FC<InfoIconProps> = ({ onClick }) => {
    const { t } = useTranslation();

    return (
        <div className="dataForm-info" data-tooltip={t("instructions")}>
            <IconContext.Provider value={{ color: "#000" }}>
                <BiSolidInfoSquare onClick={onClick} />
            </IconContext.Provider>
        </div>
    );
};

export default InfoIcon;
