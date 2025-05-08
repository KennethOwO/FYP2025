import { useState, useEffect } from "react";
import { Card, CardContent, Grid } from "@mui/material"; // Import Material-UI components
import { fetchCat } from "../../services/library.service";
import styles from "./Admin/LibraryAdmin.module.css";
import { useNavigate } from "react-router-dom";

interface LibraryCategories {
  category_name: string;
  category_thumbnail: string;
  category_id: number;
}

export default function Library() {
  const [categories, setCategories] = useState<LibraryCategories[]>([]);
  const navigate = useNavigate();

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

  const handleCategoryClick = async (categoryName: string) => {
    try {
      // console.log("lal", categoryName);
      // navigate to the category page
      navigate(`/library/${categoryName}`);
    } catch (error) {
      console.error("Error fetching signs:", error);
    }
  };

  return (
    <div className={styles.library}>
      <div className={styles.imageHeader}>
        <img src="./images/lib.png" alt="Library" className={styles.libImage} />
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
                    src={category.category_thumbnail}
                    alt={category.category_name}
                    style={{ maxWidth: "100%" }}
                  />
                  <div className={styles.categoryText}>
                    <p>{category.category_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
