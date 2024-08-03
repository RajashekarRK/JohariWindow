import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/GreatLakesTheme.css';
import JohariWindow from './components/JohariWindow';
import PeerAssessment from './components/PeerAssessment';
import JohariResults from './components/JohariResults';
import LoadingScreen from './components/LoadingScreen';
import UserInfoPopup from './components/UserInfoPopup';

// Import all logo images
import greatLakesLogo from './images/great-lakes-logo.png';
import aacsbLogo from './images/aacsb-logo.png';
import ambaLogo from './images/amba-logo.png';
import saqsLogo from './images/SAQS-logo.png';
import nbaLogo from './images/NBA-logo.png';
import aicteLogo from './images/AICTE-logo.png';
import chicagoBoothLogo from './images/chicago-booth-logo.png';
import skemaLogo from './images/skema-logo.png';
import bordeauxLogo from './images/universite-de-bordeaux-logo.png';
import iesegLogo from './images/ieseg-logo.png';
import frankfurtLogo from './images/frankfurt-school-logo.png';
import cornellLogo from './images/cornell-logo.png';

function App() {
  const [stage, setStage] = useState('userInfo');
  const [name, setName] = useState(''); // This is now the userName
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selfAdjectives, setSelfAdjectives] = useState([]);
  const [peerAssessments, setPeerAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const handleUserInfoSubmit = (userInfo) => {
    setName(userInfo.name); // Setting the userName
    setEmail(userInfo.email);
    setPhone(userInfo.phone);
    setStage('selfAssessment');
  };

  const handleSelfAssessmentSubmit = (adjectives) => {
    setSelfAdjectives(adjectives);
    setStage('peerAssessment');
  };

  const handlePeerAssessmentSubmit = (peerAssessment) => {
    setPeerAssessments([...peerAssessments, peerAssessment]);
    setStage('results');
  };

  const handleNavigate = (path) => {
    // This function can be expanded to handle different navigation paths
    if (path === '/johari-window') {
      setStage('results');
    }
  };

  const handleAddMorePeers = () => {
    if (peerAssessments.length < 5) {
      setStage('peerAssessment');
    } else {
      alert('Maximum of 5 peer assessments allowed.');
    }
  };

  const handleDownloadReport = async (userInfo) => {
    try {
      await axios.post('/api/johari/send-report', { 
        ...userInfo, 
        johariData: { 
          selfAdjectives, 
          peerAssessments 
        } 
      });
      alert('Report has been sent to your email.');
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Failed to send report. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <img src={greatLakesLogo} alt="Great Lakes Logo" className="great-lakes-logo" />
            <h1>GREAT LAKES EXECUTIVE EDUCATION</h1>
          </div>
          <div className="logo-container">
            <img src={aacsbLogo} alt="AACSB Accredited" className="logo" />
            <img src={ambaLogo} alt="AMBA Accredited" className="logo" />
            <img src={saqsLogo} alt="SAQS Accredited" className="logo" />
            <img src={nbaLogo} alt="NBA Accredited" className="logo" />
            <img src={aicteLogo} alt="AICTE Accredited" className="logo" />
          </div>
        </div>
      </header>
      <main className="container">
        {stage === 'userInfo' && <UserInfoPopup onSubmit={handleUserInfoSubmit} />}
        {stage === 'selfAssessment' && (
          <JohariWindow 
            onSubmit={handleSelfAssessmentSubmit} 
            name={name} 
            email={email} 
            phone={phone} 
          />
        )}
        {stage === 'peerAssessment' && (
          <PeerAssessment
            onSubmit={handlePeerAssessmentSubmit}
            userName={name} // Passing userName as a prop
            onNavigate={handleNavigate}
          />
        )}
        {stage === 'results' && (
          <>
            <JohariResults 
              name={name} 
              selfAdjectives={selfAdjectives} 
              peerAssessments={peerAssessments}
            />
            {peerAssessments.length < 5 && (
              <button onClick={handleAddMorePeers} className="btn">
                Add More Peer Assessments ({5 - peerAssessments.length} remaining)
              </button>
            )}
            <button onClick={() => setStage('downloadReport')} className="btn">
              Download Full Report
            </button>
          </>
        )}
        {stage === 'downloadReport' && (
          <UserInfoPopup 
            onSubmit={handleDownloadReport}
            title="Enter your details to receive the report"
            submitButtonText="Send Report"
          />
        )}
      </main>
      <footer className="footer">
        <div className="container">
          <h3>ASSOCIATIONS</h3>
          <div className="association-logos">
            <img src={chicagoBoothLogo} alt="Chicago Booth" className="association-logo" />
            <img src={skemaLogo} alt="SKEMA Business School" className="association-logo" />
            <img src={bordeauxLogo} alt="Université de Bordeaux" className="association-logo" />
            <img src={iesegLogo} alt="IÉSEG School of Management" className="association-logo" />
            <img src={frankfurtLogo} alt="Frankfurt School of Finance & Management" className="association-logo" />
            <img src={cornellLogo} alt="Cornell University" className="association-logo" />
          </div>
          <p>Copyright © 2024 Great Lakes Institute of Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;