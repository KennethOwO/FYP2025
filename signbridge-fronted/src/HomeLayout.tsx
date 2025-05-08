// DefaultLayout.js
import Navbar from "./containers/Navbar/Navbar";
import Footer from "./containers/Footer/Footer";
import { Outlet } from "react-router-dom";
import Chatbot from "./components/Chatbot/Chatbot";

const DefaultLayout = () => (
    <div>
        <Navbar />
        <div className="page-container">
            <Outlet />
        </div>
        <Footer />
        <Chatbot />
    </div>
);

export default DefaultLayout;
