const { verifyRequest } = require('../middlewares/authenticateToken.middleware');
const LeaderBoardService = require('../services/LeaderBoardService');

const LeaderBoardController = {
    async GetAllGuessTheWordPlayer(req, res) {
        try {
            const result = await LeaderBoardService.GetAllGuessTheWordPlayer();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async GetAllDoTheSignPlayer(req, res) {
        try {
            const result = await LeaderBoardService.GetAllDoTheSignPlayer();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async SaveGuessTheWordScore(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const result = await LeaderBoardService.SaveGuessTheWordScore(req.body);
                res.status(200).json(result);
            })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async SaveDoTheSignScore(req, res) {
        try {
            await verifyRequest(req, res, async (req, res) => {
                const result = await LeaderBoardService.SaveDoTheSignScore(req.body);
                res.status(200).json(result);
            })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = LeaderBoardController