import React, { useState } from 'react';

const UserInfoPopup = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agreePolicy) {
      onSubmit({ name, email, phone: `${phonePrefix}${phoneNumber}` });
    }
  };

  return (
    <div className="user-info-popup">
      <form onSubmit={handleSubmit}>
        <h2>How does it work?</h2>
        {/* ... (keep the explanation text) ... */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name (optional)"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email (optional)"
        />
        <div className="phone-input">
          <input
            type="text"
            value={phonePrefix}
            onChange={(e) => setPhonePrefix(e.target.value)}
            className="phone-prefix"
            style={{ width: '60px' }}
          />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number (optional)"
            className="phone-number"
          />
        </div>
        <label>
          <input
            type="checkbox"
            checked={agreePolicy}
            onChange={(e) => setAgreePolicy(e.target.checked)}
            required
          />
          I understand the usage policy
        </label>
        <button type="submit" disabled={!agreePolicy}>
          Start
        </button>
      </form>
    </div>
  );
};

export default UserInfoPopup;