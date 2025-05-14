import { useNavigate } from "react-router-dom";
import style from "./PageUnderConstruction.module.css";

const NotFound = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate("/");
    };

    return (
        <div className={style.not_found_container}>
            <div className={style.animated_background}>
                <img src="./images/under_construction.gif" alt="Under Construction GIF" className={style.not_found_gif} />
                <h3 className={style.page_not_found_title}>Site Under Construction</h3>
                <div className={style.not_found_message_container}>
                    <p className={style.not_found_message}>Oops! We are very sorry for the inconvenience. It looks like the page you're trying to access is under construction.</p>
                </div>
                <button className={style.go_home_btn} onClick={goToHome}>
                    Go to Homepage
                </button>
            </div>
        </div>
    );
};

export default NotFound;
