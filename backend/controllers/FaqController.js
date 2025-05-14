const FaqService = require("../services/FaqService");
const { verifyRequest, adminVerifyRequest } = require("../middlewares/authenticateToken.middleware");

const FaqController = {
    async CreateFaq(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const faqData = req.body;
                const newFaq = await FaqService.CreateFaq(faqData);
                res.status(201).json(newFaq);
            })
        } catch (error) {
            console.error("Error creating faq:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async UpdateFaq(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const faqId = parseInt(req.params.id);
                const faqData = req.body;
                const updatedFaq = await FaqService.UpdateFaq(faqId, faqData);
                res.status(200).json(updatedFaq);
            })
        } catch (error) {
            console.error("Error updating faq:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async DeleteFaq(req, res) {
        try {
            const faqId = parseInt(req.params.id);
            const deletedFaq = await FaqService.DeleteFaq(faqId);
            res.status(200).json(deletedFaq);
        } catch (error) {
            console.error("Error deleting faq:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async FetchFaq(req, res) {
        try {
            const faqs = await FaqService.FetchFaq();
            res.status(200).json(faqs);
        } catch (error) {
            console.error("Error fetching faq:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async insertFixFaq(res) {
        try {
            const result = await FaqService.insertFixFaq();
            if (res) {
                res.status(200).json({ message: "Fix FAQ inserted successfully" });
            }
        } catch (error) {
            console.error("Error inserting fix faq:", error);
            if (res) {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }
};

module.exports = FaqController;