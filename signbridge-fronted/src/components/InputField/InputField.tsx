import React, { ChangeEvent } from "react";
import "./InputField.css";

interface InputFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  id?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multipleLines?: boolean;
  error: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  placeholder = " ",
  type = "text",
  value = "",
  defaultValue,
  onChange,
  error,
  id,
  multipleLines = false,
}) => {
  const inputElement = multipleLines ? (
    <textarea
      className={`form-control ${error ? "is-invalid" : ""} multipleLines`}
      placeholder={placeholder}
      name={name}
      value={value}
      id={id}
      onChange={onChange}
      data-testid={name}
      defaultValue={defaultValue}
    />
  ) : (
    <input
      className={`form-control ${error ? "is-invalid" : ""}`}
      placeholder={placeholder}
      type={type}
      name={name}
      value={value}
      id={id}
      onChange={onChange}
      data-testid={name}
      defaultValue={defaultValue}
    />
  );

  return (
    <div className={`form-group ${error ? "is-invalid" : ""}`}>
      {inputElement}
      <label className={`input-label ${multipleLines ? "multiple_label" : ""}`}>
        {label}
      </label>
      <div className={`form-error ${error ? "is-invalid" : ""}`}>{error}</div>
    </div>
  );
};

export default InputField;
