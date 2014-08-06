
var ChunkMap = require('../map/ChunkMap')

/**
* Creates a ChunkMap with biome information
* @class BiomeMap
* @constructor
* @param {Integer} dim Dimensions of the map
* @param {ChunkMap} heightMap The height map containing elevation data
* @param {ChunkMap} temperatureMap Map containing temperature data
* @param {ChunkMap} preciptationMap Map containing precipitation data
* @return {ChunkMap} Returns a ChunkMap with a biome property for each tile
*/
function BiomeMap(dim, heightMap, temperatureMap, precipitationMap) {
	var start = Date.now()
	var biomeMap = new ChunkMap()
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {
			var t = temperatureMap.getTile(i,j).value
			var h = heightMap.getTile(i,j).value
			var p = precipitationMap.getTile(i,j).value

			var biome = decideBiome(h, t, p)

			biomeMap.setTile(i, j, { biome: biome })
		}
	}
	var stop = Date.now()
	console.log('biomeMap generated', stop-start, 'ms')
	// javascript hacks, BiomeMap is now a ChunkMap w/ the values defined above
	return biomeMap 
}

/*
* Classifies biomes
*   primarily divides the land into 3 main regions by temp: 
*		hot, temperate, chilly
*   and then each of those into 5 sub regions by water content: 
*		desert, grassland, frontier, forest, rainforest
*	The result is 15 permutations, .e.g 'cold-desert', 'temperate-grassland' etc
*		some have less generic names, like tundra, or tropical-whatever
* @method decideBiome
* @param {Numeber} elevation The elevation, between -1.0 and 1.0
* @param {Numeber} temperature The temperature, between -1.0 and 1.0
* @param {Numeber} precipitation The preciptation, between -1.0 and 1.0
* @return {String} Returns a string name for the biome
*/
var decideBiome = function(elevation, temperature, precipitation) {
	var biome = 'void'
	if (elevation < 0) {		
		// ocean biomes
		biome = 'ocean'
		
		if (temperature > 0.25) {
			biome = 'tropical-ocean'
		}
		if (temperature < -0.25) {
			biome = 'arctic-ocean'
		}
		if (temperature <= 0.25 && temperature >= -0.25) {
			biome = 'temperate-ocean'
		}
		
	} else {
		// land biomes
		if (temperature < -0.25) {		
			// the chilly biomes
			if (precipitation > -1.0) {
				biome = 'cold-desert'
			}
			if (precipitation > -0.25) {
				biome = 'tundra'
			}
			if (precipitation > 0.0) {
				biome = 'taiga-frontier'
			}
			if (precipitation > 0.25) {
				biome = 'taiga'
			}
			if (precipitation > 0.5) {
				biome = 'taiga-rainforest'
			}
		}

		if (temperature > 0.25) {		
			// the hot biomes
			if (precipitation > -1) {
				biome = 'hot-desert'
			}
			if (precipitation > -0.25) {
				biome = 'hot-savanna'
			}
			if (precipitation > 0.0) {
				biome = 'tropical-frontier' // meaning between grass and forest
			}
			if (precipitation > 0.25) {
				biome = 'tropical-forest'
			}
			if (precipitation > 0.5) {
				biome = 'tropical-rainforest'
			}
		}

		if (temperature <= 0.25 && temperature >= -0.25) {		
			// the temperate biomes
			if (precipitation > -1) {
				biome = 'temperate-desert'
			}
			if (precipitation > -0.25) {
				biome = 'temperate-grassland'
			}
			if (precipitation > 0.0) {
				biome = 'temperate-frontier' // meaning between grass and forest
			}
			if (precipitation > 0.25) {
				biome = 'temperate-forest'
			}
			if (precipitation > 0.5) {
				biome = 'temperate-rainforest'
			}
		}

		// 
		if (temperature < -0.55) {
			biome = 'snow'
		}

		if (temperature < -0.66) {
			biome = 'glacier'
		}
	}
	return biome
}

module.exports = BiomeMap
