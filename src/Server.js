const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000; // Backend server port

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const mongoURI = 'mongodb+srv://practiceuser:12345@test-pro-db.utets.mongodb.net/?retryWrites=true&w=majority&appName=test-pro-db';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Emotion Schema and Model
const emotionSchema = new mongoose.Schema({
  imageName: String,
  emotions: [
    {
      emotion: String,
      score: Number,
      timestamp: { type: Date, default: Date.now },
    }
  ],
});

const Emotion = mongoose.model('Emotion', emotionSchema);

// Route to save emotion data
app.post('/saveEmotion', async (req, res) => {
  try {
    const { imageName, emotion, score } = req.body;

    // Find or create a document for the image and push new emotion data
    const emotionDoc = await Emotion.findOneAndUpdate(
      { imageName },
      { $push: { emotions: { emotion, score } } }, // Add new emotion to emotions array
      { new: true, upsert: true }
    );

    res.status(200).json(emotionDoc);
  } catch (error) {
    console.error('Error saving emotion:', error);
    res.status(500).send('Error saving emotion');
  }
});