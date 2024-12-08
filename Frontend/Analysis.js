import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Analysis.css';

const Analysis = () => {
  const [sessionsByDate, setSessionsByDate] = useState({});
  const [sessions, setSessions] = useState([]);
  const [existingAnalysis, setExistingAnalysis] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/sessions');
      console.log('API Response:', response.data);
      const sortedSessions = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSessions(sortedSessions);
      const groupedSessions = sortedSessions.reduce((acc, session) => {
        const date = new Date(session.timestamp).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
      }, {});

      setSessionsByDate(groupedSessions);

      // Fetch existing analyses
      // const existingAnalysisResponse = await axios.get('http://localhost:5000/sessions/existing-analysis');
      // setExistingAnalysis(existingAnalysisResponse.data);
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSessionClick = async (sessionId) => {
    setLoadingSessionId(sessionId);
    try {
      console.log(`Requesting analysis for session ID: ${sessionId}`);
      const response = await axios.get(`http://localhost:5000/sessions/analysis/${sessionId}`);

      if (response.status === 200 && response.data && response.data.analysisResults) {
        console.log('Analysis already exists:', response.data.analysisResults);
        setExistingAnalysis((prevState) => ({
          ...prevState,
          [sessionId]: true,
        }));
        navigate(`/analysis/${sessionId}`);
      } else {
        setExistingAnalysis((prevState) => ({
          ...prevState,
          [sessionId]: false,
        }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('No analysis found. Sending images to Hugging Face model...');
        try {
          const mediaResponse = await axios.get(`http://localhost:5000/sessions/media/${sessionId}`);
          console.log('Media response:', mediaResponse.data);

          const { imagePaths = [], screenshotPaths = [] } = mediaResponse.data || {};
          const media = [...imagePaths, ...screenshotPaths];

          if (media.length === 0) {
            console.error('No media found for session.');
            alert('No media available for analysis in this session.');
            return;
          }

          const analysisResponse = await axios.post(`http://localhost:5000/sessions/analyze/${sessionId}`, { images: media });

          if (analysisResponse.data && analysisResponse.data.analysisResults) {
            const analysisResults = analysisResponse.data.analysisResults;
            await axios.post(`http://localhost:5000/sessions/${sessionId}/save-analysis`, { analysisResults });

            setExistingAnalysis((prevState) => ({
              ...prevState,
              [sessionId]: true,
            }));
            navigate(`/analysis/${sessionId}`);
          } else {
            console.error('Analysis response did not contain results:', analysisResponse.data);
          }
        } catch (error) {
          console.error('Error during analysis process:', error.response ? error.response.data : error.message);
        }
      } else {
        console.error('Error during analysis request:', error.response ? error.response.data : error.message);
      }
    } finally {
      setLoadingSessionId(null);
    }
  };

  return (
      <div className="analysis-container">
        <h1>Admin Interface</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          Object.keys(sessionsByDate).map((date) => (
            <div key={date} className="date-section">
              <h2>
                {date} <span>Total: {sessionsByDate[date].length}</span>
              </h2>
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsByDate[date].map((session) => {
                    const timestamp = new Date(session.timestamp).toLocaleTimeString();
  
                    return (
                      <tr key={session.sessionId}>
                        <td>{session.sessionName}</td>
                        <td>{timestamp}</td>
                        <td>
                {!existingAnalysis[session.sessionId] ? (
                <button 
                className="analyze-button" 
                onClick={() => handleSessionClick(session.sessionId)} 
                disabled={loadingSessionId === session.sessionId}
                >
                Analyze
                {loadingSessionId === session.sessionId && (
                <span className="spinner-border spinner-border-sm loading-spinner" role="status" aria-hidden="true"></span>
                )}
                </button>
                ) : (
                <button 
                  className="view-report-button" 
                  onClick={() => navigate(`/analysis/${session.sessionId}`)}
                  >
                View Report
                </button>
                  )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    );
  };
  
  export default Analysis;