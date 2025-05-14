import React, { useState } from "react";
import { Button } from "antd";
import "./ButtonProcessing.css";

interface ButtonProcessingProps {
  type?: "text" | "link" | "default" | "dashed" | "primary"; // Adjusted to match Ant Design's expected values
  onClick?: () => any;
  buttonStyle: string;
  buttonSize: string;
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: any;
}

const ButtonProcessing: React.FC<ButtonProcessingProps> = ({
  type,
  onClick,
  buttonStyle,
  buttonSize,
  children,
  isLoading,
  setIsLoading,
}) => {
  return (
    <Button
      className={`${buttonStyle} ${buttonSize}`}
      onClick={onClick}
      type={type}
      loading={isLoading}
      style={{ height: "auto", position: "relative" }}
      data-testid="submit_btn2"
    >
      {isLoading}
      {children}
    </Button>
  );
};

export default ButtonProcessing;
