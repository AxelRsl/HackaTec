const mongoose = require('mongoose');

const SignGestureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  videoUrl: String,
  animationData: Object,
  handPositions: [{
    timestamp: Number,
    leftHand: {
      landmarks: [[Number]],
      confidence: Number
    },
    rightHand: {
      landmarks: [[Number]],
      confidence: Number
    },
    face: {
      landmarks: [[Number]],
      expressions: Object,
      confidence: Number
    },
    bodyPose: {
      landmarks: [[Number]],
      confidence: Number
    }
  }],
  metadata: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    region: String,
    tags: [String],
    usageFrequency: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const SignGesture = mongoose.model('SignGesture', SignGestureSchema);

module.exports = SignGesture;
