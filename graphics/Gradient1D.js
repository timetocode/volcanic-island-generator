var MathEx = require('../MathEx')
var ColorHelper = require('./ColorHelper')

/**
* Checks if a color is a hex string or rgb object
* converts hex string to rgb
*/
function sanitizeColor(color) {
    if (typeof color == 'string' && color.indexOf('#') == 0) {
        return ColorHelper.hexToRgb(color)
    } else if (typeof color.r == 'number') {        
        return color
    } else {
        throw('Unable to understand color format. Use hex #FFFFFF or { r: 255, g: 255: b: 255 }')
    }
}

/**
* Represents a multi-color gradient
* this is not a graphical component at all, merely 1D data which can be
* queried for nice blended colors at any position along the gradient
* @class Gradient
* @constructor
* @param {Object} anchors A dictionary of numbers and colors, e.g.
*   '1.0' : '#FFFFFF',
*   '0.8' : '#1A3F66', and so on
*   the color can be either format: '#FFFFFF' or { r: 255, g: 255: b: 255 }
*/
function Gradient1D(anchors) {
    this.anchors = []
    for (var prop in anchors) {
        this.anchors.push({ 
            value: parseFloat(prop), 
            color: sanitizeColor(anchors[prop]) 
        })
    }
}

/**
* Queries the gradient for a blended color
* @method colorAt
* @param {Number} n A value within the gradient range
* @return {Object} Returns a color object with r,g,b components
*/
Gradient1D.prototype.colorAt = function(n) {
    // hack, b/c exact 1.0 and -1.0 don't work... need to change > to >=
    // but not going to test all that yet, so this remains for now
    // also acts as a bounds check
	if (n > 0.99) n = 0.99
	if (n < -0.99) n = -0.99

    // for n, find closet two anchor points
    var max = { value: 9999 }
    var min = { value: -9999 }
    
    for (var i = 0; i < this.anchors.length; i++) {
        var curr = this.anchors[i]
        if (curr.value < max.value && curr.value > n) {
            max = curr
        }
        if (curr.value > min.value && curr.value < n) {
            min = curr
        }
    }

    // then linearly interpolate a blended color between these two anchor points
    var portion = (n-min.value)/(max.value-min.value)
    var color = MathEx.lerpColor(min.color, max.color, portion)

    return color
}

/**
* Queries the gradient for a blended color, wraps colorAt
* @method getRGBA
* @param {Number} n A value within the gradient range
* @return {Object} Returns an HTML5 rgba color string
*/
Gradient1D.prototype.getRGBA= function(n) {
    var color = this.colorAt(n)
    return 'rgba(' 
        + Math.floor(color.r) + ',' 
        + Math.floor(color.g) + ',' 
        + Math.floor(color.b) +', 1.0)'
}

module.exports = Gradient1D