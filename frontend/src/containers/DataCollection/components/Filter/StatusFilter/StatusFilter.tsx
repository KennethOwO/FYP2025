import React from "react";
import { Select } from "antd";
import "./StatusFilter.css";
import { useTranslation } from "react-i18next";

const { Option } = Select;

interface StatusFilterProps {
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  user: string;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  filterStatus,
  setFilterStatus,
  user,
}) => {
  const { t, i18n } = useTranslation();
  const handleSelectChange = (value: string) => {
    setFilterStatus(value);
  };

  // Declare options variable
  let options: { value: string; label: string }[] = [];

  // Assign options based on user
  if (user === "signexpert") {
    options = [
      { value: t("all"), label: t("all") },
      { value: t("new"), label: t("new") },
      { value: t("awaitingAccept"), label: t("awaitingAccept") },
      { value: t("inProgress"), label: t("inProgress") },
      { value: t("awaitingVerify"), label: t("awaitingVerify") },
      { value: t("rejected"), label: t("rejected") },
      { value: t("verified"), label: t("verified") },
    ];
  } else if (user === "admin") {
    options = [
      { value: t("all"), label: t("all") },
      { value: t("new"), label: t("new") },
      { value: t("inProgress"), label: t("inProgress") },
      { value: t("awaitingVerify"), label: t("awaitingVerify") },
      { value: t("rejected"), label: t("rejected") },
      { value: t("verified"), label: t("verified") },
    ];
  }

  return (
    <div className="status-filter">
      <Select
        value={filterStatus}
        onChange={handleSelectChange}
        style={{ width: 180, height: 40 }}
        popupClassName="status-filter-dropdown"
      >
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default StatusFilter;
