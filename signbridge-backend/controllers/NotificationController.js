const NotificationService = require("../services/NotificationService");
const { verifyRequest, adminVerifyRequest, signExpertVerifyRequest, signExpertOrAdminVerifyRequest } = require("../middlewares/authenticateToken.middleware");
const { admin } = require("../config/firebaseAdmin.config");

// At the top of the file, add a Map to store temporary tokens
const streamTokens = new Map();

const NotificationController = {
    async CreateNotification(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const notificationData = req.body;
                const newNotification = await NotificationService.CreateNotification(notificationData);

                res.status(201).json(newNotification);
            });
        } catch (error) {
            console.error("Error creating notification:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async GetNotifications(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const userId = req.params.receiverId;
                const notifications = await NotificationService.GetNotifications(userId);

                res.status(200).json(notifications);
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // get sender info by sender_id
    async GetSenderInfo(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const senderId = req.params.senderId;
                const senderInfo = await NotificationService.GetSenderInfo(senderId);
                res.status(200).json(senderInfo);
            });
        } catch (error) {
            console.error("Error fetching sender info:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async DeleteNotification(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const notificationIds = req.body.notificationIds;
                // console.log("notificationIdsDeleye:", notificationIds);
                const results = await Promise.all(
                    notificationIds.map(async notificationId => {
                        return await NotificationService.DeleteNotification(notificationId);
                    })
                );
                res.status(200).json(results);
            });
        } catch (error) {
            console.error("Error deleting notifications:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async UpdateNotificationStatuses(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const notificationIds = req.body.notificationIds;
                const newStatus = req.body.status;

                const result = await NotificationService.UpdateNotificationStatuses(notificationIds, newStatus);

                if (result.modifiedCount === 0) {
                    res.status(404).json({ error: "No notifications found" });
                } else {
                    res.status(200).json({ message: `${result.modifiedCount} notification(s) updated successfully` });
                }
            });
        } catch (error) {
            console.error("Error updating notification statuses:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async NotificationStream(req, res) {
        let client = null;
        try {
            const { userId, tempId } = req.params;
            const token = streamTokens.get(tempId);

            if (!token) {
                return res.status(401).json({ error: "Invalid or expired session" });
            }

            // Verify the token
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                if (!decodedToken) {
                    return res.status(401).json({ error: "Invalid token" });
                }
            } catch (error) {
                return res.status(401).json({ error: "Invalid token" });
            }

            // Set SSE headers
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                Connection: "keep-alive",
                "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
                "Access-Control-Expose-Headers": "Content-Type",
            });

            // Setup initial connection and get count
            const { initialCount, client: dbClient, collection } = await NotificationService.setupNotificationStream(userId);
            client = dbClient;

            // Send initial data
            res.write(`data: ${JSON.stringify({ count: initialCount })}\n\n`);

            // Set up interval for updates
            const interval = setInterval(async () => {
                try {
                    const currentCount = await collection.countDocuments({
                        receiver_id: Number(userId),
                        status: 0,
                    });

                    // Send update
                    res.write(`data: ${JSON.stringify({ count: currentCount })}\n\n`);
                } catch (error) {
                    console.error("Error in notification stream interval:", error);
                }
            }, 1000);

            // Handle client disconnect
            req.on("close", () => {
                clearInterval(interval);
                if (client) {
                    client.close();
                }
            });
        } catch (error) {
            console.error("Error in notification stream:", error);
            if (client) {
                client.close();
            }
            if (!res.headersSent) {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    },

    // fetch the notifications data by receiver_id using the stream
    async FetchNotificationsDataByStream(req, res) {
        let client = null;
        let interval = null;
        let lastNotifications = null;

        try {
            const { userId, tempId } = req.params;
            const token = streamTokens.get(tempId);

            if (!token) {
                return res.status(401).json({ error: "Invalid or expired session" });
            }

            // Verify the token
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                if (!decodedToken) {
                    return res.status(401).json({ error: "Invalid token" });
                }
            } catch (error) {
                return res.status(401).json({ error: "Invalid token" });
            }

            // Set SSE headers
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                Connection: "keep-alive",
                "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
                "Access-Control-Expose-Headers": "Content-Type",
            });

            // Setup initial connection and get notifications
            const { notifications, client: dbClient, collection } = await NotificationService.FetchNotificationsDataByStream(userId);
            client = dbClient;

            // Send initial notifications
            res.write(`data: ${JSON.stringify({ notifications: notifications })}\n\n`);

            // Set up interval for updates
            interval = setInterval(async () => {
                try {
                    const currentNotifications = await collection.find({ receiver_id: Number(userId) }).toArray();

                    // Only send if there are changes
                    const currentNotificationsStr = JSON.stringify(currentNotifications);
                    if (currentNotificationsStr !== lastNotifications) {
                        lastNotifications = currentNotificationsStr;
                        res.write(`data: ${JSON.stringify({ notifications: currentNotifications })}\n\n`);
                    }
                } catch (error) {
                    console.error("Error in notification stream interval:", error);
                }
            }, 1000);

            // Handle client disconnect
            req.on("close", () => {
                if (interval) {
                    clearInterval(interval);
                }
                if (client) {
                    client.close();
                }
            });
        } catch (error) {
            console.error("Error in notification stream:", error);
            if (interval) {
                clearInterval(interval);
            }
            if (client) {
                client.close();
            }
            if (!res.headersSent) {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    },

    async SetupStream(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const { tempId } = req.body;
                const token = req.headers.authorization.split(" ")[1];

                // Store the token with the temp ID
                streamTokens.set(tempId, token);

                // Set an expiration (e.g., 1 hour)
                setTimeout(() => {
                    streamTokens.delete(tempId);
                }, 3600000);

                res.status(200).json({ message: "Stream setup successful" });
            });
        } catch (error) {
            console.error("Error setting up stream:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async CleanupStream(req, res) {
        try {
            const { tempId } = req.params;
            streamTokens.delete(tempId);
            res.status(200).json({ message: "Cleanup successful" });
        } catch (error) {
            console.error("Error cleaning up stream:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

// useless functions
// get user_id by email (used to find the sender_id of a notification)
// async GetUserIdByEmail(req, res) {
//     try {
//         const email = req.params.email;
//         const userId = await NotificationService.GetUserIdByEmail(email);

//         res.status(200).json(userId);
//     } catch (error) {
//         console.error("Error fetching user:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// },

// fetch all notifications
// async FetchAllNotifications(req, res) {
//     try {
//         const notifications = await NotificationService.FetchNotifications();

//         res.status(200).json(notifications);
//     } catch (error) {
//         console.error("Error fetching notifications:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// },

// fetch the notifications count by receiver_id and status
// async FetchNotificationsCount(req, res) {
//     try {
//         await verifyRequest(req, res, async (req, res) => {
//             const receiverId = req.params.receiverId;
//             const status = req.params.status;
//             const count = await NotificationService.FetchNotificationsCount(receiverId, status);
//             res.status(200).json(count);
//         });
//     } catch (error) {
//         console.error("Error fetching notifications count:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// },

module.exports = NotificationController;
