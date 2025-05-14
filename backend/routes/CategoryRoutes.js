const CategoryController = require("../controllers/CategoryController");
const { uploadImage } = require('../middlewares/multer.middleware');
const router = require("express").Router();


router.get("/lib/categories", CategoryController.fetchCat);
// router.post("/lib", CategoryController.insertPresetSignCategories);
router.post("/lib/admin/categories", uploadImage, CategoryController.CreateCat);
router.put("/lib/admin/categories/:id", uploadImage, CategoryController.UpdateCat);
router.delete("/lib/admin/categories/:id", CategoryController.DeleteCat);
module.exports = router;