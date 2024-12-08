import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Input.css";
//import WebcamEmotionAnalysis from "./videolink"; // Webcam component
import 'bootstrap/dist/css/bootstrap.min.css';
import Human from "./Human.png";

const Input = React.memo(() => {
  const navigate = useNavigate();
  // const [startAnalysis, setStartAnalysis] = useState(false); // New state to control webcam analysis

  const handleClick = () => {
    navigate("/Logins");
  };

  const handleClicks = () => {
    //  setStartAnalysis(true); // Start the webcam analysis when the button is clicked
    //  <WebcamEmotionAnalysis />
    navigate("/Gameweb"); 
  };
  const handleanalyse = () => {
    navigate("/Analysis");
  };

  return (
    <div className="input-container">
      <header>
        <nav className="input-navbar">
          <div className="input-logo">
            <h2>Play Smart</h2>
          </div>
          <ul className="input-nav-links">
            <li>Home</li>
            <li>Courses</li>
            <li>About</li>
            <li>Blog</li>
            <li>Contact</li>
          </ul>
          <div className="input-auth-buttons">
            <button className="input-btn" onClick={handleanalyse}>Get Analysis</button>
            <button className="input-btn" onClick={handleClick}>Play Games</button>
          </div>
        </nav>
      </header>
      <main className="input-hero-section">
        <div className="input-hero-text">
          <h1>Joy With Learning</h1>
          <p>
          Capture, Analyze, and Improve Game Experiences with Real-Time Emotional Feedback
          </p>
          {/* <button className="input-btn" onClick={handleClicks}>Play Games</button> */}
          
           {/* {startAnalysis && <WebcamEmotionAnalysis />} Render WebcamEmotionAnalysis only after button click */}
        </div>

         <div className="input-hero-image">
          <img src={Human} alt="Learning on Tablet" /> 
        </div> 
      </main>
    </div>
  );
});

export default Input;
