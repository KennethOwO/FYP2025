import * as React from "react";
import { FormControlLabel, FormGroup } from "@mui/material";
import style from "./NotifFilter.module.css";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import { useNotificationFilterStore } from "../../store/notificationFilter";
import { useUserStore } from "@root/store/userStore";
import { useTranslation } from "react-i18next";

const NotifFilter: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useUserStore();
    const [checked, setChecked] = React.useState([true, true]);
    const [newTaskChecked, setNewTaskChecked] = React.useState(true);
    const [waitingForVerificationChecked, setWaitingForVerificationChecked] = React.useState(true);
    const useStore = useNotificationFilterStore();

    const filterData = (data: string[]) => {
        let newData: any[] = [];

        if (data.includes("newtask")) {
            // add the data that has newtask value
            for (let i = 0; i < useStore.data.length; i++) {
                if (useStore.data[i].type_value === "newtask") {
                    newData.push(useStore.data[i]);
                }
            }
        }

        if (data.includes("accepted")) {
            // add the data that has accepted value, it should be added to the new data instead of replacing it
            for (let i = 0; i < useStore.data.length; i++) {
                if (useStore.data[i].type_value === "accepted") {
                    newData.push(useStore.data[i]);
                }
            }
        }

        if (data.includes("rejected")) {
            // add the data that has rejected value, it should be added to the new data instead of replacing it
            for (let i = 0; i < useStore.data.length; i++) {
                if (useStore.data[i].type_value === "rejected") {
                    newData.push(useStore.data[i]);
                }
            }
        }

        if (data.includes("newtext")) {
            // add the data that has newtext value
            for (let i = 0; i < useStore.data.length; i++) {
                if (useStore.data[i].type_value === "newtext") {
                    newData.push(useStore.data[i]);
                }
            }
        }

        if (data.includes("waitingforverification")) {
            // add the data that has waitingforverification value
            for (let i = 0; i < useStore.data.length; i++) {
                if (useStore.data[i].type_value === "waitingforverification") {
                    newData.push(useStore.data[i]);
                }
            }
        }

        newData = newData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        useStore.setModifiedData(newData);
    };

    const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            if (newTaskChecked) {
                useStore.setFilter(["newtask", "accepted", "rejected"]);
            } else {
                useStore.setFilter(["accepted", "rejected"]);
            }
        } else if (event.target.checked === false) {
            if (newTaskChecked) {
                useStore.setFilter(["newtask"]);
            } else {
                useStore.setFilter([]);
            }
        }

        setChecked([event.target.checked, event.target.checked]);
    };

    const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const exist = useStore.filter.includes(event.target.value);
            if (!exist) {
                useStore.setFilter([...useStore.filter, event.target.value]);
            }
        }

        if (event.target.checked === false) {
            const newFilter = useStore.filter.filter((item: string) => item !== event.target.value);
            useStore.setFilter(newFilter);
        }

        setChecked([event.target.checked, checked[1]]);
    };

    const handleChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const exist = useStore.filter.includes(event.target.value);
            if (!exist) {
                useStore.setFilter([...useStore.filter, event.target.value]);
            }
        }

        if (event.target.checked === false) {
            const newFilter = useStore.filter.filter((item: string) => item !== event.target.value);
            useStore.setFilter(newFilter);
        }

        setChecked([checked[0], event.target.checked]);
    };

    const handleNewTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const exist = useStore.filter.includes(event.target.value);
            if (!exist) {
                useStore.setFilter([...useStore.filter, event.target.value]);
            }
        }

        if (event.target.checked === false) {
            const newFilter = useStore.filter.filter((item: string) => item !== event.target.value);
            useStore.setFilter(newFilter);
        }

        setNewTaskChecked(event.target.checked);
    };

    const handleWaitingForVerificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const exist = useStore.filter.includes(event.target.value);
            if (!exist) {
                useStore.setFilter([...useStore.filter, event.target.value]);
            }
        }

        if (event.target.checked === false) {
            const newFilter = useStore.filter.filter((item: string) => item !== event.target.value);
            useStore.setFilter(newFilter);
        }

        setWaitingForVerificationChecked(event.target.checked);
    };

    React.useEffect(() => {
        filterData(useStore.filter);
    }, [useStore.filter]);

    const renderFilterOptions = () => {
        const role = user?.role_access !== undefined ? user?.role_access : "";

        const renderAdminOptions = () => (
            <>
                <FormControlLabel label={t("newTask")} control={<Checkbox value="newtask" checked={newTaskChecked} onChange={handleNewTaskChange} />} />
                <FormControlLabel label={t("taskConfirmation")} control={<Checkbox checked={checked[0] && checked[1]} indeterminate={checked[0] !== checked[1]} onChange={handleChange1} />} />
                {/* @ts-ignore */}
                <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
                    <FormControlLabel label={t("accepted")} control={<Checkbox checked={checked[0]} value="accepted" onChange={handleChange2} />} />
                    <FormControlLabel label={t("rejected")} control={<Checkbox checked={checked[1]} value="rejected" onChange={handleChange3} />} />
                </Box>
            </>
        );

        const renderSignExpertOptions = () => (
            <>
                <FormControlLabel label={t("newText")} control={<Checkbox value="newtext" checked={newTaskChecked} onChange={handleNewTaskChange} />} />
                <FormControlLabel label={t("waitingForVerification")} control={<Checkbox value="waitingforverification" checked={waitingForVerificationChecked} onChange={handleWaitingForVerificationChange} />} />
            </>
        );

        const renderPublicOptions = () => (
            <>
                <FormControlLabel label={t("textVerification")} control={<Checkbox checked={checked[0] && checked[1]} indeterminate={checked[0] !== checked[1]} onChange={handleChange1} />} />
                <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
                    <FormControlLabel label={t("accepted")} control={<Checkbox checked={checked[0]} value="accepted" onChange={handleChange2} />} />
                    <FormControlLabel label={t("rejected")} control={<Checkbox checked={checked[1]} value="rejected" onChange={handleChange3} />} />
                </Box>
            </>
        );

        switch (role) {
            case "admin":
                return renderAdminOptions();
            case "signexpert":
                return renderSignExpertOptions();
            case "public":
                return renderPublicOptions();
            default:
                return null;
        }
    };

    return (
        <div className={style.notifFilterContainer}>
            <div className={style.notifFilterHeader}>
                <p className={style.notifFilterHeaderText}>{t("filter")}</p>
            </div>
            <div className={style.notifFilterItem}>
                <FormGroup>{renderFilterOptions()}</FormGroup>
            </div>
        </div>
    );
};

export default NotifFilter;
