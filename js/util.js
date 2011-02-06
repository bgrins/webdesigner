/*
 * Canvas Context2D Wrapper <http://github.com/millermedeiros/CanvasContext2DWrapper>
 * Released under WTFPL <http://sam.zoy.org/wtfpl/>.
 * @author Miller Medeiros <http://millermedeiros.com>
 * @version 1.0 (2010/08/08)
 */
(function(d){var e="arc arcTo beginPath bezierCurveTo clearRect clip closePath createImageData createLinearGradient createRadialGradient createPattern drawFocusRing drawImage fill fillRect fillText getImageData isPointInPath lineTo measureText moveTo putImageData quadraticCurveTo rect restore rotate save scale setTransform stroke strokeRect strokeText transform translate".split(" "),b="canvas fillStyle font globalAlpha globalCompositeOperation lineCap lineJoin lineWidth miterLimit shadowOffsetX shadowOffsetY shadowBlur shadowColor strokeStyle textAlign textBaseline".split(" ");function a(h,g,f){return function(){return h.apply(g,arguments)||f}}function c(h,g,f){return function(i){if(typeof i==="undefined"){return g[h]}else{g[h]=i;return f}}}d.Context2DWrapper=function(f){var h=e.length,g;this.context=f;while(h--){g=e[h];this[g]=a(f[g],f,this)}h=b.length;while(h--){g=b[h];this[g]=c(g,f,this)}}}(this));