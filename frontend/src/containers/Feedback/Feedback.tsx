import style from "./Feedback.module.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import RatingEmoji from "../../components/RatingEmoji/RatingEmoji";
import ImageInput from "../../components/ImageInput/ImageInput";
import { CreateFeedback } from "../../services/feedback.service";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATION_API_KEY;
const API_URL = import.meta.env.VITE_GOOGLE_TRANSLATION_API_URL;

const translateText = async (text: string, targetLanguage: "ms" | "en") => {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
        q: text,
        target: targetLanguage,
    });

    return response.data.data.translations[0].translatedText;
};

const Feedback = () => {
    const currentSelectedLanguage = localStorage.getItem("i18nextLng") || "en";
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
        gender: "male",
        race: "",
        email: "",
        fcategory: "Whole Website",
        experience: 5,
        friendliness: 5,
        quality: 5,
        recommended: 5,
        question1: "",
        question2: "",
        question3: "",
        screenshot: null,
    });

    const [formErrors, setFormErrors] = useState({
        firstName: "",
        lastName: "",
        age: "",
        race: "",
        email: "",
        fcategory: "",
    });

    const questionMapping = {
        "Whole Website": {
            question1: t("website_question1"),
            question2: t("website_question2"),
            question3: t("website_question3"),
        },
        "Game 1": {
            question1: t("game1_question1"),
            question2: t("game1_question2"),
            question3: t("game1_question3"),
        },
        "Game 2": {
            question1: t("game2_question1"),
            question2: t("game2_question2"),
            question3: t("game2_question3"),
        },
    };

    // ---------- Dropdown Control ----------
    const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);

    // Add useRef for the dropdown
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleDropdownClick = () => {
        setIsOpenDropdown(!isOpenDropdown);
    };

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpenDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ---------- Image Control ----------
    const [imageInfo, setImageInfo] = useState(null);
    const [resetImage, setResetImage] = useState(false);

    const setImage = (image: any) => {
        setFormData({ ...formData, screenshot: image });
    };

    const handleImageReset = () => {
        setResetImage(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let isValid = true;

        if (isValid) {
            if (type === "radio" && name === "gender") {
                setFormData({ ...formData, gender: value });
            } else if (type === "radio") {
                setFormData({ ...formData, [name]: parseInt(value) });
            } else {
                setFormData({ ...formData, [name]: value });
            }
        }

        switch (name) {
            case "firstName":
                isValid = validateFirstName(value);
                break;
            case "lastName":
                isValid = validateLastName(value);
                break;
            case "age":
                isValid = validateAge(value);
                break;
            case "race":
                isValid = validateRace(value);
                break;
            case "email":
                isValid = validateEmail(value);
                break;
            default:
                break;
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCategory = e.target.value;
        setFormData({ ...formData, fcategory: selectedCategory });
    };

    // ---------- Validations ----------
    const validateFirstName = (value: string) => {
        if (!value.trim()) {
            setFormErrors((prev) => ({
                ...prev,
                firstName: t("firstname_required"),
            }));
            return false;
        } else if (value.length < 3) {
            setFormErrors((prev) => ({
                ...prev,
                firstName: t("firstname_length"),
            }));
            return false;
        }
        setFormErrors((prev) => ({ ...prev, firstName: "" }));
        return true;
    };

    const validateLastName = (value: string) => {
        if (!value.trim()) {
            setFormErrors((prev) => ({
                ...prev,
                lastName: t("lastname_required"),
            }));
            return false;
        } else if (value.length < 3) {
            setFormErrors((prev) => ({
                ...prev,
                lastName: t("lastname_length"),
            }));
            return false;
        }
        setFormErrors((prev) => ({ ...prev, lastName: "" }));
        return true;
    };

    const validateAge = (value: string) => {
        if (!value) {
            setFormErrors((prev) => ({ ...prev, age: t("age_required") }));
            return false;
        } else if (+value < 2 || +value > 150 || isNaN(+value)) {
            setFormErrors((prev) => ({ ...prev, age: t("age_length") }));
            return false;
        }
        setFormErrors((prev) => ({ ...prev, age: "" }));
        return true;
    };

    const validateRace = (value: string) => {
        const lettersRegex = /^[a-zA-Z]+$/;

        if (!value.trim()) {
            setFormErrors((prev) => ({ ...prev, race: t("race_required") }));
            return false;
        } else if (!lettersRegex.test(value)) {
            setFormErrors((prev) => ({ ...prev, race: t("race_letter") }));
            return false;
        } else if (value.length < 3) {
            setFormErrors((prev) => ({ ...prev, race: t("race_length") }));
            return false;
        } else {
            setFormErrors((prev) => ({ ...prev, race: "" }));
            return true;
        }
    };

    const validateEmail = (value: string) => {
        const emailRegex = /\S+@\S+\.\S+/;
        if (!value.trim()) {
            setFormErrors((prev) => ({ ...prev, email: t("email_required") }));
            return false;
        } else if (!emailRegex.test(value)) {
            setFormErrors((prev) => ({ ...prev, email: t("email_invalid") }));
            return false;
        }
        setFormErrors((prev) => ({ ...prev, email: "" }));
        return true;
    };

    // ---------- Handle form submission ----------
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const isFirstNameValid = validateFirstName(formData.firstName);
        const isLastNameValid = validateLastName(formData.lastName);
        const isAgeValid = validateAge(formData.age);
        const isRaceValid = validateRace(formData.race);
        const isEmailValid = validateEmail(formData.email);

        if (isFirstNameValid && isLastNameValid && isAgeValid && isEmailValid && isRaceValid) {
            const data = new FormData();
            data.append("firstName", formData.firstName);
            data.append("lastName", formData.lastName);
            data.append("age", formData.age!);
            data.append("gender", formData.gender);
            data.append("race", formData.race);
            data.append("email", formData.email);
            data.append("fcategory", formData.fcategory);
            data.append("experience", formData.experience.toString());
            data.append("friendliness", formData.friendliness.toString());
            data.append("quality", formData.quality.toString());
            data.append("recommended", formData.recommended.toString());

            if (formData.question1) {
                if (currentSelectedLanguage === "en") {
                    const translatedText = await translateText(formData.question1, "ms");
                    data.append("question1_bm", translatedText);
                    data.append("question1_en", formData.question1);
                } else if (currentSelectedLanguage === "bm") {
                    const translatedText = await translateText(formData.question1, "en");
                    data.append("question1_en", translatedText);
                    data.append("question1_bm", formData.question1);
                }
            } else {
                data.append("question1_en", "");
                data.append("question1_bm", "");
            }

            if (formData.question2) {
                if (currentSelectedLanguage === "en") {
                    const translatedText = await translateText(formData.question2, "ms");
                    data.append("question2_bm", translatedText);
                    data.append("question2_en", formData.question2);
                } else if (currentSelectedLanguage === "bm") {
                    const translatedText = await translateText(formData.question2, "en");
                    data.append("question2_en", translatedText);
                    data.append("question2_bm", formData.question2);
                }
            } else {
                data.append("question2_en", "");
                data.append("question2_bm", "");
            }

            if (formData.question3) {
                if (currentSelectedLanguage === "en") {
                    const translatedText = await translateText(formData.question3, "ms");
                    data.append("question3_bm", translatedText);
                    data.append("question3_en", formData.question3);
                } else if (currentSelectedLanguage === "bm") {
                    const translatedText = await translateText(formData.question3, "en");
                    data.append("question3_en", translatedText);
                    data.append("question3_bm", formData.question3);
                }
            } else {
                data.append("question3_en", "");
                data.append("question3_bm", "");
            }

            if (formData.screenshot) {
                data.append("image", formData.screenshot);
            } else {
                data.append("imageURL", "");
            }

            await CreateFeedback(data);
            handleFormReset();
            navigate("/feedback-success");

            toast.success(t("feedback_toast_success"));
        } else {
            toast.error(t("feedback_toast_error"));
        }
    };

    // ---------- Handle form reset ----------
    const handleFormReset = () => {
        setFormData({
            firstName: "",
            lastName: "",
            age: "",
            gender: "male",
            race: "",
            email: "",
            fcategory: "Whole Website",
            experience: 5,
            friendliness: 5,
            quality: 5,
            recommended: 5,
            question1: "",
            question2: "",
            question3: "",
            screenshot: null,
        });

        setResetImage(true);

        setFormErrors({
            firstName: "",
            lastName: "",
            age: "",
            race: "",
            email: "",
            fcategory: "",
        });
    };

    return (
        <>
            <div className={style.feedback_header_container}>
                <h1 className={style.feedback_heading}>{t("feedback_us")}</h1>
                <p className={style.feedback_subheading}>{t("feedback_subheading")}</p>
            </div>
            <div className={style.feedback_container}>
                {/* Feedback Form */}
                <div className={style.feedback_box}>
                    <form id="feedbackForm" onSubmit={handleSubmit}>
                        <legend className={style.feedback_legend}>{t("personal_details")}</legend>
                        <fieldset className={style.feedback_fieldset}>
                            <div className={style.feedback_row}>
                                <div className={style.feedback_input}>
                                    <label htmlFor="firstName">
                                        {t("first_name")} <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input type="text" id="firstName" data-testid="test_firstName" name="firstName" maxLength={25} value={formData.firstName} onChange={handleFormChange} />
                                    {formErrors.firstName.length > 0 && <div className={style.feedback_error}>{formErrors.firstName}</div>}
                                </div>

                                <div className={style.feedback_input}>
                                    <label htmlFor="lastName">
                                        {t("last_name")} <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input type="text" id="lastName" data-testid="test_lastName" name="lastName" maxLength={25} value={formData.lastName} onChange={handleFormChange} />
                                    {formErrors.lastName && <div className={style.feedback_error}>{formErrors.lastName}</div>}
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input}>
                                    <label>
                                        {t("age")} <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input type="text" id="age" data-testid="test_age" name="age" max={150} min={2} value={formData.age || ""} onChange={handleFormChange} />
                                    {formErrors.age && <div className={style.feedback_error}>{formErrors.age}</div>}
                                </div>

                                <div className={style.feedback_input}>
                                    <label>
                                        {t("gender")} <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <div className={style.gender}>
                                        <input type="radio" name="gender" id="male" data-testid="test_male" value="male" onChange={handleFormChange} checked={formData.gender === "male"} />
                                        <label htmlFor="male"> {t("male")}</label>
                                        <input type="radio" name="gender" data-testid="test_female" id="female" value="female" className="female" onChange={handleFormChange} />
                                        <label htmlFor="female"> {t("female")}</label>
                                    </div>
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input}>
                                    <label>
                                        {t("email_address")} <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input type="text" name="email" data-testid="test_email" id="email" value={formData.email} onChange={handleFormChange} />
                                    {formErrors.email && <div className={style.feedback_error}>{formErrors.email}</div>}
                                </div>

                                <div className={style.feedback_input}>
                                    <label>
                                        {t("race")} <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input type="text" id="race" data-testid="test_race" name="race" maxLength={15} value={formData.race} onChange={handleFormChange} />
                                    {formErrors.race && <div className={style.feedback_error}>{formErrors.race}</div>}
                                </div>
                            </div>
                        </fieldset>

                        <legend className={style.feedback_legend}>{t("ratings")}</legend>
                        <fieldset className={style.feedback_fieldset}>
                            <div className={style.feedback_row}>
                                <div ref={dropdownRef} className={`${style.feedback_input} ${isOpenDropdown ? `${style.open}` : ""}`}>
                                    <label>{t("feedback_category")}</label>
                                    <div className={style.select_wrapper}>
                                        <select id="fcategory" data-testid="test_fcategory" className={style.fcategory} onChange={handleSelectChange} onClick={handleDropdownClick} value={formData.fcategory}>
                                            {/* dropdown */}
                                            <option value="Whole Website">{t("whole_website")}</option>
                                            <option value="Game 1">{t("game1_guess_the_word")}</option>
                                            <option value="Game 2">{t("game2_do_the_sign")}</option>
                                        </select>
                                        <div className={style.arrow_down}></div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        {/* Rating Emoji */}
                        <fieldset className={style.feedback_fieldset}>
                            <div className={style.feedback_row}>
                                <div className={style.feedback_input2}>
                                    <label>{t("experience")}</label>
                                    <div className={style.rating_emojis}>
                                        <RatingEmoji type="radio" name="experience" className="super_happy" id="super-happy" value={5} onChange={handleFormChange} checked={formData.experience === 5} />
                                        <RatingEmoji type="radio" name="experience" className="happy" id="happy" value={4} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="experience" className="neutral" id="neutral" value={3} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="experience" className="sad" id="sad" value={2} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="experience" className="super_sad" id="super-sad" value={1} onChange={handleFormChange} />
                                    </div>
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input2}>
                                    <label>{t("friendliness")}</label>
                                    <div className={style.rating_emojis}>
                                        <RatingEmoji type="radio" name="friendliness" className="super_happy" id="super-happy1" value={5} onChange={handleFormChange} checked={formData.friendliness === 5} />
                                        <RatingEmoji type="radio" name="friendliness" className="happy" id="happy1" value={4} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="friendliness" className="neutral" id="neutral1" value={3} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="friendliness" className="sad" id="sad1" value={2} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="friendliness" className="super_sad" id="super-sad1" value={1} onChange={handleFormChange} />
                                    </div>
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input2}>
                                    <label>{t("quality")}</label>
                                    <div className={style.rating_emojis}>
                                        <RatingEmoji type="radio" name="quality" className="super_happy" id="super-happy2" value={5} onChange={handleFormChange} checked={formData.quality === 5} />
                                        <RatingEmoji type="radio" name="quality" className="happy" id="happy2" value={4} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="quality" className="neutral" id="neutral2" value={3} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="quality" className="sad" id="sad2" value={2} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="quality" className="super_sad" id="super-sad2" value={1} onChange={handleFormChange} />
                                    </div>
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input2}>
                                    <label>{t("recommended")}</label>
                                    <div className={style.rating_emojis}>
                                        <RatingEmoji type="radio" name="recommended" className="super_happy" id="super-happy3" value={5} onChange={handleFormChange} checked={formData.recommended === 5} />
                                        <RatingEmoji type="radio" name="recommended" className="happy" id="happy3" value={4} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="recommended" className="neutral" id="neutral3" value={3} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="recommended" className="sad" id="sad3" value={2} onChange={handleFormChange} />
                                        <RatingEmoji type="radio" name="recommended" className="super_sad" id="super-sad3" value={1} onChange={handleFormChange} />
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        <legend className={style.feedback_legend}>{t("comments")}</legend>
                        <fieldset className={style.feedback_fieldset}>
                            <div className={style.feedback_row}>
                                <div className={style.feedback_input}>
                                    <label htmlFor="question1">{questionMapping[formData.fcategory as keyof typeof questionMapping]?.question1}</label>
                                    <textarea id="question1" name="question1" value={formData.question1} onChange={handleFormChange} />
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input}>
                                    <label htmlFor="question2">{questionMapping[formData.fcategory as keyof typeof questionMapping]?.question2}</label>
                                    <textarea id="question2" name="question2" value={formData.question2} onChange={handleFormChange} />
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input}>
                                    <label htmlFor="question3">{questionMapping[formData.fcategory as keyof typeof questionMapping]?.question3}</label>
                                    <textarea id="question3" name="question3" value={formData.question3} onChange={handleFormChange} />
                                </div>
                            </div>

                            <div className={style.feedback_row}>
                                <div className={style.feedback_input}>
                                    <label>{t("issues_screenshot")}</label>
                                    <ImageInput reset={resetImage} onReset={handleImageReset} setImageInfo={setImage} />
                                </div>
                            </div>
                        </fieldset>

                        {/* Submit and Reset */}
                        <div className={style.wrap}>
                            <button type="reset" id="reset_button" className={`${style.cancel} ${style.subCanBtn}`} onClick={handleFormReset}>
                                {t("reset_btn")}
                            </button>
                            <br />
                            <button type="submit" id="submit_button" data-testid="test_submit" className={`${style.submit} ${style.subCanBtn}`} name="submit_button">
                                {t("submit_btn")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Feedback;
