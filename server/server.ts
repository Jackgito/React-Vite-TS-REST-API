import express, { Request, Response } from 'express'; // Web server framework
import bodyParser from 'body-parser'; // Parse JSON from requests
import { Builder } from 'xml2js'; // Convert XML to JSON
import fs from 'fs/promises'; // File system operations
import cors from 'cors'; // Resource sharing with client and server

const app = express();
const PORT = 3000;

const XML_FILE_PATH = 'notes.xml';

interface Note {
  text: string[];
  timestamp: string[];
}

interface Topic {
  $: { name: string };
  note: Note[];
}

interface NotesDatabase {
  data: {
    topic: Topic[];
  };
}

let notesDatabase: NotesDatabase = {
  data: {
    topic: [],
  },
};

// Load notes from XML file at server startup
const loadNotesFromXml = async () => {
  try {
    const xmlData = await fs.readFile(XML_FILE_PATH, 'utf-8');
    if (xmlData.trim() !== '') {
      notesDatabase = JSON.parse(xmlData);
    }
  } catch (error) {
    console.error('Error reading XML file:', error);
  }
};

loadNotesFromXml();

app.use(cors());
app.use(bodyParser.json());

// Add a new note to XML file
app.post('/addNote', async (req: Request, res: Response) => {
  const { topic, text, timestamp } = req.body;

  const topicIndex = notesDatabase.data.topic.findIndex(
    (t) => t.$.name === topic
  );

  if (topicIndex === -1) {
    notesDatabase.data.topic.push({
      $: { name: topic },
      note: [{ text: [text], timestamp: [timestamp] }],
    });
  } else {
    notesDatabase.data.topic[topicIndex].note.push({
      text: [text],
      timestamp: [timestamp],
    });
  }

  // Save data to XML file
  const xmlBuilder = new Builder();
  const xml = xmlBuilder.buildObject({ data: notesDatabase.data }); // Save only the 'data' part

  try {
    await fs.writeFile(XML_FILE_PATH, xml, 'utf-8');
    res.send('Note added successfully');
  } catch (error) {
    console.error('Error writing to XML file:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve notes for a specific topic
app.get('/getNotes/:topic', (req: Request, res: Response) => {
  const { topic } = req.params;
  const topicData = notesDatabase.data.topic.find(
    (t) => t.$.name === topic
  );

  const notes = topicData ? topicData.note : [];
  res.json(notes);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
