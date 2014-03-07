var _ = require('underscore');
var Note = require('../models/Note');


/**
 * POST /note/new
 * Create a new local account.
 * @param email
 * @param password
 */

exports.postNewNoteForm = function(req, res, next) {
  req.assert('noteText', 'Text must be between 1 and 140 characters').len(1, 140);
  req.assert('twitterHandle', 'Twitter handle must be between 1 and 25 characters').len(1, 25);
  var errors = req.validationErrors();
  console.log(req.body);
  if (errors) {
    return res.send({ errors: errors });
  }
  var note = new Note({
    text: req.body.noteText,
    twitterHandle: req.body.twitterHandle
  }).save(function(err, newNote) {
    return res.send(newNote);
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
  Note.find(null, null, requestParams).sort({ _id: 1 }).exec(function(err, foundNotes){
    res.send({
        requestParams: requestParams,
        notes: foundNotes
    });
  });
};

