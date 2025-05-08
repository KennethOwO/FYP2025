import style from "./ProfilePage.module.css";
import PersonalInfo from "./components/PersonalInfo/PersonalInfo";
import AccountForm from "./components/AccountForm/AccountForm";
import SignInfo from "./components/SignInfo/SignInfo";
import AdminStatistic from "./components/AdminStatistic/AdminStatistic";
import * as Tabs from "@radix-ui/react-tabs";
import { useTranslation } from "react-i18next";

import { useUserStore } from "@root/store/userStore";

const ProfilePage = () => {
    const { t } = useTranslation();
    const { user } = useUserStore();

    return (
        <div className={style.profilePageContainer}>
            <div className={style.profileContentContainer}>
                <div className={style.PersonalInfoContainer}>
                    <PersonalInfo />
                </div>
                <div className={style.SignInfoContainer}>
                    <Tabs.Root defaultValue="account">
                        <Tabs.List className={style.TabsList}>
                            <Tabs.Trigger className={style.TabsTrigger} value="account">
                                {t("profile")}
                            </Tabs.Trigger>
                            {(user?.role_access === "public" || user?.role_access === "signexpert") && (
                                <Tabs.Trigger className={style.TabsTrigger} value="SignInfo">
                                    {t("signText")}
                                </Tabs.Trigger>
                            )}
                            {user?.role_access === "admin" && (
                                <Tabs.Trigger className={style.TabsTrigger} value="Statistic">
                                    {t("statistics")}
                                </Tabs.Trigger>
                            )}
                        </Tabs.List>
                        <Tabs.Content value="account">
                            <AccountForm />
                        </Tabs.Content>
                        <Tabs.Content value="SignInfo">
                            <SignInfo />
                        </Tabs.Content>
                        <Tabs.Content value="Statistic">
                            <AdminStatistic />
                        </Tabs.Content>
                    </Tabs.Root>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
