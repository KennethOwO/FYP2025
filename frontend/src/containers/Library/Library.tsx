import { useState, useEffect } from "react";
import { Card, CardContent, Grid } from "@mui/material";
import { fetchCat } from "../../services/library.service";
import styles from "./Admin/LibraryAdmin.module.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

interface LibraryCategories {
  category_name: string;
  category_thumbnail: string;
  category_id: number;
}

export default function Library() {
  const [categories, setCategories] = useState<LibraryCategories[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
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

  const resetSearch = () => {
    setSearchKeyword("");
  };

  const filteredCategories =
    searchKeyword.trim() === ""
      ? categories
      : categories.filter((cat) =>
        cat.category_name.toLowerCase().includes(searchKeyword.toLowerCase())
      );

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/library/${categoryName}`);
  };

  return (
    <div className={styles.library}>
      <div className={styles.imageHeader}>
        <img src="./images/lib.png" alt="Library" className={styles.libImage} />
      </div>

      <div className={styles.searchBarContainer1}>
        <div className={styles.searchBarWrapper}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Search by category..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <span className={styles.separator}>|</span>
          <button className={styles.resetButton} aria-label="Clear" onClick={resetSearch}>
            <Cross2Icon className={styles.resetIcon} />
          </button>
        </div>
      </div>


      {/* Category grid */}
      <Grid className={styles.grid1} container spacing={8}>
        {filteredCategories.map((category) => (
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
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
