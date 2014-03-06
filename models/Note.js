var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var noteSchema = new mongoose.Schema({
  text: { type: String, unique: false },
  twitterHandle: { type: String, unique: false },
  updated: { type: Date, unique: false },
});

noteSchema.pre('save', function(next) {
  // Clean Up Twitter Handle As Needed;
  //if (this.twitterHandle.indexOf('@') !== -1) {
 // }
  if (!this.updated) this.updated = new Date;
  next();
});

//module.exports = mongoose.model('Note', noteSchema);
var noteModel = mongoose.model('Note', noteSchema);

noteModel.schema.path('twitterHandle').validate(function(value) {
  return (value.length > 0 && value.length < 15);
}, 'Please Check Twitter Handle');

noteModel.schema.path('text').validate(function(value) {
  return (value.length > 0 && value.length < 140);
}, 'Note must be between 0 and 140 characters in length.');

// If I want to add extra functionality to the model, that's the way to do it.
noteModel.hello = function() {
};

module.exports = noteModel;
