import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginInput from "../../../components/LoginInput/LoginInput";
import "./ForgotPassword.css";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

// @ts-ignore
import { auth } from "../../../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate(); // For the redirection
	const [loading, setLoading] = useState(false);

	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState("");
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		validateEmail(e.target.value);
	};

	// get token from cookies, if exist, redirect to home
	useEffect(() => {
		const token = Cookies?.get("token");
		if (token !== undefined) {
			navigate("/");
		}
	}, [navigate]);

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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		const emailErrors = validateEmail(email);

		let errorMessage = "";
		if (emailErrors.length > 0){
			errorMessage = emailErrors
		}

		if (emailErrors.length === 0) {
			setLoading(true);

			sendPasswordResetEmail(auth, email)
				.then(() => {
					toast.success(t("password_reset_link_sent"));
				})
				.catch(error => {
					toast.error(error.message);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			toast.error(errorMessage);
		}
	};

	return (
		<div className="sign-up-container">
			<h1>{t("forgot_password_page")}</h1>
			<div className="sign-up-form">
				<form onSubmit={handleSubmit}>
					<LoginInput label={t("email")} type="email" placeholder="" value={email} onChange={handleEmailChange} error={emailError} />

					<button className="sign-up-btn" type="submit" disabled={loading}>
						{loading ? (
							<>
								<i className="fa fa-spinner fa-spin"></i> Loading
							</>
						) : (
							t("reset_password")
						)}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ForgotPassword;
