
element.elID = 0;
element.ignoreTags = { 'style':1 };
element.styleAttributes = [
'padding-top','padding-right','padding-bottom','padding-left',
'margin-top','margin-right','margin-bottom','margin-left',
'border-top-width', 'border-top-style', 'border-top-color',
'border-right-width', 'border-right-style', 'border-right-color',
'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
'border-left-width', 'border-left-style', 'border-left-color',
'display', 'text-decoration',
'font-family', 'font-style', 'font-weight', 'font-size', 'color'
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
	this.offset = el.offset();
	this.position = el.position();
	this.height = el.height();
	this.width = el.width();
	
	this.css = { };
	for (var i = 0; i < element.styleAttributes.length; i++) {
		var attr = element.styleAttributes[i];
		this.css[$.camelCase(attr)] = el.css(attr);
	}
	
	this.css.font = this.css.fontWeight + " "  + this.css.fontSize + " " + this.css.fontFamily;
	
	this.css.outerHeight = this.height + 
		parseInt(this.css.paddingTop, 10) +
		parseInt(this.css.paddingBottom, 10) +
		parseInt(this.css.borderTopWidth, 10) + 
		parseInt(this.css.borderBottomWidth);
		
	this.css.outerHeightMargins = this.css.outerHeight + 
		parseInt(this.css.marginTop, 10) + 
		parseInt(this.css.marginBottom, 10);
		
	this.css.outerWidth = this.width + 
		parseInt(this.css.paddingLeft, 10) +
		parseInt(this.css.paddingRight, 10) +
		parseInt(this.css.borderLeftWidth, 10) + 
		parseInt(this.css.borderRightWidth);
		
	this.css.outerWidthMargins = this.css.outerWidth + 
		parseInt(this.css.marginLeft, 10) + 
		parseInt(this.css.marginRight, 10);
		
	
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
	
	canvas.getContext("2d").drawImage(this.canvas, this.offset.left, this.offset.top, this.css.outerWidthMargins, this.css.outerHeightMargins);
	for (var i = 0; i < this.childElements.length; i++) {
		var element = this.childElements[i];
		if (element.nodeType != 3) {
			element.renderToCanvas(canvas);
		}
	}
};

element.prototype.precalculateCanvas = function() {
	if (!this.shouldRender) { return; }
	
	this.canvas = document.createElement("canvas");
	
	this.canvas.width = this.css.outerWidthMargins;
	this.canvas.height = this.css.outerHeightMargins;
	
	log(this.tagName, this.canvas.height,  this.height, this.canvas.width, this.width);
	var canvas = this.canvas;
	var ctx = canvas.getContext("2d");
	
	var offsetLeft = 0;
	var offsetTop = 0;
	var offsetBottom = 0;
	var offsetRight = 0;
	
	var offsets = { 'top': 0, 'right': 0, 'bottom': 0, 'left': 0 };
	
	if (this.display == "block") {
	
	}
	
	var marginWidths = {
		top: parseInt(this.css.marginTop, 10),
		right: parseInt(this.css.marginRight, 10),
		bottom: parseInt(this.css.marginBottom, 10),
		left: parseInt(this.css.marginLeft, 10)
	};
	
	offsetTop += parseInt(this.css.marginTop, 10) || 0;
	offsetRight += parseInt(this.css.marginRight, 10) || 0;
	offsetBottom += parseInt(this.css.marginBottom, 10) || 0;
	offsetLeft += parseInt(this.css.marginLeft, 10) || 0;
	
	var borderLeftWidth = parseInt(this.css.borderLeftWidth, 10) || 0;
	if (borderLeftWidth) {		
		ctx.fillStyle = this.css.borderLeftColor;
		ctx.fillRect(offsetLeft, offsetTop, borderLeftWidth, this.css.outerHeight);
	}
	var borderTopWidth = parseInt(this.css.borderTopWidth, 10) || 0;
	if (borderTopWidth) {		
		ctx.fillStyle = this.css.borderTopColor;
		ctx.fillRect(offsetLeft, offsetTop, this.css.outerWidth, borderTopWidth);
	}
	var borderBottomWidth = parseInt(this.css.borderBottomWidth, 10) || 0;
	if (borderBottomWidth) {		
		ctx.fillStyle = this.css.borderBottomColor;
		ctx.fillRect(offsetLeft, offsetTop + this.css.outerHeight - borderBottomWidth, this.css.outerWidth, borderBottomWidth);
	}
	var borderRightWidth = parseInt(this.css.borderRightWidth, 10) || 0;
	if (borderRightWidth) {		
		ctx.fillStyle = this.css.borderRightColor;
		ctx.fillRect(offsetLeft + this.css.outerWidth - borderRightWidth, offsetTop, borderRightWidth, this.css.outerHeight);
	}
	
	
	offsetTop += borderTopWidth;
	offsetRight += borderRightWidth;
	offsetBottom += borderBottomWidth;
	offsetLeft += borderLeftWidth;
	
	offsetTop += parseInt(this.css.paddingTop, 10) || 0;
	offsetRight += parseInt(this.css.paddingRight, 10) || 0;
	offsetBottom += parseInt(this.css.paddingBottom, 10) || 0;
	offsetLeft += parseInt(this.css.paddingLeft, 10) || 0;
	
	
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
