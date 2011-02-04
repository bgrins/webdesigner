function log() {
	if (window.console) {
		console.log(Array.prototype.slice.apply(arguments));
	}
}

function log1() {
	if (element.logLevel >= 1) {
		log.apply(this, arguments);
	}
}
function log2() {
	if (element.logLevel >= 2) {
		log.apply(this, arguments);
	}
}
function error(msg) {
	throw "[Web Designer] " + msg;
	return false;
}

// Convert: <div>Hi <strong>there.</strong> <!-- some comment --></div>
// Into: <div><span>Hi </span><strong>there.</strong></div>
$.fn.wrapSiblingTextNodes = function(wrapper) {
	return this.each(function() {
	
		var element = $(this);
		var children = element.children();
		element.contents().each(function() {
		    if (this.nodeType == 3) {
		    	if ($.trim(this.data) == "") { $(this).remove(); }
		    	if (children.length) {
		    		$(this).wrap(wrapper);
		    	}
		    }
		    else if (this.nodeType != 1) {
		    	$(this).remove();
		    }
		});
		
	});
};

element.LOGLEVELS = {RELEASE: 0, NORMAL: 1, VERBOSE: 2};
element.logLevel = element.LOGLEVELS.RELEASE;
element.drawBoundingBox = false;

element.elID = 0;
element.ignoreTags = { 'style':1, 'br': 1, 'script': 1, 'link': 1 };
element.styleAttributes = [
'border-top-style', 'border-top-color',
'border-right-style', 'border-right-color',
'border-bottom-style', 'border-bottom-color',
'border-left-style', 'border-left-color',
'display', 'text-decoration',
'font-family', 'font-style', 'font-weight', 'color',
'position', 'float', 'clear', 'overflow'
];
element.styleAttributesPx = [
'padding-top','padding-right','padding-bottom','padding-left',
'margin-top','margin-right','margin-bottom','margin-left',
'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
'top', 'bottom', 'left', 'right', 
'line-height', 'font-size'
];

element.shouldProcess = function(dom) {
	return (dom.nodeType == 1) && (!element.ignoreTags[dom.tagName]);
};

function html2canvas(body, canvas, width) {
	if (width) {
		$(body).width(width);
	}
	var el = new element(body);
	
	canvas.width = el.css.outerWidthMargins;
	canvas.height = el.css.outerHeightMargins;
	
	el._canvas = canvas;	
	el.precalculateCanvas();
	el.renderToCanvas(canvas);
}

function element(DOMElement) {

	log1("initializing element", DOMElement, DOMElement.nodeType);
	
	if (!element.shouldProcess(DOMElement)) {
		return error("Invalid element passed for processing");
	}
	
	DOMElement._element = this;
	
	this.elID = element.elID++;
	this._domElement = DOMElement;
	this.jq = $(this._domElement);
	this.body = DOMElement.ownerDocument.body._element;
	
	var that = this;
	this.jq.bind("mouseover", function() {
		var s = new Date().getTime();
		that.jq.attr("data-debug", "true");
		that.body._canvas.width = that.body._canvas.width;
		that.renderToCanvas(that.body._canvas)
		log("Took", (new Date().getTime() - s));
	}).bind("mouseout", function() {that.jq.removeAttr("data-debug"); });
	
	this.parent = this._domElement.parentNode._element;
	if (this.parent) {
		this.closestBlock = (this.parent.isBlock) ? this.parent : this.parent.closestBlock;
	}
	
	this.jq.wrapSiblingTextNodes("<span></span>");
	this.copyDOM();
	
	
	this.childNodes = this._domElement.childNodes;
	this.childElements = [];
	for (var i = 0; i < this.childNodes.length; i++) {
		var child = this.childNodes[i];
		if (element.shouldProcess(child)) {
	   		this.childElements.push(new element(child));
	   	}
	}
	
}


