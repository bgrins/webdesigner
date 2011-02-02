
element.elID = 0;
element.ignoreTags = { 'style':1 };
element.drawBoundingBox = false;
element.styleAttributes = [
'border-top-style', 'border-top-color',
'border-right-style', 'border-right-color',
'border-bottom-style', 'border-bottom-color',
'border-left-style', 'border-left-color',
'display', 'text-decoration',
'font-family', 'font-style', 'font-weight', 'font-size', 'color'
];
element.styleAttributesPx = [
'padding-top','padding-right','padding-bottom','padding-left',
'margin-top','margin-right','margin-bottom','margin-left',
'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'
];

function element(DOMElement) {
	//log("initializing element", DOMElement);
	
	DOMElement._element = this;
	
	this.elID = element.elID++;
	this._domElement = DOMElement;
	
	this.copyDOM();
	
	if (this.shouldRender) {
		this.childNodes = this._domElement.childNodes;
		this.childElements = [];
		for (var i = 0; i < this.childNodes.length; i++) {
			this.childElements.push(new element(this.childNodes[i]));
		}
	}
}

element.prototype.copyDOM = function(el) {

	this.shouldRender = false;
	this.nodeType = this._domElement.nodeType;
	
	if (this.nodeType == 3) {
		this.text = this._domElement.data;
		return; 
	}
	
	this.tagName = this._domElement.tagName.toLowerCase();
	
	if (element.ignoreTags[this.tagName]) { 
		return; 
	}
		
	var el = $(this._domElement);

	this.shouldRender = true;
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
	
	this.originalOffset = el.offset();
	this.offset = { 
		top: this.originalOffset.top - this.css.marginTop, 
		left: this.originalOffset.left - this.css.marginLeft 
	};
	this.position = el.position();
	this.height = el.height();
	this.width = el.width();
	
	
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
		
	
	// Todo: get a better measurement of line height, actually breaking the text up into lines
	var oldHtml = el.html();
	var newHtml = el.html() + "<span id='measure'>x</span>";
	var measured = el.html(newHtml).find("#measure");
	var measuredHeight = measured.height();
	this.lineheight = measuredHeight;
	el.html(oldHtml);
};
element.prototype.renderToCanvas = function(canvas) {
	
	if (!this.shouldRender) { return; }
	
	//log("rendering", this.tagName, this.offset);
	log("rendering", this.tagName, this.canvas, this.offset.left, this.offset.top);
	
	var ctx = canvas.getContext("2d");
	if (element.drawBoundingBox || this.drawDebugging) {
		ctx.strokeStyle = "#d66";
		ctx.lineWidth = 1;
		ctx.strokeRect(this.offset.left - 1, this.offset.top - 1, 
			this.css.outerWidthMargins + 2, this.css.outerHeightMargins + 2);
	}
	
	ctx.drawImage(this.canvas, this.offset.left, this.offset.top, 
		this.css.outerWidthMargins, this.css.outerHeightMargins);
	
	
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
	
	var offsetLeft = 0;
	var offsetTop = 0;
	var offsetBottom = 0;
	var offsetRight = 0;
	
	var offsets = { 'top': 0, 'right': 0, 'bottom': 0, 'left': 0 };
	
	if (this.display == "block") {
	
	}
	
	offsetTop += this.css.marginTop;
	offsetRight += this.css.marginRight;
	offsetBottom += this.css.marginBottom;
	offsetLeft += this.css.marginLeft;
	
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
		ctx.fillRect(offsetLeft + this.css.outerWidth - borderRightWidth, offsetTop, borderRightWidth, this.css.outerHeight);
	}
	
	
	offsetTop += borderTopWidth;
	offsetRight += borderRightWidth;
	offsetBottom += borderBottomWidth;
	offsetLeft += borderLeftWidth;
	
	offsetTop += this.css.paddingTop;
	offsetRight += this.css.paddingRight;
	offsetBottom += this.css.paddingBottom;
	offsetLeft += this.css.paddingLeft;
	
	for (var i = 0; i < this.childElements.length; i++) {
		var element = this.childElements[i];
		if (element.nodeType == 3) {
  			ctx.font = this.css.font;
  			ctx.fillStyle = this.css.color;
			ctx.textBaseline = "bottom";
			
			log("rendering text", element.text, this.tagName, this.lineheight, this.height, this.position.top);
			
  			ctx.fillText(element.text, offsetLeft, offsetTop + this.lineheight);// offsetLeft, this.offset.top);
  			offsetLeft += ctx.measureText(element.text).width;
		}
		else {
			offsetLeft += element.width;
			element.precalculateCanvas();
		}
	}
};
