// DatasetFiltering.tsx
import React from "react";
import { Select } from "antd";
import StatusFilter from "../Filter/StatusFilter/StatusFilter"; // Importing StatusFilter component
import OrderFilter from "../Filter/OrderFilter/OrderFilter";
import "./DatasetFiltering.css";
import { useTranslation } from "react-i18next";
const { Option } = Select;

interface DatasetFilteringProps {
  filterFunction: string;
  setFilterFunction: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  user: string;
}

const DatasetFiltering: React.FC<DatasetFilteringProps> = ({
  filterFunction,
  setFilterFunction,
  filterStatus,
  setFilterStatus,
  sortOrder,
  setSortOrder,
  user,
}) => {
  const { t, i18n } = useTranslation();
  const handleFilterFunctionChange = (value: string) => {
    setFilterFunction(value);
  };

  return (
    <div className="dataset-filter-group">
      <div className="dataset-filter-item">
        <label htmlFor="filterFunction"></label>
        <Select
          id="filterFunction"
          value={filterFunction}
          onChange={handleFilterFunctionChange}
          style={{ width: 140, height: 40 }}
        >
          <Option value="number">{t("dc_number")}</Option>
          <Option value="status">{t("dc_status")}</Option>
          <Option value="datetime">{t("dc_datetime")}</Option>
        </Select>
      </div>
      <div className="dataset-filter-item">
        {filterFunction === "status" ? (
          // Render StatusFilter if filterFunction is "status"
          <StatusFilter
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            user={user}
          />
        ) : filterFunction === "number" ? (
          // Render OrderFilter if filterFunction is "number"
          <OrderFilter sortOrder={sortOrder} setSortOrder={setSortOrder} />
        ) : filterFunction === "datetime" ? (
          // Render a JSX element for datetime
          <OrderFilter sortOrder={sortOrder} setSortOrder={setSortOrder} />
        ) : null}
      </div>
    </div>
  );
};

export default DatasetFiltering;
