var _ = require('underscore');
var Note = require('../models/Note');


/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  Note.find(null, null, {limit: 10}, function(err, foundNotes) {
    console.log(foundNotes);
    res.render('home', {
       notes: foundNotes
    });
  });


};
