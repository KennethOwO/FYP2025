const FeedbackController = require('../controllers/FeedbackController');
const { uploadImage } = require('../middlewares/multer.middleware');

const router = require('express').Router();

router.post('/feedbacks/create-feedback', uploadImage, FeedbackController.CreateFeedback);
router.get('/feedbacks/fetch-feedback', FeedbackController.FetchFeedback);
router.put('/feedbacks/update-feedback-status/:feedbackId', FeedbackController.UpdateFeedbackStatus);

module.exports = router;