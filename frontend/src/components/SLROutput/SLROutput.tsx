import "./SLROutput.css";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const SLROutput = ({ responseData }: { responseData: string | null }) => {
    const { t } = useTranslation();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [responseData]);

    useEffect(() => {
        if (responseData && "speechSynthesis" in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            try {
                // Force voices to load if they haven't already
                if (!voices.length) {
                    setVoices(window.speechSynthesis.getVoices());
                }

                const utterance = new SpeechSynthesisUtterance(responseData);
                utterance.lang = "id-ID";

                // Find Indonesian voice or fall back to default
                const selectedVoice = voices.find(voice => voice.lang === "id-ID");
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                utterance.onstart = () => {
                    setIsSpeaking(true);
                    toast(t("speaking"), {
                        icon: "🔊",
                        style: {
                            borderRadius: "10px",
                            background: "#333",
                            color: "#fff",
                        },
                    });
                };

                utterance.onend = () => {
                    setIsSpeaking(false);
                    toast(t("finished_speaking"), {
                        icon: "✅",
                        style: {
                            borderRadius: "10px",
                            background: "#333",
                            color: "#fff",
                        },
                    });
                };

                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error("Speech synthesis error:", error);
                toast.error(t("speech_error"));
                setIsSpeaking(false);
            }
        }
    }, [responseData]);

    const renderSpeakButton = () => {
        if ("speechSynthesis" in window) {
            return (
                <button
                    className="avatar-speak-btn"
                    onClick={async () => {
                        if (!isSpeaking && responseData) {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(responseData);
                            utterance.lang = "id-ID";

                            // Find Indonesian voice or fall back to default
                            const selectedVoice = voices.find(voice => voice.lang === "id-ID");
                            if (selectedVoice) {
                                utterance.voice = selectedVoice;
                            }

                            utterance.onstart = () => {
                                setIsSpeaking(true);
                                toast(t("speaking"), {
                                    icon: "🔊",
                                    style: {
                                        borderRadius: "10px",
                                        background: "#333",
                                        color: "#fff",
                                    },
                                });
                            };

                            utterance.onend = () => {
                                setIsSpeaking(false);
                                toast(t("finished_speaking"), {
                                    icon: "✅",
                                    style: {
                                        borderRadius: "10px",
                                        background: "#333",
                                        color: "#fff",
                                    },
                                });
                            };

                            window.speechSynthesis.speak(utterance);
                        } else if (isSpeaking) {
                            // Stop speaking if already speaking
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                            toast(t("stopped_speaking"), {
                                icon: "🛑",
                                style: {
                                    borderRadius: "10px",
                                    background: "#333",
                                    color: "#fff",
                                },
                            });
                        }
                    }}>
                    <i className={`fa ${isSpeaking ? "fa-stop faStopBtn2" : "fa-volume-up"}`}></i>
                </button>
            );
        } else {
            return (
                <button className="avatar-speak-btn disabled" disabled={true}>
                    <i className="fa fa-volume-up"></i>
                    <span className="tooltip2">{t("speech_not_supported")}</span>
                </button>
            );
        }
    };

    return (
        <div className="slr-output-container">
            <h1>{t("slr_model_output")}</h1>
            {responseData ? (
                <div className="output-content">
                    <div className="output-with-speak">
                        <p>
                            {t("received_output")}: {responseData}
                        </p>
                        {renderSpeakButton()}
                    </div>
                </div>
            ) : (
                <div className="output-content">
                    <p>{t("no_output_available")}</p>
                </div>
            )}
        </div>
    );
};

export default SLROutput;
