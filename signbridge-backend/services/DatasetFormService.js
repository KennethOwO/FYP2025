const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const DatasetCounterService = require("./DatasetCounterService")

const DatasetFormService = {
    async SubmitForm(formData) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const newFormId = await DatasetCounterService.getNextValue('formId')
            formData.form_id = newFormId;
            const result = await collection.insertOne(formData);
            client.close(); // Close the connection
            return { result, newFormId }
        } catch (error) {
            // Handle validation errors or database errors
            if (error.name === 'ValidationError') {
                throw new Error(`Registration failed: ${error.message}`);  // More specific message
            } else {
                throw new Error(`Error registering form: ${error.message}`);  // Generic error for other errors
            }
        }
    },
    async GetFormById(formId) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const form = await collection.findOne({ form_id: parseInt(formId) });
            await client.close();
            return form;
        } catch (error) {
            console.error("Error fetching form:", error);
            throw error; // Re-throw for controller to handle
        }
    },


    async GetAllFormsForSignExpert() {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const users = await collection.find().toArray();
            await client.close();
            return users;
        } catch (error) {
            console.error("Error fetching form:", error);
            throw error; // Re-throw for controller to handle
        }
    },

    async GetAllFormsForAdmin() {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const users = await collection.find({ status_Admin_en: { $ne: "-" }, status_Admin_bm: { $ne: "-" } }).toArray(); // Filter for not "-"
            await client.close();
            return users;
        } catch (error) {
            console.error("Error fetching form:", error);
            throw error; // Re-throw for controller to handle
        }
    },

    async DeleteFormByID(id) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION); // Assuming FORMS is the collection name
            await collection.deleteOne({ form_id: parseInt(id) });
            await client.close();
        } catch (error) {
            console.error("Error deleting form:", error);
            throw error;
        }
    },

    async UpdateFormByID(id, updatedDetails) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION); // Assuming FORMS is the collection name
            const result = await collection.updateOne(
                { form_id: parseInt(id) },
                { $set: updatedDetails }
            );
            if (result) {
                client.close();
                return result; // Return the number of modified documents
            }
        } catch (error) {
            console.error("Error updating form:", error);
            throw error; // Re-throw for controller to handle
        }
    },

    async GetDemoVideoById(formId) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const form = await collection.findOne({ form_id: parseInt(formId) });
            await client.close();
            if (form) {
                return { videoLink: form.video_link, videoName: form.video_name }; // Returning video_link and video_name as an object
            } else {
                return null; // Or handle if form is not found
            }
        } catch (error) {
            console.error("Error fetching form:", error);
            throw error; // Re-throw for controller to handle
        }
    },

    async GetAvatarVideoById(formId) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const form = await collection.findOne({ form_id: parseInt(formId) });
            await client.close();
            if (form) {
                return { videoLink: form.avatar_link, videoName: form.avatar_name }; // Returning video_link and video_name as an object
            } else {
                return null; // Or handle if form is not found
            }
        } catch (error) {
            console.error("Error fetching form:", error);
            throw error; // Re-throw for controller to handle
        }
    },
}

module.exports = DatasetFormService