element.prototype.copyDOM = function() {

	this.nodeType = this._domElement.nodeType;
	if (this.nodeType == 3) { return error("Parse Error: Encountered Text Node"); }
	
	this.tagName = this._domElement.tagName.toLowerCase();
	
	if (element.ignoreTags[this.tagName]) { 
		return; 
	}
		
	var el = this.jq;
	
	this.css = { };
	for (var i = 0; i < element.styleAttributes.length; i++) {
		var attr = element.styleAttributes[i];
		this.css[$.camelCase(attr)] = el.css(attr);
	}
	for (var i = 0; i < element.styleAttributesPx.length; i++) {
		var attr = element.styleAttributesPx[i];
		this.css[$.camelCase(attr)] = parseInt(el.css(attr), 10) || 0;
	}
	
	this.offset = el.offset();
	this.position = el.position();
	this.height = el.height();
	this.width = this.overflowHiddenWidth = el.width();
	
	// Offset needs to be computed with the margin to show where to start the bounding box of element
	// Offset does not take body's border into account http://bugs.jquery.com/ticket/7948
	var body = this._domElement.ownerDocument.body._element;
	this.offsetRenderBox = { 
		top:  Math.max(0, this.offset.top - this.css.marginTop + body.css.borderTopWidth), 
		left: Math.max(0, this.offset.left - this.css.marginLeft + body.css.borderLeftWidth)
	};
	
	this.isBlock = this.css.display == "block" || this.tagName == "body";
	
	// Todo: this width needs to be tested for all types of elements.
	// should be easy to set up a case in the harness with div's, p's, and body
	if (this.isBlock) {
		var oldStyle = el.attr("style");
		this.overflowHiddenWidth = el.css("overflow", "hidden").width();
		
		if (oldStyle) { el.attr("style", oldStyle); }
		else { el.removeAttr("style"); }
		
		this.isOverflowing = this.overflowHiddenWidth != this.width;
	}
	
	if (this.closestBlock && (this.closestBlock.width < this.width)) {
		this.overflowHiddenWidth = this.closestBlock.width;
		this.isOverflowing = this.overflowHiddenWidth != this.width;
	}
	
	this.hasOnlyTextNodes = true;
	var childNodes = this._domElement.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeType != 3) { this.hasOnlyTextNodes = false; }
	}
	
	this.text = this.hasOnlyTextNodes ? el.text() : "";
	this.css.font = $.trim(this.css.fontStyle + " " + this.css.fontWeight + " "  + this.css.fontSize + "px " + this.css.fontFamily);
	
	this.css.outerHeight = 
		this.height + 
		this.css.paddingTop +
		this.css.paddingBottom +
		this.css.borderTopWidth +
		this.css.borderBottomWidth;
		
	this.css.outerHeightMargins = 
		this.css.outerHeight + 
		this.css.marginTop + 
		this.css.marginBottom;
		
	this.css.outerWidth = 
		this.width + 
		this.css.paddingLeft +
		this.css.paddingRight +
		this.css.borderLeftWidth + 
		this.css.borderRightWidth;
		
	this.css.outerWidthMargins = 
		this.css.outerWidth + 
		this.css.marginLeft +
		this.css.marginRight;
	
	// innerOffset: where to start printing content from within the context of the element.
	this.css.innerOffset = {
		left: this.css.marginLeft + this.css.borderLeftWidth + this.css.paddingLeft,
		top: this.css.marginTop + this.css.borderTopWidth + this.css.paddingTop
	};
	
	this.css.innerHeight = 
		this.height + 
		this.css.paddingBottom + 
		this.css.paddingTop;
		
	this.css.innerWidth = 
		this.width + 
		this.css.paddingLeft + 
		this.css.paddingRight;
		
	this.shouldRender = (this.css.outerWidthMargins > 0 && this.css.outerHeightMargins > 0);
	
	
	if (this.hasOnlyTextNodes) {
		// Todo: get a better measurement of line height, actually breaking the text up into lines
		var oldHtml = el.html();
		var newHtml = "<span id='measure'>x</span>";
		var measured = el.html(newHtml).find("#measure");
		var textStart = el.position();
		if (!this.css.lineHeight) {
			this.css.lineHeight = measured.height();
		}
		el.html(oldHtml);
		
		this.textStartsOnDifferentLine = 
			(textStart.left != this.position.left) ||  
			(textStart.top != this.position.top);
			
		this.textStart = {
			top: textStart.top - this.position.top,
			left: textStart.left - this.position.left
		};
		this.css.textBaselinePx = (this.css.lineHeight) - ((this.css.lineHeight - this.css.fontSize) / 2);
		
	}
};

element.prototype.renderToCanvas = function(canvas) {
	
	if (!this.shouldRender) { return; }
	
	var ctx = canvas.getContext("2d"),
		x = this.offsetRenderBox.left, y = this.offsetRenderBox.top,
		w = this.css.outerWidthMargins, h = this.css.outerHeightMargins;
	
	log2("Rendering", this.tagName, this.text, x, y, w, h);
	
	// Draw a bounding box to show where the DOM Element lies
	if (this.jq.attr("data-debug") || this.drawDebugging) {
		ctx.strokeStyle = "#d66";
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, w, h);
	}
	
	// Render the element's canvas onto this canvas.  May eventually need to move
	// to a getImageData / putImageData model to better use caching	
	if (w > 0 && h > 0) {
		ctx.drawImage(this.canvas, x, y, w, h);
	}
	
	for (var i = 0; i < this.childElements.length; i++) {
		var el = this.childElements[i];
		if (el.nodeType != 3) {
			el.renderToCanvas(canvas);
		}
	}
};

