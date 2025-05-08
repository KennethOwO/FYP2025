import style from "./FeedbackSuccess.module.css";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use-size";
import { useTranslation } from "react-i18next";

const FeedbackSuccess = () => {
  const { width, height } = useWindowSize();
  const { t, i18n } = useTranslation();

  return (
    <>
      <Confetti width={width} height={height} />
      <div className={style.feedbackSuccess}>
        <div className={style.feedbackSuccessContainer}>
          <h1>{t("thankyouFeedback")}</h1>
          <p>
          {t("feedbckImportant")}
          </p>
          <button onClick={() => window.location.replace("/")}>
            <i className="fa-solid fa-arrow-left"></i> {t("backtoWebsite")}
          </button>
        </div>
      </div>
    </>
  );
};

export default FeedbackSuccess;
