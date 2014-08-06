var ChunkMap = require('../map/ChunkMap')

/**
* Subtracts all the values in mapB from mapA
* @method subtract
* @param {Integer} dim The dimensions of the maps (they must be the same)
* @param {ChunkMap} mapA The first map
* @param {ChunkMap} mapB The second map
* @return {ChunkMap} Returns a new ChunkMap composed from mapA and mapB
*/
module.exports = function(dim, mapA, mapB, weight) {
	var map = new ChunkMap()
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {
			var a = mapA.getTile(i,j).value
			var b = mapB.getTile(i,j).value

			var value = a - b
			map.setTile(i, j, { value: value})
		}
	}
	return map
}

