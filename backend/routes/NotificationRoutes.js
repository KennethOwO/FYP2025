const NotificationController = require("../controllers/NotificationController");

const router = require("express").Router();

// Add a global options handler for all notification routes
router.options("*", (req, res) => {
    res.header({
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Expose-Headers": "Content-Type",
    });
    res.sendStatus(200);
});

router.post("/notifications/create-notification", NotificationController.CreateNotification);
router.get("/notifications/fetch-sender-info/:senderId", NotificationController.GetSenderInfo);
router.delete("/notifications/delete-notifications", NotificationController.DeleteNotification);
router.put("/notifications/update-statuses", NotificationController.UpdateNotificationStatuses);

// Add this new route (for fetching the notifications count by receiver_id and status)
router.get("/notifications/public/stream/:userId", NotificationController.NotificationStream);

// fetch the notifications data by receiver_id using the stream
router.get("/notifications/stream/data/:userId", NotificationController.FetchNotificationsDataByStream);

// Add these new routes
router.post("/notifications/setup-stream", NotificationController.SetupStream);
router.delete("/notifications/cleanup-stream/:tempId", NotificationController.CleanupStream);
router.get("/notifications/stream/data/:userId/:tempId", NotificationController.FetchNotificationsDataByStream);
router.get("/notifications/stream/:userId/:tempId", NotificationController.NotificationStream);

// useless routes
// router.get('/notifications/user/:email', NotificationController.GetUserIdByEmail);
// router.get("/notifications/fetch-notifications/:receiverId", NotificationController.GetNotifications);
// router.get('/notifications/fetch-notifications', NotificationController.FetchAllNotifications);
// router.get("/notifications/fetch-notifications-count/:receiverId/:status", NotificationController.FetchNotificationsCount);

module.exports = router;
