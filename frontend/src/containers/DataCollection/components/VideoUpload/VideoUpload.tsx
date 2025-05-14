import React, { useState, useEffect } from "react";
import { Upload, message, Space, Button } from "antd";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./VideoUpload.css";

interface VideoUploadProps {
  videoInfo: any;
  setVideoInfo: any;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  videoInfo,
  setVideoInfo,
}) => {
  const { t } = useTranslation();
  const [uploadedVideo, setUploadedVideo] = useState<string | null>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false); // State to track screen size

  // Check screen size for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 560); // Adjust the width threshold as needed
    };

    // Initial check on mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (info: any) => {
    if (info.file.status !== "uploading") {
      // Handle uploading
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} ` + t("fileUploadSuccess"));
      setUploadedVideo(info.file.name); // Set the uploaded video name
      setVideoInfo(info.file.originFileObj); // Set video info when upload is successful
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} ` + t("fileUploadFailed"));
      setUploadedVideo(null); // Reset uploaded video name on error
    }
  };

  const handleRemove = () => {
    setUploadedVideo(null);
    setVideoInfo(null);
  };

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div>
      {videoInfo ? (
        <Space>
          <p>
            <span style={{ color: "blue" }}>{uploadedVideo}</span>
          </p>
          <span
            onClick={handleRemove}
            style={{
              cursor: "pointer",
              color: isHovered ? "red" : "black",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CloseOutlined />
          </span>
        </Space>
      ) : (
        <Upload
          name="video"
          action="/upload/video"
          onChange={handleChange}
          maxCount={1}
          accept=".mp4"
          showUploadList={false}
          beforeUpload={() => {
            setUploading(true);
            return true;
          }}
          customRequest={({ file, onSuccess, onError }) => {
            setTimeout(() => {
              onSuccess?.("ok");
              setUploading(false);
            }, 1000);
          }}
        >
          {isSmallScreen ? (
            // Render icon-only button for small screens
            <Button
              icon={<UploadOutlined />}
              size="middle"
              loading={uploading}
              className="video-upload-button-text"
              style={{ width: "50px" }} // Add the width here
            ></Button>
          ) : (
            <Button
              icon={<UploadOutlined />}
              size="middle"
              loading={uploading}
              className="video-upload-button-text"
            >
              <span
                className={`upload-button-text ${
                  uploading ? "uploading" : "choose-a-video"
                }`}
              >
                {uploading ? t("uploading") : t("choose_a_video")}
              </span>
            </Button>
          )}
        </Upload>
      )}
    </div>
  );
};

export default VideoUpload;
