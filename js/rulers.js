
(function(app) {

// Make [1,2,5] array
var r_intervals = [];
for(var i = .1; i < 1E5; i *= 10) {
    r_intervals.push(1 * i);
    r_intervals.push(2 * i);
    r_intervals.push(5 * i);
}
var limit = 30000;
    
app.rulers = { };

app.rulers.scroll = function(left, top) {
	$("#ruler-x").scrollLeft(left);
	$("#ruler-y").scrollTop(top);
};

app.rulers.draw = function(zoom) {

	var scroller = $("#scroller");
	
	zoom = zoom || 1;
	
	var rulerX = $("#ruler-x"),
		rulerY = $("#ruler-y");
	
	rulerX.width(scroller.width());
	rulerY.height(scroller.height());
	rulerX.find("div").width(scroller[0].scrollWidth);
	rulerY.find("div").height(scroller[0].scrollHeight);
	
	var canvases = { x: rulerX.find("canvas")[0], y: rulerY.find("canvas")[0] };
    var contentOffset = $("#content").offset();
    var scrollerOffset = scroller.offset();
    
    //var units = svgedit.units.getTypeMap();
    //var unit = units[curConfig.baseUnit]; // 1 = 1px
    var unit = 1;
    
    draw (true);
    draw (false);
    
    function draw(is_x) {
    
    	var dim = is_x ? 'x' : 'y';
    	var t = is_x ? 'left' : 'top';
    	var lentype = is_x?'width':'height';
    	var content_d = Math.max(0, contentOffset[t] - scrollerOffset[t]);
    	var hcanv = canvases[dim];
    	var ruler_len = $(hcanv).parent()[lentype]();
    	var total_len = ruler_len;
    	var canv_count = 1;
    	var ctx_num = 0;
    	var ctx_arr;
    	var ctx = hcanv.getContext("2d");
    	
    	hcanv.width = $(hcanv).parent().width();
    	hcanv.height = $(hcanv).parent().height();
    	ctx.fillStyle = "rgb(200,0,0)"; 
    	ctx.fillRect(0,0,hcanv.width,hcanv.height); 
    	
    	
    	// Create multiple canvases when necessary (due to browser limits)
    	if(ruler_len >= limit) {
    		var num = parseInt(ruler_len / limit) + 1;
    		ctx_arr = Array(num);
    		ctx_arr[0] = ctx;
    		for(var i = 1; i < num; i++) {
    			hcanv[lentype] = limit;
    			var copy = hcanv.cloneNode(true);
    			hcanv.parentNode.appendChild(copy);
    			ctx_arr[i] = copy.getContext('2d');
    		}
    		
    		copy[lentype] = ruler_len % limit;
    		
    		// set copy width to last
    		ruler_len = limit;
    	}
    	
    	hcanv[lentype] = ruler_len;
    	
    	var u_multi = unit * zoom;
    	
    	// Calculate the main number interval
    	var raw_m = 50 / u_multi;
    	var multi = 1;
    	for(var i = 0; i < r_intervals.length; i++) {
    		var num = r_intervals[i];
    		multi = num;
    		if(raw_m <= num) {
    			break;
    		}
    	}
    	
    	var big_int = multi * u_multi;

    	ctx.font = "9px sans-serif";

    	var ruler_d = ((content_d / u_multi) % multi) * u_multi;
    	var label_pos = ruler_d - big_int;
    	for (; ruler_d < total_len; ruler_d += big_int) {
    		label_pos += big_int;
    		var real_d = ruler_d - content_d;

    		var cur_d = Math.round(ruler_d) + .5;
    		if(is_x) {
    			ctx.moveTo(cur_d, 15);
    			ctx.lineTo(cur_d, 0);
    		} else {
    			ctx.moveTo(15, cur_d);
    			ctx.lineTo(0, cur_d);
    		}

    		var num = (label_pos - content_d) / u_multi;
    		var label;
    		if(multi >= 1) {
    			label = Math.round(num);
    		} else {
    			var decs = (multi+'').split('.')[1].length;
    			label = num.toFixed(decs)-0;
    		}
    		
    		// Change 1000s to Ks
    		if(label !== 0 && label !== 1000 && label % 1000 === 0) {
    			label = (label / 1000) + 'K';
    		}
    		
    		if(is_x) {
    			ctx.fillText(label, ruler_d+2, 8);
    		} else {
    			var str = (label+'').split('');
    			for(var i = 0; i < str.length; i++) {
    				ctx.fillText(str[i], 1, (ruler_d+9) + i*9);
    			}
    		}
    		
    		var part = big_int / 10;
    		for(var i = 1; i < 10; i++) {
    			var sub_d = Math.round(ruler_d + part * i) + .5;
    			if(ctx_arr && sub_d > ruler_len) {
    				ctx_num++;
    				ctx.stroke();
    				if(ctx_num >= ctx_arr.length) {
    					i = 10;
    					ruler_d = total_len;
    					continue;
    				}
    				ctx = ctx_arr[ctx_num];
    				ruler_d -= limit;
    				sub_d = Math.round(ruler_d + part * i) + .5;
    			}
    			
    			var line_num = (i % 2)?12:10;
    			if(is_x) {
    				ctx.moveTo(sub_d, 15);
    				ctx.lineTo(sub_d, line_num);
    			} else {
    				ctx.moveTo(15, sub_d);
    				ctx.lineTo(line_num ,sub_d);
    			}
    		}
    	}

    	ctx.strokeStyle = "#000";
    	ctx.stroke();
    	
    	
    }
    
};

})(OldApp);



