const express = require("express");
const { uploadVideo } = require("../middlewares/multer.middleware")
const CommunicationController = require("../controllers/CommunicationController");
const router = express.Router()

router.post("/logs/user", CommunicationController.fetchLogsByUser);
router.post("/logs/user/create", CommunicationController.CreateLogsByUser);
router.delete("/logs/user/:id", CommunicationController.DeleteAllLogsByUser);
router.post("/nlp/output", CommunicationController.fetchNLPOutput);
router.post("/slr/output", uploadVideo, CommunicationController.fetchSLROutput);

module.exports = router;
