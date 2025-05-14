const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const NotificationCounterService = require("./NotificationCounterService");

const NotificationService = {
    async CreateNotification(notificationData) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);

            const newFormId = await NotificationCounterService.getNextValue("notifId");

            const notificationWithTimestamp = {
                ...notificationData,
                notification_id: newFormId,
            };

            const result = await collection.insertOne(notificationWithTimestamp);
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error creating notification: ${error.message}`);
        }
    },

    // get notifications by receiver_id
    async GetNotifications(receiverId) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);
            const numericReceiverId = Number(receiverId); // Convert receiverId to a number
            const notifications = await collection.find({ receiver_id: numericReceiverId }).toArray();

            client.close();
            return notifications;
        } catch (error) {
            throw new Error(`Error fetching notifications: ${error.message}`);
        }
    },

    // get sender info by sender_id
    async GetSenderInfo(senderId) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);
            const numericSenderId = Number(senderId); // Convert senderId to a number
            const sender = await collection.findOne({ user_id: numericSenderId });
            client.close();
            return sender;
        } catch (error) {
            throw new Error(`Error fetching sender: ${error.message}`);
        }
    },

    async DeleteNotification(notificationId) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);
            const numericNotificationId = Number(notificationId);
            const result = await collection.deleteMany({ notification_id: numericNotificationId });
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error deleting notification: ${error.message}`);
        }
    },

    async UpdateNotificationStatuses(notificationIds, newStatus) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);
            const numericNotificationIds = notificationIds.map(Number);
            const result = await collection.updateMany({ notification_id: { $in: numericNotificationIds } }, { $set: { status: newStatus } });
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error updating notification statuses: ${error.message}`);
        }
    },

    // For fetching the notifications count by receiver_id and status
    async setupNotificationStream(userId) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);

            // Initial count
            const initialCount = await collection.countDocuments({
                receiver_id: Number(userId),
                status: 0,
            });

            return {
                initialCount,
                client,
                collection,
            };
        } catch (error) {
            throw new Error(`Error setting up notification stream: ${error.message}`);
        }
    },

    // fetch the notifications data by receiver_id using the stream
    async FetchNotificationsDataByStream(receiverId) {
        let client;
        try {
            const { client: dbClient, database } = await connectDB();
            client = dbClient;
            const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);

            const numericReceiverId = Number(receiverId);
            const notifications = await collection.find({ receiver_id: numericReceiverId }).toArray();

            return {
                notifications,
                client,
                collection,
            };
        } catch (error) {
            if (client) {
                client.close();
            }
            throw new Error(`Error fetching notifications data by stream: ${error.message}`);
        }
    },
};

// Useless functions
// get user_id by email
// async GetUserIdByEmail(email) {
//     try {
//         const { client, database } = await connectDB();
//         const collection = database.collection(DATABASE_COLLECTIONS.USERS);
//         const user = await collection.findOne({ email: email });
//         client.close();
//         return user.user_id;
//     } catch (error) {
//         throw new Error(`Error fetching user: ${error.message}`);
//     }
// },

// fetch all notifications
// async FetchAllNotifications() {
//     try {
//         const { client, database } = await connectDB();
//         const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);
//         const notifications = await collection.find().toArray();
//         client.close();
//         return notifications;
//     } catch (error) {
//         throw new Error(`Error fetching notifications: ${error.message}`);
//     }
// },

// fetch the notifications count by receiver_id and status
// async FetchNotificationsCount(receiverId, status) {
//     let client;
//     try {
//         const { client: dbClient, database } = await connectDB();
//         client = dbClient;
//         const collection = database.collection(DATABASE_COLLECTIONS.NOTIFICATIONS);

//         const numericReceiverId = Number(receiverId);
//         const numericStatus = Number(status);

//         const query = {
//             receiver_id: numericReceiverId,
//             status: numericStatus,
//         };

//         const notificationsCount = await collection.countDocuments(query);
//         return notificationsCount;
//     } catch (error) {
//         throw new Error(`Error fetching notifications count: ${error.message}`);
//     } finally {
//         if (client) {
//             client.close();
//         }
//     }
// },

module.exports = NotificationService;
