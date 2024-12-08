import React, { useState, useEffect, useRef } from "react"; // Imports React hooks for state, effect, and refs
import "./gamestyle.css"; // Imports CSS for styling
import axios from "axios"; // Imports Axios for HTTP requests
import { useLocation } from "react-router-dom"; // Imports useLocation hook for accessing route data
import { v4 as uuidv4 } from "uuid"; // Imports UUID for generating unique IDs

// Imports images used for questions
// import image1 from './image1.jpg';
// import pen from './pen.jpg';
// import hen from './hen.jpg';
// import car1 from './car1.jpeg';
// import grapes from './grapes.jpg';
// import cat from './Cat_March_2010-1a.jpg';

// // Array of question objects containing image source and correct answer
 const questions = [
   {  },
   {  answer: 'pen' },
   {  answer: 'hen' },   {  answer: 'car' },
   {  answer: 'grapes' },
   { answer: 'cat' },
 ];

const Gameindex = () => {
  // Sets up route data, references, and game state variables
  const location = useLocation(); // Accesses the state passed from the router
  const videoRef = useRef(null); // Reference to video element
  const canvasRef = useRef(null); // Reference to canvas element for capturing images
  const captureIntervalRef = useRef(null); // Reference to capture interval timer

  // Initializes state variables for game functionality
  const [sessionName, setSessionName] = useState(location.state?.sessionName || "Undefined");
  const [sessionId, setSessionId] = useState(uuidv4()); // Unique session ID
  const [shuffledQuestions, setShuffledQuestions] = useState([]); // Shuffled questions for randomness
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Current question index
  const [score, setScore] = useState(0); // Score counter
  const [timeRemaining, setTimeRemaining] = useState(120); // Game timer
  const [showEndScreen, setShowEndScreen] = useState(false); // Shows end screen on game over
  const [guess, setGuess] = useState(''); // Stores user’s answer
  const [resultMessage, setResultMessage] = useState(''); // Feedback for user guess
  const [messageColor, setMessageColor] = useState(''); // Message color based on answer correctness
  const [webcamGranted, setWebcamGranted] = useState(false); // Webcam access status
  const [cameraActive, setCameraActive] = useState(false); // Camera activation status
  const [hasStarted, setHasStarted] = useState(false); // Game start status

  const speech = new SpeechSynthesisUtterance(); // Object for text-to-speech feedback

  // Requests camera access and assigns video stream to video element
  const requestWebcamAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Set video source to the webcam stream
      videoRef.current.srcObject = stream;
  
      // Update state to indicate that webcam access was granted
      setWebcamGranted(true);
  
      // Check if the camera is live and update the state accordingly
      const isCameraLive = stream.getVideoTracks()[0]?.readyState === "live";
      setCameraActive(isCameraLive);
  
      // Hide the video element if needed
      videoRef.current.style.display = "none";
    } catch (error) {
      // Update state to indicate that webcam access was denied
      setWebcamGranted(false);
    }
  };
  
  // Randomizes question order at the beginning of the game
  useEffect(() => {
    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffleArray(questions));
}, []);

  // Timer that updates timeRemaining every second and ends game if time runs out
  useEffect(() => {
    if (timeRemaining > 0 && !showEndScreen) {
      const timerId = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timerId); // Cleans up timer on component unmount
    } else if (timeRemaining <= 0) {
      endGame(); // Calls endGame function if timer runs out
    }
  }, [timeRemaining, showEndScreen]);
  // Captures an image from the webcam feed and uploads it
  const captureImage = () => {
    if (!cameraActive || !sessionId) return; // Stops if camera isn't active
    const canvas = canvasRef.current; // Gets canvas reference
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); // Draws webcam image on canvas

    // Converts canvas image to blob and uploads it
    canvas.toBlob((blob) => uploadImage(blob, "capture.png"));
  };

  // Handles image upload to server with session metadata
  const uploadImage = (blob, fileName) => {
    const formData = new FormData(); // Creates form data for upload
    formData.append("capture", blob, fileName);
    formData.append("sessionId", sessionId);
    formData.append("sessionName", sessionName);

    axios.post("http://localhost:5000/uploads", formData)
      .then((response) => console.log("Image uploaded:", response.data))
      .catch((error) => console.error("Error uploading image:", error));
  };

  // Starts game by resetting states and starting image capture interval
  const startGame = () => {
    setSessionId(uuidv4()); // Generates new session ID
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5)); // Randomizes questions
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeRemaining(120); // Resets timer
    setShowEndScreen(false);
    setResultMessage('');
    setGuess('');
    setHasStarted(true);
    captureIntervalRef.current = setInterval(captureImage, 10000); // Captures image every 10 seconds
  };

  // Checks if user guess is correct, provides feedback, and advances to next question
  const handleGuessSubmit = () => {
    const isCorrect = guess.toLowerCase() === questions[currentQuestionIndex].answer.toLowerCase();
    speech.text = guess;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech); // Provides speech feedback

    if (isCorrect) {
      setResultMessage("Correct!");
      setMessageColor("green");
      setScore(score + 1); // Increments score if correct
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1); // Advances to next question
      } else {
        displayWinMessage(); // Displays win message if all questions answered
      }
    } else {
      setResultMessage("Try again!");
      setMessageColor("red");
    }
  };

  // Displays a win message when the game is completed
  const displayWinMessage = () => {
    document.body.innerHTML = ''; // Clears body content
    const h1 = document.createElement('h1');
    h1.textContent = 'HURRAY!! YOU HAVE COMPLETED THE QUIZ!';
    h1.style.color = 'green';
    h1.style.textAlign = 'center';
    document.body.appendChild(h1);

    speech.text = 'HURRAY!! YOU HAVE COMPLETED THE QUIZ !';
    window.speechSynthesis.speak(speech);

    // Adds a button to return to homepage
  startConfetti();
  };
  function startConfetti() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const confettiColors = ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];
    const confettiArray = [];

    function ConfettiPiece(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 8 + 2;
        this.speedY = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
    }

    ConfettiPiece.prototype.draw = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    };

    ConfettiPiece.prototype.update = function() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y > canvas.height) this.y = 0; // Loop confetti from the top
    };

    function createConfetti() {
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confettiArray.push(new ConfettiPiece(x, y, color));
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiArray.forEach((confetti) => {
            confetti.update();
            confetti.draw();
        });
        requestAnimationFrame(animateConfetti);
    }

    createConfetti();
    animateConfetti();
  }; 

  // Ends the game and clears capture interval
  const endGame = () => {
    setShowEndScreen(true);
    clearInterval(captureIntervalRef.current);
  };

  return (
    <div className="gamestyle-body">
      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }}></video> {/* Hidden video element */}
      <canvas ref={canvasRef} style={{ display: "none" }} width="520" height="480"></canvas> {/* Hidden canvas element */}

      {/* Game controls and interface */}
      {/* (!webcamGranted || !cameraActive) ? requestWebcamAccess() :
        !hasStarted ? (
          <button onClick={startGame}>Start Game</button> // Start button before game begins
        ) : !showEndScreen ? (
          <div className="game-container">
            <div className="gamestyle-timer"> */}
              {/* Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
            </div>
            <h1>Guess the object!!!</h1>
            {currentQuestionIndex < questions.length && ( */}
              {/* <img src={shuffledQuestions[currentQuestionIndex].src} alt="Guess the object" width="200px" />
            {/* )} */}
            {/* <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Enter your guess" />
            <button onClick={handleGuessSubmit}>Submit Guess</button>
            //</div><p style={{ color: messageColor }}>{resultMessage}</p> */}
          </div>
  )
}      
export default Gameindex;
