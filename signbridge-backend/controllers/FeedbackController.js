const FeedbackService = require('../services/FeedbackService');
const FirebaseService = require("../services/FirebaseService");
const { adminVerifyRequest } = require("../middlewares/authenticateToken.middleware");

const FeedbackController = {
    async CreateFeedback(req, res) {
        try {
            const feedbackData = req.body;
            const imageInfo = req.file;

            if (imageInfo) {
                const imageURL = await FirebaseService.uploadImageToStorageAndGetURL(imageInfo);
                if (imageURL) {
                    const newFeedback = await FeedbackService.CreateFeedback({ ...feedbackData, imageURL });
                    res.status(201).json(newFeedback);
                } else {
                    res.status(500).json({ error: "Failed to upload image" });
                }
            } else {
                const newFeedback = await FeedbackService.CreateFeedback(feedbackData);
                res.status(201).json(newFeedback);
            }
        } catch (error) {
            console.error("Error creating feedback:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async FetchFeedback(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const feedbacks = await FeedbackService.FetchFeedback();
                res.status(200).json(feedbacks);
            })
        } catch (error) {
            console.error("Error fetching feedback:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async UpdateFeedbackStatus(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const feedbackId = req.params.feedbackId;
                const updatedFeedback = await FeedbackService.UpdateFeedbackStatus(feedbackId);
                res.status(200).json(updatedFeedback);
            })
        } catch (error) {
            console.error("Error updating feedback status:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = FeedbackController;