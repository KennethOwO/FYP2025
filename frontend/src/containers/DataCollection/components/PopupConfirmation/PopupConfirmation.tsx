import React from "react";
import "./PopupConfirmation.css";
import { Button } from "../../../../components/Button/Button";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

import ButtonProcessing from "../../../../components/ButtonProcessing/ButtonProcessing";
import { useTranslation } from "react-i18next";

interface PopupConfirmationProps {
    name: string;
    email: string;
    text: string;
    video: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: any;
    isLoading: boolean;
    setIsLoading: any;
}

const PopupConfirmation: React.FC<PopupConfirmationProps> = ({ name, email, text, video, isOpen, onClose, onSubmit, isLoading, setIsLoading }) => {
    const { t, i18n } = useTranslation();

    return (
        <div className={`popup-confirmation ${isOpen ? "open" : ""}`}>
            <div className="popup-confirmation-content-header">
                <h2>{t("insAreYouSure")}</h2>
            </div>
            <div className="popup-confirmation-content">
                <div className="popup-confirmation-details">
                    <Paper sx={{ overflow: "hidden" }}>
                        <TableContainer
                            sx={{
                                boxShadow: "none",
                                overflowX: "auto", // Allow horizontal scrolling
                            }}
                        >
                            <Table sx={{}}>
                                <TableBody sx={{ backgroundColor: "#f2f2f2" }}>
                                    <TableRow>
                                        <TableCell
                                            className="popup-confirmation-td-title"
                                            sx={{
                                                fontSize: "18px",
                                                wordBreak: "break-word",
                                                border: "none",
                                                width: "20%",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {t("insName")}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                fontSize: "16px",
                                                wordBreak: "break-word",
                                                border: "none",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {name}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell
                                            className="popup-confirmation-td-title"
                                            sx={{
                                                fontSize: "18px",
                                                wordBreak: "break-word",
                                                border: "none",
                                                width: "20%",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {t("insEmail")}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                fontSize: "16px",
                                                wordBreak: "break-word",
                                                border: "none",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {email}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell
                                            className="popup-confirmation-td-title"
                                            sx={{
                                                fontSize: "18px",
                                                wordBreak: "break-word",
                                                border: "none",
                                                width: "20%",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {t("insText")}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                fontSize: "16px",
                                                wordBreak: "break-word",
                                                border: "none",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {text}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell
                                            className="popup-confirmation-td-title"
                                            sx={{
                                                fontSize: "18px",
                                                wordBreak: "break-word",
                                                width: "20%",
                                                border: "none",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {t("insVideo")}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                fontSize: "16px",
                                                wordBreak: "break-word",
                                                border: "none",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {video}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>

                <div className="popup-confirmation-content-button">
                    <Button type="button" onClick={onClose} buttonStyle="btn--reset" buttonSize="btn--large">
                        {t("cancel_btn")}
                    </Button>
                    <ButtonProcessing onClick={onSubmit} buttonStyle="btn-submit" buttonSize="btn-large" isLoading={isLoading} setIsLoading={setIsLoading}>
                        {t("submit_btn")}
                    </ButtonProcessing>
                </div>
            </div>
        </div>
    );
};

export default PopupConfirmation;
