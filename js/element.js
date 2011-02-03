
element.elID = 0;
element.ignoreTags = { 'style':1, 'br': 1 };
element.drawBoundingBox = false;
element.styleAttributes = [
'border-top-style', 'border-top-color',
'border-right-style', 'border-right-color',
'border-bottom-style', 'border-bottom-color',
'border-left-style', 'border-left-color',
'display', 'text-decoration',
'font-family', 'font-style', 'font-weight', 'font-size', 'color',
'position', 'float', 'clear', 'overflow'
];
element.styleAttributesPx = [
'padding-top','padding-right','padding-bottom','padding-left',
'margin-top','margin-right','margin-bottom','margin-left',
'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
'top', 'bottom', 'left', 'right'
];

$.fn.wrapSiblingTextNodes = function(wrapper) {
	this.contents().each(function() {
		if (this.nodeType == 3) {
			if ($.trim(this.data) == "") { $(this).remove(); }
			if ($(this.parentNode).children().length) {
				$(this).wrap(wrapper);
			}
		}
	});
};

function htmlToCanvas(body, canvas) {
	var el = new element(body);
	canvas.width = el.css.outerWidthMargins;
	canvas.height = el.css.outerHeightMargins;
	el.precalculateCanvas();
	el.renderToCanvas(canvas);
}

function element(DOMElement) {
	
	log("initializing element", DOMElement);
	
	DOMElement._element = this;
	
	this.elID = element.elID++;
	this._domElement = DOMElement;
	this.jq = $(this._domElement);
	
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
		var ignore = child.nodeType == 3 || element.ignoreTags[child.tagName];
		if (!ignore) {
	   		this.childElements.push(new element(this.childNodes[i]));
	   	}
	}
	
}

element.prototype.copyDOM = function() {

	this.nodeType = this._domElement.nodeType;
	
	if (this.nodeType == 3) {
		this.text = $.trim(this._domElement.data);
		return; 
	}
	
	this.tagName = this._domElement.tagName.toLowerCase();
	
	if (element.ignoreTags[this.tagName]) { 
		return; 
	}
		
	var el = this.jq;
	this.drawDebugging = !!el.attr("data-debug");
	
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
	if (this.parent) {
		this.offset = {
			top: this.offset.top + this.parent.css.borderTopWidth, 
			left: this.offset.left + this.parent.css.borderLeftWidth
		}
		this.originalOffset = el.offset();
	}
	this.offsetNoMargin = { 
		top: this.offset.top - this.css.marginTop, 
		left: this.offset.left - this.css.marginLeft
	};
	
	this.position = el.position();
	this.height = el.height();
	this.width = this.overflowHiddenWidth = el.width();
	this.isBlock = this.css.display == "block" || this.tagName == "body";
	
	if (this.isBlock) {
		var oldOverflow = el.css("overflow");
		this.overflowHiddenWidth = el.css("overflow", "hidden").width();
		el.css("overflow", oldOverflow);
		this.isOverflowing = this.overflowHiddenWidth != this.width;
	}
	
	if (this.closestBlock && (this.closestBlock.width < this.width)) {
		this.overflowHiddenWidth = this.closestBlock.width;
		this.isOverflowing = this.overflowHiddenWidth != this.width;
	}
	
	this.hasOnlyTextNodes = true;
	this.text = "";
	var childNodes = this._domElement.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeType != 3) { this.hasOnlyTextNodes = false; }
	}
	
	this.text = this.hasOnlyTextNodes ? el.text() : "";
	this.css.font = this.css.fontWeight + " "  + this.css.fontSize + " " + this.css.fontFamily;
	
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
		
	this.shouldRender = (this.css.outerWidthMargins > 0 && this.css.outerHeightMargins > 0);
	
	// Todo: get a better measurement of line height, actually breaking the text up into lines
	var oldHtml = el.html();
	var newHtml = "<span id='measure'>x</span>";
	var measured = el.html(newHtml).find("#measure");
	this.textStart = el.offset();
	this.lineheight = measured.height();
	el.html(oldHtml);
};

element.prototype.renderToCanvas = function(canvas) {
	
	if (!this.shouldRender) { return; }
	
	//log("rendering", this.tagName, this.canvas.width, canvas.width, this.canvas.height, canvas.height);
	
	var ctx = canvas.getContext("2d");
	
	if (element.drawBoundingBox || this.drawDebugging) {
		ctx.strokeStyle = "#d66";
		ctx.lineWidth = 1;
		ctx.strokeRect(this.offset.left, this.offset.top, 
			this.css.outerWidthMargins, this.css.outerHeightMargins);
	}
	
	if (this.css.outerWidthMargins > 0 && this.css.outerHeightMargins > 0) {
		ctx.drawImage(
			this.canvas, this.offset.left, this.offset.top, 
			this.css.outerWidthMargins, this.css.outerHeightMargins
		);
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
	
	// log(this.tagName, this.canvas.height,  this.height, this.canvas.width, this.width);
	
	var canvas = this.canvas;
	var ctx = canvas.getContext("2d");
	
	var offsetLeft = this.css.marginLeft;
	var offsetTop = this.css.marginTop;
	var offsetBottom = this.css.marginBottom;
	var offsetRight = this.css.marginRight;
	
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
	
	offsetTop += borderTopWidth;
	offsetRight += borderRightWidth;
	offsetBottom += borderBottomWidth;
	offsetLeft += borderLeftWidth;
	
	offsetTop += this.css.paddingTop;
	offsetRight += this.css.paddingRight;
	offsetBottom += this.css.paddingBottom;
	offsetLeft += this.css.paddingLeft;
	
	var lineheight = this.lineheight;
	var lines = [];
	
	if (this.hasOnlyTextNodes) {
		
  		ctx.font = this.css.font;
  		ctx.fillStyle = this.css.color;
		ctx.textBaseline = "bottom";
		log(this.offset.left);
		var startX = this.textStart.left - this.offset.left;
		var lines = getLines2(ctx,this.text,this.overflowHiddenWidth);
		var lastY = 0;
		for (var j = 0; j < lines.length; j++) {
		    lastY += this.lineheight;
		    log("rendering text", lines[j], offsetLeft, startX);
		    ctx.fillText(lines[j], offsetLeft + startX, offsetTop + lastY);
		    startX = 0;
		}
	}
	else {
		for (var i = 0; i < this.childElements.length; i++) {
			this.childElements[i].precalculateCanvas();
		}
	}
	
};

function getLines2(ctx, phrase, maxWidth) {
	var words = phrase.split(" ");
	var lastLine = [];
	var lastX = 0;
	var output = [];
	
	for (var i = 0; i < words.length; i++) {
		var word = $.trim(words[i]);
		if (word == "") { continue; }
	    lastX += ctx.measureText(word + ' ').width;
	    lastLine.push(word);
	    
	    if (lastLine.length == 0 || lastX > maxWidth) {
	    	output.push(lastLine.join(' '));
	    	lastX = 0;
	    	lastLine = [];
	    }
	}
	
	if (lastLine.length) {
		output.push(lastLine.join(' '));
	}
	
	return output;
}
