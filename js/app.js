


function log() { if (window.console) { console.log(Array.prototype.slice.apply(arguments)); } }

var app = { };

app.editorStyles = "<style>" +
	".hover { outline: solid 2px orange; }" + 
	".selected { outline: solid 2px red; }" + 
"</style><link href='http://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/base/jquery-ui.css' rel='stylesheet' type='text/css' />";

app.loadProject = function(src) {
	$("#mirror").attr("src", $("#src").val());
}

app.bindBody = function(body) {
	var current = $([]);
	var sel = "div, p, h1, h2, h3, h4, h5, h6, img";
	$(body).delegate(sel, "mouseenter", function() {
		if (!current.length) {
			$(this).addClass("hover");
		}
	}).delegate(sel, "mouseleave", function() {
		$(this).removeClass("hover");
	}).delegate(sel, "click", function() {
		current.removeClass("selected");
		current = $(this).addClass("selected");
		return false;
	});
	/*
	$(body).mousemove(function(e) {
		if (current.length) {
			current.offset({top:e.pageY, left: e.pageX});
		}
	});*/
	$(body).keydown(function(e) {
		log("keydown", current);
		//log(e.target ,e.keyCode == keyCode.UP);
		if (!current.length) return;
		
		var off = current.offset();
		var modifier = e.shiftKey ? 10 : 5;
		var code = e.keyCode;
		
		if (code == keyCode.UP) {
			off.top -= modifier;
			current.offset(off);
		}
		else if (code == keyCode.DOWN) {
			off.top += modifier;
			current.offset(off);
		}
		else if (code == keyCode.LEFT) {
			off.left -= modifier;
			current.offset(off);
		}
		else if (code == keyCode.RIGHT) {
			off.left += modifier;
			current.offset(off);
		}
	});
};

app.frameLoaded = function(frame) {
	if (frame.src == 'javascript:void(0);') { return; }
	
	var mirror = $(frame).contents();
	var mirrorBody = mirror.find("body").attr("data-debug", "true");
	mirrorBody.append(app.editorStyles);
	var h = mirrorBody[0].scrollHeight;
	var w = mirrorBody[0].scrollWidth;

	// mirrorBody.html($("#loadTemplate").html());
	var canvas = $("#c");
	$(frame).height(h).width(w);
	$("#content").height(h).width(w);
	
	app.bindBody(mirrorBody);
	return;
	var bodyElement = html2canvas(mirrorBody[0], canvas[0]);
	
	var current = $([]);
	
	bodyElement.traverseChildren(function(child) {
		if (!child.isBlock) {return;}
		child.jq.hover(
		function() {
			$(this).attr("data-debug", true);
			bodyElement.copyToCanvas(canvas[0]);
		}, function() {
			if (this == current[0]) { return; }
			$(this).removeAttr("data-debug", true);
			bodyElement.copyToCanvas(canvas[0]);
		
		}).click(function() {
			current.removeAttr("data-debug");
			current = $(this).attr("data-debug", true);
			log(current);
			//bodyElement.copyToCanvas(canvas[0]);
			$("#current-props").hide().find(".prop-values").hide().html(current[0]._element.x);
			return false;
		});
	});
	
	
	//initeasel(bodyElement, canvas[0]);
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
