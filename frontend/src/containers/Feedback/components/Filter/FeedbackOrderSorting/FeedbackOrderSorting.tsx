import React, { useEffect } from "react";
import { Select } from "antd";
import style from "./FeedbackOrderSorting.module.css";
import { useFeedbackSortFilterStore } from "../../../../../store/feedbackSortFilter";
import { useTranslation } from "react-i18next";

const { Option } = Select;

interface OrderFilterProps {
    sortData: () => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ sortData }) => {
    const { t, i18n } = useTranslation();
    const store = useFeedbackSortFilterStore();

    const handleSelectChange = (value: string) => {
        if (store.field === "Category" || store.field === "Status") {
            store.setFilterBy(value);
            store.setSortBy("");
        } else {
            // ("Sort by", value);
            store.setSortBy(value);
            store.setFilterBy("");
        }

        // sortData();
    };

    useEffect(() => {
        sortData();
    }, [store.field, store.sortBy, store.filterBy]);

    // useEffect(() => {
    //   if (selectedField === "Category") {
    //     setSortOrder("whole website");
    //   }
    //   else if (selectedField === "Status") {
    //     setSortOrder("new");
    //   } else {
    //     setSortOrder("asc");
    //   }
    // }, [selectedField]); // Run effect when selectedField changes

    const selectWidth = i18n.language === "en" ? 140 : 200;

    return (
        <div className={style.order_filter}>
            <Select value={store.sortBy !== "" ? store.sortBy : store.filterBy} onChange={handleSelectChange} style={{ width: selectWidth, height: 40 }} popupClassName={style.order_filter_dropdown} placeholder={t("selectOrder")}>
                {/* Options based on selected field */}
                {store.field === "Category" ? (
                    <>
                        <Option value="whole website">{t("whole_website")}</Option>
                        <Option value="game1">{t("game1")}</Option>
                        <Option value="game2">{t("game2")}</Option>
                    </>
                ) : store.field === "Status" ? (
                    <>
                        <Option value="new">{t("new")}</Option>
                        <Option value="viewed">{t("viewed")}</Option>
                    </>
                ) : (
                    <>
                        <Option value="asc">{t("ascending")}</Option>
                        <Option value="desc">{t("descending")}</Option>
                    </>
                )}
            </Select>
        </div>
    );
};

export default OrderFilter;
