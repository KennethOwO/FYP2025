import React, { useEffect, useState } from "react";
import style from "./Notification.module.css";
import NotifBox from "../../components/NotifBox/NotifBox";
import NotifFilter from "../../components/NotifFilter/NotifFilter";
import { useNotificationFilterStore } from "../../store/notificationFilter";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-hot-toast";
import { GetSenderInfoBySenderId, DeleteNotification, UpdateNotificationStatus, FetchNotificationsDataByStream } from "../../services/notification.service";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@root/store/userStore";
import { getAuth } from "firebase/auth";

let isUndoing = false;

const Notification: React.FC = () => {
    const { t } = useTranslation();
    const currentSelectedLanguage = localStorage.getItem("i18nextLng");
    const { user } = useUserStore();
    const useFilterStore = useNotificationFilterStore();
    const currentUser = getAuth().currentUser;
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    const filterData = () => {
        let newData: any[] = [];

        if (useFilterStore.filter.includes("newtask")) {
            // add the data that has newtask value
            for (let i = 0; i < useFilterStore.data.length; i++) {
                if (useFilterStore.data[i].type_value === "newtask") {
                    newData.push(useFilterStore.data[i]);
                }
            }
        }

        if (useFilterStore.filter.includes("accepted")) {
            // add the data that has accepted value, it should be added to the new data instead of replacing it
            for (let i = 0; i < useFilterStore.data.length; i++) {
                if (useFilterStore.data[i].type_value === "accepted") {
                    newData.push(useFilterStore.data[i]);
                }
            }
        }

        if (useFilterStore.filter.includes("rejected")) {
            // add the data that has rejected value, it should be added to the new data instead of replacing it
            for (let i = 0; i < useFilterStore.data.length; i++) {
                if (useFilterStore.data[i].type_value === "rejected") {
                    newData.push(useFilterStore.data[i]);
                }
            }
        }

        if (useFilterStore.filter.includes("newtext")) {
            // add the data that has newtext value
            for (let i = 0; i < useFilterStore.data.length; i++) {
                if (useFilterStore.data[i].type_value === "newtext") {
                    newData.push(useFilterStore.data[i]);
                }
            }
        }

        if (useFilterStore.filter.includes("waitingforverification")) {
            // add the data that has waitingforverification value
            for (let i = 0; i < useFilterStore.data.length; i++) {
                if (useFilterStore.data[i].type_value === "waitingforverification") {
                    newData.push(useFilterStore.data[i]);
                }
            }
        }

        newData = newData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        useFilterStore.setModifiedData(newData);
    };

    useEffect(() => {
        let eventSourceCleanup: (() => void) | undefined;

        const setupNotificationStream = async () => {
            if (isUndoing || !user || !currentUser) return;

            try {
                eventSourceCleanup = await FetchNotificationsDataByStream(user.user_id, async notifications => {
                    const notificationsWithUsernames = await Promise.all(
                        notifications.map(async (notification: any) => {
                            const senderInfo = await GetSenderInfoBySenderId(notification.sender_id, currentUser);
                            return {
                                ...notification,
                                sender_username: senderInfo.data.username,
                                sender_avatar: senderInfo.data.picture,
                            };
                        })
                    );

                    const data = notificationsWithUsernames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    useFilterStore.setData(data);
                });
            } catch (error) {
                console.error("Error in notification stream:", error);
                // Attempt to reconnect after a delay
                setTimeout(() => {
                    setupNotificationStream();
                }, 5000);
            }
        };

        setupNotificationStream();

        return () => {
            if (eventSourceCleanup) {
                eventSourceCleanup();
            }
        };
    }, [user, currentUser, isUndoing]);

    useEffect(() => {
        filterData();
    }, [useFilterStore.data]);

    const formatDate = (date: string) => {
        const today = new Date();
        const newDate = new Date(date);
        if (today.getDate() === newDate.getDate() && today.getMonth() === newDate.getMonth() && today.getFullYear() === newDate.getFullYear()) {
            return new Date(date).toLocaleTimeString();
        } else {
            return new Date(date).toLocaleDateString();
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Select all notifications
            const allNotificationIds = useFilterStore.modifiedData.map(notification => notification.notification_id);
            setSelectedNotifications(allNotificationIds);
        } else {
            // Deselect all notifications
            setSelectedNotifications([]);
        }
    };

    // handle the delete icon function
    const handleDeleteNotification = async (notificationIds: number[]) => {
        isUndoing = true;
        handleDelete(notificationIds);
        try {
            const originalData = [...useFilterStore.modifiedData];
            const updatedData = useFilterStore.modifiedData.filter(notification => !notificationIds.includes(notification.notification_id));
            useFilterStore.setModifiedData(updatedData);

            toast.success(s => (
                <span>
                    {t("notifDeleteSuccess")}
                    <Button
                        onClick={() => {
                            useFilterStore.setModifiedData(originalData);
                            handleUndo();
                            toast.dismiss(s.id);
                        }}>
                        UNDO
                    </Button>
                </span>
            ));
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error(t("notifDeleteFailed"));
        }
    };

    const handleDelete = async (notificationIds: number[]) => {
        if (!timerId && currentUser) {
            const id = setTimeout(async () => {
                await DeleteNotification(notificationIds, currentUser);
                setTimerId(null);
                isUndoing = false;
            }, 5000);
            setTimerId(id);
        }
    };

    const handleUndo = () => {
        if (timerId) {
            clearTimeout(timerId);
            setTimerId(null);
            isUndoing = false;
        }
    };

    // handle the make as read icon function
    const handleMakeAsRead = async (notificationIds: number[]) => {
        try {
            if (currentUser) {
                await UpdateNotificationStatus(notificationIds, 1, currentUser);
                toast.success(t("notifReadSuccess"));
            }
        } catch (error) {
            console.error("Error updating notification status:", error);
            toast.error(t("notifReadFailed"));
        }
    };

    return (
        <>
            <div className={style.notifocationBigContainer}>
                <div className={style.notifocationHeader}>
                    <h1 className={style.notifocationHeaderText}>{t("notification")}</h1>
                </div>
                <div className={style.notifocationWholeContainer}>
                    <NotifFilter />
                    <div className={style.notificationContainer}>
                        {/* Tools container */}
                        <div className={style.toolsContainer}>
                            <div className={style.toolsItem}>
                                <Tooltip title={t("selectAll")} arrow followCursor>
                                    <Checkbox checked={selectedNotifications.length === useFilterStore.modifiedData.length && useFilterStore.modifiedData.length > 0} indeterminate={selectedNotifications.length > 0 && selectedNotifications.length < useFilterStore.modifiedData.length} onChange={handleSelectAll} />
                                </Tooltip>
                                <div className={style.toolsIcon}>
                                    <Tooltip title={t("delete")} arrow followCursor>
                                        <i className="fa-regular fa-trash-can" onClick={() => handleDeleteNotification(selectedNotifications)}></i>
                                    </Tooltip>
                                </div>
                                <div className={style.toolsIcon}>
                                    <Tooltip title={t("markAsRead")} arrow followCursor>
                                        <i className="fa-regular fa-envelope-open" onClick={() => handleMakeAsRead(selectedNotifications)}></i>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        {useFilterStore.modifiedData.length > 0 ? (
                            useFilterStore.modifiedData.map((notification, index) => (
                                <NotifBox
                                    key={index}
                                    sender_username={notification.sender_username}
                                    sender_avatar={notification.sender_avatar}
                                    message={currentSelectedLanguage === "en" ? notification.message_en : notification.message_bm}
                                    created_at={formatDate(notification.created_at)}
                                    sign_text={notification.sign_text}
                                    status={notification.status}
                                    checked={selectedNotifications.includes(notification.notification_id)}
                                    handleCheckboxChange={e => {
                                        if (e.target.checked) {
                                            setSelectedNotifications([...selectedNotifications, notification.notification_id]);
                                        } else {
                                            setSelectedNotifications(selectedNotifications.filter(id => id !== notification.notification_id));
                                        }
                                    }}
                                />
                            ))
                        ) : (
                            <div className={style.noNotificationsContainer}>
                                <p>{t("noNotif")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notification;
