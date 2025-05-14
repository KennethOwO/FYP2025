// multerMiddleware.js

const multer = require('multer');

// Function to upload videos
function uploadVideo(req, res, next) {
    const storage = multer.memoryStorage({});
    const upload = multer({ storage: storage }).single('video');
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'File upload error', error: err });
        } else if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
        next();
    });
}

// Function to upload images
function uploadImage(req, res, next) {
    const storage = multer.memoryStorage({});

    const upload = multer({ storage: storage }).single('image');
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'File upload error', error: err });
        } else if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
        next();
    });
}

function uploadPicture(req, res, next) {
    const storage = multer.memoryStorage({});

    const upload = multer({ storage: storage }).single('picture');
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'File upload error', error: err });
        } else if (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
        next();
    });
}

module.exports = { uploadVideo, uploadImage, uploadPicture };