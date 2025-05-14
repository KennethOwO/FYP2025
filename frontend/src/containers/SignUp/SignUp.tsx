import "./SignUp.css";
import { useState, useEffect } from "react";
import LoginInput from "../../components/LoginInput/LoginInput";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { SignUpUser, VerifyEmail } from "../../services/account.service";
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, signOut } from "firebase/auth";
// @ts-ignore
import { auth, signInWithGooglePopup } from "../../../firebase";
import { useUserStore } from "@root/store/userStore";

function SignUp() {
    const navigate = useNavigate(); // For the redirection
    const { t } = useTranslation();
    const { user } = useUserStore();

    // ---------- Define the variables ----------
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        validateUsername(e.target.value);
    };

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        validateEmail(e.target.value);
    };

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        validatePassword(e.target.value);
    };

    const [confirmPassword, setconfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setconfirmPassword(e.target.value);
        validateConfirmPassword(e.target.value);
    };

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.firebase_id) {
            navigate("/");
        }
    }, []);

    // ---------- Toggle password visibility ----------
    const handleTogglePassword = () => {
        setShowPassword(!showPassword); // Toggle password visibility
    };

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword); // Toggle password visibility
    };

    // ---------- Validations ----------
    const validateUsername = (value: string) => {
        let error = "";
        if (value.length === 0) {
            setUsernameError(t("username_required"));
            error = t("username_required");
            return error;
        }

        if (!value.trim()) {
            setUsernameError("Username is required");
            error = t("username_required");
            return error;
        }

        // length of username should be between 3 and 20
        if (value.length < 3 || value.length > 20) {
            setUsernameError(t("username_length"));
            error = t("username_length");
            return error;
        }

        setUsernameError("");
        return error;
    };

    const validateEmail = (value: string) => {
        let error = "";
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value.trim()) {
            error = t("email_required");
            setEmailError(t("email_required"));
            return error;
        } else if (!emailRegex.test(value)) {
            setEmailError(t("email_invalid"));
            return error;
        }
        setEmailError("");
        return error;
    };

    const validatePassword = (value: string) => {
        let error = "";
        if (!value.trim()) {
            error = t("password_required");
            setPasswordError(t("password_required"));
            return error;
        } else if (password.length < 5) {
            error = t("password_length");
            setPasswordError(t("password_length"));
            return error;
        }
        setPasswordError("");
        return error;
    };

    const validateConfirmPassword = (value: string) => {
        let error = "";
        if (!value.trim()) {
            error = t("confirm_password_required");
            setConfirmPasswordError(t("confirm_password_required"));
            return error;
        } else if (value !== password) {
            error = t("confirm_password_error");
            setConfirmPasswordError(t("confirm_password_error"));
            return error;
        }

        setConfirmPasswordError("");
        return error;
    };

    // ---------- Handle form submission ----------
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate all fields and update state with error messages
        const usernameErrors = validateUsername(username);
        const emailErrors = validateEmail(email);
        const passwordErrors = validatePassword(password);
        const confirmPasswordErrors = validateConfirmPassword(confirmPassword);

        // Construct error message for fields that are invalid
        let errorMessage = "";
        if (usernameErrors.length > 0) errorMessage += `• ${usernameErrors}\n`;
        if (emailErrors.length > 0) errorMessage += `• ${emailErrors}\n`;
        if (passwordErrors.length > 0) errorMessage += `• ${passwordErrors}\n`;
        if (confirmPasswordErrors.length > 0) errorMessage += `• ${confirmPasswordErrors}\n`;

        if (usernameErrors.length === 0 && emailErrors.length === 0 && passwordErrors.length === 0 && confirmPasswordErrors.length === 0) {
            setLoading(true);

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
                    await SignUpUser(
                        {
                            firebase_id: userCredential.user.uid,
                            username,
                            email,
                            acc_type: "traditional",
                        },
                        userCredential.user
                    );
                    return userCredential;
                });
                const user = userCredential.user;

                await sendEmailVerification(user);
                toast.success(t("verified_email_sent") + user.email);
                navigate("/login");

                const checkEmailVerified = setInterval(async () => {
                    await user.reload();
                    if (user.emailVerified) {
                        clearInterval(checkEmailVerified);
                        toast.success(user.email + " signed up successfully");
                        await signOut(auth);
                    }
                }, 1000);
            } catch (error) {
                const firebaseError = error as { code: string; message: string };
                if (firebaseError.code === "auth/email-already-in-use") {
                    toast.error(t("email_already_exists"));
                } else {
                    if (error instanceof Error) {
                        toast.error("Error: " + error.message);
                    } else {
                        toast.error(t("unknown_error"));
                    }
                }
            } finally {
                setLoading(false);
            }
        } else {
            toast.error(t("form_validation_failed") + errorMessage);
        }
    };

    const googleLogin = async () => {
        const response = await signInWithGooglePopup();
        if (response) {
            await SignUpUser(
                {
                    firebase_id: response.user.uid,
                    username: response.user.displayName,
                    email: response.user.email,
                    acc_type: "google",
                    picture: response.user.photoURL,
                },
                response.user
            );
            await VerifyEmail(
                {
                    firebase_id: response.user.uid,
                },
                response.user
            );
            navigate("/");
            toast.success(t("login_successful"));
        }
    };

    return (
        <div className="sign-up-container">
            <h1>{t("signup")}</h1>
            <div className="sign-up-form">
                <form onSubmit={handleSubmit}>
                    <div className={`login-form-group ${usernameError ? "error" : ""}`}>
                        <input type="text" placeholder="" value={username} onChange={handleUsernameChange} />
                        <label htmlFor="inp" className="login-form-label">
                            {t("username")}
                        </label>
                        {usernameError && <div className="login-error-message">{usernameError}</div>}
                    </div>

                    <LoginInput type="email" placeholder=" " value={email} onChange={handleEmailChange} error={emailError} label={t("email")} />

                    <LoginInput type={showPassword ? "text" : "password"} placeholder=" " value={password} onChange={handlePasswordChange} error={passwordError} label={t("password")} showPassword={showPassword} handleTogglePassword={handleTogglePassword} />

                    <LoginInput type={showConfirmPassword ? "text" : "password"} placeholder=" " value={confirmPassword} onChange={handleConfirmPasswordChange} error={confirmPasswordError} label={t("confirm_password")} showPassword={showConfirmPassword} handleTogglePassword={handleToggleConfirmPassword} />

                    <button className="sign-up-btn" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <i className="fa fa-spinner fa-spin"></i> {t("loading")}
                            </>
                        ) : (
                            <>{t("signup")}</>
                        )}
                    </button>

                    <div>{t("or")}</div>

                    <button className="google-sign-up-btn" type="button" onClick={() => googleLogin()}>
                        <img src="/images/google-logo.png" alt="Google Logo" className="google-logo" />
                        {t("signup_with_google")}
                    </button>

                    <div className="login-link">
                        <div>{t("already_have_account")}</div> <Link to="/login">{t("login_here")}</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
