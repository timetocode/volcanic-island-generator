
/**
* MathEx, aka MathExtensions
* not to be confused with javascript's Math
* contains some normal game dev math
*	 distance, vectors, ranges, lerps
*/

/**
* Scales a number from a source range to its value in a destination range
* e.g. n: 127.5 from range [0, 255] would become n: 0.0 in range [-1, 1]
* @method scale
* @param {Number} n The number to scale
* @param {Number} a The lower limit of the source range
* @param {Number} b The upper limit of the source range
* @param {Number} c The lower limit of the destination range
* @param {Number} d The lower limit of the destination range
* @return {Number} Returns a value for n relative to the destination range
*/
module.exports.scale = function(n, a, b, c, d) {
	return (d - c) * (n - a) / (b - a) + c
}

/*
* Distance between two points, pythagorean
* @method distance
* @param {Number} x1 X component of the first point
* @param {Number} y1 Y component of the first point
* @param {Number} x2 X component of the second point
* @param {Number} y2 Y component of the second point
* @return {Number} Returns distance
*/
module.exports.distance = function(x1, y1, x2, y2) {
    var x = x2 - x1
    var y = y2 - x1
    return Math.sqrt((x*x) + (y*y))
}

/*
* Turns two points into a vector
* @method vectorize
* @param {Number} x1 X component of the first point
* @param {Number} y1 Y component of the first point
* @param {Number} x2 X component of the second point
* @param {Number} y2 Y component of the second point
* @return {Object} Returns a vector with x and y components
*/
module.exports.vectorize = function(x1, y1, x2, y2) {
	return {
		x: x2 - x1,
		y: y2 - y1
	}
}

/*
* Calculates length of a vector ##not sure if this is actually used anywhere
* @method vectorLength
* @param {Object} vector A vector with an x and y component
* @return {Object} Returns a vector with x and y components
*/
module.exports.vectorLength = function(vector) {
	return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
}


/*
* Calculates a unit vector (vector of length 1)
* @method normalizeVector
* @param {Object} vector A vector with an x and y component
* @return {Object} Returns a unit vector with x and y components
*/
module.exports.normalizeVector = function(vector) {
	if (vector.x === 0 & vector.y === 0) {
		return { x: 0, y: 0 }
	}

	var	length = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
	return {
		x: vector.x / length,
		y: vector.y / length
	}
}

/*
* Liner interpolation
* e.g. a: 50, b: 100, portion: 0.5, result: 75 (75 is halfway from 50 to 100)
* @method lerp
* @param {Number} a The first number in the range
* @param {Number} b The second number in the range
* @param {Number} portion Partial distance usually between 0.0 and 1.0
* @return {Object} Returns a value at 'portion' distance between a and b
*/
var lerp = function(a, b, portion) {
  return a + ((b - a) * portion)
}
module.exports.lerp = lerp

/*
* Liner interpolation between two colors (for blending/gradients)
* @method lerpColor
* @param {Number} colorA The first color
* @param {Number} colorB The second color
* @param {Number} portion How far between the colors (0.0 is colorA, 1.0 is colorB)
* @return {Object} Returns a color blend between a and b
*/
module.exports.lerpColor = function(colorA, colorB, portion) {
    return {
        r: lerp(colorA.r, colorB.r, portion),
        g: lerp(colorA.g, colorB.g, portion),
        b: lerp(colorA.b, colorB.b, portion)
    }
}
