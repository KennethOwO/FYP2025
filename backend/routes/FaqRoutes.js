const FaqController = require("../controllers/FaqController");
const router = require("express").Router();

router.post("/faqs/create-faq", FaqController.CreateFaq);
router.get("/faqs/fetch-faq", FaqController.FetchFaq);
// router.post("/faqs/insert-fix-faq", FaqController.insertFixFaq);
router.put("/faqs/update-faq/:id", FaqController.UpdateFaq);
router.delete("/faqs/delete-faq/:id", FaqController.DeleteFaq);

module.exports = router;