import React from "react";
import AboutBackground from "./Assets/about-background.png";
import AboutBackgroundImage from "./Assets/kindhaaaa-removebg-preview.png";
import { BsFillPlayCircleFill } from "react-icons/bs";
import "./HomePage.css";

const About = () => {
  return (
    <div className="homepage-about-section-container">
      <div className="homepage-about-background-image-container">
        <img src={AboutBackground} alt="" />
      </div>
      <div className="homepage-about-section-image-container">
        <img src={AboutBackgroundImage} alt="" />
      </div>
      <div className="homepage-about-section-text-container">
        <p className="homepage-primary-subheading">About</p>
        <h1 className="homepage-primary-heading">
        Understanding Emotions, Enhancing Education
        </h1>
        <p className="homepage-primary-text">
        Empowering Dyslexic Kids Through Play and Emotional Insights

        </p>
        <p className="homepage-primary-text">
        Capture, Analyze, and Improve Game Experiences with Real-Time Emotional Feedback.
        </p>
        <div className="homepage-about-buttons-container">
          <button className="homepage-secondary-button">Learn More</button>
          <button className="homepage-watch-video-button">
            <BsFillPlayCircleFill /> Watch Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
