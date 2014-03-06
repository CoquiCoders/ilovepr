// @TODO most of this stuff is home page specific.  Make it only load to front page.

var prLover = {
  container: 'ul.notes',
  errorFlashContainer: $('#flash'),
  flashElement: $('.new-content-flash'),
  flashInAnimationName: 'fadeInDown',
  flashOutAnimationName: 'fadeOut',
  noteIncrementLoadLimit: 27,
  flashFinishedEvents: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

  templateNote: function(noteData) {
    // Template the new note.
    var newNote = "<li class='note'><div class='note-text'>" + noteData.text + "</div>";
    if (noteData.twitterHandle) {
      newNote = newNote + "<div class='note-twitter-handle'><a href='http://twitter.com/" + noteData.twitterHandle + "' target='_blank'>@" + noteData.twitterHandle + "</a></div>";
    }
    newNote = newNote + "</li>";

    return newNote;
  },

  getDocHeight: function() {
    var D = document;
    return Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
  },
  fadeOut: function (element) {
    console.log('fading out.');
    // React differently based on in our out animation;
    if ($(element).hasClass(flashOutAnimationName)) {
      // Clear html on flash out.
      console.log('flashout');
      $(element).html('');
    }

    // Regardless remove animation classes.
    $(element).removeClass('animated ' + flashInAnimationName);
    $(element).removeClass('animated ' + flashOutAnimationName);
  },

  getNotes: function(options) {
    console.log('Get Notes Options');
    console.log(options);
    var url = 'notes/' + options.skip + '/' + options.limit;
    return $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
    });
  },

  insertNewNotes: function(newNoteData) {
    console.log('Insert New Notes');
    console.log(newNoteData);
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
      console.log('Unbind InView');
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
  },

  init: function() {
    // Setup.
    // Grab Loaded Notes
    var self = this;
    $(this.container).data('loadedNotes', 0);
    // Bind Scroll Loading.
    $(window).bind('scroll', function() {
      if ($(window).scrollTop() + $(window).height() == self.getDocHeight()) {
        console.log("bottom!");
        self.getNotes({
          skip: $(self.container).data('loadedNotes'),
          limit: self.noteIncrementLoadLimit
        }).then(function(noteData) {
          self.insertNewNotes(noteData);
        });
      }
    });
    // Bind Flash Finished Events.
    $(this.errorFlashContainer).bind(this.flashFinishedEvent, this.fadeOut);
    $(this.flashElement).bind(this.flashFinishedEvent, this.fadeOut);

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

  /*  socket.on('appFlash', function(flashData) {
    var flashString = '';
    for (var i = 0; i < flashData.length; i++) {
      flashString = flashString + '<div class="alert alert-' + flashData[i].type + '">' + flashData[i].message + '</div>';
    }
    $(errorFlashContainer).html(flashString).addClass('animated ' + flashInAnimationName);
    setTimeout(function() {
      $(errorFlashContainer).addClass('animated ' + flashOutAnimationName);
    }, 500);
  });*/

  /*socket.on('additionalNotesLoaded', function(newNoteData) {
    if (!newNoteData.requestParams.skip || newNoteData.requestParams.skip < 1) {
        container.isotope({
          itemSelector: '.note',
          // options...
          resizable: false, // disable normal resizing
          // set columnWidth to a percentage of container width
          masonry: { columnWidth: container.width() / 50 }
        });
    }
    if (newNoteData.notes.length < 1) {
        console.log('Unbind InView');
        //container.unbind('inview');
        $(window).unbind('scroll');
        return;
    }
    console.log('NewNotesReceived');
    var notesToAdd = '';
    for (var i = 0; i < newNoteData.notes.length; i++) {
      notesToAdd = notesToAdd + templateNote(newNoteData.notes[i]);
    }
    container.isotope('insert', $(notesToAdd));
    var updatedNoteCount = container.data('loadedNotes') + noteIncrementLoadLimit;
    container.data('loadedNotes', updatedNoteCount);

  });*/

  /*socket.on('newNoteSaved', function(data) {
    // @TODO how to template this?
    // Get Current "Unread" Note Count
    var noteCount = $('.new-content-flash').data('note-count') || 0;
    // Increment by 1.
    noteCount = noteCount + 1;
    flashElement
      // Store Note Count.
      .data('note-count', noteCount)
      // Display Message.
      .html('<div class="alert animated ' + flashInAnimationName + ' alert-info"><strong>' + noteCount + '</strong> New Notes Available <a href="#" class="flash-show-items">Show Me</a>')
      // Make it animate.css pretty.
      .addClass('animated ' + flashInAnimationName);
    var newNote = templateNote(data);
    // Prepend it to the container, but don't re-init isotope until Show Me Is Clicked.
    container.prepend(newNote);

    // Open a window to execute tweet.
    var path = 'http://www.google.com';
    var windowName = 'Tweet!'; // should not include space for IE
    var windowOptions = 'location=0,status=0,width=570,height=700,scrollbars=yes';
    var twitterWindow = window.open(path, windowName, windowOptions);

    // Since the HTML keeps refreshing in the flash, we have to keep re-binding the callback for click on Show Me.
    // This is shitty and has to be a better way.
    $('.flash-show-items').click(function(event) {
      console.log('flash show');
      event.preventDefault();
      event.stopPropagation();
      // Rearrange items in container.
      container
        .isotope('reloadItems')
        .isotope({ sortBy: 'original-order' });

      // Clear out the text from flash element and fade it out.
      flashElement
        .data('note-count', 0)
        .addClass('animated ' + flashOutAnimationName)

      // Increment note count by 1;
      var updatedNoteCount = container.data('loadedNotes') + 1;
      container.data('loadedNotes', updatedNoteCount);
      return false;
    });
  });
*/


  // @TODO Should this just be ajax?
  $('#new-note-form .btn').click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    // @TODO -- rework this so that validation is still done properly.
    var newNoteText = $('#new-note-form #note-text').val();
    var twitterHandle = $('#new-note-form #twitterHandle').val();
    // @TODO - http://stackoverflow.com/questions/7519617/get-the-client-id-of-the-message-sender-in-socket-io
    // Use the socket id to react differently for senders.
    var note = {
      text: newNoteText,
      twitterHandle: twitterHandle,
    };
    socket.emit('newNoteSubmitted', note);
    return false;
  });



  // update columnWidth on window resize
  $(window).smartresize(function(){
    container.isotope({
      // update columnWidth to a percentage of container width
      masonry: { columnWidth: container.width() / 50 }
    });
  });
});


