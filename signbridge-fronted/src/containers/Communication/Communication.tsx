// Communication.jsx
// General Imports
import "regenerator-runtime/runtime";
import styles from "./Communication.module.css";
import { useRef, useState, useEffect, SetStateAction } from "react";
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
// import SLROutput from "../../components/SLROutput/SLROutput";
import CommunicationSLP from "../../components/CommunicationSLP.tsx";
import ButtonRow from "../../components/ButtonRow/ButtonRow";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";
import { useUserStore } from "@root/store/userStore";
import { FaCog } from "react-icons/fa";

function Communication() {
    const currentUser = getAuth().currentUser;
    const { user } = useUserStore();
    const { t, i18n } = useTranslation();
    const [isListening, setIsListening] = useState(false);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({});
    const formRef = useRef<HTMLFormElement>(null);

    const renderMicrophoneButton = () => {
        const handleStopListening = () => {
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

            triggerSubmit(); // Call the new helper function to submit without an event
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
    const triggerSubmit = () => {
        if (formRef.current) {
            formRef.current.requestSubmit(); // Trigger form submission using the form reference
        }
    };

    const [customTranscript, setCustomTranscript] = useState("");

    useEffect(() => {
        setCustomTranscript(transcript);
    }, [transcript]);

    // Define a variable to store the previous submitted text
    let previousSubmittedText = "";
    // @ts-ignore
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true); // Start loading
        // @ts-ignore
        const formData = new FormData(formRef.current); // Use formRef for data extraction
        let submittedText = (formData.get("sigmlUrl") as string) || ""; // Prevent null value
        const getData = {
            submitted_Text: submittedText,
        };

        try {
            const response = await fetchNLPOutput(getData);
            const data = await response;

            if (previousSubmittedText === submittedText) {
                // If the current submitted text is the same as the previous one, append "#" to the returned text
                setInputText(data["return"] + "+");
            } else {
                // If they are different, update the inputText directly
                setInputText(data["return"]);
                const logData = {
                    text: data["return"],
                    module: "SLP",
                    user_id: user?.user_id || "",
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

    // States to manage the application
    // General states
    const [activeButton, setActiveButton] = useState(() => {
        // Retrieve the activeButton value from localStorage on initial Frender
        return localStorage.getItem("activeButton") || "SLP";
    });

    // SLP states
    const [inputText, setInputText] = useState(""); // State to hold the input text
    const [speed, setSpeed] = useState(1); // State to hold the speed value
    const [handFocus, setHandFocus] = useState(false); // State to manage hand focus mode
    const [showSkeleton, setShowSkeleton] = useState(false); // State to manage skeleton visibility
    const [currentAnimationName, setCurrentAnimationName] = useState(""); // State to hold the current animation name
    const [currentSignFrame, setCurrentSignFrame] = useState("Sign / Frame : 0 / 90"); // State to hold the current animation name
    const [isPaused, setPaused] = useState(false); // State to manage pause/play
    // const [leftHandedMode, setLeftHandedMode] = useState(false); // State to manage left-handed mode
    const [currentStatus, setCurrentStatus] = useState(""); // State to hold the current animation name
    // SLR states
    const [SLRResponse, setSLRResponse] = useState<string>("");

    //////////////////////////////////////////
    // General functions

    // @ts-ignore
    const handleButtonValue = (event) => {
        const { value } = event.target;
        setActiveButton(value);
        localStorage.setItem("activeButton", value); // Save the activeButton value to localStorage

        // Clear SLR state when switching tabs
        if (value === "SLP") {
            setSLRResponse("");
            handleSLRReset();
        }
    };

    const sliderStyle = {
        "--slider-value": speed,
    } as React.CSSProperties;

    // @ts-ignore
    const isButtonActive = (buttonValue) => {
        return activeButton === buttonValue;
    };

    //////////////////////////////////////////
    // SLP functions

    // @ts-ignore
    const updateCurrentAnimationName = (animationName) => {
        setCurrentAnimationName(animationName);
    };

    // @ts-ignore
    const updateCurrentSignFrame = (signFrame) => {
        setCurrentSignFrame(signFrame);
    };

    // @ts-ignore
    const updateStatus = (status) => {
        setCurrentStatus(status);
    };

    // @ts-ignore
    const handleSpeedChange = (event) => {
        const newSpeed = parseFloat(event.target.value);
        setSpeed(newSpeed);
    };

    // // Function to toggle left-handed mode
    // const toggleLeftHandedMode = () => {
    //     setLeftHandedMode((prevMode) => !prevMode);
    // };

    const togglePause = () => {
        setPaused((prevState) => !prevState);
    };

    function HandFocusMode() {
        const { camera } = useThree();
        const x = -35; // Adjust these values according to your requirements
        const y = 150;
        const z = 100;
        const decimal = 1; // Adjust this value to control the speed of lerping

        useFrame(() => {
            camera.position.lerp({ x, y, z }, decimal);
            camera.lookAt(x, y, z);
        });

        return null;
    }

    const controls = useRef();

    // @ts-ignore

    //////////////////////////////////////////
    // SLR functions
    const handleSLRResponse = (data: string) => {
        setSLRResponse(data);
        const logData = {
            text: data,
            module: "SLR",
            user_id: user?.user_id || "",
        };
        if (currentUser) createLogsByUser(logData, currentUser);
    };

    // Add reset handler
    const handleSLRReset = () => {
        setSLRResponse("");
    };

    const [showSettingsPopup, setShowSettingsPopup] = useState(false);

    const toggleSettingsPopup = () => {
        setShowSettingsPopup(!showSettingsPopup);
    };

    const [isLoading, setIsLoading] = useState(false);

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
                                <SLRInput onResponsiveReceived={handleSLRResponse} onReset={handleSLRReset} />
                            </div>
                            <div className={styles["slr-content-wrapper"]}>
                                {/* <SLROutput responseData={SLRResponse} /> */}
                            </div>
                        </div>
                        {user && currentUser ? (
                            <div>
                                <Communicationlog userId={user.user_id || ""} moduleType={"SLR"} />
                            </div>
                        ) : (
                            <a></a>
                        )}
                    </>
                )}
            </div>
            {activeButton === "SLP" && (
                <>
                    {user && currentUser ? (
                        <div>
                            <Communicationlog userId={user.user_id || ""} moduleType={"SLP"} />
                        </div>
                    ) : (
                        <a></a>
                    )}

                    <div className={styles["contentContainer"]}>
                        <div className={styles["contentWrapper"]}>
                            <div className={styles["canvasBgWrapper"]}>
                                {/* <div className={styles["circleBg"]}></div>
                                <div className={styles["rectangleOverlay"]}>
                                    <ButtonRow isPaused={isPaused} togglePause={togglePause} renderMicrophoneButton={renderMicrophoneButton} setCustomTranscript={setCustomTranscript} />
                                    <div className={styles["textInputWrapper"]}>
                                        <form ref={formRef} onSubmit={handleSubmit} className={styles["voice-form"]}>
                                            <textarea value={customTranscript} onChange={(e) => setCustomTranscript(e.target.value)} className={styles["avatar-textbox"]} id="sigmlUrl" name="sigmlUrl" placeholder={t("enter_text_here")} spellCheck="true"></textarea>
                                            <button className={styles["avatarplay-btn"]} type="submit">
                                                {t("play")}
                                            </button>
                                        </form>
                                    </div>
                                </div> */}
                                {/* <input className={styles["gloss-box"]} type="text" placeholder={t("gloss")} value={currentAnimationName} readOnly /> */}
                                <CommunicationSLP />
                            </div>

                            {/* <button className={styles.settingsButton} onClick={toggleSettingsPopup}>
                                <FaCog className={styles["settingsIcon"]} />
                            </button> */}

                            {showSettingsPopup && (
                                <>
                                    {/* <div className={styles.overlay} onClick={toggleSettingsPopup}></div>
                                    <div className={styles.settingsPopup}>
                                        <h2>
                                            {t("setting")}
                                            <button className={styles.closeButton} onClick={toggleSettingsPopup} aria-label="Close settings">
                                                ×
                                            </button>
                                        </h2>
                                        <div className={styles["speed-control-wrapper"]} style={sliderStyle}>
                                            <span className={styles["speed-span"]}>{t("speed")} : </span>
                                            <Slider className={styles["speed-slider"]} min={0.2} max={2} step={0.2} value={speed} onChange={handleSpeedChange} aria-labelledby="speed-slider" />
                                            <span className={styles["speed-value"]}>{speed}</span>
                                        </div>

                                        <FormControlLabel className={styles["custom-checkbox-label"]} control={<Checkbox checked={showSkeleton} onChange={() => setShowSkeleton((prevState) => !prevState)} color="primary" inputProps={{ "aria-label": "Show Skeleton" }} />} label={showSkeleton ? t("hide_skeleton") : t("show_skeleton")} />
                                    </div> */}
                                </>
                            )}

                            {/* <div className={`${styles["helperBox"]} ${styles["controlBox"]}`}>
                                <h2>{t("setting")}</h2>
                                <div className={styles["speed-control-wrapper"]} style={sliderStyle}>
                                    <span className={styles["speed-span"]}>{t("speed")} : </span>
                                    <Slider className={styles["speed-slider"]} min={0.2} max={2} step={0.2} value={speed} onChange={handleSpeedChange} aria-labelledby="speed-slider" />
                                    <span className={styles["speed-value"]}>{speed}</span>
                                </div> */}

                                {/* Show/Hide Skeleton */}
                                {/* <FormControlLabel className={styles["custom-checkbox-label"]} control={<Checkbox checked={showSkeleton} onChange={() => setShowSkeleton((prevState) => !prevState)} color="primary" inputProps={{ "aria-label": "Show Skeleton" }} />} label={showSkeleton ? t("hide_skeleton") : t("show_skeleton")} />
                            </div>
                            <div className={`${styles["helperBox"]} ${styles["disclaimerBox"]}`}>
                                <img className={styles["infoIcon"]} src="./images/info.png" />
                                <span className={styles["disclaimerText"]}>{t("sign_disclaimer")}</span>
                            </div> */}
                        </div> 
                    </div>
                </>
            )}
        </div>
    );
}

export default Communication;
