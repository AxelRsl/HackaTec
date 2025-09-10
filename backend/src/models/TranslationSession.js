const mongoose = require('mongoose');

const TranslationSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['signToText', 'textToSign', 'bidirectional'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active'
  },
  context: {
    subject: String,
    environment: String,
    preferredLanguage: String
  },
  messages: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    direction: {
      type: String,
      enum: ['incoming', 'outgoing']
    },
    originalFormat: {
      type: String,
      enum: ['text', 'sign', 'audio']
    },
    translatedFormat: {
      type: String,
      enum: ['text', 'sign', 'audio']
    },
    originalContent: String,
    translatedContent: String,
    confidence: Number
  }],
  metadata: {
    deviceInfo: Object,
    location: String,
    duration: Number,
    performance: {
      avgTranslationTime: Number,
      accuracy: Number
    }
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date
}, { timestamps: true });

const TranslationSession = mongoose.model('TranslationSession', TranslationSessionSchema);

module.exports = TranslationSession;
