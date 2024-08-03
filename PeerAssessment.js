import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import '../styles/GreatLakesTheme.css';

const PeerAssessment = ({ onSubmit, userName, onNavigate }) => {
  const [selectedAdjectives, setSelectedAdjectives] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [peerName, setPeerName] = useState('');
  const [peerEmail, setPeerEmail] = useState('');
  const [generateQR, setGenerateQR] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');

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

  const getProgressColor = (progress) => {
    if (progress <= 20) return '#8B0000';
    if (progress <= 40) return '#FF0000';
    if (progress <= 60) return '#FFA500';
    if (progress <= 80) return '#FFFF00';
    if (progress < 100) return '#90EE90';
    return '#006400';
  };

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
    if (!peerName.trim()) {
      setError('Please enter the peer\'s name.');
      return;
    }
    if (selectedAdjectives.length < 5 || selectedAdjectives.length > 6) {
      setError('Please select 5-6 adjectives.');
      return;
    }
    try {
      const response = await axios.post('/api/johari/submit-peer', {
        userName, // Using the userName prop in the request
        peerName,
        peerEmail,
        adjectives: selectedAdjectives
      });
      
      if (response.data.success) {
        onSubmit({ peerName, adjectives: selectedAdjectives });
        onNavigate('/johari-window');
      } else {
        setError(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error submitting peer assessment:', error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGenerateQR = async () => {
    if (!peerName || !peerEmail) {
      setError('Please enter peer name and email before generating QR code.');
      setGenerateQR(false);
      return;
    }
    try {
      console.log('Generating QR code for:', { userName, peerName, peerEmail });
      const response = await axios.post('/api/johari/generate-qr', {
        userName,
        peerName,
        peerEmail
      });
      console.log('QR code response:', response.data);
      if (response.data.success && response.data.qrCodeData) {
        setQRCodeData(response.data.qrCodeData);
        setShowQRCode(true);
      } else {
        throw new Error('QR code data is missing from the response');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError(`Error generating QR code: ${error.message}. Please try again.`);
      setGenerateQR(false);
    }
  };

  const handleSendToPeer = async () => {
    if (!peerName.trim() || !peerEmail.trim()) {
      setError('Please enter peer name and email.');
      return;
    }
    try {
      const response = await axios.post('/api/johari/send-peer-email', {
        userName,
        peerName,
        peerEmail,
        generateQR
      });
      
      if (response.data.success) {
        alert('Invitation sent successfully to the peer.');
      } else {
        setError(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error sending invitation to peer:', error);
      setError(`Error sending invitation: ${error.message}`);
    }
  };

  const handleReset = () => {
    setPeerName('');
    setPeerEmail('');
    setSelectedAdjectives([]);
    setError('');
    setGenerateQR(false);
    setShowQRCode(false);
  };

  useEffect(() => {
    if (generateQR) {
      handleGenerateQR();
    } else {
      setShowQRCode(false);
    }
  }, [generateQR]);

  return (
    <div className="container">
      <h2>Peer Assessment for {userName}</h2>
      <div className="peer-info">
        <input
          type="text"
          value={peerName}
          onChange={(e) => setPeerName(e.target.value)}
          placeholder="Enter peer's name"
          required
          className="peer-input"
        />
        <input
          type="email"
          value={peerEmail}
          onChange={(e) => setPeerEmail(e.target.value)}
          placeholder="Enter peer's email (optional)"
          className="peer-input"
        />
        <button 
          onClick={handleReset} 
          className={`reset-btn ${peerName || peerEmail ? 'active' : ''}`}
          disabled={!peerName && !peerEmail}
        >
          Reset
        </button>
      </div>
      <div className="qr-and-send">
        <label className="qr-checkbox">
          <input
            type="checkbox"
            checked={generateQR}
            onChange={(e) => setGenerateQR(e.target.checked)}
          />
          Generate QR Code
        </label>
        <button 
          onClick={handleSendToPeer} 
          className="send-to-peer-btn"
          disabled={!peerName.trim() || !peerEmail.trim()}
        >
          Send to Peer
        </button>
      </div>
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{
            width: `${progress}%`,
            backgroundColor: getProgressColor(progress)
          }}
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
          disabled={selectedAdjectives.length < 5 || !peerName.trim()}
        >
          Submit
        </button>
      </form>
      {showQRCode && (
        <div className="qr-popup">
          <div className="qr-content">
            <h3>QR Code for Peer Assessment</h3>
            <QRCode value={qrCodeData} size={256} />
            <p>Scan this QR code to access the peer assessment.</p>
            <button onClick={() => setShowQRCode(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerAssessment;