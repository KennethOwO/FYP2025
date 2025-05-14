import { useNavigate } from 'react-router-dom';
import style from './InternalServerError.module.css';

const InternalServerError = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className={style.internal_server_error_container}>
      <div className={style.animated_background}>
        <img src="./images/500_comp.gif" alt="500-comp" className={style.internal_server_error_comp}/>
        <img src="./images/500.gif" alt="500 GIF" className={style.internal_server_error_500}/>
        <h3 className={style.internal_server_error_title}>Internal Server Error</h3>
        <div className={style.internal_server_error_message_container}>
          <p className={style.internal_server_error_message}>
            Oops, something went wrong. Please try again later.
          </p>
        </div>
        <button className={style.go_home_btn} onClick={goToHome}>Go to Homepage</button>
      </div>
    </div>
  );
};

export default InternalServerError;