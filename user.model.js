const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { 
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  selfAssessment: [String],
  peerAssessments: [{
    peerName: String,
    peerEmail: String,
    assessmentId: String,
    adjectives: [String],
    completed: Boolean
  }]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;