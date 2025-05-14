const express = require("express");
const EditHomepageController = require("../controllers/EditHomepageController");

const router = express.Router();

router.post("/homepage/add-component", EditHomepageController.addHomepageComponent);
router.put("/homepage/update-component/:id", EditHomepageController.updateHomepageComponent);
router.delete("/homepage/delete-component/:id", EditHomepageController.deleteHomepageComponent);
router.get("/homepage/get-component", EditHomepageController.getHomepageComponent);

// For Image Slider
router.post("/homepage/add-image-slider", EditHomepageController.addHomepageImageSlider);
router.get("/homepage/get-image-slider", EditHomepageController.getHomepageImageSlider);
router.put("/homepage/update-image-slider", EditHomepageController.updateHomepageImageSlider);

module.exports = router;
