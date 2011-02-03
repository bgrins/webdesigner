
var app = { };

app.loadProject = function(src) {
	$("#mirror").attr("src", src);
}

function frameLoaded(frame) {

	var mirror = $(frame).contents();
	var mirrorBody = mirror.find("body").attr("data-debug", "true");
	
	var h = mirrorBody[0].scrollHeight;
	var w = mirrorBody[0].scrollWidth;
	
	$(frame).height(mirrorBody[0].scrollHeight).width(mirrorBody[0].scrollWidth);

	//mirrorBody.html($("#loadTemplate").html());
	var canvas = $("#c");
	
	//canvas[0].width = canvas.parent().width();
	//canvas[0].height = canvas.parent().height();
	htmlToCanvas(mirrorBody[0], canvas[0]);
	
	
}

$(function() {
	app.loadProject("load/blueprint.html");
	var scroller = $("#scroller");
	$(window).resize(function() {
		app.rulers.draw();
	}).resize();
	
	scroller.scroll(function() {
		app.rulers.scroll(scroller.scrollLeft(), scroller.scrollTop());
	});
	
});


