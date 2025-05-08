import React, { useEffect, useRef, useState } from "react";
import styles from "./LeaderboardPopup.module.css";
import buttonClickedSound from "/music/btnClicked.wav";
import { useTranslation } from "react-i18next";

import { GetAllGuessTheWordPlayer, GetAllDoTheSignPlayer } from "../../../../services/leaderboard.service";

interface LeaderboardPopupProps {
    onClose: () => void;
}

type Player = {
    username: string;
    score: number;
    picture: string;
};

const LeaderboardPopup: React.FC<LeaderboardPopupProps> = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const leaderboardRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState("Guess The Word"); // State for active tab

    const [guessTheWordPlayers, setGuessTheWordPlayers] = useState<Player[]>([]);
    const [doTheSignPlayers, setDoTheSignPlayers] = useState<Player[]>([]);

    const [guessTheWordTop3Players, setGuessTheWordTop3Players] = useState<Player[]>([]);
    const [doTheSignTop3Players, setDoTheSignTop3Players] = useState<Player[]>([]);

    // Function to get all players for Guess The Word
    const getGuessTheWordPlayers = async () => {
        try {
            const response = await GetAllGuessTheWordPlayer();
            setGuessTheWordPlayers(response.data);
            setGuessTheWordTop3Players(response.data.sort((a: Player, b: Player) => b.score - a.score).slice(0, 3));
        } catch (err) {
            console.error(err);
        }
    };

    // Function to get all players for Do The Sign
    const getDoTheSignPlayers = async () => {
        try {
            const response = await GetAllDoTheSignPlayer();
            setDoTheSignPlayers(response.data);
            setDoTheSignTop3Players(response.data.sort((a: Player, b: Player) => b.score - a.score).slice(0, 3));
        } catch (err) {
            console.error(err);
        }
    };

    // Get all players for Guess The Word and Do The Sign
    useEffect(() => {
        getGuessTheWordPlayers();
        getDoTheSignPlayers();
    }, []);

    // Function to play button clicked sound
    const playButtonClickedSound = () => {
        const audio = new Audio(buttonClickedSound);
        audio.play();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (leaderboardRef.current && !leaderboardRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className={styles.leaderboard_container}>
            <div ref={leaderboardRef} className={styles.leaderboard_content}>
                <div className={`${styles.box__line} ${styles.box__line__top}`}></div>
                <div className={`${styles.box__line} ${styles.box__line__right}`}></div>
                <div className={`${styles.box__line} ${styles.box__line__bottom}`}></div>
                <div className={`${styles.box__line} ${styles.box__line__left}`}></div>
                <h3>{t("leaderboard")}</h3>
                <button
                    className={styles.close_btn_pushable}
                    role="button"
                    onClick={() => {
                        onClose();
                        playButtonClickedSound();
                    }}
                >
                    <span className={styles.close_btn_shadow}></span>
                    <span className={styles.close_btn_edge}></span>
                    <span className={styles.close_btn_front}>
                        <i className={`${styles.fa_close_btn} fa fa-close`}></i>
                    </span>
                </button>

                {/* Tab Buttons */}
                <div className={styles.tab_buttons}>
                    <button className={`${styles.tab_button} ${activeTab === "Guess The Word" ? styles.active : ""}`} onClick={() => setActiveTab("Guess The Word")}>
                        {t("guess_the_word")}
                    </button>
                    <button className={`${styles.tab_button} ${activeTab === "Do The Sign" ? styles.active : ""}`} onClick={() => setActiveTab("Do The Sign")}>
                        {t("do_the_sign")}
                    </button>

                    <div
                        className={styles.animation}
                        style={{
                            left: activeTab === "Guess The Word" ? "0%" : "50%",
                        }}
                    ></div>
                </div>

                <div className={styles.tab_content}>
                    {activeTab === "Guess The Word" && (
                        <div>
                            <div className={styles.topThreeContainer}>
                                <div className={styles.playerCard}>
                                    <div className={`${styles.rankLabel} ${styles.secondPlace}`}>2nd</div>
                                    <img src={guessTheWordTop3Players[1]?.picture} alt="Second Place" className={styles.secthird} />
                                    <p className={styles.playerName}>{guessTheWordTop3Players[1]?.username || "Anonymous"}</p>
                                    <p className={styles.playerScore}>{guessTheWordTop3Players[1]?.score}</p>
                                </div>
                                <div className={styles.playerCard}>
                                    <div className={styles.rankLabel}>1st</div>
                                    <img src={guessTheWordTop3Players[0]?.picture} alt="Champion" className={styles.champion} />
                                    <p className={styles.playerName}>{guessTheWordTop3Players[0]?.username || "Anonymous"}</p>
                                    <p className={styles.playerScore}>{guessTheWordTop3Players[0]?.score}</p>
                                </div>
                                <div className={styles.playerCard}>
                                    <div className={`${styles.rankLabel} ${styles.thirdPlace}`}>3rd</div>
                                    <img src={guessTheWordTop3Players[2]?.picture} alt="Third Place" className={styles.secthird} />
                                    <p className={styles.playerName}>{guessTheWordTop3Players[2]?.username || "Anonymous"}</p>
                                    <p className={styles.playerScore}>{guessTheWordTop3Players[2]?.score}</p>
                                </div>
                            </div>
                            <div className={styles.table_player}>
                                {/* Filter the top 3 player */}
                                {guessTheWordPlayers
                                    .filter((player) => !guessTheWordTop3Players.includes(player))
                                    .map((player, index) => (
                                        <div key={index} className={`${styles.table_row} ${index % 2 === 0 ? styles.alternateRow : ""}`}>
                                            <div>{index + 4}</div>
                                            <div className={styles.player_image_container}>
                                                <img src={player.picture} referrerPolicy="no-referrer" alt={`${player.username}'s profile`} className={styles.player_profile_picture} />
                                            </div>
                                            <div>{player.username}</div>
                                            <div>{player.score}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                    {activeTab === "Do The Sign" && (
                        <div>
                            <div className={styles.topThreeContainer}>
                                <div className={styles.playerCard}>
                                    <div className={`${styles.rankLabel} ${styles.secondPlace}`}>2nd</div>
                                    <img src={doTheSignTop3Players[1]?.picture} alt="Second Place" className={styles.secthird} />
                                    <p className={styles.playerName}>{doTheSignTop3Players[1]?.username || "Anonymous"}</p>
                                    <p className={styles.playerScore}>{doTheSignTop3Players[1]?.score}</p>
                                </div>
                                <div className={styles.playerCard}>
                                    <div className={styles.rankLabel}>1st</div>
                                    <img src={doTheSignTop3Players[0]?.picture} alt="Champion" className={styles.champion} />
                                    <p className={styles.playerName}>{doTheSignTop3Players[0]?.username || "Anonymous"}</p>
                                    <p className={styles.playerScore}>{doTheSignTop3Players[0]?.score}</p>
                                </div>
                                <div className={styles.playerCard}>
                                    <div className={`${styles.rankLabel} ${styles.thirdPlace}`}>3rd</div>
                                    <img src={doTheSignTop3Players[2]?.picture} alt="Third Place" className={styles.secthird} />
                                    <p className={styles.playerName}>{doTheSignTop3Players[2]?.username || "Anonymous"}</p>
                                    <p className={styles.playerScore}>{doTheSignTop3Players[2]?.score}</p>
                                </div>
                            </div>
                            <div className={styles.table_player}>
                                {/* Filter the top 3 player */}
                                {doTheSignPlayers
                                    .filter((player) => !doTheSignTop3Players.includes(player))
                                    .map((player, index) => (
                                        <div key={index} className={`${styles.table_row} ${index % 2 === 0 ? styles.alternateRow : ""}`}>
                                            <div>{index + 4}</div>
                                            <div className={styles.player_image_container}>
                                                <img src={player.picture} alt={`${player.username}'s profile`} className={styles.player_profile_picture} />
                                            </div>
                                            <div>{player.username}</div>
                                            <div>{player.score}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPopup;
