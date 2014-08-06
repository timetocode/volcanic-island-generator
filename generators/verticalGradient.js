var ChunkMap = require('../map/ChunkMap')
var MathEx = require('../MathEx')

/**
* Generates a radial gradient in a circle (not an oval, yet)
* @param {Integer} dim The dimension of the map (it's a mandatory square atm)
* @param {Integer} cx The center point's x
* @param {Integer} cy The center point's y
* @param {Integer} radius The radius of the radial gradient's circle
* @param {Integer} rv [Optional, default: -1.0] The value the gradient reaches 
*	at its radius (aka edge)
* @param {Integer} cv [Optional, default: 1.0] The value the gradient reaches at
*	 its center
* @return {Object} Returns a ChunkMap cotaining the radial gradient
*/
module.exports = function(dim, x1, x2, value1, value2) {
	// defaults
	rv = typeof rv !== 'undefined' ? rv : -1.0
	cv = typeof cv !== 'undefined' ? cv : 1.0

	var start = Date.now()
	var map = new ChunkMap()
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {
	        var value = MathEx.scale(j, x1, x2, value1, value2)
	        //console.log(value, ':', j, value1, value2, x1, x2)
			map.setTile(i, j, { value: value })
		}
	}
	var stop = Date.now()
	console.log('linear gradient generated', stop-start, 'ms')
	return map
}

