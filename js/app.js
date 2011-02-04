
var app = { };

app.loadProject = function(src) {
	$("#mirror").attr("src", $("#src").val());
}

function frameLoaded(frame) {

	var mirror = $(frame).contents();
	var mirrorBody = mirror.find("body").attr("data-debug", "true");
	
	var h = mirrorBody[0].scrollHeight;
	var w = mirrorBody[0].scrollWidth;
	
	$(frame).height(mirrorBody[0].scrollHeight).width(mirrorBody[0].scrollWidth);

	//mirrorBody.html($("#loadTemplate").html());
	var canvas = $("#c");
	$("#content").height(mirrorBody[0].scrollHeight).width(mirrorBody[0].scrollWidth);
	
	//canvas[0].width = canvas.parent().width();
	//canvas[0].height = canvas.parent().height();
	htmlToCanvas(mirrorBody[0], canvas[0]);
	
	
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
		htmlToCanvas(mirrorBody[0], canvas[0]);
		/*	
		if (size == 'full') {
			htmlToCanvas(mirrorBody[0], canvas[0]);
		}
		else {
			htmlToCanvas(mirrorBody[0], canvas[0], size);
		}*/
		return false;
	});
});


