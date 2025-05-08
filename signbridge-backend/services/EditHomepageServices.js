const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const EditHomepageCounterService = require("./EditHomepageCounterService");

const EditHomepageServices = {
    async addHomepageComponent(data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.HOMEPAGE_COMPONENTS);
            const homepageData = await collection.findOne();

            // the data has an attribute called "type"
            // if the type is "youtube" then check if there is any document with the same type, if there is then do not add it and return an error message
            // if the type is "about" then check if there is any document with the same type, if there is then do not add it and return an error message
            // however, if the type is "module" then check if there are any document with the same type, if there are more than 3 then do not add it and return an error message
            // if the type is "module" and there are less than 3 then add the document
            if (homepageData) {
                const { type } = data;
                if (type === "youtube" || type === "about" || type === "location") {
                    const existingData = await database.collection(DATABASE_COLLECTIONS.HOMEPAGE_COMPONENTS).findOne({ type });
                    if (existingData) {
                        throw new Error("Data already exists");
                    }
                } else if (type === "module") {
                    const moduleData = await database.collection(DATABASE_COLLECTIONS.HOMEPAGE_COMPONENTS).find({ type }).toArray();
                    if (moduleData.length >= 3) {
                        throw new Error("Maximum 3 modules allowed");
                    }
                }
            }
            const newHomepageComponentId = await EditHomepageCounterService.getNextValue("homepageComponentId");
            data.homepage_component_id = newHomepageComponentId;
            await collection.insertOne(data);
            client.close();
        } catch (error) {
            console.error("Error adding homepage data:", error);
            throw new Error("Failed to add homepage data");
        }
    },

    async updateHomepageComponent(homepageComponentId, data) {
        try {
            const { _id, ...updateData } = data;
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.HOMEPAGE_COMPONENTS);
            const result = await collection.updateOne({ homepage_component_id: parseInt(homepageComponentId) }, { $set: updateData });
            client.close();
        } catch (error) {
            console.error("Error updating homepage data:", error);
            throw new Error("Failed to update homepage data");
        }
    },

    async deleteHomepageComponent(homepageComponentId) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.HOMEPAGE_COMPONENTS);
            await collection.deleteOne({ homepage_component_id: parseInt(homepageComponentId) });
            client.close();
        } catch (error) {
            console.error("Error deleting homepage data:", error);
            throw new Error("Failed to delete homepage data");
        }
    },

    async getHomepageComponent() {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.HOMEPAGE_COMPONENTS);
            const homepageData = await collection.find().toArray();
            client.close();
            return homepageData;
        } catch (error) {
            console.error("Error fetching homepage data:", error);
            throw new Error("Failed to fetch homepage data");
        }
    },

    // For Image Slider
    async addHomepageImageSlider(data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.HOMEPAGE_IMAGE_SLIDER);
            const newHomepageImageSliderId = await EditHomepageCounterService.getNextImgSliderValue("homepageImageSliderId");

            data.homepage_image_slider_id = newHomepageImageSliderId;
            await collection.insertOne(data);
            client.close();
        } catch (error) {
            throw new Error("Failed to add homepage data");
        }
    },

    async getHomepageImageSlider() {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.HOMEPAGE_IMAGE_SLIDER);
            const homepageImageSliderData = await collection.find().toArray();
            client.close();
            return homepageImageSliderData;
        } catch (error) {
            throw new Error("Failed to fetch homepage data");
        }
    },

    // data is the array of objects that will be updated
    async updateHomepageImageSlider(data) {
        // update all the data in the array
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.HOMEPAGE_IMAGE_SLIDER);
            for (let i = 0; i < data.length; i++) {
                const { _id, ...updateData } = data[i];
                // if the homepage_image_slider_id is found in the database then update the data
                if (updateData.homepage_image_slider_id) {
                    await collection.updateOne({ homepage_image_slider_id: updateData.homepage_image_slider_id }, { $set: updateData });
                }
            }
            // delete the data that is not in the array
            const homepageImageSliderData = await collection.find().toArray();
            for (let i = 0; i < homepageImageSliderData.length; i++) {
                const found = data.find(item => item.homepage_image_slider_id === homepageImageSliderData[i].homepage_image_slider_id);
                if (!found) {
                    await collection.deleteOne({ homepage_image_slider_id: homepageImageSliderData[i].homepage_image_slider_id });
                }
            }
            client.close();
        } catch (error) {
            throw new Error("Failed to update homepage data");
        }
    },
};

module.exports = EditHomepageServices;
