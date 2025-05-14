import "./App.css";
import Navbar from "./containers/Navbar/Navbar";
import Footer from "./containers/Footer/Footer";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./containers/Home/Home";
import DeafMode from "./containers/DeafMode/DeafMode" //Additonal Deaf Mode Part
import Library from "./containers/Library/Library";
import LibraryCategory from "./containers/Library/LibraryCategory";
import LibrarySign from "./containers/Library/LibrarySign";
import Communication from "./containers/Communication/Communication";
import Education from "./containers/Education/Education";
import DataCollectionPublic from "./containers/DataCollection/Public/DataCollectionPublic";
import DatasetReviewAdmin from "./containers/DataCollection/Admin/DatasetReviewAdmin";
import DatasetReviewSE from "./containers/DataCollection/SignExpert/DatasetReviewSE/DatasetReviewSE";
import DatasetCollectionSE from "./containers/DataCollection/SignExpert/DatasetCollection/DatasetCollectionSE";
import Feedback from "./containers/Feedback/Feedback";
import Faq from "./containers/Faq/Faq";
import Notification from "./containers/Notification/Notification";
import Login from "./containers/Login/Login";
import SignUp from "./containers/SignUp/SignUp";
import ForgotPassword from "./containers/Login/ForgotPwd/ForgotPassword";
import ResetPassword from "./containers/Login/ResetPwd/ResetPassword";
import React, { useEffect, useState } from "react";
import HomeLayout from "./HomeLayout";
import ForgotResetPasswordLayout from "./ForgotResetPasswordLayout";
import toast, { Toaster } from "react-hot-toast";
import GuessTheWord from "./containers/Education/Game/GuessTheWord";
import DoTheSign from "./containers/Education/Game/DoTheSign";
// import DataCollectionReview from "./containers/DataCollection/Admin/DataCollectionReview";
import FeedbackAdmin from "./containers/Feedback/Admin/FeedbackAdmin";
import FeedbackSuccess from "./containers/Feedback/FeedbackSuccess";
import FaqAdmin from "./containers/Faq/Admin/FaqAdmin";
import ProfilePage from "./containers/ProfilePage/ProfilePage";
import LibraryAdmin from "./containers/Library/Admin/LibraryAdmin";
import LibraryAdminCategory from "./containers/Library/Admin/LibraryAdminCategory";
import LibraryAdminSign from "./containers/Library/Admin/LibraryAdminSign";
import References from "./containers/References/References";
import PageNotFound from "./containers/PageNotFound/PageNotFound";
import PageUnderConstruction from "./containers/PageUnderConstruction/PageUnderConstruction";
import InternalServerError from "./containers/InternalServerError/InternalServerError";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import resources from "./i18n";

import { COLOR_ROLE_ACCESS } from "./constants/account.constant";
import { useThemeStore } from "@root/store/theme";
// @ts-ignore
import { auth } from "../firebase";
import { User } from "firebase/auth";
import { GetUserByEmail, FetchAllUsers } from "@root/services/account.service";

import { useUserStore } from "@root/store/userStore";
import useNetworkStatus from "@root/hook/useNetworkStatus";
import axios from "axios";

