const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  password: String,
  role: { type: String, default: 'client' }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);