import React, { useState, useEffect } from "react";
import "./CollapsibleForm.css";
import { Button } from "../../../../components/Button/Button";
import { Descriptions } from "antd";
import {
  getDemoVidById,
  getAvatarVidById,
} from "../../../../services/dataset.service";
import { saveAs } from "file-saver";

import { toast } from "react-hot-toast";
import { CreateNotification } from "../../../../services/notification.service";
import VideoUpload from "../VideoUpload/VideoUpload";
import DownloadButton from "../../../../components/DownloadButton/DownloadButton";
import moment from "moment";
import { useTranslation } from "react-i18next";
import ButtonProcessing from "../../../../components/ButtonProcessing/ButtonProcessing";

import { useUserStore } from "@root/store/userStore";
import { getAuth } from "firebase/auth";

interface CollapsibleFormProps {
  number: string;
  form_id: number;
  dateTime: string;
  status_en: string;
  status_bm: string;
  name: string;
  email: string;
  text: string;
  video_link: string;
  avatar_link?: string;
  user?: string;
  user_id?: number;
  video_name: string;
  avatar_name: string;
  handleSubmit: Function;
  handleDelete: Function;
}

const CollapsibleForm: React.FC<CollapsibleFormProps> = ({
  number,
  form_id,
  dateTime,
  status_en,
  status_bm,
  name,
  email,
  text,
  video_link,
  avatar_link,
  user,
  user_id,
  video_name,
  avatar_name,
  handleSubmit,
  handleDelete,
}) => {
  const { t, i18n } = useTranslation();
  const currentSelectedLanguage = localStorage.getItem("i18nextLng") || "en";
  const { user: userStore } = useUserStore();
  const currentUser = getAuth().currentUser;

  const downloadVideo = async (type?: string) => {
    try {
      let video;
      if (type === "demo" && currentUser) {
        video = await getDemoVidById(form_id, currentUser); // Assuming getDemoVidById returns a Promise
        const blob = new Blob([video.data], { type: "video/mp4" }); // Assuming video.data contains blob data and video.contentType contains the content type

        saveAs(blob, video_name);
      } else if (type === "avatar" && currentUser) {
        video = await getAvatarVidById(form_id, currentUser); // Assuming getDemoVidById returns a Promise
        const blob = new Blob([video.data], { type: "video/mp4" }); // Assuming video.data contains blob data and video.contentType contains the content type

        saveAs(blob, avatar_name);
      }
    } catch (error) {
      console.error("Error downloading video:", error);
      // Handle download errors gracefully (e.g., display error message)
    }
  };

  const [isOpen, setIsOpen] = useState<boolean>(false);

  //Video Control
  const [videoInfo, setVideoInfo] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>("");

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const closeForm = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const personal_details = [
    {
      key: "1",
      label: t("dc_name"),
      children: <span className="personal-details-info">{name}</span>,
    },
    {
      key: "2",
      label: t("dc_email"),
      children: <span className="personal-details-info">{email}</span>,
    },
  ];

  const video_details_with_video_upload = [
    {
      key: "1",
      label: t("dc_demo_video"),
      children: (
        <span className="video-details-info">
          <DownloadButton downloadVideo={downloadVideo} type="demo" />
        </span>
      ),
    },
    {
      key: "2",
      label: t("dc_avatar_video"),
      children: (
        <span className="video-details-info">
          <VideoUpload videoInfo={videoInfo} setVideoInfo={setVideoInfo} />
        </span>
      ),
    },
  ];

  const video_details_with_information = [
    {
      key: "1",
      label: t("dc_demo_video"),
      children: (
        <span className="video-details-info">
          <DownloadButton downloadVideo={downloadVideo} type="demo" />
        </span>
      ),
    },
    {
      key: "2",
      label: t("dc_avatar_video"),
      children:
        avatar_link !== "" ? (
          <span className="video-details-info">
            <DownloadButton downloadVideo={downloadVideo} type="avatar" />
          </span>
        ) : (
          <span className="video-details-info">{t("no_video_submitted")}</span>
        ),
    },
  ];

  // For notification
  const [isLoading, setIsLoading] = useState(false);

  // for public (accept/reject)
  const handleSEAcceptPublicButtonClick = async () => {
    try {
      const notificationData = {
        receiver_id: user_id,
        sender_id: 2,
        message_en: "has accepted your text.",
        message_bm: "telah menerima teks anda.",
        sign_text: text,
        status: 0,
        type: "Text Verification",
        type_value: "accepted",
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
    try {
      const notificationData = {
        receiver_id: 1,
        sender_id: 2,
        message_en: "has assigned new text.",
        message_bm: "telah menetapkan teks baru.",
        sign_text: text,
        status: 0,
        type: "New Task",
        type_value: "newtask",
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

  const handleSERejectPublicButtonClick = async () => {
    try {
      const notificationData = {
        receiver_id: user_id,
        sender_id: 2,
        message_en: "has rejected your text.",
        message_bm: "telah menolak teks anda.",
        sign_text: text,
        status: 0,
        type: "Text Verification",
        type_value: "rejected",
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

  // for admin (accept/reject)
  const handleSEAcceptAdminButtonClick = async () => {
    try {
      const notificationData = {
        receiver_id: 1,
        sender_id: 2,
        message_en: "has accepted your avatar.",
        message_bm: "telah menerima avatar anda.",
        sign_text: text,
        status: 0,
        type: "Task Confirmation",
        type_value: "accepted",
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

  const handleSERejectAdminButtonClick = async () => {
    try {
      const notificationData = {
        receiver_id: 1,
        sender_id: 2,
        message_en: "has rejected your avatar.",
        message_bm: "telah menolak avatar anda.",
        sign_text: text,
        status: 0,
        type: "Task Confirmation",
        type_value: "rejected",
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
  // For admin upload
  const handleAdminButtonClick = async () => {
    try {
      const notificationData = {
        receiver_id: 2,
        sender_id: parseInt(userStore?.user_id?.toString() || "0"),
        message_en: "has uploaded the avatar.",
        message_bm: "telah memuat naik avatar.",
        sign_text: text,
        status: 0,
        type: "Waiting for Verification",
        type_value: "waitingforverification",
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
    <div className="collapsible-container ">
      <div
        className={`collapsible-content ${isOpen ? "opened" : "not-opened"}`}
        onClick={closeForm}
        data-testid={`collapsible-content_${form_id}`}
      >
        <div
          className={`collapsible-content-header ${user}`}
          onClick={toggleOpen}
        >
          <h2 className="number">No: {number}</h2>
          <h2 className="status">
            Status: {currentSelectedLanguage === "en" ? status_en : status_bm}
          </h2>
          <h2 className="dateTime">
            {t("dc_date")}: {moment(dateTime).format("YYYY-MM-DD HH:mm:ss")}
          </h2>
          <div className="expand-icon">
            {isOpen ? <span>&#9650;</span> : <span>&#9660;</span>}
          </div>
        </div>
        {isOpen && (
          <div className="collapsible-content-background">
            <div className="collapsible-content-details">
              <div className={`personal-details ${user}`}>
                <h2>{t("dc_personal_details")}</h2>
                <Descriptions items={personal_details} bordered column={1} />
              </div>
              <div className="sentence-details">
                <h2>{t("dc_text_sentence")}</h2>
                <div className="sentence-details-content">
                  <p>{text}</p>
                </div>
              </div>
            </div>
            <div className="collapsible-content-footer">
              <div className={`content-left ${user}`}>
                <h2>{t("dc_video_details")}</h2>
                {user === "admin" && (
                  <>
                    {status_en === "Rejected" && status_bm === "Ditolak" ? (
                      <Descriptions
                        items={video_details_with_video_upload}
                        bordered
                        column={1}
                      />
                    ) : status_en === "In Progress" &&
                      status_bm === "Dalam Proses" ? (
                      <Descriptions
                        items={video_details_with_video_upload}
                        bordered
                        column={1}
                      />
                    ) : (
                      <Descriptions
                        items={video_details_with_information}
                        bordered
                        column={1}
                      />
                    )}
                  </>
                )}

                {user === "signexpert" && (
                  <Descriptions
                    items={video_details_with_information}
                    bordered
                    column={1}
                  />
                )}
              </div>

              <div className="buttons-right">
                {user === "signexpert" && (
                  <>
                    {status_en === "New" && status_bm === "Baru" && (
                      <div className="dataset-button-container">
                        <div className="dataset-button-individual">
                          <Button
                            type="button"
                            onClick={() => {
                              const updateData = {
                                status_SE_en: "Awaiting Accept",
                                status_SE_bm: "Menunggu Penerimaan",
                                status_Admin_en: "New",
                                status_Admin_bm: "Baru",
                              };
                              const updatedMessage = "New_Request_Accepted";

                              handleSubmit(
                                form_id,
                                updateData,
                                false,
                                updatedMessage
                              );
                              handleSEAcceptPublicButtonClick();
                            }}
                            buttonStyle="btn--accept" // Style for accept button
                            buttonSize="btn--large"
                          >
                            {t("dc_accept")}
                          </Button>
                        </div>
                        <div className="dataset-button-individual">
                          <Button
                            type="button"
                            onClick={() => {
                              const updatedMessage = "Request_Cancelled";
                              handleDelete(form_id, updatedMessage);
                              handleSERejectPublicButtonClick();
                            }}
                            buttonStyle="btn--cancel" // Style for cancel button
                            buttonSize="btn--large"
                          >
                            {t("dc_cancel")}
                          </Button>
                        </div>
                      </div>
                    )}
                    {status_en === "Awaiting Verification" &&
                      status_bm === "Menunggu Pengesahan" && (
                        <div className="dataset-button-container">
                          <div className="dataset-button-individual">
                            <Button
                              type="button"
                              onClick={() => {
                                const updateData = {
                                  status_SE_en: "Verified",
                                  status_SE_bm: "Disahkan",
                                  status_Admin_en: "Verified",
                                  status_Admin_bm: "Disahkan",
                                };
                                const updatedMessage = "Request_Verified";
                                handleSubmit(
                                  form_id,
                                  updateData,
                                  false,
                                  updatedMessage
                                );
                                handleSEAcceptAdminButtonClick();
                              }}
                              buttonStyle="btn--send"
                              buttonSize="btn--large"
                            >
                              {t("dc_verify")}
                            </Button>
                          </div>
                          <div className="dataset-button-individual">
                            <Button
                              type="button"
                              onClick={() => {
                                const updateData = {
                                  status_SE_en: "Rejected",
                                  status_SE_bm: "Ditolak",
                                  status_Admin_en: "Rejected",
                                  status_Admin_bm: "Ditolak",
                                };
                                const updatedMessage = "Request_Rejected";
                                handleSubmit(
                                  form_id,
                                  updateData,
                                  false,
                                  updatedMessage
                                );
                                handleSERejectAdminButtonClick();
                              }}
                              buttonStyle="btn--cancel"
                              buttonSize="btn--large"
                            >
                              {t("dc_reject")}
                            </Button>
                          </div>
                        </div>
                      )}
                  </>
                )}
                {user === "admin" && (
                  <>
                    {status_en === "New" && status_bm === "Baru" && (
                      <Button
                        type="button"
                        onClick={() => {
                          const updateData = {
                            status_SE_en: "In Progress",
                            status_SE_bm: "Dalam Proses",
                            status_Admin_en: "In Progress",
                            status_Admin_bm: "Dalam Proses",
                          };
                          const updatedMessage = "Request_Accepted_by_Admin";
                          handleSubmit(
                            form_id,
                            updateData,
                            false,
                            updatedMessage
                          );
                        }}
                        buttonStyle="btn--accept" // Style for accept button
                        buttonSize="btn--large"
                      >
                        {t("dc_accept")}
                      </Button>
                    )}
                    {status_en === "In Progress" &&
                      status_bm === "Dalam Proses" && (
                        <ButtonProcessing
                          onClick={async () => {
                            if (videoInfo) {
                              setIsLoading(true);

                              const updateData = {
                                status_SE_en: "Awaiting Verification",
                                status_SE_bm: "Menunggu Pengesahan",
                                status_Admin_en: "Awaiting Verification",
                                status_Admin_bm: "Menunggu Pengesahan",
                              };
                              const updatedMessage = "Request_Updated_by_Admin";
                              try {
                                const response = await handleSubmit(
                                  form_id,
                                  updateData,
                                  videoInfo,
                                  updatedMessage
                                );

                                if (response) {
                                  handleAdminButtonClick();
                                }
                              } catch (error) {
                                console.error(
                                  "Error during handleSubmit:",
                                  error
                                );
                              } finally {
                                setIsLoading(false);
                              }
                            } else {
                              toast.error(t("mustUploadAvatar"));
                            }
                          }}
                          buttonStyle="btn--accept"
                          buttonSize="btn--large"
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                        >
                          {t("dc_submit")}
                        </ButtonProcessing>
                      )}
                    {status_en === "Rejected" && status_bm === "Ditolak" && (
                      <ButtonProcessing
                        onClick={async () => {
                          if (videoInfo) {
                            setIsLoading(true);
                            const updateData = {
                              status_SE_en: "Awaiting Verification",
                              status_SE_bm: "Menunggu Pengesahan",
                              status_Admin_en: "Awaiting Verification",
                              status_Admin_bm: "Menunggu Pengesahan",
                            };
                            const updatedMessage = "Request_Updated_by_Admin";
                            try {
                              const response = await handleSubmit(
                                form_id,
                                updateData,
                                videoInfo,
                                updatedMessage
                              );

                              if (response) {
                                handleAdminButtonClick();
                              }
                            } catch (error) {
                              console.error(
                                "Error during handleSubmit:",
                                error
                              );
                            } finally {
                              setIsLoading(false);
                            }
                          } else {
                            toast.error(t("mustUploadAvatar"));
                          }
                        }}
                        buttonStyle="btn--accept"
                        buttonSize="btn--large"
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                      >
                        {t("dc_submit")}
                      </ButtonProcessing>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleForm;
