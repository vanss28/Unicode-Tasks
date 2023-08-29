const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb+srv://vanss2808:Jns$2020@cluster0.y86jjmu.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true//what is it
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    minlength: 3, // Minimum word length constraint
    maxlength: 50 // Maximum word length constraint
  },
  meanings: String ,
  synonyms: String,
  antonyms: String
});
const Word = mongoose.model('Word', wordSchema);

app.use(bodyParser.json());

// Endpoint to fetch word meanings
app.get('/getMeaning/:input', async (req, res) => {
  const word = req.params.input;

  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

    if (response.data.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const meanings = response.data[0].meanings.map(meaning => {
      return {
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map(definition => definition.definition)
      };
    });

    res.json({ word, meanings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// POST request to store a new word along with its meaning
app.post('/addWord', async (req, res) => {
  const wordEntry = new Word({ ...req.body });

  try {
    await wordEntry.save();
    res.status(201).json(wordEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while storing data' });
  }
});

app.get('/getAllMeanings', async (req, res) => {
  try {
    const allMeanings = await Word.find({});
    res.status(200).json(allMeanings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while storing data' });
  }
});

app.get('/getWord/:word', async (req, res) => {
  const word = req.params.word;

  try {
    const foundWord = await Word.findOne({ word });

    if (!foundWord) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(foundWord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});
// Endpoint to fetch a specific word from the database
app.get('/getWordInput', async (req, res) => {
  const word = req.body.word;

  try {
    const foundWord = await Word.findOne({ word });
    console.log(foundWord);

    if (!foundWord) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(foundWord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


