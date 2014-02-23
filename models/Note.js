var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var noteSchema = new mongoose.Schema({
  text: { type: String, unique: true },
  twitterHandle: { type: String, unique: false}
});

module.exports = mongoose.model('Note', noteSchema);
