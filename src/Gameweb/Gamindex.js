import React, { useState, useEffect } from "react"; // Import React hooks
import { useRef } from "react"; // Import useRef for referencing DOM elements
import { useNavigate } from "react-router-dom";
import "./gamestyle.css"; // Import CSS file for styling
import axios from "axios"; // Import axios for making HTTP requests
import html2canvas from "html2canvas"; // Import html2canvas for capturing screenshots
import { useLocation } from "react-router-dom"; // Import useLocation to get route data
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique session IDs
import confetti from 'canvas-confetti'; 
// Import image assets

// Array of questions with images and correct answers
const questions = [
  {question:'Correct the Spelling',src:'/apple.jpg', answer: 'apple',speechPrompt: 'Enter the spelling of apple' },
  {question:'Correct the spelling',src:'/doll.jpg',answer:'doll',speechPrompt: 'Enter the spelling of doll'},
  {question: 'Guess the Object!',src: '/pen.jpg', answer: 'pen' ,speechPrompt: 'Guess the Object'},
  {question: 'Guess the Animal', src: '/hen.jpg', answer: 'hen' ,speechPrompt: 'Guess the animal'},
  {question: 'Guess the Object!', src: '/car1.jpeg', answer: 'car',speechPrompt: 'Guess the Object' },
  {question: 'Guess the Animal', src:'/Cat.jpg', answer: 'cat' ,speechPrompt: 'Guess the Animal'},
];  

