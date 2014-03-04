var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var noteSchema = new mongoose.Schema({
  text: { type: String, unique: false},
  twitterHandle: { type: String, unique: false}
});

//module.exports = mongoose.model('Note', noteSchema);
var noteModel = mongoose.model('Note', noteSchema);

// If I want to add extra functionality to the model, that's the way to do it.
noteModel.hello = function() {
};

module.exports = noteModel;
