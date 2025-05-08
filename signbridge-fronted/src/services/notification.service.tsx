import axios from "axios";
import { User } from "firebase/auth";
import { getAuth } from "firebase/auth";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// Custom EventSource class that supports headers
class AuthEventSource extends EventSource {
    constructor(url: string, token: string) {
        super(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        } as EventSourceInit);
    }
}

// ---------- Create Notification ----------
export const CreateNotification = async (data: any, user: User) => {
    try {
        const response = await axios.post(`${BASE_API_URL}/notifications/create-notification`, data, {
            headers: {
                Authorization: `Bearer ${await user?.getIdToken(true)}`,
            },
        });
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Get sender info by sender_id ----------
export const GetSenderInfoBySenderId = async (senderId: any, user: User) => {
    try {
        const response = await axios.get(`${BASE_API_URL}/notifications/fetch-sender-info/${senderId}`, {
            headers: {
                Authorization: `Bearer ${await user?.getIdToken(true)}`,
            },
        });
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Delete notification by notification_id ----------
export const DeleteNotification = async (notificationIds: number[], user: User) => {
    try {
        const response = await axios.delete(`${BASE_API_URL}/notifications/delete-notifications`, {
            data: { notificationIds },
            headers: {
                Authorization: `Bearer ${await user?.getIdToken(true)}`,
            },
        });
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Update Notification Status ----------
export const UpdateNotificationStatus = async (notificationIds: number[], newStatus: number, user: User) => {
    try {
        const response = await axios.put(
            `${BASE_API_URL}/notifications/update-statuses`,
            {
                notificationIds,
                status: newStatus,
            },
            {
                headers: {
                    Authorization: `Bearer ${await user?.getIdToken(true)}`,
                },
            }
        );
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Fetch Notification's count ----------
export const StreamNotifications = async (userId: number, onMessage: (count: number) => void): Promise<() => void> => {
    return new Promise(async resolve => {
        try {
            // Get the token first
            const token = await getAuth().currentUser?.getIdToken(true);
            if (!token) throw new Error("No auth token available");

            // Create a temporary token ID
            const tempId = Math.random().toString(36).substring(7);

            // First, make a setup request to store the token temporarily
            await axios.post(
                `${BASE_API_URL}/notifications/setup-stream`,
                { tempId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Then create EventSource with the temp ID
            const eventSource = new EventSource(`${BASE_API_URL}/notifications/stream/${userId}/${tempId}`);

            eventSource.onmessage = event => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.count) {
                        onMessage(data.count);
                    }
                } catch (error) {
                    console.error("Error parsing SSE data:", error);
                }
            };

            eventSource.onerror = async error => {
                console.error("SSE connection error:", error);
                // Attempt to reconnect after a delay
                setTimeout(async () => {
                    eventSource.close();
                    await StreamNotifications(userId, onMessage);
                }, 5000);
            };

            resolve(() => {
                eventSource.close();
                // Clean up the temporary token
                axios.delete(`${BASE_API_URL}/notifications/cleanup-stream/${tempId}`).catch(console.error);
            });
        } catch (error) {
            console.error("Error setting up SSE:", error);
        }
    });
};

// ---------- Fetch Notification's data ----------
export const FetchNotificationsDataByStream = async (userId: number, onMessage: (notifications: any[]) => void): Promise<() => void> => {
    return new Promise(async resolve => {
        try {
            // Get the token first
            const token = await getAuth().currentUser?.getIdToken(true);
            if (!token) throw new Error("No auth token available");

            // Create a temporary token ID
            const tempId = Math.random().toString(36).substring(7);

            // First, make a setup request to store the token temporarily
            await axios.post(
                `${BASE_API_URL}/notifications/setup-stream`,
                { tempId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Then create EventSource with the temp ID
            const eventSource = new EventSource(`${BASE_API_URL}/notifications/stream/data/${userId}/${tempId}`);

            eventSource.onmessage = event => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.notifications) {
                        onMessage(data.notifications);
                    }
                } catch (error) {
                    console.error("Error parsing SSE data:", error);
                }
            };

            eventSource.onerror = async error => {
                console.error("SSE connection error:", error);
                // Attempt to reconnect after a delay
                setTimeout(async () => {
                    eventSource.close();
                    await FetchNotificationsDataByStream(userId, onMessage);
                }, 5000);
            };

            resolve(() => {
                eventSource.close();
                // Clean up the temporary token
                axios.delete(`${BASE_API_URL}/notifications/cleanup-stream/${tempId}`).catch(console.error);
            });
        } catch (error) {
            console.error("Error setting up SSE:", error);
        }
    });
};

// ---------- Get user_id by email ----------
// export const GetUserIdByEmail = async (email: any) => {
//   try {
//     const response = await axios.get(
//       `${BASE_API_URL}/notifications/user/${email}`
//     );
//     return response;
//   } catch (err) {
//     throw err;
//   }
// };

// ---------- Get notifications by id ----------
// export const GetNotificationsById = async (receiverId: any, user: User) => {
//     try {
//         const response = await axios.get(`${BASE_API_URL}/notifications/fetch-notifications/${receiverId}`, {
//             headers: {
//                 Authorization: `Bearer ${await user?.getIdToken(true)}`,
//             },
//         });
//         return response;
//     } catch (err) {
//         throw err;
//     }
// };

// ---------- fetch notification counts by receiver_id and status ----------
// export const FetchNotificationCounts = async (receiverId: number, status: number, user: User) => {
//     try {
//         const response = await axios.get(`${BASE_API_URL}/notifications/fetch-notifications-count/${receiverId}/${status}`, {
//             headers: {
//                 Authorization: `Bearer ${await user?.getIdToken(true)}`,
//             },
//         });
//         return response;
//     } catch (err) {
//         throw err;
//     }
// };
