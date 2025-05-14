import * as React from "react";
import styles from "./Communicationlog.module.css";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { fetchLogsByUser, deleteAllLogsByUser } from "../../services/communication.service";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material"; // Import Material-UI components
import HistoryIcon from "@mui/icons-material/History";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";

type CommunicationlogProps = {
    userId: any;
    moduleType: string;
};

interface LogData {
    text: string;
    timestamp: string;
    log_id: number;
}

const Communicationlog: React.FC<CommunicationlogProps> = ({ userId, moduleType }) => {
    const [logs, setLogs] = useState<LogData[]>([]); // Initialize as an empty array
    const currentUser = getAuth().currentUser;

    useEffect(() => {
        const getLogs = async () => {
            try {
                const getData = {
                    user_id: userId,
                    module: moduleType,
                };
                if (currentUser) {
                    const { data } = await fetchLogsByUser(getData, currentUser);
                    const logsArray = Array.isArray(data) ? data : []; // If data is not an array, set logs to an empty array
                    setLogs(logsArray); // Directly set logs to logsArray
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
                setLogs([]); // Set an empty array if there's an error
            }
        };

        getLogs();
    }, [moduleType, userId]);

    return (
        <List>
            {logs
                ?.sort((a, b) => b.log_id - a.log_id) // Optional chaining to prevent sorting on undefined
                .map((log) => (
                    <ListItem key={log.log_id} disablePadding className={styles.logItem}>
                        <ListItemButton>
                            <ListItemIcon className={styles.logId}>{log.log_id}</ListItemIcon>
                            <ListItemText
                                primary={<strong>{`"${log.text}"`}</strong>} // Make log.text bold
                                secondary={log.timestamp}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
        </List>
    );
};

type Anchor = "right";

const AnchorTemporaryDrawer: React.FC<CommunicationlogProps> = ({ userId, moduleType }) => {
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // State for delete confirmation dialog
    const [state, setState] = useState({ right: false });
    const { t, i18n } = useTranslation();
    const currentUser = getAuth().currentUser;

    const confirmDeleteLogs = async () => {
        try {
            const delData = {
                module: moduleType,
            };
            if (currentUser) {
                await deleteAllLogsByUser(userId, delData, currentUser);
                toast.success("History logs cleared successfully");
            }
        } catch (error) {
            toast.error("Error deleting logs");
        } finally {
            setOpenDeleteConfirm(false); // Close the delete confirmation dialog
            setState({ right: false }); // Close the drawer
        }
    };

    const toggleDrawer = (anchor: Anchor, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === "keydown" && ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const list = (anchor: Anchor) => (
        <Box className={styles.logBg} sx={{ width: 250 }} role="presentation">
            <div className={styles.logTop}>
                <br />
                <button onClick={() => setOpenDeleteConfirm(true)} className={styles.dltLogBtn}>
                    <FontAwesomeIcon className={styles.dltLogsIcon} icon={faTrash} />
                </button>
                <i className={`fa fa-close ${styles.closeFa}`} onClick={toggleDrawer(anchor, false)}></i>

                <h3 className={styles.logHeader}>{t("communicationLog")}</h3>
                <br />
            </div>
            <Dialog className={styles.dialogOverlay} open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                <DialogContent className={styles.dialogContent}>
                    <DialogTitle className={styles.dialogTitle}>{t("confirmClear")}</DialogTitle>
                    <DialogContentText className={styles.dialogDescription}>{t("clearAllLogs")}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <div className={styles.buttonsConfirmation}>
                        <button className={styles.noButton} onClick={() => setOpenDeleteConfirm(false)}>
                            {t("no_btn")}
                        </button>
                        <button className={styles.yesButton} onClick={confirmDeleteLogs}>
                            {t("yes_btn")}
                        </button>
                    </div>
                </DialogActions>
            </Dialog>
            <Communicationlog userId={userId} moduleType={moduleType} />
        </Box>
    );

    return (
        <div>
            <React.Fragment key={"right"}>
                <button onClick={toggleDrawer("right", true)} className={styles.communicationlogBtn} title="Communication log">
                    <ListItemIcon className={styles.communicationlogIcon}>
                        <HistoryIcon className={styles.communicationlogImg} />
                    </ListItemIcon>
                </button>
                <Drawer anchor={"right"} open={state["right"]} onClose={toggleDrawer("right", false)}>
                    {list("right")}
                </Drawer>
            </React.Fragment>
        </div>
    );
};

export default AnchorTemporaryDrawer;
