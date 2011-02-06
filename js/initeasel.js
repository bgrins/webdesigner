

// IMPORT DEMO FROM EASEL
// TODO: TAKE PAGE OFFSET INTO ACCOUNT, USE OUR Elements instead



var offset, stage, canvas;

function initeasel(bodyElement, c) {
canvas = c;

// attach mouse handlers directly to the source canvas:
canvas.onmousemove = onMouseMove;
canvas.onmousedown = onMouseDown;
canvas.onmouseup = onMouseUp;

// assign a tick listener directly to this window:
Tick.addListener(window);


	
stage = new Stage(canvas);
offset = new Point();
stage.mouseChildren = true;

// attach mouse handlers directly to the source canvas:
canvas.onmousemove = onMouseMove;
canvas.onmousedown = onMouseDown;
canvas.onmouseup = onMouseUp;

// assign a tick listener directly to this window:
Tick.addListener(window);


	bodyElement.traverseChildren(function(element) {
		log("traversing", element.canvas);
		var bitmap = new Bitmap(element.canvas);
		bitmap.x = element.x;
		bitmap.y = element.y;
		bitmap.mouseEnabled = true;
		
		//bitmap.rotation = 360 * Math.random()|0;
		//bitmap.regX = bitmap.image.width/2|0;
		//bitmap.regY = bitmap.image.height/2|0;
		stage.addChild(bitmap);
	});
	


/*
// load the source image:
var image = new Image();
image.src = "load/blueprint/valid.png"
image.onload = handleImageLoad;
*/	
}

 
var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
function handleImageLoad(event) {
	var image = event.target;
	var bitmap;
	
	
	// create and populate the screen with random daisies:
	for(var i = 0; i < 30; i++){
		bitmap = new Bitmap(image);
		bitmap.x = canvas.width * Math.random()|0;
		bitmap.y = canvas.height * Math.random()|0;
		bitmap.rotation = 360 * Math.random()|0;
		bitmap.regX = bitmap.image.width/2|0;
		bitmap.regY = bitmap.image.height/2|0;
		bitmap.mouseEnabled = true;
		stage.addChild(bitmap);
	}
}
 
function tick() {

	// if we were dragging, but are not anymore, call mouseOut with the old target:
	if(!dragStarted && mouseTarget){ 
		onMouseOut(mouseTarget); 
			log("MOUSEOVER");
		dragStarted = false;
	}
	
	// if we're not currently dragging, and have valid mouseX and mouseY values, check for objects under mouse:
	if(!dragStarted && stage.mouseX && stage.mouseY){
		// this will return the top-most display object under the mouse position:
		mouseTarget = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
		if(mouseTarget){
			// if we found a target, call mouseOver with it:
			onMouseOver(mouseTarget);
			offset.x = mouseTarget.x-stage.mouseX;
			offset.y = mouseTarget.y-stage.mouseY;
		}
	}
	
	// if we're currently dragging something, update it's x/y:
	if(dragStarted && mouseTarget){
		// pop it to the top of the display list:
		stage.addChild(mouseTarget);
		mouseTarget.x = stage.mouseX+offset.x;
		mouseTarget.y = stage.mouseY+offset.y;
	}
	
	//Tick the display list (draw everything)
	stage.tick();
}
 
 
/**********************************
/** MOUSE HANDLERS 
**********************************/
// on mouse move, update the stage's mouseX/mouseY:
function onMouseMove(e) {
	if(!e){ var e = window.event; }
	log(e.layerX, e.layerY);
	
	stage.mouseX = e.layerX; 
	stage.mouseY = e.layerY;
	//stage.mouseX = e.pageX-canvas.offsetLeft;
	//stage.mouseY = e.pageY-canvas.offsetTop;
}
 
// set flag to indicate we want to drag whatever is under the mouse:
function onMouseDown() {
	if(!e){ var e = window.event; }
	dragStarted = true;
}
 
// set flag to indicate we no longer want to drag:
function onMouseUp() {
	dragStarted = false;
}
 
// scale Display Objects on mouseOver / Out:
function onMouseOver(target){
	target.scaleX = target.scaleY = 1.1; 
}
 
function onMouseOut(target){
	target.scaleX = target.scaleY = 1; 
}
