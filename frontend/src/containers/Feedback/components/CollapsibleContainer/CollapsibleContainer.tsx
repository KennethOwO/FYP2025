import { useState } from "react";
import style from "./CollapsibleContainer.module.css";
import RatingStars from "../RatingStars/RatingStars";
import { useFeedbackSortFilterStore } from "../../../../store/feedbackSortFilter";
import { useTranslation } from "react-i18next";

interface CollapsibleContainerProps {
  id: number;
  name: string;
  age: number;
  gender: string;
  race: string;
  email: string;
  fcategory: string;
  experience: string;
  friendliness: string;
  quality: string;
  recommended: string;
  q1_en: string;
  q2_en: string;
  q3_en: string;
  q1_bm: string;
  q2_bm: string;
  q3_bm: string;
  image: string;
  created_at: string;
  status_en: string;
  status_bm: string;
  updateStatus: (feedbackId: string, status_en: string, status_bm: string) => void;
}

const CollapsibleContainer: React.FC<CollapsibleContainerProps> = ({
  id,
  name,
  age,
  gender,
  race,
  email,
  fcategory,
  experience,
  friendliness,
  quality,
  recommended,
  q1_en,
  q2_en,
  q3_en,
  q1_bm,
  q2_bm,
  q3_bm,
  image,
  created_at,
  status_en,
  status_bm,
  updateStatus,
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const useStore = useFeedbackSortFilterStore();

  const toggleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      updateStatus(id.toString(), "Viewed", "Dilihat");
    }

    for (let i = 0; i < useStore.modifiedData.length; i++) {
      if (useStore.modifiedData[i].feedback_id === id) {
        useStore.setModifiedData([
          ...useStore.modifiedData.slice(0, i),
          {
            ...useStore.modifiedData[i],
            status_en: "Viewed",
            status_bm: "Dilihat",
          },
          ...useStore.modifiedData.slice(i + 1),
        ]);
        break;
      }
    }
  };

  const closeForm = (e: React.MouseEvent<HTMLDivElement>) => {
    const isHeaderClicked =
      e.target === e.currentTarget.querySelector(`.${style.collapsibleHeader}`);

    if (isHeaderClicked) {
      setIsOpen(false);
    }

    e.stopPropagation();
  };

  const personalDetails = [
    { key: "1", label: t("feedback_name"), children: name },
    { key: "2", label: t("age"), children: String(age) },
    { key: "3", label: t("gender"), children: gender },
    { key: "4", label: t("race"), children: race },
    { key: "5", label: t("feedback_email"), children: email },
  ];

  const ratings = [
    { key: "1", label: t("feedback_category_filter"), children: fcategory },
    { key: "2", label: t("view_experience"), children: experience },
    { key: "3", label: t("view_friendliness"), children: friendliness },
    { key: "4", label: t("view_quality"), children: quality },
    { key: "5", label: t("view_recommended"), children: recommended },
  ];

  const comments = [
    { key: "1", label: "Q1", children: i18n.language === "en" ? q1_en : q1_bm },
    { key: "2", label: "Q2", children: i18n.language === "en" ? q2_en : q2_bm },
    { key: "3", label: "Q3", children: i18n.language === "en" ? q3_en : q3_bm },
    { key: "4", label: t("screenshot"), children: image },
  ];

  return (
    <div className={style.collapsibleContainer}>
      <div
        className={`${style.collapsibleContent} ${
          isOpen ? style.opened : style.notOpened
        }`}
        onClick={toggleOpen}
      >
        <div className={style.collapsibleHeader}>
          <h2>
            {t("feedback_id")}: {id}
          </h2>
          <h2>
            {t("feedback_name")}: {name}
          </h2>
          <h2>
            {t("feedback_status")}: {i18n.language === "en" ? status_en : status_bm}
          </h2>
          <h2>
            {t("feedback_date")}: {created_at}
          </h2>
          <div className={style.expandIcon}>
            {isOpen ? <span>&#9650;</span> : <span>&#9660;</span>}
          </div>
        </div>

        {isOpen && (
          <div className={style.collapsibleContent} onClick={closeForm}>
            <div className={style.collapsiblebox}>
              <div className={style.personalDetails}>
                <h3>{t("personal_details")}</h3>
                {personalDetails.map((detail) => (
                  <div key={detail.key} className={style.personalDetailsItem}>
                    <span className={style.personalDetailsLabel}>
                      {detail.label}:{" "}
                    </span>
                    <span className={style.personalDetailsContent}>
                      {detail.children}
                    </span>
                  </div>
                ))}
              </div>
              <div className={style.ratings}>
                <h3>{t("ratings")}</h3>
                {ratings.map((rating) => (
                  <div key={rating.key} className={style.ratingsItem}>
                    <span className={style.ratingsLabel}>
                      {rating.label}
                      {rating.label === t("view_experience") ||
                      rating.label === t("view_friendliness") ||
                      rating.label === t("view_quality") ||
                      rating.label === t("view_recommended")
                        ? ""
                        : ":"}{" "}
                    </span>
                    <span className={style.ratingsContent}>
                      {rating.label === t("view_experience") ||
                      rating.label === t("view_friendliness") ||
                      rating.label === t("view_quality") ||
                      rating.label === t("view_recommended") ? (
                        <RatingStars rating={parseInt(rating.children)} />
                      ) : (
                        rating.children
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className={style.comments}>
                <h3>{t("comments")}</h3>
                {comments.map((comment) => (
                  <div key={comment.key} className={style.commentsItem}>
                    <span className={style.commentsLabel}>
                      {comment.label}:{" "}
                    </span>
                    {comment.label === "Screenshot" &&
                    comment.children.toLowerCase().includes("http") ? (
                      <a
                        href={comment.children}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {/* <img src={comment.children} alt="Screenshot" className={style.screenshotImage} /> */}
                        {t("view_screenshot")}
                      </a>
                    ) : (
                      <span className={style.commentsContent}>
                        {comment.children || "-"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* <div className={style.status}>
                                <h3>Status</h3>
                                <span>{status}</span>
                            </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleContainer;
