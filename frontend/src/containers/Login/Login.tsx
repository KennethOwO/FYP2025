import "./Login.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginInput from "../../components/LoginInput/LoginInput";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SignUpUser, VerifyEmail } from "../../services/account.service";
// @ts-ignore
import { auth, signInWithGooglePopup } from "../../../firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useUserStore } from "@root/store/userStore";

function Login() {
  const navigate = useNavigate(); // For the redirection
  const { t } = useTranslation();
  const { user } = useUserStore();

  // ---------- Define the variables ----------
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

  // ---------- Toggle password visibility ----------
  const handleTogglePassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  useEffect(() => {
    if (user && user.firebase_id) {
      navigate("/");
    }
  }, []);

  // ---------- Validations ----------
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

  // For testing purposes (session authorization)
  // function callApi(url: string, method: string, body?: any) {
  // 	var options = {
  // 		method: method,
  // 		headers: {
  // 			"Content-Type": "application/json"
  // 		},
  // 		body: body !== undefined ? JSON.stringify(body) : undefined
  // 	};

  // 	if (user) {
  // 		user.getIdToken(true)
  // 		.then(function(idToken) {
  // 			options.headers["Authorization"] = "Bearer " + idToken;
  // 			fetch(url, options);
  // 		})
  // 		.catch(error => {
  // 			console.log(error);
  // 		});
  // 	} else {
  // 		fetch(url, options);
  // 	}
  // }

  // ---------- Handle form submission ----------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailErrors = validateEmail(email);
    const passwordErrors = validatePassword(password);

    let errorMessage = "";
    if (emailErrors.length > 0) errorMessage += `• ${emailErrors}\n`;
    if (passwordErrors.length > 0) errorMessage += `• ${passwordErrors}\n`;

    if (emailErrors.length === 0 && passwordErrors.length === 0) {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          if (!user.emailVerified) {
            toast.error(t("email_not_verified"));
            return;
          } else if (user.emailVerified && user) {
            await VerifyEmail(
              {
                firebase_id: user.uid,
              },
              user
            );

            toast.success(t("login_successful"));
            navigate("/");
          }
        })
        .catch((error) => {
          // invalid email or password
          if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/wrong-password"
          ) {
            toast.error(t("invalid_email_password"));
          } else {
            toast.error(t("login_failed")); // other errors
          }
        });
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
    <div className="login-container">
      <h1>{t("login")}</h1>
      {/* <button onClick={() => callApi(`http://localhost:3000/users/${user?.email}/profile`, "GET")}>testing button</button> */}
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <LoginInput
            type="email"
            placeholder=" "
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            label={t("email")}
          />

          <LoginInput
            type={showPassword ? "text" : "password"}
            placeholder=" "
            value={password}
            onChange={handlePasswordChange}
            error={passwordError}
            label={t("password")}
            showPassword={showPassword}
            handleTogglePassword={handleTogglePassword}
          />

          <div className="forgot-pwd-container">
            <Link to="/forgot-password" className="forgot-password">
              {t("forgot_password")}
            </Link>
          </div>

          <button className="login-btn" type="submit">
            {t("login")}
          </button>

          <div>{t("or")}</div>

          <button
            className="google-login-btn"
            type="button"
            onClick={googleLogin}
          >
            <img
              src="/images/google-logo.png"
              alt="Google Logo"
              className="google-logo"
            />
            {t("login_with_google")}
          </button>

          <div className="sign-up">
            <div>{t("no_account")}</div>{" "}
            <Link to="/sign-up">{t("sign_up")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
