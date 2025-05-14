import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./DownloadButton.css";

interface DownloadButtonProps {
  type: string;
  downloadVideo: (name: string) => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  type,
  downloadVideo,
}) => {
  const { t, i18n } = useTranslation();
  return (
    <Button className="responsive-button" onClick={() => downloadVideo(type)}>
      <span>
        <DownloadOutlined />
      </span>
      <span className="download-text" style={{ marginLeft: "8px" }}>
        {t("download_btn")}
      </span>
    </Button>
  );
};

export default DownloadButton;
