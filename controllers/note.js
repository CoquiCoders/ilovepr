var passport = require('passport');
var _ = require('underscore');
var Note = require('../models/Note');


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
    text: req.body.noteText
  });

  note.save(function(err) {
    if (err) {
      req.flash('errors', { msg: 'Something happened idk what' });
    }
    return res.redirect('/');
  });
};

exports.getNotes = function(req, res, next) {
};

exports.respond = function (socket_io) {
  // now we can do whatever we want:
  console.log('responding');
  socket_io.on('news',function(newsreel){
  // as is proper, protocol logic like
  // this belongs in a controller:
    socket.broadcast.emit(newsreel);
  });
};