const Game = () => {
  const location = useLocation();
  const [sessionName, setSessionName] = useState("");
  useEffect(() => {
    const session = location.state?.sessionName || "Unnamed Session";
    setSessionName(session);
    console.log("Session Name (in game.js):", session); // Ensure this is printed correctly
  }, [location.state]);

  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(2 * 60); // 3 minutes
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [answerStates, setAnswerStates] = useState([]); // Array to track button states
  const [hasStarted, setHasStarted] = useState(false); // New state for game start
  const [webcamGranted, setWebcamGranted] = useState(false); // State to track webcam access
  const [cameraActive, setCameraActive] = useState(false); // State to track if the camera is active
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [messageColor, setMessageColor] = useState(''); // To store the message color
  const speech = new SpeechSynthesisUtterance();
  const videoRef = useRef(null); // Reference to the video element
  const canvasRef = useRef(null); // Reference to the canvas element for capturing images
  const captureIntervalRef = useRef(null); // To store the interval ID for image capture
  const [sessionId, setSessionId] = useState(null); // State for session ID
  const { v4: uuidv4 } = require("uuid");
  let newSessionId = "null";

  const isCameraActive = () => {
    const stream = videoRef.current?.srcObject;
    if (stream && stream.getVideoTracks().length > 0) {
      const track = stream.getVideoTracks()[0];
      return track.readyState === "live" && track.enabled; // Check if track is live and enabled
    }
    return false;
  };

  // Function to request webcam access
  const requestWebcamAccess = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setWebcamGranted(true);

        const track = stream.getVideoTracks()[0];

        // Check if the camera track is live
        if (track.readyState === "live" && track.enabled) {
          setCameraActive(true);
        } else {
          setCameraActive(false);
        }

        videoRef.current.style.display = "none"; // hide the vedio feed

        // Periodically check if the camera is still active
        const checkInterval = setInterval(() => {
          if (!isCameraActive()) {
            //alert("Camera is not active. Please ensure the camera is turned on.");
            setCameraActive(false);
          } else {
            console.log("Camera is active only ");
            setCameraActive(true);
          }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(checkInterval); // Clean up interval
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setWebcamGranted(false); // Webcam access denied
        setCameraActive(false); // Camera not active
      });
  };

  useEffect(() => {
    // shuffling the questions during the game play
    setShuffledQuestions(questions.sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    // Modify the timer logic to check for game completion
    if (timeRemaining > 0 && !showEndScreen) {
      const timerId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          // Check if time is running out
          if (prevTime <= 1) {
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeRemaining, showEndScreen]);


  const startGame = () => {
    if (!webcamGranted || !isCameraActive()) {
      alert(
        "Please allow access to the camera and ensure it is active to start the game."
      );
      return;
    }
    newSessionId = uuidv4();
    setSessionId(newSessionId); // Generate a new session ID
    console.log("Session id generated..." + newSessionId);
    handleUpload(newSessionId);
    setShuffledQuestions(questions.sort(() => Math.random() - 0.5));
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeRemaining(2 * 60);
    setShowEndScreen(false);
    setSelectedAnswerIndex(null);
    setAnswerStates([]);
    setHasStarted(true); // Start the game
    captureIntervalRef.current = setInterval(captureImage, 10000);
    // start image caputre(calling the image capture function for every 30 secs)
  };

  const captureImage = () => {
    if (!isCameraActive()) {
      alert("Camera is not active. Please ensure the camera is turned on.");
      return;
    }
    if (!newSessionId) {
      // Check if sessionId is null
      console.error("Session ID is null. Cannot capture images.");
      return; // Skip capture if no session ID is set
    }

    // Capture the video feed
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Capture the entire webpage using html2canvas
    html2canvas(document.body).then((screenshotCanvas) => {
      screenshotCanvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append("screenshot", blob, "screenshot.png"); // Screenshot of the page
        formData.append("newSessionId", newSessionId); // Add session ID to the form data
        formData.append("sessionName", sessionName);
        console.log("Captured screenshot. Session ID: " + newSessionId);

        // Send the screenshot image to the server
        axios
          .post("http://localhost:5000/screenshots", formData)
          .then((response) =>
            console.log("Screenshot uploaded:", response.data)
          )
          .catch((error) =>
            console.error("Error uploading screenshot:", error)
          );
      });
    });

    // Capture the video feed image as before
    canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append("image", blob, "capture.png"); // Append the image file
      formData.append("newSessionId", newSessionId); // Append the session ID
      formData.append("sessionName", sessionName); // Append the session name

      console.log(
        "Image captured. Session ID: " +
          newSessionId +
          " | Session Name: " +
          sessionName
      );

      // Send the image, session ID, and session name to the server
      axios
        .post("http://localhost:5000/uploads", formData)
        .then((response) =>
          console.log("Image uploaded with session details:", response.data)
        )
        .catch((error) =>
          console.error("Error uploading image with session details:", error)
        );
    });
  };
   const handleUpload = async (sessionId) => {
     const formData = new FormData();
     formData.append('newSessionId', sessionId);  // Add sessionId
     formData.append('sessionName', sessionName); // Add sessionName

     try {
         const response = await fetch('http://localhost:5000', {
             method: 'POST',
             body: formData,
         });

         const result = await response.json();
         console.log(result);
     } catch (error) {
         console.error('Error uploading file:', error);
     }
   };

  const endGame = () => {
    setShowEndScreen(true);
    clearInterval(captureIntervalRef.current); // Stop image capture
    const endGameSpeech = new SpeechSynthesisUtterance('Hurray! You have completed the quiz!');
    endGameSpeech.rate = 0.8; // Slightly slower speech
    window.speechSynthesis.speak(endGameSpeech);
    startConfetti();
  };

  const startConfetti = () => {
    // Create multiple confetti bursts
    const duration = 3 * 1000; // 3 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 0 
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Since we're using multiple colors, we'll create multiple bursts
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0']
      }));
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0']
      }));
    }, 250);
  };

  useEffect(() => {
    loadNewImage();
  }, [currentIndex]);

  const loadNewImage = () => {
    if (currentIndex < questions.length) {
      setResultMessage('');
      setGuess('');
     } 
     else {
      <button className="btn" onClick={() => (window.location.href = "/")}>
            Home
          </button>
   }
  };

   useEffect(() => {
    const currentQuestion = questions[currentIndex];
    if (currentQuestion) {
      const speech = new SpeechSynthesisUtterance(currentQuestion.speechPrompt);
      speech.rate = 0.7; // Set speech rate to slow
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      window.speechSynthesis.speak(speech);
    }
  }, [currentIndex]);

  /* Function to handle user's guess submission */
  const handleGuessSubmit = () => {
    const userGuess = guess.toLowerCase();
    const correctAnswer = questions[currentIndex].answer.toLowerCase();
    speech.text = guess;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    window.speechSynthesis.speak(speech);

    let timeout = 0;

    if (userGuess === correctAnswer) {
      speech.text = 'Correct!';
      window.speechSynthesis.speak(speech);
      setResultMessage('Correct!');
      setMessageColor('green'); // Set message color to green
      setScore(score + 1);
      timeout = 3000; // Short timeout for correct answers
    } 
    else {
      setResultMessage('Oops! You are Wrong');
      speech.text = `The correct answer is ${correctAnswer}.`;
      window.speechSynthesis.speak(speech);
      setMessageColor('red'); // Set message color to red
      
      // Delay for speaking each letter
      correctAnswer.split('').forEach((letter, index) => {
        setTimeout(() => {
          const letterSpeech = new SpeechSynthesisUtterance(letter);
          window.speechSynthesis.speak(letterSpeech);
        }, index * 500); // Speak each letter with a 0.5-second interval
      });

      timeout = (correctAnswer.length + 2) * 1700; // Longer timeout for incorrect answers
    }
    
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      }
      else {
        // All questions completed
        endGame();
      }
    }, timeout);
  };

  useEffect(() => {
    loadNewImage(); // This is equivalent to window.onload in vanilla JS
  }, []);

  return (
    <div className="gamestyle-body">
      {/* <Header /> */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      ></video>
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width="640"
        height="480"
      ></canvas>

     { !webcamGranted ? (
        requestWebcamAccess()
      ): !cameraActive ? (
        // 
        requestWebcamAccess()
      ) : !hasStarted ? (
        // 
        startGame()
      ) : !showEndScreen ? (
          <div className="gamestyle-body">
          <div className="gamestyle-timer">
            Time Remaining: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </div>
          
          <div className="gamestyle-box1">
        <div className="gamestyle-box2">
          <h1>{questions[currentIndex].question}</h1>
          {currentIndex < questions.length && (
            <img
              id="gamestyle-image"
              src={questions[currentIndex].src} // Dynamically set the image source
              alt="Guess the object"
              width="200px"
            />
          )}
          <div className="gamestyle-box3">
            <input
              className="gamestyle-guess-input"
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess"
            />
            <p>
              <b
                className="gamestyle-result-message"
                style={{ color: messageColor }} // Apply dynamic color based on result
              >
                {resultMessage}
              </b>
            </p>
            <button className="gamestyle-bottom-button" onClick={handleGuessSubmit}>
              Submit
            </button>
            </div>
        </div>
      </div>
    </div>
      ):(
        <div className="end-screen">
          <h2>Hurray you have completed the quiz!</h2>
          <p className="gamestyle-score">
            Score: {score}/{questions.length}
          </p>
          <button 
            className="btn" 
            onClick={() => window.location.href = "/"}>
            Back to Home
          </button>
        </div>
      )}
        </div>
      );
    };
export default Game;