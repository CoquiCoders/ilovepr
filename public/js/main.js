$(document).ready(function() {
  var socket = io.connect(window.location.href);
    socket.on('greet', function (data) {
      console.log(data);
      socket.emit('respond', { message: 'Hello to you too, Mr.Server!' });
    });

	var container = $('.notes');

	container.isotope({
		itemSelector: '.note',
		// options...
		resizable: false, // disable normal resizing
		// set columnWidth to a percentage of container width
		masonry: { columnWidth: container.width() / 50 }
	});

	// update columnWidth on window resize
	$(window).smartresize(function(){
	  container.isotope({
	    // update columnWidth to a percentage of container width
	    masonry: { columnWidth: container.width() / 50 }
	  });
	});
});

