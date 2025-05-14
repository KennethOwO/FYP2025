import { useState, useRef, useEffect } from "react";
import styles from "./VideoRecorder.module.css";
import buttonClickedSound from "/music/btnClicked.wav";
import { fetchSLROutput } from "../../../../services/communication.service";
const mimeType = 'video/webm; codecs="opus,vp8"';

// Function to play button clicked sound
const playButtonClickedSound = () => {
    const audio = new Audio(buttonClickedSound);
    audio.play();
};

const VideoRecorder = ({ countdown, onStartRecording, onStopRecording, onVideoData }: { countdown: number; onStartRecording: () => void; onStopRecording: () => void; onVideoData: (data: { return: string }) => void }) => {
    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const liveVideoFeed = useRef<HTMLVideoElement>(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
    const [videoChunks, setVideoChunks] = useState<Blob[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCameraPermission = async () => {
        setRecordedVideo(null);
        //get video and audio permissions and then stream the result media stream to the videoSrc variable
        if ("MediaRecorder" in window) {
            try {
                const videoConstraints = {
                    audio: false,
                    video: true,
                };
                const audioConstraints = { audio: true };

                // create audio and video streams separately
                const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
                const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);

                setPermission(true);
                const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
                setStream(combinedStream);
                if (liveVideoFeed.current) {
                    liveVideoFeed.current.srcObject = videoStream;
                }
            } catch (err) {
                alert((err as Error).message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = async () => {
        setRecordingStatus("recording");
        if (onStartRecording) {
            onStartRecording(); // Callback to start countdown timer in parent component
        }

        if (stream) {
            // Ensure stream is not null
            const media = new MediaRecorder(stream, { mimeType });
            mediaRecorder.current = media;
            mediaRecorder.current.start();
            let localVideoChunks: Blob[] = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (typeof event.data === "undefined") return;
                if (event.data.size === 0) return;
                localVideoChunks.push(event.data);
            };

            setVideoChunks(localVideoChunks);
        } else {
            console.error("Stream is null. Cannot start recording.");
        }
    };

    const stopRecording = () => {
        if (onStopRecording) {
            onStopRecording(); // Callback to stop countdown timer in parent component
        }

        setPermission(false);
        setRecordingStatus("inactive");
        mediaRecorder.current?.stop();

        // Stop the media stream
        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            setStream(null); // Reset the stream state to null
        }

        if (mediaRecorder.current) {
            mediaRecorder.current.onstop = () => {
                const videoBlob = new Blob(videoChunks, { type: mimeType });
                const videoUrl = URL.createObjectURL(videoBlob);

                setRecordedVideo(videoUrl);
            };
        }
    };
    
    const handleUpload = async () => {
        setIsLoading(true);
        const formData = new FormData();

        if (recordedVideo) {
            const videoBlob = new Blob(videoChunks, { type: mimeType });
            formData.append("video", videoBlob);
        }

        if (formData.has("video")) {
            try {
                const data = await fetchSLROutput(formData);
                onVideoData(data);
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

    useEffect(() => {
        if (countdown === 0 && recordingStatus === "recording") {
            stopRecording();
        }
    }, [countdown, recordingStatus]);

    return (
        <>
            {!permission ? (
                <div className={styles.desktop_button_group}>
                    <button
                        className={styles.open_cam_btn_pushable}
                        onClick={() => {
                            getCameraPermission();
                            playButtonClickedSound();
                        }}
                        type="button"
                    >
                        <span className={styles.open_cam_btn_shadow}></span>
                        <span className={styles.open_cam_btn_edge}></span>
                        <span className={`${styles.open_cam_btn_front}`}>
                            <i className={`fa fa-video ${styles.fa_video}`}></i>
                        </span>
                    </button>
                    {recordedVideo ? (
                        <button
                            className={styles.upload_btn_pushable}
                            type="button"
                            onClick={() => {
                                handleUpload();
                                playButtonClickedSound();
                            }}
                        >
                            <span className={styles.upload_btn_shadow}></span>
                            <span className={styles.upload_btn_edge}></span>
                            <span className={`${styles.upload_btn_front} text`}>
                                <i className={`fa fa-upload ${styles.fa_upload}`}></i>
                            </span>
                        </button>
                    ) : null}
                </div>
            ) : null}

            <main>
                <div className={styles.video_controls}>
                    {!permission ? (
                        <div className={styles.mobile_button_group}>
                            <button
                                className={styles.open_cam_btn_pushable}
                                onClick={() => {
                                    getCameraPermission();
                                    playButtonClickedSound();
                                }}
                                type="button"
                            >
                                <span className={styles.open_cam_btn_shadow}></span>
                                <span className={styles.open_cam_btn_edge}></span>
                                <span className={`${styles.open_cam_btn_front}`}>
                                    <i className={`fa fa-video ${styles.fa_video}`}></i>
                                </span>
                            </button>
                            {recordedVideo ? (
                                <button
                                    className={styles.upload_btn_pushable}
                                    type="button"
                                    onClick={() => {
                                        handleUpload();
                                        playButtonClickedSound();
                                    }}
                                >
                                    <span className={styles.upload_btn_shadow}></span>
                                    <span className={styles.upload_btn_edge}></span>
                                    <span className={`${styles.upload_btn_front} text`}>
                                        <i className={`fa fa-upload ${styles.fa_upload}`}></i>
                                    </span>
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                    <div>
                        {permission && recordingStatus === "inactive" ? (
                            <button
                                className={styles.open_cam_btn_pushable}
                                onClick={() => {
                                    startRecording();
                                    playButtonClickedSound();
                                }}
                                type="button"
                            >
                                <span className={styles.open_cam_btn_shadow}></span>
                                <span className={styles.open_cam_btn_edge}></span>
                                <span className={`${styles.open_cam_btn_front}`}>
                                    <i className={`fa fa-play ${styles.fa_play}`}></i>
                                </span>
                            </button>
                        ) : null}
                        {recordingStatus === "recording" ? (
                            <button
                                className={styles.open_cam_btn_pushable}
                                onClick={() => {
                                    stopRecording();
                                    playButtonClickedSound();
                                }}
                                type="button"
                            >
                                <span className={styles.open_cam_btn_shadow}></span>
                                <span className={styles.open_cam_btn_edge}></span>
                                <span className={`${styles.open_cam_btn_front}`}>
                                    <i className={`fa fa-stop ${styles.fa_stop}`}></i>
                                </span>
                            </button>
                        ) : null}
                    </div>
                </div>
            </main>

            <div className={styles.video_player}>
                {!recordedVideo ? <video ref={liveVideoFeed} autoPlay className={`${styles.livePlayer} ${!permission ? styles.initialHeight : ""}`}></video> : null}
                {recordedVideo ? (
                    <div className={styles.recorded_player}>
                        {isLoading && (
                            <div className={styles.loading_overlay}>
                                <div className={styles.loading_spinner}></div>
                                <p>Processing video...</p>
                            </div>
                        )}
                        <video className={styles.recorded} src={recordedVideo} controls></video>
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default VideoRecorder;
