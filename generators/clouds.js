var ChunkMap = require('../map/ChunkMap')

/**
* Generates the classic perlin-esque cloud pattern
* @param {Object} simplex An instance simplex - supply one with a seed if you 
* 	want reproducible results
* @param {Integer} dim The dimensions (it's a square) of the map
* @return {Object} Returns a ChunkMap, containing the cloud pattern
*/
module.exports = function(simplex, dim) {
	var small = 9999
	var large = -9999
	var start = Date.now()

	var heightMap = new ChunkMap()
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {

			var x = i
			var y = j

			// 8 octaves typed by hand
			// the first two are both weighed at 1/128 so that the total of the
			// 	fractions adds up to 1.0
	        var a = simplex.noise2D(x, y) * 1/128	        
	        a += simplex.noise2D(x / 2, y / 2) * 1/128
	        a += simplex.noise2D(x / 4, y / 4) * 1/64
	        a += simplex.noise2D(x / 8, y / 8) * 1/32
	        a += simplex.noise2D(x / 16, y / 16) * 1/16
	        a += simplex.noise2D(x / 32, y / 32) * 1/8
	        a += simplex.noise2D(x / 64, y / 64) * 1/4
	        a += simplex.noise2D(x / 128, y / 128) * 1/2       
	
			// track the upper and lower ranges, for debugging
	        if (small > a) 	small = a
	        if (large < a) 	large = a       

			heightMap.setTile(i, j, { value: a })
		}
	}
	var stop = Date.now()
	console.log('clouds generated', stop-start, 'ms', 'ranges', small, large)
	return heightMap
}

