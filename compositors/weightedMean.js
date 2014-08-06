var ChunkMap = require('../map/ChunkMap')

/**
* Averages the values of each tile in mapA with mapB, applying weight
* @method weightedMean
* @param {Integer} dim The dimensions of the maps (they must be the same)
* @param {ChunkMap} mapA The first map
* @param {ChunkMap} mapB The second map
* @param {Number} weight The weight applied to mapA vs mapB
*	e.g. weight: 2.0 will double the contribution of mapA to the result, while 
*	halving the contribution of mapB. A weight of 0.5 will do the exact opposite
*	A weight of 1.0 is equality
* @param {Function} filterFn [Optional, default: nothing] An optional
*	function that can be injected into the weightedMean evaluation. The function
*	should have the signature fn(map, x, y, a, b, complete) and will be called once
*	per iteration. This function can still call the weightedMean arithmetic by 
*	invoking complete(). See the filterTo200UnitsFrom300300 example.
* @return {ChunkMap} Returns a new ChunkMap composed from mapA and mapB
*/
module.exports = function(dim, mapA, mapB, weight, filterFn) {
	var map = new ChunkMap()
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {
			var a = mapA.getTile(i,j).value
			var b = mapB.getTile(i,j).value

			// the actual weightedMean arithmetic
			var complete = function() {
				var value = ((a * weight) + (b * 1/weight)) / 2
				map.setTile(i, j, { value: value })
			} 

			// if no filter, just complete the arithmetic
			if (filterFn) {
				filterFn(map, i, j, a, b, complete)
			} else {
				complete()
			}
		}
	}
	return map
}

/**
* An example filter for weightedMean. One could do just about anything here, but
* 	if the desired behavior is too complicated, it would be more approriate to 
*	simply create another compositor function, rather than crazy filter logic. A 
* 	good rule is that the filter should call originalFn at some point, otherwise
* 	why bother
*
* Changes weightedMean to only weigh mapA and mapB within a specified circle, 
*	values outside of this circle are just copied from mapA instead

var filterTo200UnitsFrom300300 = function(x, y, a, b, originalFn) {
	// calculate radial distance from 300, 300
	var radialDist = Math.floor(math.distance(300, 300, x, y))
	if (radialDist < 200) {
		// if within 200 units run the original weightedMean logic
		originalFn()
	} else { 
		// otherwise copy values from mapA
		heightMap.setTile(i, j, { value: a })
	}
}
*/


// limits algo to areas that are within the landmass from the volcanicMap
/*
// requires volcanicMap to be in scope when this function is declared
var landOnlyFilter = function(map, x, y, a, b, originalFn) {
	if (volcanicMap.getTile(x, y).value > 0) {
		// if above sea level, proceed
		originalFn()
	} else {
		// if below sea level, just set value to 1.0
		map.setTile(x, y, { value: 1.0 })
	}
}
*/