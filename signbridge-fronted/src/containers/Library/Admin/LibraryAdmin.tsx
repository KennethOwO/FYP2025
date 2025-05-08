import React, { useState, useEffect } from "react";
import styles from "./LibraryAdmin.module.css";
import {
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"; // Import Material-UI components
import {
  fetchCat,
  createCat,
  updateCat,
  deleteCat,
} from "../../../services/library.service";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { Cross2Icon } from "@radix-ui/react-icons";
import InputField from "../../../components/InputField/InputField";
import ImageInput from "../../../components/ImageInput/ImageInput";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";

interface LibraryCategories {
  category_name: string;
  category_thumbnail: string;
  category_id: number;
}

export default function LibraryAdmin() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<LibraryCategories[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // State for delete confirmation dialog
  const [openUpdateConfirm, setOpenUpdateConfirm] = useState(false); // State for update confirmation dialog
  const [cattodelete, setcattodelete] = useState<number | null>(0);
  const [cattoupdate, setcattoupdate] = useState<number | null>(0);
  const [open, setOpen] = useState(false);
  const [resetImage, setResetImage] = useState(false);
  const navigate = useNavigate();

  const currentUser = getAuth().currentUser;

  const [formData, setFormData] = useState({
    category_name: "",
    category_thumbnail: null as string | null,
  });

  const handleUpdateCategory = (category: LibraryCategories) => {
    setFormData({
      category_name: category.category_name,
      category_thumbnail: category.category_thumbnail,
    });
    setcattoupdate(category.category_id);
    setOpenUpdateConfirm(true);
  };

  const [signformData, setSignFormData] = useState({
    thumbnail: null,
  });

  const setCategoryThumbnail = (image: any) => {
    setFormData({ ...formData, category_thumbnail: image });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await fetchCat();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleImageReset = () => {
    setResetImage(false);
  };

  const handleCategoryClick = async (categoryName: string) => {
    try {
      setSelectedCategory(categoryName);
      // console.log("categoryName", categoryName);
      navigate(`/library/admin/${categoryName}`);
    } catch (error) {
      console.error("Error fetching signs:", error);
    }
  };

  const confirmDeleteCategory = async () => {
    if (cattodelete === null) return;
    try {
      if (currentUser) {
        await deleteCat(cattodelete, currentUser);
        toast.success(t("deleteCategorySuccess"));
        await fetchCategories();
      }
    } catch (error) {
      toast.error(t("errorDeleteCategory"));
    } finally {
      setOpenDeleteConfirm(false);
      setcattodelete(null);
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

  async function addCat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.category_name.trim()) {
      toast.error(t("categoryNameRequired"));
      return;
    }

    if (!formData.category_thumbnail) {
      toast.error(t("categoryImageRequired"));
      return;
    }

    setIsSubmitting(true); // Start loading
    const data = new FormData();
    data.append("category_name", formData.category_name);
    if (formData.category_thumbnail) {
      data.append("image", formData.category_thumbnail);
    } else {
      data.append("imageURL", "");
    }

    try {
      if (currentUser) {
        await createCat(data, currentUser);
        toast.success(t("categoryCreatedSuccess"));
        await fetchCategories();
      }
    } catch (error) {
      toast.error(t("errorCreateCategory"));
    } finally {
      setIsSubmitting(false); // End loading
      setOpen(false);
      resetForm();
    }
  }

  async function editCat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cattoupdate === null) return;
    if (!formData.category_name.trim()) {
      toast.error(t("categoryNameRequired"));
      return;
    }

    setIsSubmitting(true); // Start loading
    const data = new FormData();
    data.append("category_name", formData.category_name);

    if (
      formData.category_thumbnail &&
      typeof formData.category_thumbnail !== "string"
    ) {
      data.append("image", formData.category_thumbnail);
    } else {
      data.append("imageURL", formData.category_thumbnail || "");
    }

    try {
      if (currentUser) {
        await updateCat(cattoupdate, data, currentUser);
        toast.success(t("categoryUpdatedSuccess"));
        await fetchCategories();
        setOpenUpdateConfirm(false);
        resetForm();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(t("errorUpdateCategory"));
    } finally {
      setIsSubmitting(false); // End loading
    }
  }

  return (
    <div className={styles.library}>
      <div className={styles.imageHeader}>
        <img src="/images/lib.png" alt="Library" className={styles.libImage} />
      </div>
      <div className={styles.buttonContainer}>
        <button
          className={styles.addCategoryButton}
          onClick={() => setOpen(true)}
        >
          {t("addCategory")}
        </button>
      </div>
      <Grid className={styles.grid1} container spacing={8}>
        {categories.map((category) => (
          <Grid
            className={styles.grid2}
            key={category.category_id}
            item
            xs={24}
            sm={6}
            md={4}
            lg={3}
          >
            <Card
              className={styles.card}
              onClick={() => handleCategoryClick(category.category_name)}
            >
              <CardContent className={styles.cardContent}>
                <div className={styles.categoryImg}>
                  <img
                    src={
                      category.category_thumbnail ||
                      "/images/signImages/medical.png"
                    }
                    alt={category.category_name}
                    style={{ maxWidth: "100%" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/signImages/medical.png";
                    }}
                  />
                  <div className={styles.categoryText}>
                    <p>{category.category_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className={styles.buttonAdmin}>
              <button
                className={`${styles.actionButton} ${styles.dltCatButton}`}
                onClick={() => {
                  setcattodelete(category.category_id);
                  setOpenDeleteConfirm(true); // Open the delete confirmation dialog
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <button
                className={`${styles.actionButton} ${styles.updateCatButton}`}
                onClick={() => {
                  handleUpdateCategory(category);
                  setcattoupdate(category.category_id);
                  setOpenUpdateConfirm(true);
                }}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* Delete confirmation dialog */}
      <Dialog
        className={styles.dialog_overlay}
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
      >
        <DialogContent className={styles.dialog_content2}>
          <DialogTitle className={styles.dialog_title}>
            {t("confirmDelete")}
          </DialogTitle>
          <DialogContentText className={styles.dialog_description2}>
            {t("sureDelete")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div className={styles.buttonsConfirmation}>
            <button
              className={`${styles.baseButton} ${styles.noButton}`}
              onClick={() => setOpenDeleteConfirm(false)}
            >
              {t("no")}
            </button>
            <button
              className={`${styles.baseButton} ${styles.yesButton}`}
              onClick={confirmDeleteCategory}
            >
              {t("yes")}
            </button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Update confirmation dialog */}
      <Dialog
        className={styles.dialog_overlay}
        open={openUpdateConfirm}
        onClose={() => setOpenUpdateConfirm(false)}
      >
        <DialogContent className={styles.dialog_content}>
          <DialogTitle className={styles.dialog_title}>
            {t("updateCategory")}
          </DialogTitle>
          <DialogContentText className={styles.dialog_description}>
            {t("please_fill")}
          </DialogContentText>
          <form method="post" onSubmit={editCat}>
            <fieldset className={styles.Fieldset_name}>
              <InputField
                label="Category Name"
                name="category_name"
                value={formData.category_name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    category_name: e.target.value,
                  });
                }}
                error=""
              />
            </fieldset>
            <fieldset className={styles.Fieldset_thumbnail}>
              <ImageInput
                reset={resetImage}
                onReset={handleImageReset}
                setImageInfo={setCategoryThumbnail}
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
                setOpenUpdateConfirm(false);
                resetForm(); // Reset the form details
              }}
            >
              {" "}
              <Cross2Icon className={styles.icon} />
            </button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <div>
        <Dialog
          className={styles.dialog_overlay}
          open={open}
          onClose={() => setOpen(false)}
        >
          <DialogContent className={styles.dialog_content}>
            <DialogTitle className={styles.dialog_title}>
              {t("createCategory")}
            </DialogTitle>
            <DialogContentText className={styles.dialog_description}>
              {t("please_fill")}
            </DialogContentText>
            <form method="post" onSubmit={addCat}>
              <fieldset className={styles.Fieldset_name}>
                <InputField
                  label="Category Name"
                  name="category_name"
                  value={formData.category_name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      category_name: e.target.value,
                    });
                  }}
                  error=""
                />
              </fieldset>
              <fieldset className={styles.Fieldset_thumbnail}>
                <ImageInput
                  reset={resetImage}
                  onReset={handleImageReset}
                  setImageInfo={setCategoryThumbnail}
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
                  setOpen(false);
                  resetForm(); // Reset the form details
                }}
              >
                {" "}
                <Cross2Icon className={styles.icon} />
              </button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
