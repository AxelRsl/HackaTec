const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  preferences: {
    language: {
      type: String,
      default: 'es'
    },
    interfaceSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    animations: {
      type: Boolean,
      default: true
    },
    textToSpeechSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'highContrast'],
      default: 'light'
    },
    avatar: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
