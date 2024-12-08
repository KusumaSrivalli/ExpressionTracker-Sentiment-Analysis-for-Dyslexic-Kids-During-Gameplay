import React, { useRef, useState, useEffect } from 'react';

// Function to analyze emotion via API
export const analyzeExpression = async (imageBlob) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/trpakov/vit-face-expression",
      {
        headers: {
          Authorization: "Bearer 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", // Ensure this is valid
          "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: imageBlob, // Send the image blob in the request body
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in API request:", error.message);
    throw error;
  }
};

// Function to save emotion result to MongoDB via the Express server
const saveEmotionResult = async (imageName, emotionResult) => {
  try {
    const response = await fetch('http://localhost:5000/saveEmotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageName,
        emotion: emotionResult.label,
        score: emotionResult.score,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save emotion result: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Save result response:', data);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      console.error('Error: Unable to connect to the server. Is it running?');
      throw new Error('Unable to connect to the server. Please ensure the backend server is running.');
    } else {
      console.error('Error saving emotion result:', error.message);
      throw error;
    }
  }
};

const WebcamEmotionAnalysis = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing the webcam:', error);
        setErrorMessage('Error accessing the webcam. Please check if your webcam is connected.');
      }
    };

    startWebcam();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      captureImage();
    }, 10000); // Capture every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const imageName = `image_${timestamp}.jpg`;

          try {
            const analysisResult = await analyzeExpression(blob);
            console.log('Analysis result:', analysisResult);

            // Save image and analysis result locally
            const csvBlob = createCSVBlob(imageName, analysisResult[0]);
            downloadBlob(csvBlob, `emotion_results_${timestamp}.csv`);

            setResult(JSON.stringify(analysisResult, null, 2)); // Display result

            // Save the result in MongoDB
            await saveEmotionResult(imageName, analysisResult[0]); // Updated to pass the first result
            setErrorMessage(''); // Clear any previous error messages on success
          } catch (error) {
            console.error('Error in emotion analysis or saving:', error);
            setErrorMessage(`Error: ${error.message}`);
            if (error.message.includes('Unable to connect to the server')) {
              setErrorMessage(`${error.message} Please check if your backend server is running on http://localhost:5000`);
            }
          }
        } else {
          console.error('Blob generation failed');
          setErrorMessage('Failed to capture image for analysis.');
        }
      }, 'image/jpeg');
    }
  };

  const downloadBlob = (blob, fileName) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const createCSVBlob = (imageName, result) => {
    const csvContent = `Image,Emotion,Score\n${imageName},${result.label},${result.score}\n`;
    return new Blob([csvContent], { type: 'text/csv' });
  };

  return (
    <div>
      <video ref={videoRef} id="webcam" autoPlay playsInline style={{display: 'none'}} />
      <canvas ref={canvasRef} id="snapshot" style={{ display: 'none' }} />
       {/* <button onClick={captureImage}>Capture Image</button>  */}
      {/* {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} */}
    </div>
  );
};

export default WebcamEmotionAnalysis;
