const express = require('express');
const UserController = require("../controllers/UserController");
const { uploadPicture } = require('../middlewares/multer.middleware');

const router = express.Router();

router.post('/users/signup', UserController.SignUpUser);
// router.post('/users/seed-preset', UserController.insertPresetAccounts);
router.get('/users/all-users', UserController.GetAllUsers);
router.put('/users/verify-email', UserController.VerifyEmail);

// For profile page (Account)
router.get('/users/countries', UserController.GetAllCountries);
router.get('/users/:email/profile', UserController.GetUserByEmail);
router.put('/users/:userID/profile', uploadPicture, UserController.UpdateUserProfileById);

// For profile page (Sign text)
router.get('/users/all-datasets', UserController.GetAllDatasetCollection);
router.get('/users/:userID/datasets', UserController.GetUserDatasetCollection);

module.exports = router;