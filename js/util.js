/*
 * Canvas Context2D Wrapper <http://github.com/millermedeiros/CanvasContext2DWrapper>
 * Released under WTFPL <http://sam.zoy.org/wtfpl/>.
 * @author Miller Medeiros <http://millermedeiros.com>
 * @version 1.0 (2010/08/08)
 */
(function(d){var e="arc arcTo beginPath bezierCurveTo clearRect clip closePath createImageData createLinearGradient createRadialGradient createPattern drawFocusRing drawImage fill fillRect fillText getImageData isPointInPath lineTo measureText moveTo putImageData quadraticCurveTo rect restore rotate save scale setTransform stroke strokeRect strokeText transform translate".split(" "),b="canvas fillStyle font globalAlpha globalCompositeOperation lineCap lineJoin lineWidth miterLimit shadowOffsetX shadowOffsetY shadowBlur shadowColor strokeStyle textAlign textBaseline".split(" ");function a(h,g,f){return function(){return h.apply(g,arguments)||f}}function c(h,g,f){return function(i){if(typeof i==="undefined"){return g[h]}else{g[h]=i;return f}}}d.Context2DWrapper=function(f){var h=e.length,g;this.context=f;while(h--){g=e[h];this[g]=a(f[g],f,this)}h=b.length;while(h--){g=b[h];this[g]=c(g,f,this)}}}(this));


var keyCode = {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
	