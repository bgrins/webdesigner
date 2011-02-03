function log() {
	if (window.console) {
		console.log(Array.prototype.slice.apply(arguments));
	}
}
function frameLoaded(frame, ind) {
	var body = $(frame).contents().find("body").html(data[ind]);
	var canvas = document.createElement("canvas");
	htmlToCanvas(body[0], canvas);
	log("done", frame, $(frame).closest(".result"))
	$(frame).closest(".result").find('.canvas').append(canvas);
}
var data = [];
$(function() {
	$("script[type='text/html']").each(function() {
		
		var results = $($("#testTemplate").html()).appendTo($("#tests"));
		data.push($(this).html());
		var ind = data.length - 1;
	    var iframe = $("<iframe onload='frameLoaded(this, "+ind+");' src='javascript:;' />").
	    	appendTo(results.find(".frame"));
	    
	    return;
	});
});