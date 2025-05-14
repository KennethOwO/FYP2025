const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");
const PRESET_SIGN_CATEGORIES = require("../constants/PresetSignCategories");
const CategoryCounterService = require("./CategoryCounterService");

const CategoryService = {

    async fetchCat(){
        try{
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY);
            const result = await collection.find({}).toArray();
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error fetching sign categories: ${error.message}`);
        }
    },

    async insertPresetSignCategories(){
        const { client, database } = await connectDB();
        const presetSignsCategories = PRESET_SIGN_CATEGORIES.PRESET_SIGN_CATEGORIES;
        try{
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY);

            const countersCollection = database.collection(DATABASE_COLLECTIONS.CATEGORY_COUNTER);
            const collections = await database.listCollections({ name: DATABASE_COLLECTIONS.CATEGORY_COUNTER }).toArray();
            if (collections.length === 0) {
                await database.createCollection(DATABASE_COLLECTIONS.CATEGORY_COUNTER);
                await countersCollection.insertOne({ _id: "catId", value: 5 });
            }

            const existingsigncategories = await collection
                .find({ $or: [{ category_id : 1 }, {  category_id : 2}, {  category_id : 3} , {  category_id : 4}] })
                .toArray();
            
            if (existingsigncategories.length === 0) {
                const presetcategorieswithID = presetSignsCategories.map((category, index) => ({
                    ...category,
                    category_id: index + 1 
                }));
    
                const result = await collection.insertMany(presetcategorieswithID);
                console.log(`${result.insertedCount} preset categories inserted`);
            } else {
                console.log("Preset sign categories already exist");
            }
        } catch (error) {
            console.error("Error inserting preset sign categories:", error);
            throw new Error(`Error inserting preset sign categories: ${error.message}`);
        } finally {
            client.close();
        }
    },

    async CreateCat(data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY);
            const id = await CategoryCounterService.getNextValue('catId')
            
            data.category_id = id;
            
            const result = await collection.insertOne(data);
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error creating category: ${error.message}`);
        }
    }, 

    async UpdateCat(id, data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY);

            const result = await  collection.updateOne(
                { category_id: id },
                { $set: data }
            );
            client.close();
            return result;
        }
        catch (error) {
            throw new Error(`Error updating category: ${error.message}`);
        }
    },

    async DeleteCat(id) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.CATEGORY);

            const result = await collection.deleteOne({ category_id: id });
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error deleting category: ${error.message}`);
        }
    },
};

module.exports = CategoryService;