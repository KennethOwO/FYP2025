import React, { useRef, useState, useEffect } from "react";
import styles from "./LibraryAdmin.module.css";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"; // Import Material-UI components
import { fetchSign, updateSign } from "../../../services/library.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { Cross2Icon } from "@radix-ui/react-icons";
import ImageInput from "../../../components/ImageInput/ImageInput";
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

export default function LibraryAdminCategory() {
  const { t, i18n } = useTranslation();
  const [signs, setSigns] = useState<LibrarySigns[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const [openUpdateSignConfirm, setOpenUpdateSignConfirm] = useState(false); // State for update confirmation dialog
  const [signtoupdate, setsigntoupdate] = useState<number | null>(0);
  const [resetImage, setResetImage] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { category } = useParams();
  const navigate = useNavigate();

  const currentUser = getAuth().currentUser;

  const [formData, setFormData] = useState({
    category_name: "",
    category_thumbnail: null as string | null,
  });

  useEffect(() => {
    if (category) {
      // console.log("category2", category);
      fetchCategorySigns(category);
    }
  }, [category]);

  const resetSearch = () => {
    setSearchKeyword("");
  };

  // Filter signs based on the search keyword
  const filteredSigns =
    searchKeyword.trim() === ""
      ? signs
      : signs.filter((sign) =>
          sign.keyword.toLowerCase().includes(searchKeyword.toLowerCase())
        );

  const fetchCategorySigns = async (categoryName: string) => {
    try {
      const data = await fetchSign(categoryName);
      setSigns(data);
    } catch (error) {
      console.error("Error fetching signs:", error);
    }
  };

  const [signformData, setSignFormData] = useState({
    thumbnail: null,
  });

  const setSignThumbnail = (image: any) => {
    setSignFormData({ ...signformData, thumbnail: image });
  };

  const handleImageReset = () => {
    setResetImage(false);
  };

  const handleCategoryClick = async (categoryName: string) => {
    try {
      // console.log("categoryName2", categoryName);
      const signsData = await fetchSign(categoryName);
      setSigns(signsData);
      setSelectedCategory(categoryName);
    } catch (error) {
      console.error("Error fetching signs:", error);
    }
  };

  const handleSignClick = (keyword: string) => {
    if (category) {
      navigate(`/library/admin/${category}/${keyword}`);
    }
  };

  const resetForm = () => {
    setFormData({
      category_name: "",
      category_thumbnail: null,
    });

    setSignFormData({
      thumbnail: null,
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function editSign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (signtoupdate === null) return;

    if (!signformData.thumbnail) {
      toast.error(t("signThumbnailRequired"));
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    if (signformData.thumbnail) {
      data.append("image", signformData.thumbnail);
    } else {
      data.append("imageURL", "");
    }

    try {
      if (currentUser) {
        await updateSign(signtoupdate, data, currentUser);
        toast.success(t("signThumbnailSuccess"));

        // Refresh the signs data using the current category
        if (category) {
          await fetchCategorySigns(category);
        }

        // Reset form and states
        setSignFormData({ thumbnail: null });
        setResetImage(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error(t("errorUpdateSignThumbnail"));
    } finally {
      setOpenUpdateSignConfirm(false);
      setIsSubmitting(false);
    }
  }

  const [showBackToTop, setShowBackToTop] = useState(false);

  // Add scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.library}>
      <div className="signs">
        <div className={styles.signBox}>
          <div className={styles.titleBack2}>
            <Button
              className={styles.backContainer}
              onClick={() => {
                navigate("/library/admin");
                resetSearch();
              }}
            >
              <div className={styles.backButton} />
            </Button>
            <Typography className={styles.signHeader} variant="h4" gutterBottom>
              {category}
            </Typography>
          </div>
          <div className={styles.searchBarWrapper}>
            <input
              className={styles.searchBar}
              type="text"
              placeholder="Search by keyword..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <span className={styles.separator}>|</span>
            <button
              className={styles.resetButton}
              aria-label="Close"
              onClick={resetSearch}
            >
              <Cross2Icon className={styles.resetIcon} />
            </button>
          </div>
        </div>
        <Grid className={styles.grid1} container spacing={8}>
          {filteredSigns.map((sign, index) => (
            <Grid
              className={styles.grid2}
              key={index}
              item
              xs={24}
              sm={6}
              md={4}
              lg={3}
            >
              <Card
                className={styles.card}
                onClick={() => handleSignClick(sign.keyword)}
              >
                <CardContent className={styles.cardContent}>
                  <div className={styles.categoryImg}>
                    <img
                      src={sign.thumbnail || "/images/signImages/medical.png"}
                      alt={sign.keyword}
                      style={{ maxWidth: "100%" }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/signImages/medical.png";
                      }}
                    />
                    <div className={styles.categoryText}>
                      <p>{sign.keyword}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className={styles.buttonAdmin}>
                <button
                  className={`${styles.actionButton} ${styles.updateSignButton}`}
                  onClick={() => {
                    setsigntoupdate(sign.signId);
                    setOpenUpdateSignConfirm(true);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* Move Dialog outside of the map function */}
        <Dialog
          className={styles.dialog_overlay}
          open={openUpdateSignConfirm}
          onClose={() => setOpenUpdateSignConfirm(false)}
        >
          <DialogContent className={styles.dialog_content3}>
            <DialogTitle className={styles.dialog_title}>
              {t("updateSignThumbnail")}
            </DialogTitle>
            <DialogContentText className={styles.dialog_description}>
              {t("plsUploadImage")}
            </DialogContentText>
            <form method="post" onSubmit={editSign}>
              <br /> <br /> <br />
              <fieldset className={styles.Fieldset_thumbnail}>
                <ImageInput
                  reset={resetImage}
                  onReset={handleImageReset}
                  setImageInfo={setSignThumbnail}
                />
              </fieldset>
              <div
                style={{
                  display: "flex",
                  marginTop: 75,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className={`${styles.baseButton} ${styles.saveButton}`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles.loadingSpinner}>
                      {t("saving")}...
                    </span>
                  ) : (
                    t("save_changes")
                  )}
                </button>
              </div>
            </form>
            <DialogActions>
              <button
                className={styles.icon_button}
                aria-label="Close"
                onClick={() => {
                  setOpenUpdateSignConfirm(false);
                  resetForm();
                }}
              >
                {" "}
                <Cross2Icon className={styles.icon} />
              </button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add back to top button before closing div */}
      {showBackToTop && (
        <div className={styles.back_to_top_button} onClick={scrollToTop}>
          <i className="fa-solid fa-arrow-up"></i>
        </div>
      )}
    </div>
  );
}
