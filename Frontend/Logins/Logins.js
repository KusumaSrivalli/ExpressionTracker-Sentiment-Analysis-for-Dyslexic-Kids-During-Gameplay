import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Logins.css'; 
import axios from 'axios';

const Login = () => {
  const [playerName, setPlayerName] = useState(''); // User input for name
  const [defaultName, setDefaultName] = useState(''); // The ChildXXX name fetched from the database
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the next available child name from the backend
    const fetchNextChildName = async () => {
      try {
        const response = await axios.get('http://localhost:5000/next-child');
        setDefaultName(response.data.nextChildName); // Store the next available ChildXXX name
      } catch (error) {
        console.error('Error fetching next child name:', error);
      }
    };

    fetchNextChildName(); // Fetch the next name on component load
  }, []);

  const handleLogin = () => {
    // Use the provided player name or the default ChildXXX name
    const assignedName = playerName ? playerName : defaultName;

    // Show an alert with the assigned session name
    alert(`Player name is : ${assignedName}`);

    // Redirect to the Game page and pass the session name via state
    navigate('/Gameindex', { state: { sessionName: assignedName } });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h1 className="login-title">LOGIN</h1>
          <label className="login-label">USERNAME</label>
          <input
            className="login-input"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter username"
          />
          {/* <label className="login-label">PASSWORD</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          /> */}
          <button className="login-button" type="submit">
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;