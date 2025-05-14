import "./SLRInput.css";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchSLROutput } from "../../services/communication.service";
const mimeType = 'video/webm; codecs="opus,vp8"';

const SLRInput = ({ onResponsiveReceived, onReset }: { onResponsiveReceived: (data: string) => void; onReset: () => void }) => {
    const { t, i18n } = useTranslation();
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [permission, setPermission] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState<"inactive" | "recording">("inactive");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
    const [videoChunks, setVideoChunks] = useState<Blob[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const liveVideoFeed = useRef<HTMLVideoElement>(null);

    const handleResetAll = () => {
        setSelectedVideo(null);
        setPermission(false);
        setRecordingStatus("inactive");
        setStream(null);
        setRecordedVideo(null);
        setVideoChunks([]);
        onReset();

        mediaRecorder.current?.stop();

        if (liveVideoFeed.current) {
            liveVideoFeed.current.srcObject = null;
        }

        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
    };

    const handleSelectedVideoChange = () => {
        handleResetAll();
        const video = videoInputRef.current?.files && videoInputRef.current.files[0];
        if (video) {
            setSelectedVideo(video);
        }
    };

    const handleCameraPermission = async () => {
        handleResetAll();
        if ("MediaRecorder" in window) {
            try {
                const videoConstraints = {
                    audio: false,
                    video: true,
                };
                const audioConstraints = { audio: true };
                const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
                const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
                setPermission(true);
                const combinedStream = new MediaStream([...videoStream.getTracks(), ...audioStream.getTracks()]);
                setStream(combinedStream);
                if (liveVideoFeed.current) {
                    liveVideoFeed.current.srcObject = videoStream;
                }
            } catch (error) {
                console.error("Error accessing the camera: ", error);
            }
        } else {
            console.error("MediaRecorder API is not supported in this browser");
        }
    };

    const handleStartRecording = async () => {
        setRecordingStatus("recording");
        if (stream) {
            const media = new MediaRecorder(stream, { mimeType });
            mediaRecorder.current = media;
            let localVideoChunks: Blob[] = [];
            media.ondataavailable = (event) => {
                if (event.data.size) {
                    localVideoChunks.push(event.data);
                }
            };
            media.onstop = () => {
                const videoBlob = new Blob(localVideoChunks, { type: mimeType });
                const videoUrl = URL.createObjectURL(videoBlob);
                setRecordedVideo(videoUrl);
            };
            media.start();
            setVideoChunks(localVideoChunks);
        } else {
            console.error("Video stream is not available");
        }
    };

    const handleStopRecording = () => {
        setPermission(false);
        setRecordingStatus("inactive");
        mediaRecorder.current?.stop();
        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
    };

    const handleUpload = async () => {
        setIsLoading(true);
        const formData = new FormData();

        if (selectedVideo) {
            formData.append("video", selectedVideo);
        }

        if (recordedVideo) {
            const videoBlob = new Blob(videoChunks, { type: mimeType });
            formData.append("video", videoBlob);
        }

        if (formData.has("video")) {
            try {
                const data = await fetchSLROutput(formData);
                onResponsiveReceived(data["return"]);
            } catch (error) {
                console.error("Error sending video to server: ", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            console.error("No video selected to upload");
            setIsLoading(false);
        }
    };

    return (
        <div className="slr-input-container">
            <div className="slr-input-menu">
                <input type="file" ref={videoInputRef} style={{ display: "none" }} accept=".mp4" onChange={handleSelectedVideoChange} />
                <button className="slr-input-btn get-video" onClick={() => videoInputRef.current?.click()} data-tooltip={t("upload_from_local_file")}>
                    <i className="fa fa-file-video-o"></i>
                </button>

                {!permission && (
                    <button className="slr-input-btn get-video" onClick={handleCameraPermission} type="button" data-tooltip={t("start_recording")}>
                        <i className="fa fa-video"></i>
                    </button>
                )}

                {permission && recordingStatus === "inactive" && (
                    <button className="slr-input-btn get-video" onClick={handleStartRecording} type="button" data-tooltip={t("record")}>
                        <i className="fa fa-play"></i>
                    </button>
                )}

                {permission && recordingStatus === "recording" && (
                    <button className="slr-input-btn get-video" onClick={handleStopRecording} type="button" data-tooltip={t("stop_recording")}>
                        <i className="fa fa-stop"></i>
                    </button>
                )}

                <button className="slr-input-btn reset" onClick={handleResetAll} type="button" disabled={!recordedVideo && !selectedVideo} data-tooltip={t("reset_recording")}>
                    <i className="fa fa-refresh"></i>
                </button>

                <button className="slr-input-btn submit" onClick={handleUpload} type="button" disabled={!recordedVideo && !selectedVideo} data-tooltip={t("upload_video")}>
                    <i className="fa fa-upload"></i>
                </button>
            </div>
            <h1>{t("video_preview")}</h1>
            <div className="slr-video-container">
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>{t("processing_video")}</p>
                    </div>
                )}
                <video ref={liveVideoFeed} className={`slr-preview-video ${!recordedVideo && !selectedVideo ? "active" : ""}`} autoPlay muted playsInline></video>
                <video
                    className={`slr-preview-video ${recordedVideo ? "active" : ""}`}
                    controls
                    autoPlay
                    muted
                    playsInline
                    // @ts-ignore
                    src={recordedVideo}
                ></video>
                <video className={`slr-preview-video ${selectedVideo ? "active" : ""}`} controls autoPlay muted playsInline src={selectedVideo ? URL.createObjectURL(selectedVideo) : ""}></video>
            </div>
        </div>
    );
};

export default SLRInput;
