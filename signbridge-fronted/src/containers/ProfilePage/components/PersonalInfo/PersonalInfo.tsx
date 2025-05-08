import { useTranslation } from "react-i18next";
import style from "./PersonalInfo.module.css";

import { useUserStore } from "@root/store/userStore";

const PersonalInfo = () => {
	const { t } = useTranslation();
	const { user } = useUserStore();

	// "Sat, 07 Sep 2024 08:44:21 GMT" => "Sep, 2024"
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "short",
		};
		const formattedDate = date.toLocaleDateString("en-US", options);

		const [month, year] = formattedDate.split(" ");
		return `${month}, ${year}`;
	};

	return (
		<div className={style.personalInfoContainer}>
			<div className={style.personalInfoBox}>
				<img src={user?.picture} alt="Profile Picture" className={style.profilePicture} />
				<div className={style.personalInfo}>
					<h1 className={style.name}>{user?.username}</h1>
					<p className={style.email}>{user?.email}</p>
					{/* <button className={style.editButton}>Edit Profile</button> */}
					<p className={style.joined}>
						{t("joinedOn")} {formatDate(user?.created_at ?? "")}
					</p>
				</div>
			</div>
		</div>
	);
};

export default PersonalInfo;
