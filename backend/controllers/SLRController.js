// const fs = require("fs");
// const path = require("path");
// const { spawnSync } = require("child_process");
// const os = require("os");

// // Path for temporary video files
// const TEMP_DIR = os.tmpdir();

// // Path to Python scripts - adjust based on your structure
// const SCRIPTS_DIR = path.join(__dirname, "../");  // Assuming scripts are in root directory
// const MODELS_DIR = path.join(__dirname, "../models");  // Path to models directory

// const SLRController = {
//     // Initialize the PoseFormer model
//     async initializeModel(req, res) {
//         try {
//             const { modelPath, confidenceThreshold } = req.body;

//             if (!modelPath) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "Model path is required"
//                 });
//             }

//             const confThreshold = confidenceThreshold || 0.7;

//             // Get model filename (in case path includes directories)
//             const modelFilename = path.basename(modelPath);

//             // Try possible paths to find the model
//             const possiblePaths = [
//                 modelPath,  // As provided
//                 path.join(MODELS_DIR, modelFilename),  // In models directory
//                 path.join(__dirname, "..", "models", modelFilename),  // Relative to controller
//                 path.join(process.cwd(), "models", modelFilename),  // From current working directory
//                 path.join(process.cwd(), "backend", "models", modelFilename)  // In backend/models
//             ];

//             // Find first path that exists
//             let resolvedModelPath = null;
//             for (const testPath of possiblePaths) {
//                 console.log(`Checking for model at: ${testPath}`);
//                 if (fs.existsSync(testPath)) {
//                     resolvedModelPath = testPath;
//                     console.log(`Model found at: ${resolvedModelPath}`);
//                     break;
//                 }
//             }

//             if (!resolvedModelPath) {
//                 // For debugging, try hard-coded path
//                 const hardCodedPath = "C:\\Users\\Acer\\Documents\\FYP A (SLP done)\\backend\\models\\poseformer_epoch_30.pth";
//                 if (fs.existsSync(hardCodedPath)) {
//                     resolvedModelPath = hardCodedPath;
//                     console.log(`Model found at hard-coded path: ${resolvedModelPath}`);
//                 } else {
//                     console.error("Model not found in any location");
//                     return res.status(400).json({
//                         success: false,
//                         error: "Model file not found. Please check the model path."
//                     });
//                 }
//             }

//             console.log("Initializing PoseFormer model:", resolvedModelPath);
//             console.log("Confidence threshold:", confThreshold);

//             // Call Python script to initialize model - similar to your SLP approach
//             // Note: You'll need to create initialize_poseformer.py
//             const pythonProcess = spawnSync("python", [
//                 path.join(SCRIPTS_DIR, "initialize_poseformer.py"),
//                 resolvedModelPath,
//                 confThreshold.toString()
//             ]);

//             if (pythonProcess.error) {
//                 console.error("Python initialization failed:", pythonProcess.error);
//                 return res.status(500).json({
//                     success: false,
//                     error: "Model initialization failed: " + pythonProcess.error.message
//                 });
//             }

//             if (pythonProcess.stderr.toString()) {
//                 console.error("Python stderr:", pythonProcess.stderr.toString());
//             }

//             // Check if Python script produced output
//             if (!pythonProcess.stdout.toString().trim()) {
//                 // No stdout - just return success for testing
//                 console.log("No Python output, returning success for testing");
//                 return res.json({
//                     success: true,
//                     message: "Model initialization successful (no Python output)",
//                     modelPath: resolvedModelPath
//                 });
//             }

//             // Try to parse Python output
//             try {
//                 const result = JSON.parse(pythonProcess.stdout.toString());
//                 result.modelPath = resolvedModelPath; // Add path for reference
//                 return res.json(result);
//             } catch (parseError) {
//                 console.error("Error parsing Python output:", parseError);
//                 console.error("Raw output:", pythonProcess.stdout.toString());

//                 // For testing, still return success
//                 return res.json({
//                     success: true,
//                     message: "Model initialization successful (parsing error handled)",
//                     modelPath: resolvedModelPath,
//                     rawOutput: pythonProcess.stdout.toString()
//                 });
//             }
//         } catch (error) {
//             console.error("Error initializing model:", error);
//             return res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     },

//     // Process video with PoseFormer model
//     async processVideo(req, res) {
//         try {
//             if (!req.file) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "No video file provided"
//                 });
//             }

//             // Get model config from request
//             const modelConfig = JSON.parse(req.body.modelConfig || '{}');
//             const modelPath = modelConfig.path;
//             const confidenceThreshold = modelConfig.confidenceThreshold || 0.7;

//             if (!modelPath) {
//                 return res.status(400).json({
//                     success: false,
//                     error: "Model path is required in modelConfig"
//                 });
//             }

//             // Save the uploaded video temporarily
//             const videoFileName = `slr_video_${Date.now()}.webm`;
//             const videoPath = path.join(TEMP_DIR, videoFileName);

//             fs.writeFileSync(videoPath, req.file.buffer);

//             // Resolve model path using same approach as in initializeModel
//             const modelFilename = path.basename(modelPath);

//             // Try possible paths to find the model
//             const possiblePaths = [
//                 modelPath,
//                 path.join(MODELS_DIR, modelFilename),
//                 path.join(__dirname, "..", "models", modelFilename),
//                 path.join(process.cwd(), "models", modelFilename),
//                 path.join(process.cwd(), "backend", "models", modelFilename)
//             ];

//             let resolvedModelPath = null;
//             for (const testPath of possiblePaths) {
//                 if (fs.existsSync(testPath)) {
//                     resolvedModelPath = testPath;
//                     break;
//                 }
//             }

