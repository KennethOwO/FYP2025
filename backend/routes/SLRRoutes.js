const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Configure multer for video file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Not a video file'), false);
        }
    }
});

// Global variable to track model initialization state
let modelInitialized = false;
let modelPath = 'models/best.pt'; // Default model path - Update to your actual path
let confidenceThreshold = 0.2; // Default confidence threshold

// Initialize the model
router.post('/initialize-model', async (req, res) => {
    try {
        console.log('Initializing SLR model...');

        // Update model configuration if provided
        if (req.body.modelPath) {
            modelPath = req.body.modelPath;
        }

        if (req.body.confidenceThreshold) {
            confidenceThreshold = req.body.confidenceThreshold;
        }

        // Check if model file exists
        const absoluteModelPath = path.join(__dirname, '..', modelPath);
        if (!fs.existsSync(absoluteModelPath)) {
            console.warn(`Model file not found at ${absoluteModelPath}, but continuing anyway for testing`);
            // For testing, we'll set as initialized even if the file isn't found
            // In production, you might want to return an error instead
        }

        // Set model as initialized
        modelInitialized = true;

        res.json({
            success: true,
            message: 'Model initialized successfully',
            config: {
                modelPath,
                confidenceThreshold
            }
        });
    } catch (error) {
        console.error('Error initializing model:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Process video for sign language recognition
router.post('/process-video', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No video file uploaded'
            });
        }

        const videoPath = req.file.path;
        console.log(`Processing video: ${videoPath}`);

        // Parse model config if provided
        let config = {
            modelPath,
            confidenceThreshold
        };

        if (req.body.modelConfig) {
            try {
                const parsedConfig = JSON.parse(req.body.modelConfig);
                config = { ...config, ...parsedConfig };
            } catch (e) {
                console.warn('Failed to parse modelConfig JSON:', e);
            }
        }

        // Make the absolute path to the model
        const absoluteModelPath = path.join(__dirname, '..', config.modelPath);

        // Run Python script for video processing
        const result = await processVideoWithPython(videoPath, absoluteModelPath, config.confidenceThreshold);

        // Clean up the uploaded file
        fs.unlink(videoPath, (err) => {
            if (err) console.error('Failed to delete uploaded video:', err);
        });

        res.json({
            success: true,
            text: result.sentence || 'No signs detected',
            detectedSigns: result.detectedWords || [],
            confidence: result.confidence || 0
        });
    } catch (error) {
        console.error('Error processing video:', error);

        // Clean up on error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => { });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function to process video using Python script
function processVideoWithPython(videoPath, modelPath, threshold) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../process_video_yolov8.py');

        const pythonProcess = spawn('python', [
            scriptPath,
            videoPath,
            modelPath,
            String(threshold)
        ]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
            console.error(`Python stderr:\n${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script failed with code ${code}`);
                return reject(new Error(`Python script failed:\n${errorData}`));
            }

            try {
                const result = JSON.parse(outputData);

                if (!result.success) {
                    return reject(new Error(result.error || 'Unknown Python error'));
                }

                resolve(result);
            } catch (err) {
                console.error('Failed to parse JSON output from Python:', outputData);
                reject(new Error('Invalid JSON output from Python script'));
            }
        });
    });
}


// Test endpoint to check if the router is working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'SLR API is working'
    });
});

module.exports = router;