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
module.exports = function(dim, cx, cy, radius,	rv, cv) {
	// defaults
	rv = typeof rv !== 'undefined' ? rv : -1.0
	cv = typeof cv !== 'undefined' ? cv : 1.0

	var start = Date.now()
	var map = new ChunkMap()
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {

			// default for any given tile, as most tiles are not actually within
			// 	the relevant circle for any given gradient
			map.setTile(i, j, { value: 0 })

			// distance from i,j to the center of the circle
	        var radialDist = Math.floor(MathEx.distance(cx, cy, i, j))

	        // if we're not dealing with a point within the gradiet, skip this
	        // 	iteration
	        if (radialDist > radius)
	        	continue
	        
	        // scale from cv to rv, as we go from center to radius
	        var value = MathEx.scale(radialDist, 0, radius, cv, rv)
			map.setTile(i, j, { value: value })
		}
	}
	var stop = Date.now()
	console.log('radial gradient generated', stop-start, 'ms')
	return map
}

