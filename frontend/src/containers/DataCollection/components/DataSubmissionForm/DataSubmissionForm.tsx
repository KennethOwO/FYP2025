import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import InputField from "../../../../components/InputField/InputField";
import { Button } from "../../../../components/Button/Button";
import VideoInput from "../../../../components/VideoInput/VideoInput";
import EmailIcon from "../EmailIcon/EmailIcon";
import PhoneIcon from "../PhoneIcon/PhoneIcon";
import InfoIcon from "../InfoIcon/InfoIcon";
import LocationIcon from "../LocationIcon/LocationIcon";
import { submitForm } from "../../../../services/dataset.service";
import "./DataSubmissionForm.css";
import { CreateNotification } from "../../../../services/notification.service";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import PopupConfirmation from "../PopupConfirmation/PopupConfirmation";
import InstructionPopup from "../InstructionPopup/InstructionPopup";
// @ts-ignore
import { auth } from "../../../../../firebase";
import { User, getAuth } from "firebase/auth";
import { GetUserByEmail } from "@root/services/account.service";
import { Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface DataSubmissionFormProps {
    user: string;
    isSubmitModalOpen: boolean;
    showPopup: boolean;
    setShowPopup: any;
    showInstructionPopup: boolean;
    setShowInstructionPopup: any;
    onOpenModal: () => void;
}

const DataSubmissionForm: React.FC<DataSubmissionFormProps> = ({ user, isSubmitModalOpen, showPopup, setShowPopup, showInstructionPopup, setShowInstructionPopup, onOpenModal }) => {
    const { t, i18n } = useTranslation();
    const [isListening, setIsListening] = useState(false);

    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({});

    const renderMicrophoneButton = () => {
        if (browserSupportsSpeechRecognition) {
            return (
                <button
                    className="avatar-microphone-btn"
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
                        }
                    }}
                >
                    <i className={`fa ${isListening ? "fa-stop faStopBtn" : "fa-microphone faMicrophone"}`}></i>
                </button>
            );
        } else {
            return (
                <button className="avatar-microphone-btn disabled" disabled={true}>
                    <i className="fa fa-microphone faMicrophone"></i>
                    <span className="tooltip2">{t("voice_input_not_supported")}</span>
                </button>
            );
        }
    };

    const [customTranScript, setCustomTranscript] = useState("");

    useEffect(() => {
        setText(transcript);
    }, [transcript]);

    //Video Control
    const [videoInfo, setVideoInfo] = useState(null);
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

    const handleVideoReset = () => {
        setVideoInfo(null);
        setUploadedVideo(null);
    };

    const handleReset = () => {
        setName("");
        setEmail("");
        setText("");
        setNameError("");
        setEmailError("");
        setTextError("");
        handleVideoReset();
    };

    //Validation Control
    const validateName = (value: string) => {
        if (!value.trim()) {
            setNameError(t("dcNameRequired"));
            return "Name is required";
        }
        setNameError("");
        return undefined;
    };

    const validateEmail = (value: string) => {
        if (!value.trim()) {
            setEmailError(t("dcEmailRequired"));
            return "Email is required";
        }
        // Email format validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError(t("dcEmailInvalid"));
            return "Invalid email format";
        }
        setEmailError("");
        return undefined;
    };

    const validateText = (value: string) => {
        if (!value.trim()) {
            setTextError(t("dcTextSentenceRequired"));
            return "Text/Sentence is required";
        }
        setTextError("");
        return undefined;
    };

    //Form Element Setup
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(e.target.value);
        validateEmail(e.target.value);
    };

    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setName(e.target.value);
        validateName(e.target.value);
    };

    const [text, setText] = useState("");
    const [textError, setTextError] = useState("");
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setText(e.target.value);
        validateText(e.target.value);
    };

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState("");

    const currentUser = getAuth().currentUser;

    useEffect(() => {
        const checkUserAuth = async () => {
            auth.onAuthStateChanged(async (user: User | null) => {
                if (user && user.emailVerified) {
                    setIsLoggedIn(true);
                    if (user.email) {
                        try {
                            const userResponse = await GetUserByEmail(user.email, user);
                            if (userResponse) {
                                setUserId(userResponse.data.user_id);
                            }
                        } catch (error: any) {
                            console.error("Error fetching user data:", error);
                        }
                    }
                }
            });
        };

        checkUserAuth();
    }, []);

    const handleShowPopup = () => {
        if (!isLoggedIn) {
            toast.error(t("mustLoginToFillForm"));
            return;
        }
        if (videoInfo == null) {
            toast.error(t("mustUploadVideo"));
            return;
        }
        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isTextValid = validateText(text);

        if (isNameValid != undefined || isEmailValid != undefined || isTextValid != undefined) {
            toast.error(t("fillFormCorrect"));
            return;
        }
        if (isNameValid == undefined && isEmailValid == undefined && isTextValid == undefined && name.length !== 0 && email.length !== 0 && text.length !== 0 && videoInfo != null) {
            setShowPopup(true);
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleShowInstructionPopup = () => {
        setShowInstructionPopup(true);
    };

    const handleCloseInstructionPopup = () => {
        setShowInstructionPopup(false);
    };

    const [isLoading, setIsLoading] = useState(false);
    //Submit Control
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
        setIsLoading(true);
        const formData = new FormData();
        let status_SE_en = "";
        let status_SE_bm = "";
        let status_Admin_en = "";
        let status_Admin_bm = "";
        if (user === "signexpert" && userId) {
            status_SE_en = "Awaiting Accept";
            status_SE_bm = "Menunggu Pengesahan";
            status_Admin_en = "New";
            status_Admin_bm = "Baru";
            formData.append("user_id", userId);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("text_sentence", text);
            formData.append("status_SE_en", status_SE_en);
            formData.append("status_SE_bm", status_SE_bm);
            formData.append("status_Admin_en", status_Admin_en);
            formData.append("status_Admin_bm", status_Admin_bm);
            formData.append("updatedMessage", "New_Request_Accepted_2");
            if (videoInfo && currentUser) {
                let response;
                formData.append("video", videoInfo);
                try {
                    response = await submitForm(formData, currentUser);
                } catch (error: any) {
                    console.error("Error");
                }
                if (response) {
                    setIsLoading(false);
                    handleReset();
                    handleClosePopup();
                    await onOpenModal();
                }
            }
        } else if (user === "public" && userId) {
            let response;
            status_SE_en = "New";
            status_SE_bm = "Baru";
            status_Admin_en = "-";
            status_Admin_bm = "-";
            formData.append("user_id", userId);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("text_sentence", text);
            formData.append("status_SE_en", status_SE_en);
            formData.append("status_SE_bm", status_SE_bm);
            formData.append("status_Admin_en", status_Admin_en);
            formData.append("status_Admin_bm", status_Admin_bm);
            formData.append("updatedMessage", "Submitted_by_Public");
            if (videoInfo && currentUser) {
                formData.append("video", videoInfo);
                try {
                    response = await submitForm(formData, currentUser);
                } catch (error: any) {
                    console.error("Error");
                }
                if (response) {
                    setIsLoading(false);
                    handleReset();
                    handleClosePopup();
                    await onOpenModal();
                }
            }
        }

        // Send notification
        try {
            const notificationData = {
                receiver_id: 2,
                sender_id: userId ? parseInt(userId) : 0,
                message_en: "has submitted new text.",
                message_bm: "telah menghantar teks baru.",
                sign_text: text,
                status: 0,
                type: "New Text",
                type_value: "newtext",
                created_at: new Date().toISOString(),
            };
            if (currentUser) {
                await CreateNotification(notificationData, currentUser);
                toast.success(t("notifSuccess"));
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error(t("notifFailed"));
        }
    };

    return (
        <>
            <PopupConfirmation name={name} email={email} text={text} video={uploadedVideo} isOpen={showPopup} onSubmit={handleSubmit} onClose={handleClosePopup} isLoading={isLoading} setIsLoading={setIsLoading} />
            <InstructionPopup showInstructionPopup={showInstructionPopup} onClose={handleCloseInstructionPopup} />

            <div className={`dataForm`}>
                <div className="dataForm-header-container">
                    <div className="dataForm-header">
                        <h1>{t("dataset_collection_form")}</h1>
                        <p>{t("datasetmsg")}</p>
                    </div>
                </div>
                <div className="dataForm-cover">
                    <div className={`dataForm-card ${user}`}>
                        <h1>{t("in_touch")}</h1>
                        <h3>{t("more_suggestions")}</h3>
                        <div className={"dataForm-card-content"}>
                            <div className="dataForm-card-info">
                                <LocationIcon />
                                <p> {t("neoun_address")}</p>
                            </div>
                            <div className="dataForm-card-info2">
                                <PhoneIcon />
                                <p>{t("neoun_phone")}</p>
                            </div>
                            <div className="dataForm-card-info2">
                                <EmailIcon />
                                <p>{t("neoun_email")}</p>
                            </div>
                            <div className="dataForm-card-info"></div>
                        </div>
                    </div>
                    <div className="dataForm-container">
                        <div className="dataForm-info-block">
                            <InfoIcon onClick={handleShowInstructionPopup} />
                        </div>
                        <div className="input-container">
                            <div className="">
                                <InputField label={t("name_input")} name="name" value={name} onChange={handleNameChange} error={nameError} />
                                <InputField label={t("email_input")} name="email" type="email" value={email} onChange={handleEmailChange} error={emailError} />
                                <div className="voiceToTextBox">
                                    <InputField label={t("text_sentence_input")} name="text" value={text} onChange={handleTextChange} multipleLines={true} error={textError} />
                                    {renderMicrophoneButton()}{" "}
                                </div>

                <div className="video-container">
                  <VideoInput
                    setVideoInfo={setVideoInfo}
                    uploadedVideo={uploadedVideo}
                    setUploadedVideo={setUploadedVideo}
                    onRemove={handleVideoReset}
                  />
                  {uploadedVideo && (
                    <Space>
                      <p>
                        <span className="uploaded-text">{uploadedVideo}</span>
                      </p>
                      <span
                        onClick={handleVideoReset}
                        className="close-outline-button"
                      >
                        <CloseOutlined />
                      </span>
                    </Space>
                  )}
                </div>
                <div className="button-container">
                  <Button
                    type="button"
                    onClick={handleReset}
                    buttonStyle="btn--reset"
                    buttonSize="btn--large"
                  >
                    {t("reset_btn")}
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleShowPopup}
                    buttonStyle="btn--submit"
                    buttonSize="btn--large"
                    data-testid="submit-btn"
                  >
                    {t("submit_btn")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataSubmissionForm;
