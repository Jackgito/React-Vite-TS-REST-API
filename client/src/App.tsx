import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Note {
  text: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
}

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const addNote = async () => {
    try {
      await axios.post<void>('http://localhost:3000/addNote', { topic, text, timestamp });
      console.log('Note added successfully');
      setSuccessMessage('Note added successfully');
      setError(null);
    } catch (error) {
      console.error('Error adding note:', error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        setError({ error: 'Invalid topic name. Please avoid spaces and special characters.' });
      } else {
        setError({ error: 'Error adding note.' });
      }
    }
  };

  const getNotes = async () => {
    try {
      const response = await axios.get<Note[]>(`http://localhost:3000/getNotes/${topic}`);
      setNotes(response.data);
      setError(null);
    } catch (error) {
      console.error('Error getting notes:', error);
      setError({ error: 'Error getting notes. Please try again.' });
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">RPC Notebook</h1>

      {/* Success message */}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error.error}
        </div>
      )}

      {/* Form */}
      <div className="mb-3">
        <label className="form-label">Topic:</label>
        <input type="text" className="form-control" value={topic} onChange={(e) => setTopic(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Text:</label>
        <textarea className="form-control" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Timestamp:</label>
        <input type="text" className="form-control" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
      </div>

      {/* Buttons */}
      <button className="btn btn-primary me-2" onClick={addNote}>
        Add Note
      </button>
      <button className="btn btn-secondary" onClick={getNotes}>
        Get Notes
      </button>

      {/* Notes */}
      <div className="mt-4">
        <h2>Notes:</h2>
        <ul className="list-group">
          {notes.map((note: Note, index: number) => (
            <li key={index} className="list-group-item">
              {note.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