//             if (!resolvedModelPath) {
//                 // For debugging, try hard-coded path
//                 const hardCodedPath = "C:\\Users\\Acer\\Documents\\FYP A (SLP done)\\backend\\models\\poseformer_epoch_30.pth";
//                 if (fs.existsSync(hardCodedPath)) {
//                     resolvedModelPath = hardCodedPath;
//                 } else {
//                     try {
//                         fs.unlinkSync(videoPath); // Clean up temporary file
//                     } catch (err) { }

//                     return res.status(400).json({
//                         success: false,
//                         error: "Model file not found. Please check the model path."
//                     });
//                 }
//             }

//             console.log("Processing video:", videoPath);
//             console.log("Model path:", resolvedModelPath);
//             console.log("Confidence threshold:", confidenceThreshold);

//             // Call Python script to process video - similar to your SLP approach
//             // Note: You'll need to create process_slr_video.py
//             const pythonProcess = spawnSync("python", [
//                 path.join(SCRIPTS_DIR, "process_slr_video.py"),
//                 videoPath,
//                 resolvedModelPath,
//                 confidenceThreshold.toString()
//             ], {
//                 // Increase max buffer size for potentially large outputs
//                 maxBuffer: 1024 * 1024 * 10 // 10 MB
//             });

//             // Clean up temporary file
//             try {
//                 fs.unlinkSync(videoPath);
//             } catch (err) {
//                 console.error("Error removing temporary file:", err);
//             }

//             if (pythonProcess.error) {
//                 console.error("Python processing failed:", pythonProcess.error);
//                 return res.status(500).json({
//                     success: false,
//                     error: "Video processing failed: " + pythonProcess.error.message
//                 });
//             }

//             if (pythonProcess.stderr.toString()) {
//                 console.error("Python stderr:", pythonProcess.stderr.toString());
//             }

//             // Check if Python script produced output
//             if (!pythonProcess.stdout.toString().trim()) {
//                 // No stdout - for testing return a mock response
//                 console.log("No Python output, returning mock response for testing");
//                 return res.json({
//                     success: true,
//                     text: "EXAMPLE SIGN DETECTED",
//                     confidence: 0.85
//                 });
//             }

//             try {
//                 // Parse the result from Python script
//                 const result = JSON.parse(pythonProcess.stdout.toString());
//                 return res.json(result);
//             } catch (parseError) {
//                 console.error("Error parsing Python output:", parseError);
//                 console.error("Raw output:", pythonProcess.stdout.toString());

//                 // For testing, still return success with mock data
//                 return res.json({
//                     success: true,
//                     text: "ERROR PARSING BUT SIGN DETECTED",
//                     confidence: 0.7,
//                     rawOutput: pythonProcess.stdout.toString()
//                 });
//             }
//         } catch (error) {
//             console.error("Error processing video:", error);
//             return res.status(500).json({
//                 success: false,
//                 error: error.message
//             });
//         }
//     }
// };

// module.exports = SLRController;
// controllers/SLRController.js
// controllers/SLRController.js

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

/**
 * Controller for Sign Language Recognition operations
 */
class SLRController {
    /**
     * Initializes the YOLOv8 model for sign language recognition
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async initializeModel(req, res) {
        try {
            // Extract model configuration from request
            const modelPath = req.body.modelPath || 'models/best.pt';
            const confidenceThreshold = req.body.confidenceThreshold || 0.7;

            // Verify model exists
            const absoluteModelPath = path.join(__dirname, '..', modelPath);
            const modelExists = fs.existsSync(absoluteModelPath);

            // For development, we'll allow initialization even if the model doesn't exist
            if (!modelExists) {
                console.warn(`Model file not found at ${absoluteModelPath}. Check the path or add the model file.`);
            }

            res.status(200).json({
                success: true,
                message: modelExists ? 'Model initialized successfully' : 'Model not found, but initialization allowed for testing',
                config: {
                    modelPath: modelPath,
                    confidenceThreshold: confidenceThreshold
                }
            });
        } catch (error) {
            console.error('Error in initializeModel:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Tests YOLOv8 installation and Python environment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async testPythonEnvironment(req, res) {
        try {
            const pythonScript = `
import sys
import json
try:
    from ultralytics import YOLO
    result = {
        "success": True,
        "python_version": sys.version,
        "ultralytics_installed": True
    }
except ImportError:
    result = {
        "success": False,
        "python_version": sys.version,
        "ultralytics_installed": False,
        "error": "Ultralytics package not installed"
    }
print(json.dumps(result))
`;

            // Create a temporary script file
            const scriptPath = path.join(__dirname, '..', 'temp_scripts', 'test_env.py');
            const scriptDir = path.dirname(scriptPath);

            if (!fs.existsSync(scriptDir)) {
                fs.mkdirSync(scriptDir, { recursive: true });
            }

            fs.writeFileSync(scriptPath, pythonScript);

            // Run the Python script
            const pythonProcess = spawn('python', [scriptPath]);

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                // Clean up the temporary script
                fs.unlink(scriptPath, () => { });

                if (code !== 0) {
                    return res.status(500).json({
                        success: false,
                        error: `Python environment test failed: ${errorData}`
                    });
                }

                try {
                    const result = JSON.parse(outputData);
                    res.status(200).json(result);
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: 'Failed to parse Python output'
                    });
                }
            });
        } catch (error) {
            console.error('Error testing Python environment:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Tests the SLR API endpoints
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async testApi(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'SLR API test successful',
                timestamp: new Date().toISOString(),
                endpoints: {
                    '/api/slr/test': 'GET - Test API connection',
                    '/api/slr/initialize-model': 'POST - Initialize YOLOv8 model',
                    '/api/slr/process-video': 'POST - Process video with YOLOv8 for sign recognition'
                }
            });
        } catch (error) {
            console.error('Error in testApi:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = SLRController;