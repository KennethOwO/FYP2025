const LeaderBoardController = require("../controllers/LeaderBoardController");
const router = require("express").Router();

router.get("/guess_the_word/player", LeaderBoardController.GetAllGuessTheWordPlayer);
router.get("/do_the_sign/player", LeaderBoardController.GetAllDoTheSignPlayer);

router.post("/guess_the_word/score", LeaderBoardController.SaveGuessTheWordScore);
router.post("/do_the_sign/score", LeaderBoardController.SaveDoTheSignScore);
module.exports = router;