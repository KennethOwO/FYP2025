import React, { ChangeEvent, useState } from "react";
import style from "./accountInputFields.module.css";

interface accountInputFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  value: string;
  id?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  multipleLines?: boolean;
  error: string;
  disabled?: boolean;   
}

const accountInputField: React.FC<accountInputFieldProps> = ({
  label,
  name,
  placeholder = " ",
  type = "text",
  value = "",
  onChange,
  error,
  id,
  multipleLines = false,
}) => {
  // const [error, setError] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<string>(value ?? "");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setInputValue(value);
    onChange(e);
  }

  // const handleChange = (
  //   e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { value } = e.target;
  //   const validationError = validate ? validate(value) : undefined;
  //   setError(validationError);
  //   onChange(e);
  // };

  const inputElement = multipleLines ? (
    <textarea
      className={`form-control ${error ? style.is_invalid : ""} multipleLines`}
      placeholder={placeholder}
      name={name}
      value={value}
      id={id}
      onChange={handleChange}
    />
  ) : (
    <input
      className={`${style.input} ${error ? style.is_invalid : ""}`}
      placeholder={placeholder}
      type={type}
      name={name}
      value={value}
      id={id}
      onChange={handleChange}
    />
  );

  return (
    <div className={`${style.form_group} ${error ? style.is_invalid : ""}`}>
      <label className={`${style.label} ${inputValue ? style.input_focused: ''}`}>
        {label}
      </label>
      {inputElement}
      <div className={`${style.form_error} ${error ? style.is_invalid : ""}`}>{error}</div>
    </div>
  );
};

export default accountInputField;
