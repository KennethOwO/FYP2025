import * as React from "react";
import { useMotionValue, Reorder, useDragControls } from "framer-motion";
import { useRaisedShadow } from "./use-raised-shadow";
import style from "./EditDialog.module.css";
import { Grip } from "lucide-react";
import { useTranslation } from "react-i18next";

type ImageModule = {
    image: File | string | null;
    sequence: number;
    status: string;
};

export const Item = ({ item, index, handleHide, handleDelete }: { item: ImageModule; index: number; handleHide: (data: ImageModule) => Promise<void>; handleDelete: (data: ImageModule) => Promise<void> }) => {
    const { t, i18n } = useTranslation();
    const y = useMotionValue(0);
    const boxShadow = useRaisedShadow(y);
    const controls = useDragControls();

    return (
        <Reorder.Item dragListener={false} dragControls={controls} value={item} id={item.image as string} style={{ boxShadow, y }} className={style.row} as="div">
            <div data-label={t("number")}>{index}</div>
            <div data-label={t("image")}>
                <img src={item.image as string} alt="thumbnail" className={style.thumbnail} />
            </div>
            <div data-label={t("status")}>
                <span className={item.status === "Shown" ? style.shown : style.hidden}>
                    {item.status === "Shown" ? t("shown") : t("hidden")}
                </span>
            </div>
            <div data-label={t("action")} className={style.btn_grp}>
                <button className={`${style.table_btn_grp} ${item.status === "Shown" ? style.hide_button : style.show_button}`} onClick={() => handleHide(item)}>
                    {item.status === "Shown" ? t("hide") : t("show")}
                </button>
                <button className={`${style.table_btn_grp} ${style.delete_button}`} onClick={() => handleDelete(item)}>
                    {t("delete")}
                </button>
            </div>
            <Grip onPointerDown={event => controls.start(event)} className={style.icon} />
        </Reorder.Item>
    );
};
