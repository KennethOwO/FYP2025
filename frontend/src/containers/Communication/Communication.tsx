// Communication.tsx
// General Imports
import "regenerator-runtime/runtime";
import styles from "./Communication.module.css";
import { useRef, useState, useEffect, SetStateAction, FormEvent, ChangeEvent } from "react";
import { fetchNLPOutput, createLogsByUser } from "../../services/communication.service";

// SLP Imports
import { Canvas, useFrame } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import React from "react";
import Communicationlog from "./Communicationlog";
// SLR Imports
import SLRInput from "../../components/SLRInput/SLRInput";
import CommunicationSLP from "../../components/CommunicationSLP.tsx";
import ButtonRow from "../../components/ButtonRow/ButtonRow";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";
import { useUserStore } from "@root/store/userStore";
import { FaCog } from "react-icons/fa";
import axios from "axios"; // Add axios for API calls
import api from '../../api';

// TypeScript interfaces
interface LogData {
    text: string;
    module: string;
    user_id: string;
}

interface ModelConfig {
    path: string;
    confidenceThreshold: number;
}

function Communication(): JSX.Element {
    const currentUser = getAuth().currentUser;
    const { user } = useUserStore();
    const { t, i18n } = useTranslation();
    const [isListening, setIsListening] = useState<boolean>(false);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({});
    const formRef = useRef<HTMLFormElement>(null);

    // States to manage the application
    // General states
    const [activeButton, setActiveButton] = useState<string>(() => {
        // Retrieve the activeButton value from localStorage on initial render
        return localStorage.getItem("activeButton") || "SLP";
    });

    // Model status for YOLO integration
    const [modelStatus, setModelStatus] = useState<"initializing" | "ready" | "error">("initializing");
    const [modelFeedback, setModelFeedback] = useState<string>("");
    const [processingVideo, setProcessingVideo] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [videoSource, setVideoSource] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    // Initialize YOLO model on component mount for SLR
    useEffect(() => {
        if (activeButton === "SLR") {
            initializePoseFormerModel();
        }

        // Cleanup on unmount
        return () => {
            if (streamRef.current) {
                const tracks = streamRef.current.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [activeButton]);

    const renderMicrophoneButton = (): JSX.Element => {
        const handleStopListening = (): void => {
            SpeechRecognition.stopListening();
            setIsListening(false);
            toast(t("stopped"), {
                icon: "✋",
                style: {
                    borderRadius: "10px",
                    background: "#333",
                    color: "#fff",
                },
            });

            triggerSubmit(); // Call the helper function to submit without an event
        };

        if (browserSupportsSpeechRecognition) {
            return (
                <button
                    className={styles["avatarMicrophoneBtn"]}
                    onClick={() => {
                        if (!isListening) {
                            resetTranscript();
                            setCustomTranscript("");
                            SpeechRecognition.startListening({
                                language: "ms-MY",
                                continuous: true,
                            });
                            setIsListening(true);
                            toast(t("listening"), {
                                icon: "🎤",
                                style: {
                                    borderRadius: "10px",
                                    background: "#333",
                                    color: "#fff",
                                },
                            });
                        } else {
                            handleStopListening();
                        }
                    }}
                >
                    <i className={`fa ${isListening ? "fa-stop" : "fa-microphone"} ${styles["faMicrophone"]}`}></i>
                    <p className={styles.btnText}>{t("speech_to_text")}</p>
                </button>
            );
        } else {
            return (
                <button className={styles["avatarMicrophoneBtn disabled"]} disabled={true}>
                    <i className={`fa fa-microphone ${styles["faMicrophone"]}`}></i>
                    <span className={styles["tooltip2"]}>{t("voice_input_not_supported")}</span>
                </button>
            );
        }
    };

    // Helper function to trigger form submission without an event parameter
    const triggerSubmit = (): void => {
        if (formRef.current) {
            formRef.current.requestSubmit(); // Trigger form submission using the form reference
        }
    };

    const [customTranscript, setCustomTranscript] = useState<string>("");

    useEffect(() => {
        setCustomTranscript(transcript || "");
    }, [transcript]);

    // Define a variable to store the previous submitted text
    let previousSubmittedText = "";

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setIsLoading(true); // Start loading

        const formData = new FormData(formRef.current as HTMLFormElement);
        let submittedText = (formData.get("sigmlUrl") as string) || ""; // Prevent null value
        const getData = {
            submitted_Text: submittedText,
        };

        try {
            const response = await fetchNLPOutput(getData);
            const data = await response;

            if (previousSubmittedText === submittedText) {
                // If the current submitted text is the same as the previous one, append "+" to the returned text
                setInputText(data["return"] + "+");
            } else {
                // If they are different, update the inputText directly
                setInputText(data["return"]);
                const logData: LogData = {
                    text: data["return"],
                    module: "SLP",
                    user_id: user?.user_id ? String(user.user_id) : "",
                };
                if (currentUser) createLogsByUser(logData, currentUser);
            }

            // Update the previousSubmittedText variable for the next comparison
            previousSubmittedText = submittedText;
        } catch (error) {
            console.error("Error processing text: ", error);
            toast.error(t("error_processing_text"));
        } finally {
            setIsLoading(false); // Stop loading regardless of success/failure
        }
    };

    // SLP states
    const [inputText, setInputText] = useState<string>(""); // State to hold the input text
    const [speed, setSpeed] = useState<number>(1); // State to hold the speed value
    const [handFocus, setHandFocus] = useState<boolean>(false); // State to manage hand focus mode
    const [showSkeleton, setShowSkeleton] = useState<boolean>(false); // State to manage skeleton visibility
    const [currentAnimationName, setCurrentAnimationName] = useState<string>(""); // State to hold the current animation name
    const [currentSignFrame, setCurrentSignFrame] = useState<string>("Sign / Frame : 0 / 90"); // State to hold the current animation name
    const [isPaused, setPaused] = useState<boolean>(false); // State to manage pause/play
    const [currentStatus, setCurrentStatus] = useState<string>(""); // State to hold the current animation name
    // SLR states
    const [SLRResponse, setSLRResponse] = useState<string>("");
    const [detectionTime, setDetectionTime] = useState<Date | null>(null);

    //////////////////////////////////////////
    // General functions

    const handleButtonValue = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const target = event.target as HTMLButtonElement;
        const value = target.value;
        setActiveButton(value);
        localStorage.setItem("activeButton", value); // Save the activeButton value to localStorage

        // Clear SLR state when switching tabs
        if (value === "SLP") {
            setSLRResponse("");
            setDetectionTime(null);
            handleSLRReset();

            // Stop any active camera streams
            if (streamRef.current) {
                const tracks = streamRef.current.getTracks();
                tracks.forEach(track => track.stop());
                streamRef.current = null;
            }

            // Reset video-related states
            setVideoSource(null);
            setIsRecording(false);
        } else if (value === "SLR") {
            // Initialize model when switching to SLR tab
            initializePoseFormerModel();
        }
    };

    const sliderStyle: React.CSSProperties = {
        "--slider-value": speed,
    } as React.CSSProperties;

    const isButtonActive = (buttonValue: string): boolean => {
        return activeButton === buttonValue;
    };

    //////////////////////////////////////////
    // SLP functions

    const updateCurrentAnimationName = (animationName: string): void => {
        setCurrentAnimationName(animationName);
    };

    const updateCurrentSignFrame = (signFrame: string): void => {
        setCurrentSignFrame(signFrame);
    };

    const updateStatus = (status: string): void => {
        setCurrentStatus(status);
    };

    const handleSpeedChange = (event: Event, newValue: number | number[]): void => {
        const newSpeed = newValue as number;
        setSpeed(newSpeed);
    };

    const togglePause = (): void => {
        setPaused((prevState) => !prevState);
    };

    function HandFocusMode(): null {
        const { camera } = useThree();
        const x = -35; // Adjust these values according to your requirements
        const y = 150;
        const z = 100;
        const decimal = 1; // Adjust this value to control the speed of lerping

        useFrame(() => {
            camera.position.lerp({ x, y, z } as any, decimal);
            camera.lookAt(x, y, z);
        });

        return null;
    }

    const controls = useRef<any>();

    //////////////////////////////////////////
    // Enhanced SLR functions

    // Handle file selection for SLR
    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Check if file is a video
        if (!file.type.startsWith('video/')) {
            setModelFeedback('Please select a video file');
            return;
        }

        // Stop any active camera stream
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
        }

        // Reset recording state
        setIsRecording(false);

        setVideoSource(URL.createObjectURL(file));
        setModelFeedback(`File selected: ${file.name}`);
    };

    // Start webcam recording
    const startRecording = async (): Promise<void> => {
        try {
            // Reset existing recording data
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }

            // Stop any existing stream first
            if (streamRef.current) {
                const tracks = streamRef.current.getTracks();
                tracks.forEach(track => track.stop());
            }

            // Clear any existing video source
            setVideoSource(null);
            setSLRResponse("");
            setDetectionTime(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: false
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event: BlobEvent): void => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = (): void => {
                const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
                chunksRef.current = [];
                setVideoSource(URL.createObjectURL(blob));
                processVideo(blob);
            };

            chunksRef.current = [];
            mediaRecorder.start();
            setIsRecording(true);
            setModelFeedback('Recording started... Make sign gestures clearly');

        } catch (error) {
            console.error('Error accessing camera:', error);
            setModelFeedback(`Error accessing camera: ${error instanceof Error ? error.message : String(error)}`);
            setIsRecording(false);
        }
    };

    // Stop webcam recording
    const stopRecording = (): void => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setModelFeedback('Recording stopped. Processing video...');
        }
    };

    // In Communication.tsx - update or add these functions

    // Initialize PoseFormer model
    const initializePoseFormerModel = async (): Promise<void> => {
        try {
            setModelStatus("initializing");
            setModelFeedback("Initializing PoseFormer model...");

            const response = await api.post('/api/slr/initialize-model', {
                modelPath: "models/best.pt",
                confidenceThreshold: 0.7
            });

            if (response.data.success) {
                setModelStatus("ready");
                setModelFeedback("Model initialized successfully");
            } else {
                setModelStatus("error");
                setModelFeedback(`Error initializing model: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Error initializing model:', error);
            setModelStatus("error");
            setModelFeedback(`Error initializing model: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // Process video with PoseFormer model
    const processVideo = async (videoBlob: Blob): Promise<void> => {
        if (modelStatus !== "ready") {
            setModelFeedback('Model is not ready. Please wait or reload the page.');
            return;
        }

        try {
            setProcessingVideo(true);
            setModelFeedback('Processing video with PoseFormer model...');

            // Create form data to send video
            const formData = new FormData();
            formData.append('video', videoBlob);

            const modelConfig: ModelConfig = {
                path: "models/best.pt",
                confidenceThreshold: 0.5
            };

            formData.append('modelConfig', JSON.stringify(modelConfig));

            // Send to backend API for processing
            const response = await api.post('/api/slr/process-video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSLRResponse(response.data.text);
                setDetectionTime(new Date());

                // Log the detected sign
                const logData: LogData = {
                    text: response.data.text,
                    module: "SLR",
                    user_id: user?.user_id ? String(user.user_id) : "",
                };
                if (currentUser) createLogsByUser(logData, currentUser);

                setModelFeedback('Processing complete');
            } else {
                setModelFeedback(`Error processing video: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Error processing video:', error);
            setModelFeedback(`Error processing video: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setProcessingVideo(false);
        }
    };
    // Reset video state
    const handleVideoReset = (): void => {
        setVideoSource(null);
        setSLRResponse("");
        setDetectionTime(null);
        setModelFeedback("");

        // Stop any active camera stream
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
        }

        // Reset recording state
        setIsRecording(false);

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const handleSLRResponse = (data: string): void => {
        setSLRResponse(data);
        setDetectionTime(new Date());

        const logData: LogData = {
            text: data,
            module: "SLR",
            user_id: user?.user_id ? String(user.user_id) : "",
        };
        if (currentUser) createLogsByUser(logData, currentUser);
    };

    // Add reset handler
    const handleSLRReset = (): void => {
        setSLRResponse("");
        setDetectionTime(null);
    };

    const [showSettingsPopup, setShowSettingsPopup] = useState<boolean>(false);

    const toggleSettingsPopup = (): void => {
        setShowSettingsPopup(!showSettingsPopup);
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Render status indicator based on model status
    const renderStatusIndicator = (): JSX.Element => {
        const statusClasses = {
            initializing: styles["status-initializing"],
            ready: styles["status-ready"],
            error: styles["status-error"]
        };

        const statusMessages = {
            initializing: 'Initializing...',
            ready: 'Model Ready',
            error: 'Model Error'
        };

        return (
            <div className={styles["status-indicator"] + " " + statusClasses[modelStatus]}>
                {modelStatus === 'initializing' && (
                    <div className={styles["loading-spinner"]}></div>
                )}
                <span>{statusMessages[modelStatus]}</span>
            </div>
        );
    };

    // Add this function inside your Communication component, alongside your other functions
    const testSlrEndpoint = async (): Promise<void> => {
        try {
            console.log("Testing SLR endpoint...");

            const response = await fetch('/api/slr/initialize-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    modelPath: 'best.pt',
                    confidenceThreshold: 0.7
                }),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('SLR initialize response:', data);

            // Show success in the UI
            setModelFeedback('SLR endpoint test successful!');

        } catch (error) {
            console.error('SLR test error:', error);
            setModelFeedback(`SLR test error: ${error instanceof Error ? error.message : String(error)}`);
        }
  };

    return (
        <div className={styles["communication-body"]}>
            <div className={styles["container-wrapper"]}>
                <div className={styles["communication-menu"]}>
                    <button value="SLP" onClick={handleButtonValue} className={isButtonActive("SLP") ? styles["active"] : ""}>
                        {t("slp")}
                    </button>
                    <button value="SLR" onClick={handleButtonValue} className={isButtonActive("SLR") ? styles["active"] : ""}>
                        {t("slr")}
                    </button>
                    <div className={`${styles.animation} ${isButtonActive("SLR") ? styles["start-about"] : styles["start-home"]}`}></div>
                </div>

                {activeButton === "SLR" && (
                    <>
                        <div className={styles["slr-container"]}>
                            <div className={styles["slr-content-wrapper"]}>
                                <div className={styles["slr-header"]}>
                                    <h3>{t("video_input")}</h3>
                                    {renderStatusIndicator()}
                                </div>

                                {/* Video preview area */}
                                <div className={styles["video-container"]}>
                                    {videoSource ? (
                                        <video
                                            ref={videoRef}
                                            src={videoSource}
                                            controls
                                            className={styles["video-preview"]}
                                        />
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            className={styles["video-preview"]}
                                            autoPlay
                                            muted
                                            playsInline
                                        />
                                    )}
                                </div>

                                {/* Model info */}
                                <div className={styles["model-info"]}>
                                    <div className={styles["model-details"]}>
                                        <span className={styles["model-name"]}>Model: PoseFormer Recognition (best.pt)</span>
                                    </div>

                                    {modelFeedback && (
                                        <div className={styles["feedback-message"]}>
                                            {processingVideo ? (
                                                <>
                                                    <div className={styles["processing-spinner"]}></div>
                                                    <span>{modelFeedback}</span>
                                                </>
                                            ) : (
                                                <span>{modelFeedback}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className={styles["action-buttons"]}>
                                    <div className={styles["file-input-wrapper"]}>
                                        <button
                                            className={styles["action-button"] + " " + styles["file-button"]}
                                            disabled={isRecording || processingVideo}
                                            type="button"
                                        >
                                            <i className="fa fa-file"></i>
                                            <span>{t("select_file")}</span>
                                        </button>
                                        {/* <label htmlFor="videoUpload">Upload video</label> */}
                                        <input
                                            id="videoUpload"
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileSelect}
                                            className={styles["file-input"]}
                                            disabled={isRecording || processingVideo}
                                        />

                                        <button
                                            className={styles["action-button"] + " " + (isRecording ? styles["stop-button"] : styles["record-button"])}
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={processingVideo}
                                            type="button"
                                        >
                                            <i className={`fa ${isRecording ? "fa-stop" : "fa-video-camera"}`}></i>
                                            <span>{isRecording ? t("stop_recording") : t("record")}</span>
                                        </button>
                                    </div>

                                    
                                    <div className={styles["file-input-wrapper"]}>
                                        <button
                                            className={styles["action-button"] + " " + styles["process-button"]}
                                            onClick={() => {
                                                if (videoSource) {
                                                    fetch(videoSource)
                                                        .then(response => response.blob())
                                                        .then(blob => processVideo(blob));
                                                }
                                            }}
                                            disabled={processingVideo || !videoSource || modelStatus !== "ready"}
                                            type="button"
                                        >
                                            <i className="fa fa-cogs"></i>
                                            <span>{processingVideo ? t("processing") : t("process")}</span>
                                        </button>
                                        
                                        <button
                                            className={styles["action-button"] + " " + styles["reset-button"]}
                                            onClick={handleVideoReset}
                                            disabled={processingVideo || (!videoSource && !streamRef.current)}
                                            type="button"
                                        >
                                            <i className="fa fa-refresh"></i>
                                            <span>{t("reset")}</span>
                                        </button>

                                    </div>

                                </div>
                            </div>

                            <div className={styles["slr-content-wrapper"]}>
                                <h3>{t("detected_sign")}</h3>
                                <div className={styles["detected-output"]}>
                                    {SLRResponse ? (
                                        <div className={styles["detected-text"]}>
                                            <div className={styles["detection-result"]}>{SLRResponse}</div>
                                            {detectionTime && (
                                                <div className={styles["detection-time"]}>
                                                    {detectionTime.toLocaleTimeString()}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={styles["no-detection"]}>
                                            {t("waiting_for_sign")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {user && currentUser ? (
                            <div className={styles["history-section"]}>
                                <Communicationlog userId={user.user_id ? String(user.user_id) : ""} moduleType={"SLR"} />
                            </div>
                        ) : null}
                    </>
                )}
            </div>
            {activeButton === "SLP" && (
                <>
                    {user && currentUser ? (
                        <div className={styles["history-section"]}>
                            <Communicationlog userId={user.user_id ? String(user.user_id) : ""} moduleType={"SLP"} />
                        </div>
                    ) : null}
            
                    {/* <div className={styles["contentContainer"]}>
                        <div className={styles["contentWrapper"]}> */}
                            {/* <div className={styles["canvasBgWrapper"]}> */}
                            <CommunicationSLP />
                            {/* </div> */}
                        {/* </div>
                    </div> */}
                </>
            )}
        </div>
    );
}

export default Communication;