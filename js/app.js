

function log() {
	if (window.console) {
		console.log(Array.prototype.slice.apply(arguments));
	}
}

var app = { };

$(function() {
	
	var scroller = $("#scroller");
	var canvas = $("#c");
	
	canvas[0].width = canvas.parent().width();
	canvas[0].height = canvas.parent().height();
	
	$(window).resize(function() {
		app.rulers.draw();
	}).resize();
	
	scroller.scroll(function() {
		app.rulers.scroll(scroller.scrollLeft(), scroller.scrollTop());
	});

	var mirror = $("#mirror").contents();
	var mirrorBody = mirror.find("body");
	
	mirrorBody.html($("#loadTemplate").html());

	var bod = new element(mirrorBody[0]);
	
	bod.precalculateCanvas();
	bod.renderToCanvas(canvas[0]);
	/*
	
	var elements = [];
	mirrorBody.find("*").each(function() {
		elements.push(new element(this));
	});
	
	
	for (var i = 0; i < elements.length; i++) {
		elements[i].renderToCanvas(canvas[0]);
	}*/
	
});


