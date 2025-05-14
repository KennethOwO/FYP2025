import React from "react";
import "./LoginInput.css";

interface LoginInputProps {
	label: string;
	type: string;
	placeholder: string;
	value?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
	error: string;
	showPassword?: boolean;
	handleTogglePassword?: () => void;
}

const LoginInput: React.FC<LoginInputProps> = ({ label, type, placeholder, value, onChange, onBlur, error, showPassword, handleTogglePassword }) => {
	return (
		<div className={`login-form-group ${error ? "error" : ""}`}>
			<input type={type} placeholder={placeholder} value={value} onChange={onChange} onBlur={onBlur} />
			<label htmlFor="inp" className="login-form-label">
				{label}
			</label>
			{error && <div className="login-error-message">{error}</div>}
			{(type === "text" || type === "password") && (
				<button type="button" className="password-toggle" onClick={handleTogglePassword}>
					{showPassword ? (
						<img src="./images/password-shown.png" alt="show-password" className="eye-icon" />
					) : (
						<img src="./images/password-hidden.png" alt="hide-password" className="eye-icon" />
					)}
				</button>
			)}
		</div>
	);
};

export default LoginInput;
