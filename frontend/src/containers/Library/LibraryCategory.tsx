import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { fetchSign } from "../../services/library.service";
import styles from "./Admin/LibraryAdmin.module.css";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

interface LibrarySigns {
    keyword: string;
    animations: Array<string>;
    contributor: string;
    thumbnail: string;
}

export default function LibraryCategory() {
    const { t, i18n } = useTranslation();
    const [signs, setSigns] = useState<LibrarySigns[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const navigate = useNavigate();
    const { category } = useParams();

    useEffect(() => {
        // console.log("Current category param:", category);
        if (category) {
            fetchCategorySigns(category);
        }
    }, [category]);

    const resetSearch = () => {
        setSearchKeyword("");
    };

    const filteredSigns = searchKeyword.trim() === "" ? signs : signs.filter(sign => sign.keyword.toLowerCase().includes(searchKeyword.toLowerCase()));

    const fetchCategorySigns = async (categoryName: string) => {
        try {
            const data = await fetchSign(categoryName);
            // console.log("fetched", data);
            setSigns(data);
        } catch (error) {
            console.error("Error fetching signs:", error);
        }
    };

    const handleSignClick = (keyword: string) => {
        if (category) {
            navigate(`/library/${category}/${keyword}`);
        }
    };

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
        <div className="signs">
            <div className={styles.signBox}>
                <div className={styles.titleBack2}>
                    <Button
                        className={styles.backContainer}
                        onClick={() => {
                            navigate("/library");
                            resetSearch();
                        }}>
                        <div className={styles.backButton} />
                    </Button>
                    <Typography className={styles.signHeader} variant="h4" gutterBottom>
                        {category}
                    </Typography>
                </div>
                <div className={styles.searchBarWrapper}>
                    <input className={styles.searchBar} type="text" placeholder="Search by keyword..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
                    <span className={styles.separator}>|</span>
                    <button className={styles.resetButton} aria-label="Close" onClick={resetSearch}>
                        <Cross2Icon className={styles.resetIcon} />
                    </button>
                </div>
            </div>
            <Grid className={styles.grid1} container spacing={8}>
                {filteredSigns.map((sign, index) => (
                    <Grid className={styles.grid2} key={index} item xs={24} sm={6} md={4} lg={3}>
                        <Card className={styles.card} onClick={() => handleSignClick(sign.keyword)}>
                            <CardContent className={styles.cardContent}>
                                <div className={styles.categoryImg}>
                                    <img
                                        src={sign.thumbnail || "/images/signImages/medical.png"}
                                        alt={sign.keyword}
                                        style={{ maxWidth: "100%" }}
                                        onError={e => {
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
                    </Grid>
                ))}
            </Grid>
            {/* Add back to top button before closing div */}
            {showBackToTop && (
                <div className={styles.back_to_top_button} onClick={scrollToTop}>
                    <i className="fa-solid fa-arrow-up"></i>
                </div>
            )}
        </div>
    );
}
