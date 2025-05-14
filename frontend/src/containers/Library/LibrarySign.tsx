import { useRef, useState, useEffect } from "react";
import { Typography, Button } from "@mui/material";
import { fetchSign } from "../../services/library.service";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// // @ts-ignore
// import { CharacterAnimationsProvider } from "../../components/Avatar/CharacterAnimations";
// // @ts-ignore
// import Experience from "../../components/Avatar/Experience";
// // @ts-ignore
// import Man from "../../components/AvatarModels/Man";
import JsonlPlayer from "../../components/JsonlPlayer";
import styles from "./Admin/LibraryAdmin.module.css";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

interface LibrarySign {
  keyword: string;
  animations: Array<string>;
  contributor: string;
  thumbnail: string;
}

export default function Library() {
  const { t } = useTranslation();
  const [sign, setSign] = useState<LibrarySign | null>(null);
  const navigate = useNavigate();
  const controls = useRef();
  const { categoryName, signKeyword } = useParams();

  useEffect(() => {
    if (categoryName && signKeyword) {
      fetchSignData(categoryName, signKeyword);
    }
  }, [categoryName, signKeyword]);

  const fetchSignData = async (category: string, keyword: string) => {
    try {
      const data = await fetchSign(category);
      const selectedSign = data.find(
        (s: LibrarySign) => s.keyword.toLowerCase() === keyword.toLowerCase()
      );

      // console.log("selectedSign", selectedSign);
      if (selectedSign) {
        setSign(selectedSign);
      }
    } catch (error) {
      console.error("Error fetching sign:", error);
    }
  };

  const handleBack = () => {
    navigate(`/library/${categoryName}`);
  };

  if (!sign) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.signPageWrapper}>
      <div>
        <div className={styles.titleBack}>
          <Button className={styles.backContainer} onClick={handleBack}>
            <div className={styles.backButton} />
          </Button>
          <Typography variant="h1" className={styles.signHeader}>
            {sign.keyword || "No sign found"}
          </Typography>
        </div>
        <div className={styles.signInfo}>
          <h4>
            {t("animations")}
            {sign.animations ? (
              <>
                {"["}
                {sign.animations.map((animation, index) => (
                  <span key={index}>
                    {index > 0 && ", "}
                    {animation}
                  </span>
                ))}
                {" ]"}
              </>
            ) : (
              "Unknown"
            )}
          </h4>

          <Typography variant="body2" className="sign-contributor">
            {t("contributor")}
            {sign.contributor || "Unknown"}
          </Typography>
        </div>
        <div className={styles.signImages}>
          <img
            src={sign.thumbnail || "/images/signImages/medical.png"}
            alt={sign.keyword}
            className={styles.signImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/signImages/medical.png";
            }}
          />
          <div className={styles.sign_wrapper}>
            <JsonlPlayer
              glossKeyword={sign.keyword.toLowerCase()}
              width={640}
              height={480}
              fps={25}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
