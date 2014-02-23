var _ = require('underscore');
var Note = require('../models/Note');


/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  console.log(req);
  Note.find(function(err, foundNotes) {
    res.render('home', {
       notes: foundNotes
    });
  });
};
