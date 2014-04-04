// @TODO most of this stuff is home page specific.  Make it only load to front page.

var prLover = {
  container: 'ul.notes',
  flashElement: '#flash',
  flashInAnimationName: 'fadeInDown',
  flashOutAnimationName: 'fadeOut',
  noteIncrementLoadLimit: 27,
  flashFinishedEvents: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

  templateTweetLink: function(noteData) {
    var tweetLink = {
      url: 'http://bit.ly/ilovepr',
      text: 'Yo Me Quedo en Puerto Rico porque ' + noteData.text,
      hashtags: 'ilovepr'
    }
    var tweetUrl = 'https://twitter.com/intent/tweet?' + $.param(tweetLink, true);
    return tweetUrl;
  },

  templateFBLink: function(noteData) {
    //https://www.facebook.com/sharer/sharer.php?app_id=113869198637480&sdk=joey&u=http://ilovepuertorico.org&display=popup
    var fbLink = {
      app_id: '113869198637480',
      sdk: 'joey',
      u: 'http://www.ilovepuertorico.org',
      display: 'popup'
    }

    var fbUrl = 'https://www.facebook.com/sharer/sharer.php?' + $.param(fbLink, true);

    return fbUrl;
  },

  templateNote: function(noteData) {
    // Template the new note.
    var newNote = "<li class='note col-md-3'><div class='note-text note-" + noteData._id + "'>" + noteData.text + "</div>";
    if (noteData.twitterHandle) {
      newNote = newNote + "<div class='note-twitter-handle'><a href='http://twitter.com/" + noteData.twitterHandle + "' target='_blank'>@" + noteData.twitterHandle + "</a></div>";
    }
    var tweetUrl = this.templateTweetLink(noteData);
    var voteCount = noteData.votes;
    if (voteCount == 0) {
      voteCount = '';
    }
    newNote = newNote + '<div class="note-vote pull-left"><button type="button" data-noteid="' + noteData._id + '"  class="btn-default"><span class="vote-count">' + voteCount + '</span> <i class="fa fa-thumbs-o-up"></i></button></div>';
    newNote = newNote + '<div class="tweet-link pull-right"><a href="' + tweetUrl + '"><img src="img/bird_gray_32.png"/></a></div>';
    newNote = newNote + "</li>";

    return newNote;
  },

  templateFlash: function(flashData) {
    var flashString = '';
    flashString = flashString +
     '<div class="alert alert-' +
     flashData.type + '">' +
     flashData.message +
     '</div>';
    return flashString;
  },

  getDocHeight: function() {
    var D = document;
    return Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
  },

  fadeIn: function(element) {
    $(element).addClass('animated ' + this.flashInAnimationName);
  },

  fadeOut: function(element) {
    $(element).addClass('animated ' + this.flashOutAnimationName);
  },


  fadeOutBinding: function (element) {
    // React differently based on in our out animation;
    if ($(element).hasClass(this.flashOutAnimationName)) {
      // Clear html on flash out.
      $(element).html('');
    }

    // Regardless remove animation classes.
    $(element).removeClass('animated ' + this.flashInAnimationName);
    $(element).removeClass('animated ' + this.flashOutAnimationName);
  },

  getNotes: function(options) {
    var url = 'notes/' + options.skip + '/' + options.limit;
    return $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
    });
  },

  voteOnNote: function(element) {
    console.log(element);
    var note = $(element).data('noteid');
    var _csrf = $("#new-note-form [name='_csrf']").val();
    console.log(note);
    return $.ajax({
      type: "PUT",
      url: 'notes/' + $(element).data('noteid'),
      data: {
        voteCount: '+1',
        _csrf: _csrf
      }
    });

  },

  insertNewNotes: function(newNoteData) {
    // First Time Call.
    if (!newNoteData.requestParams.skip || newNoteData.requestParams.skip < 1) {
      $(this.container).isotope({
        itemSelector: '.note',
        // options...
        resizable: false, // disable normal resizing
        // set columnWidth to a percentage of container width
        masonry: { columnWidth: $(this.container).width() / 50 }
      });
    }
    // Last Time Call.
    if (newNoteData.notes.length < 1) {
      //container.unbind('inview');
      $(window).unbind('scroll');
      return;
    }
    // Insert notes as needed.

    var notesToAdd = '';
    for (var i = 0; i < newNoteData.notes.length; i++) {
      notesToAdd = notesToAdd + this.templateNote(newNoteData.notes[i]);
    }
    $(this.container).isotope('insert', $(notesToAdd));
    var updatedNoteCount = $(this.container).data('loadedNotes') + this.noteIncrementLoadLimit;
    $(this.container).data('loadedNotes', updatedNoteCount);
    $('.note-vote button').click(function(e) {
      prLover.voteOnNote(this);
    });
  },

  createNewNote: function() {
    // @TODO -- rework this so that validation is still done properly.
    var noteText = $('#new-note-form #noteText').val();
    var twitterHandle = $('#new-note-form #twitterHandle').val();
    var _csrf = $("#new-note-form [name='_csrf']").val();
    return $.ajax({
      type: "POST",
      url: 'note/new',
      data: {
        noteText: noteText,
        twitterHandle: twitterHandle,
        _csrf: _csrf
      }
    });
  },

  prependNewNote: function(noteData) {
    var note = this.templateNote(noteData);
    $(this.container)
      .prepend(note)
      .isotope('reloadItems')
      .isotope({ sortBy: 'original-order' });
  },

  init: function() {
    // Setup.
    // Grab Loaded Notes
    var self = this;
    $(this.container).data('loadedNotes', 0);
    // Bind Scroll Loading.
    $(window).bind('scroll', function() {
      if ($(window).scrollTop() + $(window).height() == self.getDocHeight()) {
        self.getNotes({
          skip: $(self.container).data('loadedNotes'),
          limit: self.noteIncrementLoadLimit
        }).then(function(noteData) {
          self.insertNewNotes(noteData);
        });
      }
    });
    // Bind Smart Resize.
    // update columnWidth on window resize
    $(window).smartresize(function(){
      $(self.container).isotope({
        // update columnWidth to a percentage of container width
        masonry: { columnWidth: $(self.container).width() / 50 }
      });
    });

    // Bind Flash Finished Events.
    $(this.errorFlashContainer).bind(this.flashFinishedEvent, this.fadeOutBinding);

    $('#new-note-form .btn').click(function(event) {
      event.preventDefault;
      event.stopPropration;
      self.createNewNote().then(function(response) {
        if (!response.errors) {
          // Clear out the fields.
          $('#new-note-form #noteText').val('');
          $('#new-note-form #twitterHandle').val('');
          prLover.prependNewNote(response);
          var tweetUrl = self.templateTweetLink(response);
          var fbUrl = self.templateFBLink(response);
          $('.variable-modal-content').html(
            '<a class="btn btn-large" href="' + tweetUrl + '">Twitter</a><a target="_blank" class="btn btn-large" href="' + fbUrl + '">Facebook</a>'
          );
          $('#sharer-modal').modal();
        }
        else {
          for (var i = 0; i < response.errors.length; i ++) {
            var flashString = prLover.templateFlash({
              message: response.errors[i].msg,
              type: 'danger'
            });
            $(prLover.flashElement).append(flashString);
          }
          prLover.fadeIn(prLover.flashElement);
          setTimeout(function(){
            prLover.fadeOut(prLover.flashElement);
          }, 5000);
        }
      });
      return false;
    });

    // Load initial notes set.
    this.getNotes({
      skip: $(this.container).data('loadedNotes'),
      limit: this.noteIncrementLoadLimit
    }).then(function(noteData) {
      self.insertNewNotes(noteData);
    });

  }
};

$(document).ready(function() {
  prLover.init();

});


