const express = require("express");
const DatasetFormController = require("../controllers/DatasetFormController");
const { uploadVideo } = require("../middlewares/multer.middleware")

const router = express.Router()


router.post("/datasetForms", uploadVideo, DatasetFormController.ProcessVideoAndSubmitFormData)
// router.post("/datasetForms", DatasetFormController.ProcessVideoAndSubmitFormData)
router.get("/datasetForms/signexpert", DatasetFormController.GetAllFormsForSignExpert)
router.get("/datasetForms/admin", DatasetFormController.GetAllFormsForAdmin)
router.put("/datasetForms/:id", DatasetFormController.UpdateFormStatusById)
router.put("/datasetForms/avatarVideo/:id", uploadVideo, DatasetFormController.UpdateFormStatusWithVideoById)
router.get("/datasetForms/:id", DatasetFormController.GetFormById)
router.get("/datasetForms/demoVid/:id", DatasetFormController.GetDemoVideoById)
router.get("/datasetForms/avatarVid/:id", DatasetFormController.GetAvatarVideoById)
router.delete("/datasetForms/:id", DatasetFormController.DeleteFormById)
module.exports = router;