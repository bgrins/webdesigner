
function log() { if (window.console) { console.log(Array.prototype.slice.apply(arguments)); } }

var app = { };

app.loadProject = function(src) {
	$("#mirror").attr("src", $("#src").val());
}

app.frameLoaded = function(frame) {
	if (frame.src == 'javascript:void(0);') { return; }
	
	var mirror = $(frame).contents();
	var mirrorBody = mirror.find("body").attr("data-debug", "true");
	
	var h = mirrorBody[0].scrollHeight;
	var w = mirrorBody[0].scrollWidth;

	// mirrorBody.html($("#loadTemplate").html());
	var canvas = $("#c");
	$(frame).height(h).width(w);
	$("#content").height(h).width(w);
	html2canvas(mirrorBody[0], canvas[0]);
}

$(function() {
	var scroller = $("#scroller");
	
	$("#src").change(app.loadProject);
	app.loadProject();
	
	$(window).resize(function() {
		app.rulers.draw();
	}).resize();
	
	scroller.scroll(function() {
		app.rulers.scroll(scroller.scrollLeft(), scroller.scrollTop());
	});
	
	$("#header").delegate("a", "click", function() {
		var mirrorBody = $("#mirror").contents().find("body");
		var canvas = $("#c")
		var size = $(this).attr("href").split('#')[1];
		$(this).parent().find("a").removeClass("active");
		$(this).addClass("active");
		$("#mirror").width(size == 'full' ? mirrorBody[0].scrollWidth : size);
		html2canvas(mirrorBody[0], canvas[0]);
		return false;
	});
});


