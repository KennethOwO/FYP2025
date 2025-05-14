const express = require("express");
const router = express.Router();
const SLPController = require("../controllers/SLPController");

router.post("/match-gloss", SLPController.matchGloss);
router.post("/get-frames", SLPController.getFrames);
router.post("/match-and-connect", SLPController.matchAndConnect);

module.exports = router;
