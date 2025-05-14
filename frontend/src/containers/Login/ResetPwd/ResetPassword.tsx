import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginInput from "../../../components/LoginInput/LoginInput";
import { UserResetPassword } from "../../../services/account.service";
import toast from "react-hot-toast";

const ResetPassword: React.FC = () => {
    const navigate = useNavigate(); // For the redirection
    const [token, setToken] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenValue = params.get("token");
        setToken(tokenValue || ""); // Provide a default value of an empty string
    }, []);

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

    // ---------- Toggle password visibility ----------
    const handleTogglePassword = () => {
        setShowPassword(!showPassword); // Toggle password visibility
    };

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword); // Toggle password visibility
    };

    const validatePassword = (value: string) => {
        let error = "";
        if (!value.trim()) {
            error = "Password is required";
            setPasswordError("Password is required");
            return error;
        } else if (password.length < 5) {
            error = "Password must be at least 6 characters long";
            setPasswordError("Password must be at least 6 characters long");
            return error;
        }
        setPasswordError("");
        return error;
    };

    const validateConfirmPassword = (value: string) => {
        let error = "";
        if (!value.trim()) {
            error = "Please confirm your password";
            setConfirmPasswordError("Please confirm your password");
            return error;
        } else if (value !== password) {
            error = "Confirm password does not match";
            setConfirmPasswordError("Confirm password does not match");
            return error;
        }

        setConfirmPasswordError("");
        return error;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const passwordErrors = validatePassword(password);
        const confirmPasswordErrors = validateConfirmPassword(confirmPassword);

        let errorMessage = "";
        if (passwordErrors.length > 0) errorMessage += `- ${passwordErrors}\n`;
        if (confirmPasswordErrors.length > 0) errorMessage += `- ${confirmPasswordErrors}\n`;

        if (passwordErrors.length === 0 && confirmPasswordErrors.length === 0) {
            const data = {
                password,
                token,
            };

            try {
                const response = await UserResetPassword(data);
                toast.success(response.data.message); // Notify user about the password reset

                if (response.status === 200) {
                    navigate("/login");
                }
            } catch (error: any) {
                toast.error(error.code);
            }
        } else {
            toast.error(errorMessage);
        }
    };

    return (
        <div className="sign-up-container">
            <h1>Reset Password</h1>
            <div className="sign-up-form">
                <form onSubmit={handleSubmit}>
                    <LoginInput label="Password" type={showPassword ? "text" : "password"} placeholder=" " value={password} onChange={handlePasswordChange} error={passwordError} showPassword={showPassword} handleTogglePassword={handleTogglePassword} />

                    <LoginInput label="Confirm Password" type={showConfirmPassword ? "text" : "password"} placeholder=" " value={confirmPassword} onChange={handleConfirmPasswordChange} error={confirmPasswordError} showPassword={showConfirmPassword} handleTogglePassword={handleToggleConfirmPassword} />

                    <button className="sign-up-btn" type="submit">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