i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
});
function App() {
    const { isOnline } = useNetworkStatus();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { color, updateColors } = useThemeStore();
    const [loading, setLoading] = useState(true);
    const { user, setUser, removeUser } = useUserStore();

    useEffect(() => {
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    toast.error("Unauthorized");
                }
                return Promise.reject(error);
            }
        );
    }, []);

    useEffect(() => {
        const unsubcribe = auth.onAuthStateChanged(async (user: User | null) => {
            if (user && user.emailVerified) {
                const result = await GetUserByEmail(user.email, user);
                setUser(result.data);
                if (result.data.role_access === "admin") {
                    updateColors(COLOR_ROLE_ACCESS.admin.color);
                } else if (result.data.role_access === "signexpert") {
                    updateColors(COLOR_ROLE_ACCESS.signexpert.color);
                } else {
                    updateColors(COLOR_ROLE_ACCESS.public.color);
                }
            } else {
                updateColors(COLOR_ROLE_ACCESS.public.color);
                removeUser();
            }
            setLoading(false);
        });

        return () => {
            unsubcribe();
        };
    }, []);

    const [feedbackComponent, setFeedbackComponent] = useState<React.ReactNode>();
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setFeedbackComponent(<FeedbackAdmin />);
                break;
            case "signexpert":
                setFeedbackComponent(<Feedback />);
                break;
            default:
                setFeedbackComponent(<Feedback />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    const [faqComponent, setFaqComponent] = useState<React.ReactNode>(<Faq />);
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setFaqComponent(<FaqAdmin />);
                break;
            case "signexpert":
                setFaqComponent(<Faq />);
                break;
            default:
                setFaqComponent(<Faq />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    const [datasetComponent, setDatasetComponent] = useState<React.ReactNode>(<DataCollectionPublic />);
    const [datasetReviewComponent, setDatasetReviewComponent] = useState<React.ReactNode>();
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setDatasetComponent(<DatasetReviewAdmin />);
                break;
            case "signexpert":
                setDatasetComponent(<DatasetCollectionSE />);
                setDatasetReviewComponent(<DatasetReviewSE />);
                break;
            default:
                setDatasetComponent(<DataCollectionPublic />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    const [libraryComponent, setLibraryComponent] = useState<React.ReactNode>();
    useEffect(() => {
        switch (user?.role_access) {
            case "admin":
                setLibraryComponent(<LibraryAdmin />);
                break;
            case "signexpert":
                setLibraryComponent(<Library />);
                break;
            default:
                setLibraryComponent(<Library />);
                break;
        }
    }, [user?.role_access, location.pathname]);

    useEffect(() => {
        if (location.pathname !== "/education" && location.pathname !== "/guess-the-word" && location.pathname !== "/do-the-sign") {
            const localVolumeValue = localStorage.getItem("volumeValue");
            if (localVolumeValue) {
                localStorage.setItem("volumeValue", "100");
            }
        }

        if (location.pathname !== "/guess-the-word") {
            sessionStorage.removeItem("guessLives");
            sessionStorage.removeItem("guessCurrentLevel");
            sessionStorage.removeItem("guessQuestionList");
            sessionStorage.removeItem("guessScore");
        }

        if (location.pathname !== "/do-the-sign") {
            sessionStorage.removeItem("doTheSignLives");
            sessionStorage.removeItem("doTheSignCurrentLevel");
            sessionStorage.removeItem("doTheSignScore");
            sessionStorage.removeItem("doTheSignHintUsedCount");
            sessionStorage.removeItem("animationKeyword");
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!loading) {
            if (location.pathname === "/notifications") {
                if (!user?.role_access) {
                    toast.error(t("unauthorized_access"));
                    navigate("/login");
                }
            }
        }
    }, [user?.role_access, location.pathname, loading, navigate]);

    useEffect(() => {
        if (!loading) {
            if (location.pathname === "/profile") {
                if (!user?.role_access) {
                    toast.error(t("unauthorized_access"));
                    navigate("/login");
                }
            }
        }
    }, [user?.role_access, location.pathname, loading, navigate]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [location.pathname]);

    return (
        <>
            <Toaster />
            {loading ? (
                <div className="loading_wrapper">
                    <div className="loading_circle"></div>
                    <div className="loading_circle"></div>
                    <div className="loading_circle"></div>
                    <div className="loading_shadow"></div>
                    <div className="loading_shadow"></div>
                    <div className="loading_shadow"></div>
                    <span>Loading</span>
                </div>
            ) : (
                <>
                    {isOnline ? (
                        <Routes>
                            <Route path="/under-construction" element={<PageUnderConstruction />} />

                            <Route path="*" element={<PageNotFound />} />
                            {/* <Route path="/loading" element={<><div className="loading_wrapper">
									<div className="loading_circle"></div>
									<div className="loading_circle"></div>
									<div className="loading_circle"></div>
									<div className="loading_shadow"></div>
									<div className="loading_shadow"></div>
									<div className="loading_shadow"></div>
									<span>Loading</span>
								</div></>} /> */}
                            <Route element={<HomeLayout />}>
                                <Route path="/" element={<Home />} />
                                <Route path="/library" element={libraryComponent} />
                                <Route path="/library/:category" element={<LibraryCategory />} />
                                <Route path="/library/:categoryName/:signKeyword" element={<LibrarySign />} />
                                <Route path="/library/admin" element={<LibraryAdmin />} />
                                <Route path="/library/admin/:category" element={<LibraryAdminCategory />} />
                                <Route path="/library/admin/:categoryName/:signKeyword" element={<LibraryAdminSign />} />
                                <Route path="/communication" element={<Communication />} />
                                <Route path="/education" element={<Education />} />
                                <Route path="/dataset-collection" element={datasetComponent} />
                                <Route path="/dataset-collection-review" element={datasetReviewComponent} />
                                <Route path="/feedback" element={feedbackComponent} />
                                <Route path="/faq" element={faqComponent} />
                                <Route path="/notifications" element={<Notification />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/sign-up" element={<SignUp />} />
                                <Route path="/guess-the-word" element={<GuessTheWord />} />
                                <Route path="/do-the-sign" element={<DoTheSign />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/references" element={<References />} />
                                <Route path="/dataset-collection" element={<DataCollectionPublic />} />
                                <Route path="/deaf-mode" element={<DeafMode />} />
                                {/* Add more routes here */}
                            </Route>
                            <Route element={<ForgotResetPasswordLayout />}>
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/feedback-success" element={<FeedbackSuccess />} />
                            </Route>
                        </Routes>
                    ) : (
                        <>
                            <Navbar />
                            <div className="page-container">
                                <InternalServerError />
                            </div>
                            <Footer />
                        </>
                    )}
                </>
            )}
        </>
    );
}

export default App;