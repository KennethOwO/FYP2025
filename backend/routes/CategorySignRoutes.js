const CategorySignController = require("../controllers/CategorySignController");
const { uploadImage } = require('../middlewares/multer.middleware');
const router = require("express").Router();

router.get("/lib/sign/:cat", CategorySignController.fetchSign);
// router.post("/lib", CategorySignController.updateAvatarSigns);
router.put("/lib/admin/sign/:id", uploadImage, CategorySignController.UpdateSign);
module.exports = router;