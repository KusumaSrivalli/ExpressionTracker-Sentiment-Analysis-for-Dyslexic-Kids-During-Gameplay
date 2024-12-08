import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Slider from '@mui/material/Slider/Slider';
// Import Material-UI Slider
import './DetailedAnalysis.css';

const ExpressionAnalysis = () => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { sessionId } = useParams();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/detailed_sessions/${sessionId}`);
        console.log('Full Response Data:', response.data);
        setSessionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Detailed Error:', err);
        setError('Error fetching session data: ' + err.message);
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [sessionId]);

  const calculateHighestEmotion = (emotionArray) => {
    if (!Array.isArray(emotionArray) || emotionArray.length === 0) {
      return { label: 'No Data', score: 0 };
    }

    let highestEmotion = { label: 'No Data', score: 0 };
    emotionArray.forEach((emotionObject) => {
      if (
        emotionObject &&
        typeof emotionObject === 'object' &&
        emotionObject.label &&
        typeof emotionObject.score === 'number'
      ) {
        if (emotionObject.score > highestEmotion.score) {
          highestEmotion = {
            label: emotionObject.label,
            score: emotionObject.score * 100,
          };
        }
      }
    });

    return highestEmotion;
  };
  const handleImageClick = (e) => {
    const image = e.target;

    if (image.classList.contains('enlarged')) {
      image.classList.remove('enlarged');
    } else {
      image.classList.add('enlarged');

      // Automatically revert back after 3 seconds
      setTimeout(() => {
        image.classList.remove('enlarged');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="circular-loader"></div>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!sessionData) {
    return <p>No session data found.</p>;
  }

  return (
    <div className="detailedanalysis-container-fluid">
      <div className="detailedanalysis-image-strip-container">
        <h1>DETAILED ANALYSIS</h1>
        <div className="detailedanalysis-image-strip">
          {sessionData.modelResponse.map((responseItem, index) => {
            const emotions = Array.isArray(responseItem.result) ? responseItem.result : [];
            const highestEmotion = calculateHighestEmotion(emotions);
            const timestamp = (index + 1) * 10;

            return (
              <div key={index} className="detailedanalysis-image-box">
                <div className="detailedanalysis-time-percentage">
                  {highestEmotion.label}: {highestEmotion.score.toFixed(2)}% - Captured at {timestamp}s
                </div>
                <div className="detailedanalysis-image-container">
                  <img
                    src={`http://localhost:5000/${sessionData.screenshotPaths[index]}`}
                    alt={`Screenshot ${index + 1}`}
                    onClick={handleImageClick} // Attach the click handler
                  />
                  <img
                    src={`http://localhost:5000/${sessionData.imagePaths[index]}`}
                    alt={`Webcam ${index + 1}`}
                    onClick={handleImageClick} // Attach the click handler
                  />
                </div>
                <div className="detailedanalysis-detailed-analysis">
                  <strong>Emotion Analysis:</strong>
                  {emotions.length > 0 ? (
                    emotions.map((emotionObject, emotionIndex) => (
                      <div key={emotionIndex} className="emotion-slider">
                        <label>{emotionObject.label}</label>
                        <Slider
                          value={emotionObject.score * 100}
                          defaultValue={50}
                          max={100}
                          disabled
                          style={{
                            color:
                              emotionObject.label === highestEmotion.label
                                ? '#00cc88' // Highlight dominant emotion
                                : '#888',
                          }}
                        />
                        <span>{(emotionObject.score * 100).toFixed(2)}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-emotion-data">No emotion data available for this image</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpressionAnalysis;
