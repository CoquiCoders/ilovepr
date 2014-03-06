var passport = require('passport');
var _ = require('underscore');
var Note = require('../models/Note');


/**
 * Abstractions to Node Saving
 * Let's abstract the operations we have going on with Mongo because we may have different triggers for
 * them.
 */

/**
 * GET /note/new
 * Signup page.
 */

exports.getNewNoteForm = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('new_note', {
    title: 'Create Note'
  });
};

/**
 * POST /note/new
 * Create a new local account.
 * @param email
 * @param password
 */

exports.postNewNoteForm = function(req, res, next) {
  req.assert('noteText', 'Note must be between 5 and 150 characters').len(5, 150);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/note/new');
  }

  var note = new Note({
    text: req.body.noteText,
    twitterHandle: req.body.twitterHandle
  });

  note.save(function(err) {
    if (err) {
      req.flash('errors', { msg: 'Something happened idk what' });
    }
    return res.redirect('/');
  });

};

// @TODO cleanup the stupid property naming and make it consistent.
exports.saveNote = function(noteData, callback) {
  var note = new Note(noteData);
  // I suck.  this is where controller logic should go and instead its in app. boo.
  note.save(function(err, note) {
      callback(err, note);
  });

};

/**
 * GET /notes/:skip/:limit
 * Get Notes.
 * @param req
 * @param res
 */

exports.getNotes = function(req, res) {
  console.log('getnotes');
  console.log(req.params);
  var requestParams = {};
  var requestParams = {skip: req.params.skip, limit: req.params.limit};
  // TODO validate params incoming.
  console.log(requestParams);
  // @TODO -- use select here to figure out unneeded params.
  Note.find(null, null, requestParams).sort({ _id: -1 }).exec(function(err, foundNotes){
    res.send({
        requestParams: requestParams,
        notes: foundNotes
    });
  });
};

