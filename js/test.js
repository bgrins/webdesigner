function log() {
	if (window.console) {
		console.log(Array.prototype.slice.apply(arguments));
	}
}
var blankSrc = "javascript:void(0);";
var data = [];

html2canvas.settings.drawBoundingBox = true;

function frameLoaded(frame, ind) {
	var body = $(frame).contents().find("body");
	if (frame.src == blankSrc) {
		body.html(data[ind]);
	}
	
	$(frame).height(body[0].scrollHeight).width(body[0].scrollWidth);

	var canvas = document.createElement("canvas");
	html2canvas(body[0], canvas);
	$(frame).closest(".result").find('.canvas').append(canvas);
}

$(function() {
	$("script[type='text/html']").each(function() {		
		var results = $($("#testTemplate").html()).appendTo($("#tests"));
		data.push($(this).html());
		var ind = data.length - 1;
		var src = $(this).data("src") || blankSrc;
		results.find("h2").text($(this).data("description") || ("Test " + ind));
	    var iframe = $("<iframe onload='frameLoaded(this, "+ind+");' src='"+src+"' />").
	    	appendTo(results.find(".frame"));
	});
});