
/* Original source: StackOverflow: Tim Down 
* http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb 
* modified
*/

/**
* Returns an RGB representation of a hex color
* e.g. '#FFFFFF' becomes { r: 255, g: 255, b: 255 } 
* Note: there are bitmath alternatives to this, if speed is ever a problem
* @method hexToRgb
* @param {String} hex The hex representation of a color
* @return {Object} An object with r, g, b, properties from 0-255
*/
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
* Converts a base 10 number into hex presumably ##untested
*/
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/**
* Returns a hex string representation of an RGB color ##untested
* e.g. { r: 255, g: 255, b: 255 } becomes '#FFFFFF'
* @method rgbToHex
* @param {Integer} r The red component, 0-255
* @param {Integer} b The blue component, 0-255
* @param {Integer} g The green component, 0-255
* @return {String} Returns the color as a hex string
*/
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

module.exports.hexToRgb = hexToRgb
module.exports.rgbToHex = rgbToHex

