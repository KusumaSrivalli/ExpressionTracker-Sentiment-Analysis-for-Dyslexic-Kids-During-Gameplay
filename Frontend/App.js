import React from "react";
import "./App.css";
import SwiperComponent from "./SwiperComponent";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  Input from "./Input/Input";
import Logins from "./Logins/Logins";
import Gameweb from "./Gameweb/Gameweb";
import Gameindex from "./Gameweb/Gamindex";
import Analysis from "./Analysis";
import OverallAnalysis from "./OverallAnalysis";
import DetailedAnalysis from "./DetailedAnalysis";
import Home from "./HomePage/Home";
import Signup from "./AdminLogins/Signup";
import Login from "./AdminLogins/Login";
//import {WebcamEmotionAnalysis} from "./videolink.js";
function App() {
  return (
    <div>
    <Router>
    <Routes>
    <Route path="/" element={<Home />} />
    {/* <Route path="/" element={<About />} />
    <Route path="/" element={<Navbar />} /> */}
    <Route path="/Signup" element={<Signup />}/>
    <Route path="/Login" element={<Login />}/>
      <Route path="/Gameweb" element={<Gameweb />} />  
      <Route path="/Logins" element={<Logins />} /> 
      <Route path="/Gameindex" element={<Gameindex />} /> 
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/analysis/:sessionId" element={<OverallAnalysis />} />
      <Route path="/DetailedAnalysis/:sessionId" element={<DetailedAnalysis />} />
    </Routes>
  </Router>
    </div>
  );
}
export default App;
