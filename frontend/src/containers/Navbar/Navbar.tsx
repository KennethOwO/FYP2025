import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { useThemeStore } from "../../store/theme";
import "./Navbar.css";
import { StreamNotifications } from "../../services/notification.service";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "../../../firebase";
import { getAuth, signOut } from "firebase/auth";
import toast from "react-hot-toast";

import { useUserStore } from "@root/store/userStore";

function Navbar() {
    const navigate = useNavigate();
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);

    const { user } = useUserStore();
    const { color, updateColors } = useThemeStore();

    const { t, i18n } = useTranslation();
    const currentUser = getAuth().currentUser;
    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("i18nextLng", lang);
        closeMobileMenu();
    };

    useEffect(() => {
        const currentLang = localStorage.getItem("i18nextLng") || "en"; // Default to English
        i18n.changeLanguage(currentLang);
    }, [i18n]);

    // Function to clear user authentication status from session storage when user logs out
    const handleLogout = async () => {
        await signOut(auth).then(() => {
            localStorage.setItem("color", "#1C2E4A");
            updateColors("#1C2E4A");
            toast.success(t("logout_successful"));
            navigate("/login");
        });
    };

    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);

    // ---------- Function to show login button on small screens ----------
    const showButton = () => {
        if (window.innerWidth <= 1300) {
            setButton(false);
        } else {
            setButton(true);
        }
    };

    useEffect(() => {
        showButton();
    }, []);

    // ---------- Fetch notification counts ----------
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        let eventSourceCleanup: (() => void) | undefined;

        const setupNotificationStream = async () => {
            if (user?.user_id) {
                eventSourceCleanup = await StreamNotifications(user.user_id, count => {
                    setNotificationCount(count);
                });
            }
        };

        setupNotificationStream();

        return () => {
            if (eventSourceCleanup) {
                eventSourceCleanup();
            }
        };
    }, [user?.user_id]);

    // ---------- Listen on the weebsite screen size ----------
    window.addEventListener("resize", showButton);

    return (
        <>
            <nav className="navbar" style={{ background: color }}>
                <div className="navbar-container">
                    {/* ---------- Webiste's logo ---------- */}
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        <img src="/images/PUBLIC_LOGO.png" alt="Logo" className="navbar-logo-image" />
                    </Link>

                    {/* ---------- Hamburger menu icon (Small screen size) ---------- */}
                    <div className="menu-icon" onClick={handleClick}>
                        <i className={click ? "fas fa-times" : "fas fa-bars"} />
                    </div>

                    {/* ---------- Navbar menu ---------- */}
                    <ul className={click ? "nav-menu activate" : "nav-menu"}>
                        <li className="nav-item dropdown">
                            <label htmlFor="toggle1" className="nav-links" style={{ cursor: "pointer" }}>
                                {t("module")}
                            </label>
                            <input type="checkbox" id="toggle1" name="toggle" className="dropdown-trigger-checkbox" hidden />

                            <ul className="dropdown-menu">
                                <li>
                                    <Link to="/library" className="dropdown-link" onClick={closeMobileMenu}>
                                        {t("library")}
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/communication" className="dropdown-link" onClick={closeMobileMenu}>
                                        {t("communication")}
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/education" className="dropdown-link" onClick={closeMobileMenu}>
                                        {t("education")}
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        {user?.role_access === "signexpert" ? (
                            <li className="nav-item dropdown">
                                <label htmlFor="toggle-dataset" className="nav-links" style={{ cursor: "pointer" }}>
                                    {t("dataset_collection")}
                                </label>
                                <input type="checkbox" id="toggle-dataset" name="toggle-dataset" className="dropdown-trigger-checkbox-dataset" hidden />
                                <ul className="dropdown-menu2">
                                    <li>
                                        <Link to="/dataset-collection" className="dropdown-link" onClick={closeMobileMenu}>
                                            {t("dataset_form")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/dataset-collection-review" className="dropdown-link" onClick={closeMobileMenu}>
                                            {t("dataset_review")}
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link to="/dataset-collection" className="nav-links" onClick={closeMobileMenu}>
                                    {t("dataset_collection")}
                                </Link>
                            </li>
                        )}

                        <li className="nav-item">
                            <Link to="/feedback" className="nav-links" onClick={closeMobileMenu}>
                                {t("feedback")}
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link to="/faq" className="nav-links" onClick={closeMobileMenu}>
                                {t("faq")}
                            </Link>
                        </li>

                        <li className="nav-item dropdown">
                            <label className="nav-links" htmlFor="toggle2" style={{ cursor: "pointer" }}>
                                <Globe />
                            </label>
                            <input type="checkbox" id="toggle2" name="toggle2" className="dropdown-trigger-checkbox2" hidden />
                            <ul className="dropdown-menu3">
                                <li>
                                    <Link to="#" className="dropdown-link" onClick={() => changeLanguage("en")}>
                                        EN
                                    </Link>
                                </li>

                                <li>
                                    <Link to="#" className="dropdown-link" onClick={() => changeLanguage("bm")}>
                                        BM
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {!user ? (
                            // Render login button for users who are not logged in
                            <>
                                <div className="nav-item">
                                    <Link to="/login" className="nav-links-mobile" onClick={closeMobileMenu}>
                                        {t("login")}
                                    </Link>
                                </div>
                                {/* ---------- Login button (Small screen size) ---------- */}
                                <Link to="/login" className="btn-mobile">
                                    {button && (
                                        <Button type="button" onClick={closeMobileMenu} buttonStyle="btn--outline" buttonSize="btn--mobile">
                                            {t("login")}
                                        </Button>
                                    )}
                                </Link>
                            </>
                        ) : (
                            // Render profile and notifications icons for logged-in users
                            <>
                                <li className="nav-item">
                                    <Link to="/notifications" className="nav-links notification" onClick={closeMobileMenu}>
                                        <div className="notification-icon-container">
                                            <i className="fas fa-bell" />
                                            {notificationCount > 0 && <span className="notification-count">{notificationCount}</span>}
                                        </div>
                                    </Link>
                                </li>

                                <li className="nav-item dropdown">
                                    <img src={user?.picture} referrerPolicy="no-referrer" alt="Profile" className="profileimg" />

                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link to="/profile" className="dropdown-link" onClick={closeMobileMenu}>
                                                {user?.username}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/login" className="dropdown-link" onClick={handleLogout}>
                                                {t("logout")}
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
