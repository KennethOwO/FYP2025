import { useNavigate } from 'react-router-dom';
import style from './PageNotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className={style.not_found_container}>
      <div className={style.animated_background}>
        {/* <h1 className={style.not_found_title}>404</h1> */}
        <img src="./images/404.gif" alt="404 GIF" className={style.not_found_gif}/>
        <h3 className={style.page_not_found_title}>Page Not Found</h3>
        <div className={style.not_found_message_container}>
          <p className={style.not_found_message}>
            Oops! We are very sorry for the inconvenience.
            It looks like the page you're trying to access doesn't exist or has been removed.
          </p>
        </div>
        <button className={style.go_home_btn} onClick={goToHome}>Go to Homepage</button>
      </div>
    </div>
  );
};

export default NotFound;
