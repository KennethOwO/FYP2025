import { Link } from "react-router-dom";
import { useThemeStore } from "../../store/theme";
import styles from "./Footer.module.css";
import { useTranslation } from "react-i18next";

function Footer() {
    const { color } = useThemeStore();
    const { t } = useTranslation();

    return (
        <div className={styles.footer_container} style={{ background: color }}>
            <div className={styles.footer_links}>
                <div className={styles.footer_link_wrapper}>
                    <div className={styles.footer_link_items}>
                        <h2>Sign Bridge</h2>
                        <Link to="/under-construction">{t("how_it_works")}</Link>
                        <Link to="/under-construction">{t("testimonials")}</Link>
                        <Link to="/under-construction">{t("careers")}</Link>
                        <Link to="/under-construction">{t("investors")}</Link>
                        <Link to="/under-construction">{t("terms_of_service")}</Link>
                        <Link to="/references">{t("references")}</Link>
                    </div>
                    <div className={styles.footer_link_items}>
                        <h2>{t("contact_us")}</h2>
                        <Link to="/under-construction">{t("contact")}</Link>
                        <Link to="/under-construction">{t("support")}</Link>
                        <Link to="/under-construction">{t("destinations")}</Link>
                        <Link to="/under-construction">{t("sponsorship")}</Link>
                    </div>
                </div>
                <div className={styles.footer_link_wrapper}>
                    <div className={styles.footer_link_items}>
                        <h2>{t("modules")}</h2>
                        <Link to="/library">{t("library")}</Link>
                        <Link to="/communication">{t("communication")}</Link>
                        <Link to="/education">{t("education")}</Link>
                    </div>
                    <div className={styles.footer_link_items}>
                        <h2>{t("social_media")}</h2>
                        <Link to="https://www.facebook.com/neuon.ai.my" target="_blank" rel="noopener noreferrer">
                            Facebook
                        </Link>
                        <Link to="https://www.linkedin.com/company/neuon-ai/" target="_blank" rel="noopener noreferrer">
                            LinkedIn
                        </Link>
                        <Link to="https://www.youtube.com/@neuonai3999" target="_blank" rel="noopener noreferrer">
                            Youtube
                        </Link>
                        <Link to="https://github.com/neuonai" target="_blank" rel="noopener noreferrer">
                            GitHub
                        </Link>
                        <Link to="https://www.pinterest.com/neuon_ai/_created/" target="_blank" rel="noopener noreferrer">
                            Pinterest
                        </Link>
                    </div>
                </div>
            </div>
            <section className={styles.social_media}>
                <div className={styles.social_media_wrap}>
                    <small className={styles.website_rights}>{t("copyright")}</small>
                    <div className={styles.social_icons}>
                        <Link className={styles.social_icon_link} to="https://www.facebook.com/neuon.ai.my" target="_blank" aria-label="Facebook">
                            <i className={`fab fa-facebook-f ${styles.footer_icon}`} />
                        </Link>
                        <Link className={styles.social_icon_link} to="https://www.linkedin.com/company/neuon-ai/" target="_blank" aria-label="LinkedIn">
                            <i className={`fab fa-linkedin ${styles.footer_icon}`} />
                        </Link>
                        <Link className={styles.social_icon_link} to="https://www.youtube.com/@neuonai3999" target="_blank" aria-label="Youtube">
                            <i className={`fab fa-youtube ${styles.footer_icon}`} />
                        </Link>
                        <Link className={styles.social_icon_link} to="https://github.com/neuonai" target="_blank" aria-label="GitHub">
                            <i className={`fa-brands fa-github ${styles.footer_icon}`} />
                        </Link>
                        <Link className={styles.social_icon_link} to="https://www.pinterest.com/neuon_ai/_created/" target="_blank" aria-label="Twitter">
                            <i className={`fa-brands fa-pinterest ${styles.footer_icon}`} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Footer;
