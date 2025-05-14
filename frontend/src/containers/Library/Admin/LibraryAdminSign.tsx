import { useRef, useState, useEffect } from "react";
import styles from "./LibraryAdmin.module.css";
import { Typography, Button } from "@mui/material"; // Import Material-UI components
import { fetchSign } from "../../../services/library.service";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// @ts-ignore
import { CharacterAnimationsProvider } from "../../../components/Avatar/CharacterAnimations";
// @ts-ignore
import Experience from "../../../components/Avatar/Experience";
// @ts-ignore
import Man from "../../../components/AvatarModels/Man";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

interface LibrarySigns {
  signId: number;
  keyword: string;
  animations: Array<string>;
  contributor: string;
  thumbnail: string;
}

export default function LibraryAdminSign() {
  const { t } = useTranslation();
  const [signs, setSigns] = useState<LibrarySigns[]>([]);
  const [selectedSignIndex, setSelectedSignIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const { categoryName, signKeyword } = useParams();
  const controls = useRef<typeof OrbitControls | null>(null);

  const currentUser = getAuth().currentUser;

  useEffect(() => {
    if (categoryName && signKeyword) {
      fetchSignData(categoryName, signKeyword);
    }
  }, [categoryName, signKeyword]);

  const fetchSignData = async (category: string, keyword: string) => {
    try {
      setIsLoading(true);
      const data = await fetchSign(category);
      const selectedSign = data.find(
        (s: LibrarySigns) =>
          s.keyword.toLowerCase() === decodeURIComponent(keyword).toLowerCase()
      );
      if (selectedSign) {
        setSigns([selectedSign]);
      } else {
        // console.log("Sign not found");
        // Optionally navigate to error page or show message
      }
    } catch (error) {
      console.error("Error fetching signs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Add a loading indicator
  }

  // Check if we have valid sign data
  const currentSign = signs[selectedSignIndex];
  if (!currentSign) {
    return <div>Sign not found</div>; // Add error state
  }

  return (
    <div className={styles.library}>
      <div className={styles.signPageWrapper}>
        <div>
          <div className={styles.titleBack}>
            <Button
              className={styles.backContainer}
              onClick={() => {
                navigate(`/library/admin/${categoryName}`);
              }}
            >
              <div className={styles.backButton} />
            </Button>
            <Typography variant="h1" className={styles.signHeader}>
              {currentSign.keyword}
            </Typography>
          </div>
          <div className={styles.signInfo}>
            <h4>
              {t("animations")}
              {currentSign.animations && (
                <>
                  {"["}
                  {currentSign.animations.map((animation, index) => (
                    <>
                      {index > 0 && ", "}
                      {animation}
                    </>
                  ))}
                  {" ]"}
                </>
              )}
            </h4>

            <Typography variant="body2" className="sign-contributor">
              {t("contributor")}
              {currentSign.contributor || "Unknown"}
            </Typography>
          </div>
          <div className={styles.signImages}>
            <img
              src={currentSign.thumbnail}
              alt={currentSign.keyword}
              className={styles.signImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/signImages/medical.png";
              }}
            />

            <div className={styles.sign_wrapper}>
              <Canvas camera={{ position: [0, 0, 225], fov: 55 }}>
                <directionalLight
                  intensity={1}
                  color="white"
                  position={[10, 10, 10]}
                />
                <CharacterAnimationsProvider>
                  <Experience />
                  <Man
                    animationKeyword={currentSign.keyword}
                    speed={""}
                    showSkeleton={""}
                    repeat={"Yes"}
                    isPaused={""}
                  />
                </CharacterAnimationsProvider>
                {/* @ts-ignore */}
                <OrbitControls ref={controls} />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
