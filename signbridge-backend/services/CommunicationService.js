const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const CommunicationCounterService = require("./CommunicationCounterService");
const axios = require("axios");
// Ensure Blob is available (Node 15+ includes Blob in the global scope)
const { Blob } = require('buffer');

const CommunicationService = {
    async fetchLogsByUser(data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.COMMUNICATION_LOG);

            // Use the values from `data` to query the database dynamically
            const result = await collection.find({ user_id: Number(data.user_id), module: String(data.module) }).toArray();

            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error fetching logs: ${error.message}`);
        }
    },

    async CreateLogsByUser(data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.COMMUNICATION_LOG);
            const logid = await CommunicationCounterService.getNextValue('logId');
            data.log_id = logid;
            const result = await collection.insertOne(data);
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error creating log: ${error.message}`);
        }
    },

    async DeleteAllLogsByUser(id, data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.COMMUNICATION_LOG);
            const result = await collection.deleteMany({ user_id: Number(id), module: String(data.module) });
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error deleting logs: ${error.message}`);
        }
    },

    async fetchNLPOutput(data) {
        try {
            // Ensure that you're sending an object with the correct key to the NLP API
            const response = await axios.post(
                `${process.env.SLP_AI_MODEL_API_URL}`,
                { submitted_Text: data.submitted_Text, inputs: "" }, // Send the data with the expected key
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${process.env.HUGGINGFACE_AI_MODEL_API_KEY}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching NLP output: ${error.message}`);
        }
    },

    async fetchSLROutput(data) {
        try {
            const { video } = data;

            // Convert the buffer to a base64 string if available
            let videoBase64 = null;
            if (video) {
                videoBase64 = video.buffer.toString('base64');
            }

            const payload = {
                video: videoBase64,
                videoMimeType: video.mimetype,
                inputs: ""
            };

            const response = await axios.post(
                `${process.env.SLR_AI_MODEL_API_URL}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${process.env.HUGGINGFACE_AI_MODEL_API_KEY}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = CommunicationService;
