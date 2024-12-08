import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Chart } from "chart.js/auto";
import 'bootstrap/dist/css/bootstrap.min.css';
import './OverallAnalysis.css'; // Custom styles
import ReactSpeedometer from "react-d3-speedometer"; // Gauge chart library
import ChartDataLabels from "chartjs-plugin-datalabels";

const EmotionAnalysis = () => {
  const [emotionData, setEmotionData] = useState({});
  const [sessionTitle, setSessionTitle] = useState('');
  const { sessionId } = useParams();
  
  const donutChartRef = useRef(null);
  const navigate = useNavigate(); // For navigating to detailed analysis page

  useEffect(() => {
    const fetchEmotionData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/sessions/${sessionId}`);
        const modelResponse = response.data;

        console.log("Fetched Emotion Data:", modelResponse); // Debug API response

        setSessionTitle(modelResponse.sessionName || 'Unnamed Session');

        const emotionTotals = {};
        let count = 0;

        modelResponse.forEach((imageEmotions, index) => {
          if (imageEmotions.result && Array.isArray(imageEmotions.result)) {
            imageEmotions.result.forEach((emotion) => {
              if (!emotionTotals[emotion.label]) {
                emotionTotals[emotion.label] = 0;
              }
              emotionTotals[emotion.label] += emotion.score;
            });
            count++;
          } else {
            console.error(`Invalid or missing 'result' at index ${index}:`, imageEmotions);
          }
        });

        const averages = {};
        for (const [label, total] of Object.entries(emotionTotals)) {
          averages[label] = (total / count) * 100;
        }

        console.log("Processed Emotion Data:", averages); // Debug processed data
        setEmotionData(averages);
      } catch (error) {
        console.error("Error fetching emotion data", error);
      }
    };

    fetchEmotionData();
  }, [sessionId]);

  useEffect(() => {
    if (Object.keys(emotionData).length > 0) {
      // Destroy existing chart if it exists
      if (donutChartRef.current) donutChartRef.current.destroy();

      const donutCanvas = document.getElementById("emotionDonutChart");
      if (!donutCanvas) {
        console.error("Doughnut chart canvas not found in the DOM.");
        return;
      }

      const donutContext = donutCanvas.getContext("2d");
      if (!donutContext) {
        console.error("Doughnut chart context not found.");
        return;
      }

      const labels = Object.keys(emotionData);
      const dataValues = Object.values(emotionData);

      // Find the highest emotion
      const maxEmotionIndex = dataValues.indexOf(Math.max(...dataValues));
      const highestEmotion = labels[maxEmotionIndex];
      const highestEmotionValue = dataValues[maxEmotionIndex].toFixed(2);

      // Create Doughnut Chart
      donutChartRef.current = new Chart(donutContext, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: ["#6B8E23", "#FF6347", "#FFD700", "#20B2AA", "#4682B4", "#6A4C93"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                color: "black",
                font: {
                  size: 14,
                  family: "Arial",
                  weight: "bold",
                },
              },
            },
            datalabels: {
              color: "white",
              font: {
                size: 14,
                weight: "bold",
              },
              formatter: (value, context) => {
                const label = context.chart.data.labels[context.dataIndex];
                return `${label}\n${value.toFixed(2)}%`; // Show emotion and its percentage
              },
              anchor: "center",
              align: "center",
            },
          },
        },
        plugins: [
          ChartDataLabels,
          {
            id: "centerTextPlugin",
            beforeDraw: (chart) => {
              const ctx = chart.ctx;
              const width = chart.width;
              const height = chart.height;

              ctx.restore();
              const fontSize = (height / 10).toFixed(2);
              ctx.font = `${fontSize}px Arial`;
              ctx.textBaseline = "middle";

              const text = `${highestEmotion}\n${highestEmotionValue}%`;
              const textX = Math.round((width - ctx.measureText(text).width) / 2);
              const textY = height / 2;

              // Draw central text
              ctx.fillStyle = "#000";
              ctx.fillText(text.split("\n")[0], width / 2, textY - 10); // Emotion label
              ctx.fillText(text.split("\n")[1], width / 2, textY + 10); // Percentage value
              ctx.save();
            },
          },
        ],
      });
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (donutChartRef.current) donutChartRef.current.destroy();
    };
  }, [emotionData]);

    // Cleanup function to destroy the chart when the component unmounts

  // Navigate to the Detailed Analysis page
  const handleDetailedAnalysis = () => {
    navigate(`/DetailedAnalysis/${sessionId}`);
  };

  return (
    <div className="overallanalysis-emotion-analysis-container">
      <h1 className="overallanalysis-text-center session-title">Expression Analysis for Session: {sessionTitle}</h1>
      <div className="overallanalysis-emotion-summary">
        <h4>Average Emotion Percentages</h4>
        <div className="overallanalysis-gauge-container">
          {Object.entries(emotionData).map(([emotion, avg]) => (
            <div key={emotion} className="gauge-item">
              <ReactSpeedometer
                value={avg}
                maxValue={100}
                segments={5}
                needleColor="black"
                startColor="#FF6347"
                endColor="#32CD32"
                textColor="#000000"
                currentValueText={`${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${avg.toFixed(2)}%`}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleDetailedAnalysis}>
          Go to Detailed Analysis
        </button>
      </div>
      <div id="overallanalysis-chart-container" className="overallanalysis-chart-container">
        <div className="overallanalysis-chart-item">
          <canvas id="emotionDonutChart" width="400" height="400"></canvas>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalysis;