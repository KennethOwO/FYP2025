const { connectDB, DATABASE_COLLECTIONS } = require("../config/database");

const LeaderBoardService = {
    async GetAllGuessTheWordPlayer() {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.GUESS_THE_WORD);
            const result = await collection.aggregate([
                {
                    $lookup: {
                        from: DATABASE_COLLECTIONS.USERS,
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $group: {
                        _id: "$user_id",
                        highestScore: { $max: "$score" },
                        username: { $first: "$user.username" },
                        picture: { $first: "$user.picture" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        user_id: "$_id",
                        score: "$highestScore",
                        username: 1,
                        picture: 1
                    }
                },
                {
                    $sort: { "score": -1 }
                }
            ]).toArray();

            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error fetching players: ${error.message}`);
        }
    },

    async GetAllDoTheSignPlayer() {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.DO_THE_SIGN);
            const result = await collection.aggregate([
                {
                    $lookup: {
                        from: DATABASE_COLLECTIONS.USERS,
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $group: {
                        _id: "$user_id",
                        highestScore: { $max: "$score" },
                        username: { $first: "$user.username" },
                        picture: { $first: "$user.picture" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        user_id: "$_id",
                        score: "$highestScore",
                        username: 1,
                        picture: 1
                    }
                },
                {
                    $sort: { "score": -1 }
                }
            ]).toArray();

            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error fetching players: ${error.message}`);
        }
    },

    async SaveGuessTheWordScore(data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.GUESS_THE_WORD);
            const result = await collection.insertOne(data);
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error saving score: ${error.message}`);
        }
    },

    async SaveDoTheSignScore(data) {
        try {
            const { client, database } = await connectDB();
            const collection = database.collection(DATABASE_COLLECTIONS.DO_THE_SIGN);
            const result = await collection.insertOne(data);
            client.close();
            return result;
        } catch (error) {
            throw new Error(`Error saving score: ${error.message}`);
        }
    }
};

module.exports = LeaderBoardService