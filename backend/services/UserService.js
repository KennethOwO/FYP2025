const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const PRESET_ACCOUNTS = require("../constants/PresetAccount");
const PRESET_DATA = require("../constants/PresetCountry");
const UserCounterService = require("./UserCounterService");

const UserService = {
    async SignUpUser(userData) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);
            const existingUser = await collection.findOne({ email: userData.email });

            if (existingUser) {
                if (userData.acc_type === "google") {
                    await collection.updateOne(
                        { email: userData.email },
                        { $set: { acc_type: "public, google" } }
                    );
                    client.close();
                    return null;
                }
                console.log("Existing user: ", existingUser);
                return existingUser;
            }

            userData.created_at = new Date().toISOString();

            const newFormId = await UserCounterService.getNextValue('userId');
            userData.user_id = newFormId;

            await collection.insertOne(userData);
            client.close();
            return null;
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new Error(`Registration failed: ${error.message}`);
            } else {
                throw new Error(`Error registering user: ${error.message}`);
            }
        }
    },

    async VerifyEmail(firebase_id) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);
            const user = await collection.findOneAndUpdate(
                { firebase_id: firebase_id },
                { $set: { email_verified: true } }
            );

            client.close();
            return user;
        } catch (error) {
            console.error("Error verifying email:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async insertPresetAccounts() {
        const { client, database } = await connectDB();
        const presetAccounts = PRESET_ACCOUNTS.PRESET_ACCOUNTS;
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);

            // Check if the collection exists and insert preset accounts if it doesn't
            const countersCollection = database.collection(DATABASE_COLLECTIONS.USERS_COUNTER);
            const collections = await database.listCollections({ name: DATABASE_COLLECTIONS.USERS_COUNTER }).toArray();
            if (collections.length === 0) {
                await database.createCollection(DATABASE_COLLECTIONS.USERS_COUNTER);
                await countersCollection.insertOne({ _id: "userId", value: 3 });
            }

            const existingAccounts = await collection
                .find({ $or: [{ username: "admin" }, { username: "signexpert" }] })
                .toArray();

            if (existingAccounts.length === 0) {
                // Generate IDs for preset accounts and insert them into the collection
                const presetAccountsWithIds = presetAccounts.map((account, index) => ({
                    ...account,
                    created_at: new Date().toISOString(),
                    user_id: index + 1 // Increment index to start from 1
                }));

                const result = await collection.insertMany(presetAccountsWithIds);
                console.log(`${result.insertedCount} preset accounts inserted`);
            } else {
                console.log("Preset accounts already exist");
            }
        } catch (error) {
            console.error("Error inserting preset accounts:", error);
            throw new Error("Failed to insert preset accounts");
        } finally {
            client.close();
        }
    },

    async GetAllUsers() {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);
            const users = await collection.find().toArray();
            await client.close();
            return users;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    },

    async GetUserByEmail(email) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);
            const user = await collection.findOne({
                email: email
            });

            await client.close();
            return user;
        }
        catch (error) {
            console.error("Error fetching user by email:", error);
            throw error;
        }
    },

    async GetUserById(id) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);
            const user = await collection.findOne({
                user_id: id
            });

            await client.close();
            return user;
        }
        catch (error) {
            console.error("Error fetching user by email:", error);
            throw error;
        }
    },

    // update user profile
    async UpdateUserProfileById(user_id, updatedData) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);

            const result = await collection.updateOne(
                { firebase_id: user_id },
                { $set: updatedData }
            );
            console.log(`${result.modifiedCount} user profile updated`);

            client.close();
            return result;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw new Error("Failed to update user profile");
        }
    },

    // For country
    async insertPresetCountry() {
        const { client, database } = await connectDB();
        const presetData = PRESET_DATA.PRESET_DATA;
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.COUNTRY);

            const collections = await database.listCollections({ name: DATABASE_COLLECTIONS.COUNTRY }).toArray();
            if (collections.length === 0) {
                await database.createCollection(DATABASE_COLLECTIONS.COUNTRY);
            }

            const existingData = await collection.find().toArray();

            if (existingData.length === 0) {
                const result = await collection.insertMany(presetData);
                console.log(`${result.insertedCount} preset country data inserted`);
            } else {
                console.log("Preset country data already exist");
            }
        } catch (error) {
            console.error("Error inserting preset data:", error);
            throw new Error("Failed to insert preset data");
        } finally {
            client.close();
        }
    },

    async GetAllCountries() {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.COUNTRY);
            const countries = await collection.find().toArray();
            client.close();
            return countries;
        } catch (error) {
            console.error("Error fetching countries:", error);
            throw error;
        }
    },

    // Fetch the datasetcollection by id
    async GetDatasetById(user_id) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const dataset = await collection.find({
                user_id: parseInt(user_id)
            }).toArray();

            await client.close();
            return dataset;
        }
        catch (error) {
            console.error("Error fetching dataset by id:", error);
            throw error;
        }
    },

    // Fetch all datasetcollection 
    async GetAllUserDatasetCollection() {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.DATASET_COLLECTION);
            const dataset = await collection.find().toArray();
            await client.close();
            return dataset;
        } catch (error) {
            console.error("Error fetching dataset collection:", error);
            throw error;
        }
    },

    async getUserById(userId) {
        const { client, database } = await connectDB();
        try {
            const collection = database.collection(DATABASE_COLLECTIONS.USERS);
            const existingUser = await collection.findOne({ user_id: userId });
            await client.close();
            return existingUser;
        } catch (error) {
            console.error("Error fetching dataset collection:", error);
            throw error;
        }
    }
};

module.exports = UserService;
