import React, { useState, useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import LoginRemindPopup from "../components/LoginRemindPopup/LoginRemindPopup";
import RulesPopup from "../components/RulesPopup/RulesPopup";
import InnerSetting from "../components/InnerSetting/InnerSetting";
import GameOverPopup from "../components/GameOver/GameOver";
import styles from "./GuessTheWord.module.css";
import { Canvas, useFrame } from "@react-three/fiber";
// @ts-ignore
import { CharacterAnimationsProvider } from "../../../components/Avatar/CharacterAnimations";
// @ts-ignore
import Experience from "../../../components/Avatar/Experience";
// @ts-ignore
import Man from "../../../components/AvatarModels/Man";
import heartImage from "/images/heart.png";
import backgroundMusic from "/music/gameMusic2.mp3";
import buttonClickedSound from "/music/btnClicked.wav";
import correctAnswerSound from "/music/correctMusic.mp3";
import wrongAnswerSound from "/music/wrongMusic.mp3";
import { useTranslation } from "react-i18next";
import { useSessionStorage } from "usehooks-ts";
import { SendResultToGuessTheWord } from "@root/services/leaderboard.service";
import { GetUserByEmail } from "../../../services/account.service";
import { getAuth } from "firebase/auth";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GlossAnimation {
  keyword: string;
  animations: string[];
  category: string;
}

const playButtonClickedSound = () => {
  const audio = new Audio(buttonClickedSound);
  audio.play();
};

const playCorrectAnswerSound = () => {
  const audio = new Audio(correctAnswerSound);
  audio.play();
};

const playWrongAnswerSound = () => {
  const audio = new Audio(wrongAnswerSound);
  audio.play();
};

const GuessTheWord: React.FC = () => {
  const [lives, setLives, removeLives] = useSessionStorage("guessLives", 3);
  const [currentLevel, setCurrentLevel] = useSessionStorage(
    "guessCurrentLevel",
    1
  );
  const [questionList, setQuestionList] = useSessionStorage<Question[]>(
    "guessQuestionList",
    []
  );
  const [score, setScore] = useSessionStorage("guessScore", 0);

  const { t, i18n } = useTranslation();
  const [isLoginRemindPopupVisible, setIsLoginRemindPopupVisible] =
    useState(false);
  const [isInnerSettingOpen, setIsInnerSettingOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(-1);
  const [wrongAnswerIndex, setWrongAnswerIndex] = useState(-1);
  const [animationKeyword, setAnimationKeyword] = useState("");
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question>();
  const [clickedOptions, setClickedOptions] = useState<boolean[]>(
    new Array(4).fill(false)
  );
  const [gameOver, setGameOver] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  useEffect(() => {
    if (!user) {
      setIsLoginRemindPopupVisible(true);
    }
  }, []);

  function CameraControl() {
    const { camera } = useThree();

    const x = -7.5; // Adjust these values according to your requirements
    const y = 140;
    const z = 215;
    const decimal = 1; // Adjust this value to control the speed of lerping

    useFrame(() => {
      camera.position.lerp({ x, y, z }, decimal);
      camera.lookAt(x, y, z);
    });

    return null;
  }

  // Function to render hearts for lives
  const renderLives = () => {
    return Array.from({ length: lives }, (_, i) => (
      <img key={i} src={heartImage} alt="Heart" />
    ));
  };

  const loadAnimationKeywords = async (): Promise<GlossAnimation[] | null> => {
    try {
      const response = await fetch("/glosses/gloss.json");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }
      const data: GlossAnimation[] = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to load animation keywords:", error);
      return null;
    }
  };

  const pickRandomKeyword = async () => {
    const data = await loadAnimationKeywords();

    if (data) {
      // generate a random number between 0 and the length of the data
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomQuestion = data[randomIndex];

      const newQuestion = {
        question: randomQuestion.category,
        options: [],
        correctAnswer: randomQuestion.keyword,
      };

      setQuestionList((prev) => [...prev, newQuestion]);
    }
  };

  useEffect(() => {
    if (questionList.length > 0 && questionList[currentLevel - 1]) {
      setAnimationKeyword(questionList[currentLevel - 1].correctAnswer);
      setQuestion(questionList[currentLevel - 1]);
    }
  }, [questionList, currentLevel]);

  useEffect(() => {
    pickRandomKeyword();
  }, [currentQuestionIndex]);

  useEffect(() => {
    const fetchAnswerOptions = async () => {
      if (animationKeyword !== "") {
        const options = await generateAnswerOptions(animationKeyword);
        setAnswerOptions(options);
      }
    };

    fetchAnswerOptions();
  }, [animationKeyword]);

  const generateAnswerOptions = async (
    animationKeyword: string
  ): Promise<string[]> => {
    const options: string[] = [];
    const glossData = await loadAnimationKeywords();
    if (glossData) {
      const glossKeys = glossData
        .map((item) => item.keyword)
        .filter((key) => /^[A-Z_]+$/.test(key));

      const filteredGlossKeys = glossKeys.filter(
        (key) => key.toLowerCase() !== animationKeyword.toLowerCase()
      );

      for (let i = filteredGlossKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredGlossKeys[i], filteredGlossKeys[j]] = [
          filteredGlossKeys[j],
          filteredGlossKeys[i],
        ];
      }

      let randomIndex = Math.floor(Math.random() * filteredGlossKeys.length);

      for (let i = 0; i < 4; i++) {
        const randomKey = filteredGlossKeys[randomIndex];
        const formattedOption = randomKey
          .toLowerCase()
          .replace(/_/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        options.push(formattedOption);
        randomIndex = (randomIndex + 1) % filteredGlossKeys.length;
      }

      options[Math.floor(Math.random() * 4)] = animationKeyword
        .toLowerCase()
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return options;
    } else {
      return [];
    }
  };

  const handleAnswerOptionClick = async (
    selectedOption: string,
    index: number
  ) => {
    try {
      const glossData = await loadAnimationKeywords();
      if (clickedOptions[index]) {
        return;
      }

      const updatedClickedOptions = [...clickedOptions];
      updatedClickedOptions[index] = true;
      setClickedOptions(updatedClickedOptions);

      // Disable other options
      const disabledOptions = [...updatedClickedOptions];
      disabledOptions.fill(true);
      setClickedOptions(disabledOptions);

      if (glossData && question) {
        const correctAnswer = question.correctAnswer;
        const correctAnswerFormatted = correctAnswer
          .toLowerCase()
          .replace(/_/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const correctAnswerIndex = answerOptions.findIndex(
          (option) =>
            option.toLowerCase() === correctAnswerFormatted.toLowerCase()
        );

        if (
          selectedOption.toLowerCase() === correctAnswerFormatted.toLowerCase()
        ) {
          setScore(score + 1);
          setCorrectAnswerIndex(index);
          playCorrectAnswerSound();
        } else {
          setCorrectAnswerIndex(correctAnswerIndex);
          setWrongAnswerIndex(index);
          playWrongAnswerSound();
          setLives(lives - 1);
          if (lives === 1) {
            setGameOver(true);
            removeLives();
            if (user) {
              const res = await GetUserByEmail(user.email || "", user);
              const data = {
                score: score,
                user_id: res.data.user_id,
              };

              await SendResultToGuessTheWord(data, user);
            }
          }
        }

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questionList.length + 1) {
          setTimeout(() => {
            setCurrentLevel(currentLevel + 1);
            setCurrentQuestionIndex(nextQuestionIndex);
            setCorrectAnswerIndex(-1);
            setWrongAnswerIndex(-1);
          }, 2000);
        } else {
          setTimeout(() => {
            setShowScore(true);
            setWrongAnswerIndex(-1);
          }, 2000);
        }
      } else {
        console.error("Failed to load glossData or questions.");
      }
    } catch (error) {
      console.error("Error handling answer option click:", error);
    }
  };

  // Reset clicked options when moving to the next level
  useEffect(() => {
    setClickedOptions(new Array(4).fill(false));
  }, [currentQuestionIndex]);

  const updateBackgroundMusicVolume = (volume: number) => {
    if (audioRef.current) {
      const localVolumeValue = localStorage.getItem("volumeValue");
      if (localVolumeValue) {
        const volumeValue = parseInt(localVolumeValue, 10);
        audioRef.current.volume = volumeValue / 100;
      } else {
        audioRef.current.volume = volume;
      }
    }
  };

  useEffect(() => {
    updateBackgroundMusicVolume(1);
  }, []);

  return (
    <div className={styles.guess_the_word_layout}>
      {isLoginRemindPopupVisible && (
        <LoginRemindPopup onClose={() => setIsLoginRemindPopupVisible(false)} />
      )}
      {gameOver && (
        <GameOverPopup score={score} onClose={() => setGameOver(false)} />
      )}
      <div className={styles.guess_the_word_container}>
        <div className={styles.guess_the_word}>
          <button
            className={`${styles.shared_btn} ${styles.rules_btn}`}
            type="button"
            onClick={() => {
              setShowRules(true);
              playButtonClickedSound();
            }}
          >
            {t("rules")}
          </button>
          <h1 className={styles.level_title}>
            {questionList.length > 0 && questionList[currentQuestionIndex]
              ? `${t("level")} ${currentLevel}`
              : t("loading")}
          </h1>
          <h2 className={styles.score_title}>
            {t("score")}: {score}
          </h2>
          <button
            className={`${styles.shared_btn} ${styles.setting_btn}`}
            type="button"
            onClick={() => {
              playButtonClickedSound();
              setIsInnerSettingOpen(true);
            }}
          >
            <img
              src="./images/setting.png"
              alt="Setting"
              width="30"
              height="30"
            />
          </button>
          <div className={styles.lives_container}>{renderLives()}</div>
          {showRules && (
            <RulesPopup
              onClose={() => setShowRules(false)}
              title={t("game_rules")}
              rules={[
                t("gtw_rules1"),
                t("gtw_rules2"),
                t("gtw_rules3"),
                t("gtw_rules4"),
                t("gtw_rules5"),
                t("gtw_rules6"),
              ]}
            />
          )}
          <div>
            <h3 className={styles.question}>
              <div className={styles.education_canvas_wrapper}>
                <Canvas
                  camera={{
                    fov: 35,
                  }}
                >
                  {/* Your 3D scene components */}
                  <directionalLight
                    intensity={1}
                    color="white"
                    position={[10, 10, 10]}
                  />
                  <CharacterAnimationsProvider>
                    <Experience />
                    <CameraControl />
                    <Man
                      animationKeyword={animationKeyword}
                      speed={""}
                      showSkeleton={""}
                      repeat={"Yes"}
                      isPaused={""}
                    />
                  </CharacterAnimationsProvider>
                </Canvas>
              </div>
            </h3>
            <div className={styles.answer_btn}>
              {answerOptions.map((option, index) => (
                <button
                  className={`${styles.answer_option} 
                                ${
                                  correctAnswerIndex === index
                                    ? styles.correct_answer
                                    : ""
                                } 
                                ${
                                  wrongAnswerIndex === index
                                    ? styles.wrong_answer
                                    : ""
                                }`}
                  key={index}
                  onClick={() => handleAnswerOptionClick(option, index)}
                  disabled={clickedOptions[index]}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Add audio player for background music */}
      <audio ref={audioRef} autoPlay loop>
        <source src={backgroundMusic} type="audio/mpeg" />
        {t("not_support_music")}
      </audio>
      {/* Render InnerSetting if isInnerSettingOpen is true */}
      {isInnerSettingOpen && (
        <InnerSetting
          onClose={() => setIsInnerSettingOpen(false)}
          onVolumeChange={updateBackgroundMusicVolume}
        />
      )}
    </div>
  );
};

function CameraControl() {
  const { camera } = useThree();

  const x = -7.5; // Adjust these values according to your requirements
  const y = 140;
  const z = 215;
  const decimal = 1; // Adjust this value to control the speed of lerping

  useFrame(() => {
    camera.position.lerp({ x, y, z }, decimal);
    camera.lookAt(x, y, z);
  });

  return null;
}

export default GuessTheWord;
