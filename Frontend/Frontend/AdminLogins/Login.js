import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:5001/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      )
      .then((result) => {
        console.log("Full Result: ", result);
        if (result.data === "Success") {
          navigate("/analysis");
        }
      })
      .catch((error) => {
        console.error("Detailed Axios Error:", {
          message: error.message,
          code: error.code,
          config: error.config,
        });

        if (error.response) {
          alert(error.response.data);
        } else if (error.request) {
          alert("No response from server. Confirm backend is running.");
        } else {
          alert("Error setting up the request");
        }
      });
  };

  return (
    <div className="Adminlogins-container">
    <div className="Adminlogins-form">
      <h1 className="Adminlogins-h1">Welcome Back</h1>
      <p className="Adminlogins-p">Enter your credential for login</p>
      <form onSubmit={handleSubmit}>
        <div className="Adminlogins-form-group">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="Adminlogins-form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="Adminlogins-btn">Login Now</button>
      </form>
      <a href="/forgot-password" className="forgot-password">
        Forgot password?
      </a>
      <p className="Adminlogins-link">
        Don’t have an account?{" "}
        <a href="/signup">Sign Up</a>
      </p>
    </div>
  </div>
  
  );
}

export default Login;
