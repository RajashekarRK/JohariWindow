import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GreatLakesTheme.css';
import AdditionalPeerAssessment from './AdditionalPeerAssessment';

const JohariResults = ({ name, selfAdjectives, peerAssessments }) => {
  const [additionalPeers, setAdditionalPeers] = useState([null, null, null, null]);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [johariData, setJohariData] = useState({
    arena: [],
    blindSpot: [],
    facade: [],
    unknown: []
  });

  const allAdjectives = [
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
    calculateJohariWindow();
  }, [selfAdjectives, peerAssessments]);

  const calculateJohariWindow = () => {
    const peerAdjectivesSet = new Set(peerAssessments.flatMap(assessment => assessment.adjectives));
    const selfAdjectivesSet = new Set(selfAdjectives);

    const arena = selfAdjectives.filter(adj => peerAdjectivesSet.has(adj));
    const blindSpot = [...peerAdjectivesSet].filter(adj => !selfAdjectivesSet.has(adj));
    const facade = selfAdjectives.filter(adj => !peerAdjectivesSet.has(adj));
    const unknown = allAdjectives.filter(adj => !selfAdjectivesSet.has(adj) && !peerAdjectivesSet.has(adj));

    setJohariData({ arena, blindSpot, facade, unknown });
  };

  const handleAdditionalPeerSubmit = (peerInfo, index) => {
    const newAdditionalPeers = [...additionalPeers];
    newAdditionalPeers[index] = peerInfo;
    setAdditionalPeers(newAdditionalPeers);
  };

  const handleDownloadReport = async () => {
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      alert('Please fill in all fields to download the report.');
      return;
    }
    try {
      await axios.post('/api/send-report', { 
        ...userInfo, 
        johariData: { 
          selfAdjectives, 
          peerAssessments,
          johariWindow: johariData
        } 
      });
      alert('Report has been sent to your email.');
      setShowDownloadPopup(false);
    } catch (error) {
      alert('Failed to send report. Please try again.');
    }
  };

  const renderAdjectiveList = (adjectives) => {
    return (
      <div className="adjective-list">
        {adjectives.map(adj => <span key={adj} className="adjective-item">{adj}</span>)}
      </div>
    );
  };

  return (
    <div className="johari-results">
      <div className="johari-container">
        <div className="additional-peers-panel">
          {additionalPeers.map((peer, index) => (
            <div key={index}>
              {peer ? (
                <div>{peer.name} - Invitation sent</div>
              ) : (
                <button onClick={() => setAdditionalPeers(prev => {
                  const newPeers = [...prev];
                  newPeers[index] = 'pending';
                  return newPeers;
                })}>
                  Add Peer {index + 1}
                </button>
              )}
              {peer === 'pending' && (
                <AdditionalPeerAssessment
                  onSubmit={(peerInfo) => handleAdditionalPeerSubmit(peerInfo, index)}
                  onCancel={() => setAdditionalPeers(prev => {
                    const newPeers = [...prev];
                    newPeers[index] = null;
                    return newPeers;
                  })}
                  peerIndex={index + 1}
                />
              )}
            </div>
          ))}
        </div>
        <div className="johari-window">
          <h2>{name}'s Johari Window</h2>
          <div className="johari-grid">
            <div className="johari-quadrant">
              <h3>Arena (Open Self)</h3>
              {renderAdjectiveList(johariData.arena)}
            </div>
            <div className="johari-quadrant">
              <h3>Blind Spot</h3>
              {renderAdjectiveList(johariData.blindSpot)}
            </div>
            <div className="johari-quadrant">
              <h3>Façade (Hidden Self)</h3>
              {renderAdjectiveList(johariData.facade)}
            </div>
            <div className="johari-quadrant">
              <h3>Unknown</h3>
              {renderAdjectiveList(johariData.unknown)}
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => setShowDownloadPopup(true)} className="download-report-btn">Download Full Report</button>
      {showDownloadPopup && (
        <div className="download-popup">
          <h3>Enter your details to receive the report</h3>
          <input
            type="text"
            placeholder="Name"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={userInfo.phone}
            onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
            required
          />
          <button onClick={handleDownloadReport}>Send Report</button>
          <button onClick={() => setShowDownloadPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default JohariResults;