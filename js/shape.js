$(function() {

 paper = Raphael("canvas", 640, 480);
var c = paper.circle(100, 100, 50).attr({
    fill: "hsb(.8, 1, 1)",
    stroke: "none",
    opacity: .5
});
var start = function () {
    // storing original coordinates
    this.ox = this.attr("cx");
    this.oy = this.attr("cy");
    this.attr({opacity: 1});
},
move = function (dx, dy) {
    // move will be called with dx and dy
    this.attr({cx: this.ox + dx, cy: this.oy + dy});
},
up = function () {
    // restoring state
    this.attr({opacity: .5});
};
c.drag(move, start, up);
$("#circle").click(function() {
	$("body").addClass("add");
	return false;
});

$("body").click(function(e) {
	var bod = $(this);
	var radius = 60,
		x = e.pageX - (radius),
		y = e.pageY - (radius);
		
	if (bod.hasClass("add")) {
		
		paper.circle(x, y, radius).animate({fill: "#223fa3", stroke: "#000", "stroke-width": 80, "stroke-opacity": 0.5}, 2000);
		bod.removeClass("add");
	}
});

});


/*

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="640" height="480"><desc>Created with Raphaël</desc><defs></defs><circle cx="188" cy="657" r="60" fill="#223fa3" stroke="#000000" style="stroke-width: 80px; stroke-opacity: 0.5; " stroke-width="80" stroke-opacity="0.5"></circle><circle cx="168" cy="164" r="60" fill="#223fa3" stroke="#000000" style="stroke-width: 80px; stroke-opacity: 0.5; " stroke-width="80" stroke-opacity="0.5"></circle></svg>
*/