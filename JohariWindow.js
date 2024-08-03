import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GreatLakesTheme.css';

const JohariWindow = ({ onSubmit }) => {
  const [selectedAdjectives, setSelectedAdjectives] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const adjectives = [
    'able', 'accepting', 'adaptable', 'bold', 'brave', 'calm', 'caring', 'cheerful', 'clever',
    'complex', 'confident', 'dependable', 'dignified', 'energetic', 'extroverted', 'friendly',
    'giving', 'happy', 'helpful', 'idealistic', 'independent', 'ingenious', 'intelligent',
    'introverted', 'kind', 'knowledgeable', 'logical', 'loving', 'mature', 'modest', 'nervous',
    'observant', 'organized', 'patient', 'powerful', 'proud', 'quiet', 'reflective', 'relaxed',
    'religious', 'responsive', 'searching', 'self-assertive', 'self-conscious', 'sensible',
    'sentimental', 'shy', 'silly', 'spontaneous', 'sympathetic', 'tense', 'trustworthy',
    'warm', 'wise', 'witty'
  ];

  useEffect(() => {
    setProgress((selectedAdjectives.length / 6) * 100);
  }, [selectedAdjectives]);

  const handleAdjectiveToggle = (adjective) => {
    setSelectedAdjectives(prev => {
      if (prev.includes(adjective)) {
        return prev.filter(a => a !== adjective);
      } else if (prev.length < 6) {
        return [...prev, adjective];
      } else {
        setError("Maximum allowed is 6 adjectives. Please uncheck one to select a new adjective.");
        return prev;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAdjectives.length < 5) {
      setError('Please select at least 5 adjectives.');
      return;
    }
    try {
      console.log('Submitting self-assessment:', { adjectives: selectedAdjectives });
      const response = await axios.post('/api/johari/submit-self', {
        adjectives: selectedAdjectives
      });
      
      if (response.data.success) {
        onSubmit(selectedAdjectives);
      } else {
        setError(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      if (error.response) {
        setError(`Error: ${error.response.data.message || 'Unknown server error'}`);
      } else if (error.request) {
        setError('Error: No response received from the server');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="container">
      <h2>Select 5-6 adjectives that describe you:</h2>
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{width: `${progress}%`}}
        ></div>
      </div>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="adjective-grid">
          {adjectives.map(adjective => (
            <button
              key={adjective}
              type="button"
              className={`adjective-btn ${selectedAdjectives.includes(adjective) ? 'selected' : ''}`}
              onClick={() => handleAdjectiveToggle(adjective)}
            >
              {adjective}
            </button>
          ))}
        </div>
        <button 
          className="btn submit-btn" 
          type="submit" 
          disabled={selectedAdjectives.length < 5}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default JohariWindow;