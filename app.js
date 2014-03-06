/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');

/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var noteController = require('./controllers/note');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
var forgotController = require('./controllers/forgot');
var resetController = require('./controllers/reset');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

//var app = express();
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var week = (day * 7);
var month = (day * 30);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('connect-assets')({
  src: 'public',
  helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    db: mongoose.connection.db,
    auto_reconnect: true
  })
}));
app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.token = req.csrfToken();
  res.locals.secrets = secrets;
  next();
});
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());

/**
 * Application routes.
 */

app.get('/', homeController.index);
app.get('/note/new', noteController.getNewNoteForm);
app.post('/note/new', noteController.postNewNoteForm);
app.get('/notes/:skip/:limit', noteController.getNotes);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', forgotController.getForgot);
app.post('/forgot', forgotController.postForgot);
app.get('/reset/:token', resetController.getReset);
app.post('/reset/:token', resetController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/steam', apiController.getSteam);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
app.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);

/**
 * OAuth routes for sign-in.
 */

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

/**
 * OAuth routes for API examples that require authorization.
 */

app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/tumblr');
});
app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/venmo');
});

/**
 * Start Express server.
 */

//app.listen(app.get('port'), function() {
server.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

io.configure(function() {
  //io.set('transports', ['websocket']);
  //io.set("transports", ["xhr-polling"]);
  //io.set("polling duration", 10);
});

io.sockets.on('connection', function(socket) {
  console.log('SERVER: Connection Made');

  // @TODO should be this AJAX?
  // Handle submission of a new note on the form;
  socket.on('newNoteSubmitted', function(noteData) {
    // @TODO use local socket to react differently for submitter.
    noteController.saveNote(noteData, function(err, savedNote) {
      if (err) {
        console.log(err);
        var flashErrors = [];
        var errorMessage = "Something happend and we couldn't save your note. Please try again.";
        if (err.code == 11000) {
          console.log('Dup Note.');
          flashErrors.push({ type: 'danger', message: "A note like this already exists. Be creative!" });
        }
        if (err.name == 'ValidationError') {
          for (var errorPath in err.errors) {
            var error = err.errors[errorPath];
            console.log(error);
            flashErrors.push({
              type: 'danger',
              message: error.message
            });
          }
        }
        socket.emit('appFlash', flashErrors);
      }
      else {
        io.sockets.emit('newNoteSaved', savedNote);
      }
    });
  });

  // Handle onScroll event when user scrolls to bottom of page.
  socket.on('additionalNotesRequested', function(requestParams) {
    console.log(requestParams);
    console.log('Give me new notes');
    noteController.getNotes(requestParams).then(function(newNotes) {
      console.log('notes promise.');
      // Emit new socket with retrieved notes.
      socket.emit('additionalNotesLoaded', {notes: newNotes, requestParams: requestParams});
    });
  });

});
