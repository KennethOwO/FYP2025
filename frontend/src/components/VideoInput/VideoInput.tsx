// VideoInput.tsx
import React, { useState, useEffect } from "react";
import { Upload, Button, message, Space } from "antd";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";
import "./VideoInput.css";
import { useTranslation } from "react-i18next";

interface VideoInputProps {
  setVideoInfo: any;
  uploadedVideo: any;
  setUploadedVideo: any;
  onRemove: () => void;
}

const VideoInput: React.FC<VideoInputProps> = ({
  setVideoInfo,
  onRemove,
  uploadedVideo,
  setUploadedVideo,
}) => {
  const { t, i18n } = useTranslation();
  const [uploading, setUploading] = useState<boolean>(false);
  const handleChange = (info: any) => {
    if (info.file.status !== "uploading") {
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

  // const handleRemove = () => {
  //   onRemove();
  // };

  return (
    <div className="videoinput-class">
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
        <Button icon={<UploadOutlined />} size="large" loading={uploading}>
          {uploading ? t("uploading") : t("choose_a_video")}
        </Button>
      </Upload>
    </div>
  );
};

export default VideoInput;
