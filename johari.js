const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Self-assessment submission route
router.post('/submit-self', async (req, res) => {
  const { adjectives } = req.body;
  
  console.log('Received self-assessment:', { adjectives });

  if (!Array.isArray(adjectives) || adjectives.length < 5 || adjectives.length > 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please select 5-6 adjectives.' 
    });
  }

  try {
    const uniqueId = `Self_Assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAssessment = new User({ 
      name: uniqueId,
      selfAssessment: adjectives 
    });
    await newAssessment.save();
    
    console.log('Self-assessment saved successfully');
    res.json({ success: true, message: 'Self-assessment submitted successfully' });
  } catch (err) {
    console.error('Error in /submit-self:', err);
    res.status(500).json({ success: false, message: 'Error submitting self-assessment: ' + err.message });
  }
});

// Peer assessment submission route
router.post('/submit-peer', async (req, res) => {
  const { userName, peerName, peerEmail, adjectives } = req.body;
  
  console.log('Received peer assessment:', { userName, peerName, peerEmail, adjectives });

  if (!userName || !peerName || !Array.isArray(adjectives) || adjectives.length < 5 || adjectives.length > 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid data provided. Please ensure all fields are filled and 5-6 adjectives are selected.' 
    });
  }

  try {
    let user = await User.findOne({ name: userName });
    if (!user) {
      user = new User({ name: userName });
    }

    user.peerAssessments.push({ peerName, peerEmail, adjectives });
    await user.save();
    
    console.log('Peer assessment saved successfully');
    res.json({ success: true, message: 'Peer assessment submitted successfully' });
  } catch (err) {
    console.error('Error in /submit-peer:', err);
    res.status(500).json({ success: false, message: 'Error submitting peer assessment: ' + err.message });
  }
});

// QR code generation route
router.post('/generate-qr', async (req, res) => {
  const { userName, peerName, peerEmail } = req.body;

  console.log('Received QR code generation request:', { userName, peerName, peerEmail });

  if (!userName || !peerName || !peerEmail) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided. Please ensure all fields are filled.'
    });
  }

  try {
    const assessmentId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const assessmentUrl = `${process.env.FRONTEND_URL}/peer-assessment/${assessmentId}`;

    const qrCodeData = await QRCode.toDataURL(assessmentUrl);

    let user = await User.findOne({ name: userName });
    if (!user) {
      user = new User({ name: userName });
    }

    user.peerAssessments.push({
      peerName,
      peerEmail,
      assessmentId,
      completed: false
    });
    await user.save();

    console.log('QR code generated successfully');
    res.json({
      success: true,
      qrCodeData,
      assessmentUrl
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    res.status(500).json({ success: false, message: 'Error generating QR code: ' + err.message });
  }
});

// Send email to peer
router.post('/send-peer-email', async (req, res) => {
  const { userName, peerName, peerEmail, generateQR } = req.body;

  console.log('Received send peer email request:', { userName, peerName, peerEmail, generateQR });

  if (!userName || !peerName || !peerEmail) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid data provided. Please ensure all fields are filled.' 
    });
  }

  try {
    let user = await User.findOne({ name: userName });
    if (!user) {
      user = new User({ name: userName });
    }

    const assessmentId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const assessmentLink = `${process.env.FRONTEND_URL}/peer-assessment/${assessmentId}`;

    let qrCodeData;
    if (generateQR) {
      qrCodeData = await QRCode.toDataURL(assessmentLink);
    }

    user.peerAssessments.push({
      peerName,
      peerEmail,
      assessmentId,
      completed: false
    });
    await user.save();

    // Configure the transporter with your email service details
    const transporter = nodemailer.createTransport({
      service: 'your-email-service',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: peerEmail,
      subject: 'Peer Assessment Request for Johari Window',
      html: `
        <p>Dear ${peerName},</p>
        <p>${userName} has requested your input for their Johari Window assessment.</p>
        <p>Please click on the following link to complete the assessment:</p>
        <p><a href="${assessmentLink}">${assessmentLink}</a></p>
        ${generateQR ? '<p>Alternatively, you can scan the QR code attached to this email.</p>' : ''}
        <p>Thank you for your participation!</p>
      `,
      attachments: generateQR ? [
        {
          filename: 'qr-code.png',
          content: qrCodeData.split(';base64,').pop(),
          encoding: 'base64'
        }
      ] : []
    };

    await transporter.sendMail(mailOptions);
    
    console.log('Peer assessment invitation sent successfully');
    res.json({ success: true, message: 'Peer assessment invitation sent successfully' });
  } catch (err) {
    console.error('Error in /send-peer-email:', err);
    res.status(500).json({ success: false, message: 'Error sending peer assessment email: ' + err.message });
  }
});

// Get Johari Window data
router.get('/window/:userName', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.userName });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: {
        selfAssessment: user.selfAssessment,
        peerAssessments: user.peerAssessments
      }
    });
  } catch (err) {
    console.error('Error fetching Johari Window data:', err);
    res.status(500).json({ success: false, message: 'Error fetching Johari Window data: ' + err.message });
  }
});

module.exports = router;