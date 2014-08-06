var ChunkMap = require('../map/ChunkMap')
var MathEx = require('../MathEx')

/**
* Creates a ChunkMap with flora (and rock!) information. This is simply a string
*  flora:'vegetation'|'tree'|'rock'
* @class FloraMap
* @constructor
* @param {Integer} dim Dimensions of the map
* @param {ChunkMap} heightMap The height map containing elevation data
* @param {ChunkMap} temperatureMap Map containing temperature data
* @param {ChunkMap} preciptationMap Map containing precipitation data
* @param {Function} getRandomInt A function that returns a random integer
* @return {ChunkMap} Returns a ChunkMap with a flora property for each tile
*/

function FloraMap(dim, heightMap, temperatureMap, precipitationMap, getRandomInt) {
	var map = new ChunkMap()
	var start = Date.now()
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {
			var t = temperatureMap.getTile(i,j).value
			var h = heightMap.getTile(i,j).value
			var p = precipitationMap.getTile(i,j).value

			var flora = 'nothing'

			if (h > 0.0) {
				var scaledP = MathEx.scale(p, -1.0, 1.0, 0, 1)
				// This math is really a placeholder
				//	For now it means that the probability of a tile 
				//  having vegetation grows exponentially with rain
				//  plain ol' vegetation is weighed twice as much as a tree
				var exponentialGrowth = scaledP*10*scaledP*10
				if (scaledP > 0 && getRandomInt(0, 100) < exponentialGrowth*2) {
					// future: different types of vegetation, based on biome
					flora = 'vegetation'
				} else if (scaledP > 0 && getRandomInt(0, 100) < exponentialGrowth) {
					// future: different types of trees
					flora = 'tree'
				}

				// rocks overwrite other things
				// It's not flora, but its in here for now!
				//	Rocks appear exponentially with elevation
				if (getRandomInt(0, 100) < h*10*h*10*1) {
					// future: different types of rocks
					flora = 'rock'
				}

				// future: other features other than rocks and trees!
			}
			
			map.setTile(i, j, { flora: flora })
		}
	}
	var stop = Date.now()
	console.log('floraMap generated', stop-start, 'ms')
	return map
}

module.exports = FloraMap


