const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const FeedbackCounterService = require("./FeedbackCounterService");

const FeedbackService = {
    async CreateFeedback(feedbackData) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.FEEDBACKS);

            const newFormId = await FeedbackCounterService.getNextValue('feedbackId');

            const feedbackWithTimestamp = {
                ...feedbackData,
                createdAt: new Date(),
                status_en: "New",
                status_bm: "Baru",
                feedback_id: newFormId
            };

            const result = await collection.insertOne(feedbackWithTimestamp);
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error creating feedback: ${error.message}`);
        }
    },

    async FetchFeedback() {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.FEEDBACKS);
            const result = await collection.find({}).toArray();
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error fetching feedback: ${error.message}`);
        }
    },

    async UpdateFeedbackStatus(feedbackId) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.FEEDBACKS);
            const numericFeedbackId = Number(feedbackId); // Convert receiverId to a number
            const result = await collection.updateOne({ feedback_id: numericFeedbackId }, { $set: { status_en: "Viewed", status_bm: "Dilihat" } });
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error updating feedback status: ${error.message}`);
        }
    }
};


module.exports = FeedbackService;