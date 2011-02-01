

function log() {
	if (window.console) {
		console.log(Array.prototype.slice.apply(arguments));
	}
}

var app = { };

$(function() {
	
	var scroller = $("#scroller");
	
	$(window).resize(function() {
		app.rulers.draw();
	}).resize();
	
	scroller.scroll(function() {
		app.rulers.scroll(scroller.scrollLeft(), scroller.scrollTop());
	});
});


