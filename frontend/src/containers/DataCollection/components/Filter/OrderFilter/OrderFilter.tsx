import React from "react";
import { Select } from "antd";
import "./OrderFilter.css";
import { useTranslation } from "react-i18next";

const { Option } = Select;

interface OrderFilterProps {
  sortOrder: string;
  setSortOrder: (value: string) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({
  sortOrder,
  setSortOrder,
}) => {
  const { t, i18n } = useTranslation();
  const handleSelectChange = (value: string) => {
    setSortOrder(value);
  };

  return (
    <div className="order-filter">
      <Select
        value={sortOrder}
        onChange={handleSelectChange}
        popupClassName="order-filter-dropdown"
        placeholder={t('selectOrder')}
        style={{ width: 140, height: 40 }}
      >
        <Option value="asc">{t("ascending")}</Option>
        <Option value="desc">{t("descending")}</Option>
      </Select>
    </div>
  );
};

export default OrderFilter;
