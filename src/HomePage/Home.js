import React from "react";
import "./HomePage.css";
import BannerBackground from "./Assets/home-banner-background.png";
//import BannerImage from "../Assets/home-banner-image.png";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import About from "./About";
import { FiArrowRight } from "react-icons/fi";

const Home = () => {
    const navigate = useNavigate();
  // const [startAnalysis, setStartAnalysis] = useState(false); // New state to control webcam analysis

  const handleClick = () => {
    navigate("/Logins");
  };
  return (
    <div className="homepage-home-container">
      <Navbar />
      <div className="homepage-home-banner-container">
        <div className="homepage-home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="homepage-home-text-section">
          <h1 className="homepage-primary-heading">
            JOY WITH LEARNING
          </h1>
          <p className="homepage-primary-text">
            
          </p>
          <button className="homepage-secondary-button" onClick={handleClick}>
            Play Games <FiArrowRight />{" "}
          </button>
        </div>
        {/* <div className="home-image-section">
          <img src={BannerImage} alt="" />
        </div> */}
      </div>
      <About />
    </div>
  );
};

export default Home;
