const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MixSchema = new mongoose.Schema({
  youtubeVideoId: { type: String, required: true },
  videoStart: { type: Number, required: true },
  videoEnd: { type: Number, required: true },
  audioPreviewUrl: { type: String, required: true },
  audioStart: { type: Number, required: true },
  audioEnd: { type: Number, required: true },
  title: { type: String },
  description: { type: String },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mixes: [MixSchema],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }] 
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
