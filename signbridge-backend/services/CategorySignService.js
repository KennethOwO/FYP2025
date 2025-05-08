const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const CategorySignCounterService = require("./CategorySignCounterService");
const avatarSigns = require("../public/glosses/gloss.json");

const CategorySignService = {
    async fetchSign(cat) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY_SIGN);
            
            // If cat is provided, filter by category, otherwise return all signs
            const query = cat ? { category: cat } : {};
            const result = await collection.find(query).toArray();
            
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error fetching signs: ${error.message}`);
        }
    },

    //WORK IN PROGRESS
    async updateAvatarSigns() {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY_SIGN);
            const countersCollection = database.collection(DATABASE_COLLECTIONS.CATEGORY_SIGN_COUNTER);

            // Check if the counters collection already exists
            const collections = await database.listCollections({ name: DATABASE_COLLECTIONS.CATEGORY_SIGN_COUNTER }).toArray();
            if (collections.length === 0) {
                // Insert the count as a single document in the counters collection
                await countersCollection.insertOne({ _id: "signId", value: 1 });
            }

            // Check if avatarSigns is properly loaded and contains data
            if (!avatarSigns || !Array.isArray(avatarSigns)) {
                throw new Error("Invalid avatarSigns data");
            }

            // Get the keywords of all signs in avatarSigns
            const avatarSignKeywords = avatarSigns.map(sign => sign.keyword);

            // Find signs in the database that are not present in avatarSigns
            const signsToRemove = await collection.find({ keyword: { $nin: avatarSignKeywords } }).toArray();

            // Remove the signs from the database
            for (const signToRemove of signsToRemove) {
                await collection.deleteOne({ _id: signToRemove._id });
                console.log(`Avatar sign "${signToRemove.keyword}" removed`);
            }

            // Iterate over each sign in avatarSigns
            for (const sign of avatarSigns) {
                // Check if the sign already exists in the database
                const existingSign = await collection.findOne({ keyword: sign.keyword });
                if (!existingSign) {
                    // If not found, insert the sign into the collection
                    const signId = await CategorySignCounterService.getNextValue('signId');
                    await collection.insertOne({ ...sign, signId });
                    console.log(`Avatar sign "${sign.keyword}" inserted`);
                }
            }

            console.log("Avatar signs update completed");
        } catch (error) {
            console.error("Error updating signs:", error);
            throw new Error(`Error updating signs: ${error.message}`);
        } finally {
            client.close();
        }
    },

    async UpdateSign(id, data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY_SIGN);

            const result = await collection.updateOne(
                { signId: id },
                { $set: data }
            );
            client.close();
            return result;
        }
        catch (error) {
            throw new Error(`Error updating sign thumbnail: ${error.message}`);
        }
    },

};

module.exports = CategorySignService;