const { t } = require("i18next");
const EditHomepageServices = require("../services/EditHomepageServices");
const { verifyRequest, adminVerifyRequest, } = require("../middlewares/authenticateToken.middleware");

const EditHomepageController = {
    async addHomepageComponent(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const data = req.body;
                await EditHomepageServices.addHomepageComponent(data);
                res.status(200).send();
            })
        } catch (error) {
            console.error("Error adding homepage data:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },

    async updateHomepageComponent(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const componentId = req.params.id;
                const data = req.body;
                await EditHomepageServices.updateHomepageComponent(componentId, data);
                res.status(200).send();
            })
        } catch (error) {
            console.error("Error updating homepage data:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },

    async deleteHomepageComponent(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const componentId = req.params.id;
                await EditHomepageServices.deleteHomepageComponent(componentId);
                res.status(200).send();
            })
        } catch (error) {
            console.error("Error deleting homepage data:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },

    async getHomepageComponent(req, res) {
        try {
            const homepageData = await EditHomepageServices.getHomepageComponent();
            res.status(200).json(homepageData);
        } catch (error) {
            console.error("Error fetching homepage data:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },

    // For Image Slider
    async addHomepageImageSlider(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const data = req.body;
                await EditHomepageServices.addHomepageImageSlider(data);
                res.status(200).send();
            })
        } catch (error) {
            console.error("Error adding homepage data:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },

    async getHomepageImageSlider(req, res) {
        try {
            const homepageImageSliderData = await EditHomepageServices.getHomepageImageSlider();
            res.status(200).json(homepageImageSliderData);
        } catch (error) {
            console.error("Error fetching homepage data:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },

    async updateHomepageImageSlider(req, res) {
        try {
            await adminVerifyRequest(req, res, async (req, res) => {
                const data = req.body;
                await EditHomepageServices.updateHomepageImageSlider(data);
                res.status(200).send();
            })
        } catch (error) {
            console.error("Error updating homepage data:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },
};

module.exports = EditHomepageController;