element.prototype.precalculateCanvas = function() {

	if (!this.shouldRender) { return; }
	
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.css.outerWidthMargins;
	this.canvas.height = this.css.outerHeightMargins;
	
	log2("Precalculate Canvas", this.tagName, this.canvas.height,  this.height, this.canvas.width, this.width);
	
	var canvas = this.canvas;
	var ctx = canvas.getContext("2d");
	
	var offsetLeft = this.css.marginLeft;
	var offsetTop = this.css.marginTop;
	
	var borderLeftWidth = this.css.borderLeftWidth;
	if (borderLeftWidth) {		
		ctx.fillStyle = this.css.borderLeftColor;
		ctx.fillRect(offsetLeft, offsetTop, borderLeftWidth, this.css.outerHeight);
	}
	var borderTopWidth = this.css.borderTopWidth;
	if (borderTopWidth) {		
		ctx.fillStyle = this.css.borderTopColor;
		ctx.fillRect(offsetLeft, offsetTop, this.css.outerWidth, borderTopWidth);
	}
	var borderBottomWidth = this.css.borderBottomWidth;
	if (borderBottomWidth) {		
		ctx.fillStyle = this.css.borderBottomColor;
		ctx.fillRect(offsetLeft, offsetTop + this.css.outerHeight - borderBottomWidth, this.css.outerWidth, borderBottomWidth);
	}
	var borderRightWidth = this.css.borderRightWidth;
	if (borderRightWidth) {		
		ctx.fillStyle = this.css.borderRightColor;
		ctx.fillRect(
			offsetLeft + this.css.outerWidth - borderRightWidth, 
			offsetTop, borderRightWidth, this.css.outerHeight);
	}
	
	if (this.hasOnlyTextNodes) {
		
		// Time to print out some text, don't have to worry about any more elements changing styles
		
  		ctx.font = this.css.font;
  		ctx.fillStyle = this.css.color;
		ctx.textBaseline = "bottom";
		
		var startX = this.css.innerOffset.left;
		var startY = this.css.innerOffset.top;
		var minimumTextY = this.css.outerHeightMargins - this.css.marginBottom - this.css.borderBottomWidth;
		
		if (this.textStartsOnDifferentLine) {
			startX = this.textStart.left;
		}
		
		var lines = wordWrap(ctx, this.text, this.overflowHiddenWidth, 
			startX, !this.textStartsOnDifferentLine);
	
		log2("Recieved lines", lines, startX, this.overflowHiddenWidth, this.css.outerWidthMargins);
		
		for (var j = 0; j < lines.length; j++) {
		
		    //log2("Rendering Text", lines[j], startX, offsetTop + lastY);
		    
		    // Push down to next line of printing
		   // error(this.css.lineHeight + " " +  this.css.fontSize + " " + this.css.textBaselinePx);
		    
		    startY = startY + this.css.textBaselinePx;
		    
		    if (lines[j] != ' ') { 
		    	
		    	if (startY > minimumTextY) {
		    		startY = minimumTextY;
		    		log("ERROR", lines[j], startY, minimumTextY, lines, this.css.outerHeightMargins,
		    			this.css.textBaselinePx, this.css.fontSize, this.css.lineHeight, this.css.innerOffset);
		    		
		    		//error("Text parsing: '" + lines[j] + "' is too low (" + startY + ", " + minimumTextY + ")");
		    	}
		    	
		    	ctx.fillText(lines[j], startX, startY);
		    }
		    
		    // reset in case this started at a different place (textStartsOnDifferentLine)
		    startX = this.css.innerOffset.left;
		}
	}
	else {
		for (var i = 0; i < this.childElements.length; i++) {
			this.childElements[i].precalculateCanvas();
		}
	}
	
};

function wordWrap(ctx, phrase, maxWidth, initialOffset, isNewLine) {
	var words = phrase.split(" ");
	var lastLine = [];
	var lastX = initialOffset || 0;
	var output = [];
	
	for (var i = 0; i < words.length; i++) {
		var word = $.trim(words[i]);
		if (word == "") { continue; }
		
		var widthWithSpace = ctx.measureText(word + ' ').width;
	    
	    // Handle edge case where word doesn't fit with space, but does without.
	    // Want to still add it to the line, and the next word will get pushed down
	    if ((lastX + widthWithSpace) > maxWidth) {
	    	var widthNoSpace = ctx.measureText(word).width;
	    	if ((lastX + widthNoSpace) <= maxWidth) {
	    		widthWithSpace = widthNoSpace;
	    	}
	    }
	    
		lastX += widthWithSpace;
		
	    if (lastX > maxWidth) {
			// It is time for a new line.
	    
	    	var isFirstWord = (lastLine.length == 0) && isNewLine;
	    	
	    	if (isFirstWord) {
				// Need it to get printed because it's the only thing in the line.
	    		lastX = 0;
	    		output.push(word);
	    	}
	    	else {
	    		// Start the next line, first rendering out the current one if necessary.
	    		// This could be the case where a line came in starting nearly done, and we couldn't
	    		// even get the first word in before getting too big.
	    		if (lastLine.length) { output.push(lastLine.join(' ')); }
	    		isNewLine = true;
	    		lastX = widthWithSpace;
	    		lastLine = [word];
	    	}
	    } 
	    else {
	    	// Normal case - 
	    	lastLine.push(word);
	    }
	    	
	    
	    
	}
	
	
	if (lastLine.length) {	
		log2("FOUND last", output, lastLine.join(' '));
		output.push(lastLine.join(' '));
	}
	
	return output;
}

