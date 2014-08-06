(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{}],2:[function(require,module,exports){

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

},{"../map/ChunkMap":26}],3:[function(require,module,exports){
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



},{"../MathEx":1,"../map/ChunkMap":26}],4:[function(require,module,exports){

/**
* Compositor, wraps the compositing functions
* named after composition operations (XOR, OR, AND, etc)
* usage: Compositor.weightedMean(etc)
*/
module.exports.weightedMean = require('./weightedMean')
module.exports.subtract = require('./subtract')
},{"./subtract":5,"./weightedMean":6}],5:[function(require,module,exports){
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


},{"../map/ChunkMap":26}],6:[function(require,module,exports){
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
},{"../map/ChunkMap":26}],7:[function(require,module,exports){
var MathEx = require('../MathEx')


function Eroder(slopeMap, map, getRandomInt) {
	this.slopeMap = slopeMap
	this.map = map
	this.getRandomInt = getRandomInt
}

// deposit sediment
Eroder.prototype.deposit = function(x, y, amount) {
	var currTile = this.map.getTile(x,y)	

	var neighbors = [
		{ x: x + 1, y: y},
		{ x: x - 1, y: y},
		{ x: x, y: y + 1},
		{ x: x, y: y - 1}
	]

	var highestNeighorValue = -99
	var highestNeighbor = false

	// find the highest neighbor
	for (var i = 0; i < neighbors.length; i++) {
		var neighbor = neighbors[i]

		if (this.slopeMap.boundsCheck(neighbor.x, neighbor.y)) {
			var neighborValue = this.map.getTile(neighbor.x, neighbor.y).value
			if (neighborValue > highestNeighorValue) {
				highestNeighorValue = neighborValue
				highestNeighbor = neighbor
			}
		}
	}

	// only deposit up to the highest neighbor's height
	if (highestNeighbor) {
		if (highestNeighorValue > currTile.value) {
			var maxFillAmount = highestNeighorValue - currTile.value
			
			if (amount < maxFillAmount) {
				//console.log('filling amount', amount)
				currTile.value += amount
			} else {
				//console.log('max amount', maxFillAmount)
				currTile.value += maxFillAmount
			}
		}
	}

	this.slopeMap.recalculate(x,y, this.map)
	this.slopeMap.recalculate(x+1,y, this.map)
	this.slopeMap.recalculate(x-1,y, this.map)
	this.slopeMap.recalculate(x,y+1, this.map)
	this.slopeMap.recalculate(x,y-1, this.map)
}

/**
* Removes an amount from the heightmap at x,y. Removes half that much from the 
* 	N S E W neighbors
* @method erode
* @param {Integer} x X coordinate
* @param {Integer} y Y cordinate
* @param {Number} amount How much to erode
*/
Eroder.prototype.erode = function(x, y, amount) {
	this.map.getTile(x,y).value -= amount
	
	if (this.slopeMap.boundsCheck(x+1, y)) {
		this.map.getTile(x+1,y+0).value -= amount * 0.5
	}
	if (this.slopeMap.boundsCheck(x-1, y)) {
		this.map.getTile(x-1,y+0).value -= amount * 0.5
	}
	if (this.slopeMap.boundsCheck(x, y + 1)) {
		this.map.getTile(x+0,y+1).value -= amount * 0.5
	}
	if (this.slopeMap.boundsCheck(x, y-1)) {
		this.map.getTile(x+0,y-1).value -= amount * 0.5
	}
	
	this.slopeMap.recalculate(x,y, this.map)
	this.slopeMap.recalculate(x+1,y, this.map)
	this.slopeMap.recalculate(x-1,y, this.map)
	this.slopeMap.recalculate(x,y+1, this.map)
	this.slopeMap.recalculate(x,y-1, this.map)
}

/**
* Given a directional vector, follows the vector but randomly applies weights
* 	to each of the x and y components. Overall this moves generally downhill,
*	but with some winding.
* @method chooseDirection
* @param {Vector} vector An object whose x, y represent a vector
* @return {Point} Returns an object with x, y between -1 and 1
*/
Eroder.prototype.chooseDirection = function(vector) {
	var direction = { x: 0, y: 0 }	
	
	// commit to a direction for X, either 1 or -1 if x is above/below zero
	if (vector.x > 0.0) {
		direction.x = 1
	} else {
		direction.x = -1
	}

	// commit to a direction for Y, either 1 or -1 if y is above/below zero
	if (vector.y > 0.0) {
		direction.y = 1
	} else {
		direction.y = -1
	}	

	var absX = Math.abs(vector.x)
	var absY = Math.abs(vector.y)

	if (absX > absY * this.getRandomInt(1, 4)) {
		direction.y = 0
	}

	if (absY > absX * this.getRandomInt(1, 4)) {
		direction.x = 0
	}
	/*
	// half the time go somewhere random
	if (this.getRandomInt(1,10) === 1) {
		direction.x = this.getRandomInt(-1, 1)
	} else {
		direction.y = this.getRandomInt(-1, 1)
	}
	*/
	
	return direction
}

/**
* Is a tile the lower than its neighbors?
* @method isLowest
* @param {Integer} x X
* @param {Integer} y Y
* @param {Number} threshold Allows for a little play in the neighbors, e.g. 0.98
*	means the target tile could be up to 2% lower than its neighbors without 
* 	this function claiming it is the lowest. Used to ignore subtle variations
*	that are not a significantly lower point.
* @return {Boolean} Returns true if tile is lower than neighbors, else false
*/
Eroder.prototype.isLowest = function(x,y, threshold) {
	var here = this.map.getTile(x, y)
	if (here.value < this.map.getTile(x+1,y).value * threshold
			&& here.value < this.map.getTile(x-1,y).value * threshold
			&& here.value < this.map.getTile(x,y+1).value * threshold
			&& here.value < this.map.getTile(x,y+1).value * threshold) {
		return true
	}

	return false
}


Eroder.prototype.isHighest = function(x,y, threshold) {
	var here = this.map.getTile(x, y)
	if (here.value > this.map.getTile(x+1,y).value * threshold
			&& here.value > this.map.getTile(x-1,y).value * threshold
			&& here.value > this.map.getTile(x,y+1).value * threshold
			&& here.value > this.map.getTile(x,y+1).value * threshold) {
		return true
	}

	return false
}


//var erodeImmune = {}

function xyKey(x, y) {
	return x + ',' + y
}

/**
* Flows around the map in a mostly downhill direction, applying erosion and
* 	depositing soil. Calls an inner function recursively, ends at a low point 
* 	for erosion, ends at a the ocena for rivers, or ends after a set number 
* 	of iterations.
* @method flow
* @param {Integer} x
* @param {Integer} y
* @param {Number} erosionStrength Erosion strength is subtracted from the
* 	heightMap, so numbers should be very small, in the 0.001 - 0.05 range
* @param {Boolean} isRiver A flag to denote if the algo is in river mode
* @return {Array} Returns an array of river points (or nothing, if in erosion mode)
*/
var allEvar = {}
Eroder.prototype.flow = function(x, y, erosionStrength, isRiver) {
	//console.log('flow', x, y, momentum, water, particulates, curr)
	var limit = (isRiver) ? 300 : 100
	var curr = 0
	var immune = {}
	var todo = []
	var riverTiles = []
	var slopeMap = this.slopeMap
	var self = this
	var isLowest = this.isLowest

	var momentum = { x: 0, y: 0 }

	var dirt = 0

	function innerFlow(x, y) {
		curr++
		//console.log('flow', x, y, momentum, water, particulates, curr)
		if (!slopeMap.boundsCheck(x,y)) {
			//console.log('flow concluded: ran off edge of map')
			return
		}

		if (curr > limit) {
			//console.log('flow concluded: hit limit of ' + limit + ' iterations')
			return
		}

		if (allEvar[xyKey(x, y)])
			return

		if (self.map.getTile(x,y).value <= 0) {
			return
		}

		var threshold = (isRiver) ? 1 : 0.98

		var slope = self.slopeMap.getTile(x,y)
		// slope may be inverted somewhere, this only goes downhill if slope is subtracted
		momentum.x -= slope.x 
		momentum.y -= slope.y

		if (self.isLowest(x,y, threshold)) {
		
			
			todo.push(function() { self.deposit(x+1, y, erosionStrength, this.map) })
			todo.push(function() { self.deposit(x-1, y, erosionStrength, this.map) })
			todo.push(function() { self.deposit(x, y+1, erosionStrength, this.map) })
			todo.push(function() { self.deposit(x, y-1, erosionStrength, this.map) })
			todo.push(function() { self.deposit(x, y, erosionStrength, this.map) })
			dirt -= erosionStrength * 12
				//console.log('flow concluded: arrived at lowest point')
			if (!isRiver)
				return
		} else {	
		
			var magnitude = MathEx.vectorLength(momentum)
			if (dirt > magnitude && !self.isHighest(x, y, 1.0)) {
				
				todo.push(function() { self.deposit(x+1, y, erosionStrength, this.map) })
				todo.push(function() { self.deposit(x-1, y, erosionStrength, this.map) })
				todo.push(function() { self.deposit(x, y+1, erosionStrength, this.map) })
				todo.push(function() { self.deposit(x, y-1, erosionStrength, this.map) })
				todo.push(function() { self.deposit(x, y, erosionStrength, this.map) })

				dirt -= erosionStrength * 12
				//momentum.x *= 0.99
				//momentum.y *= 0.99
			} else {
				todo.push(function() { self.erode(x, y, erosionStrength, this.map) })
				dirt += erosionStrength * 18
			}
		}

		// mark the tile, used by the rendering code to draw blue river overlay
		if (isRiver) {
			riverTiles.push({x: x, y: y})
			//riverTiles.push({x: x+1, y: y})
			//riverTiles.push({x: x, y: y+1})
			//riverTiles.push({x: x+1, y: y+1})
			allEvar[xyKey(x, y)] = true
			//allEvar[xyKey(x+1, y)] = true
			//allEvar[xyKey(x+1, y+1)] = true
			//allEvar[xyKey(x, y+1)] = true
		}

		// mark the tile as immune, it cannot be eroded again this flow
		immune[xyKey(x, y)] = true



		//console.log(momentum, magnitude, dirt)

		// lose momentum each tile, so that slope is a large factor in our direction (rather than
		// building up speed and making a very straight line)
		//momentum.x *= 0.98
		//momentum.y *= 0.98

		var next = self.chooseDirection(momentum)

		var maxTries = 10
		var tries = 0
		// flow in another direction if we've already flown here before
		while (xyKey(x + next.x, y + next.y) in immune && ++tries < maxTries) {
			//console.log('rerolling direction due to immunity')
			next = self.chooseDirection(momentum)
		}
		innerFlow(x + next.x, y + next.y)
	}

	innerFlow(x,y)

	for (var j = 0; j < todo.length; j++) {
		todo[j]()
	}

	return { todo: todo, riverTiles: riverTiles }
}


Eroder.prototype.applyErosion = function() {
	var start = Date.now()

	var allRiverTiles = []


	// river pass needs to run before erosion pass, otherwise the rivers
	// 	 are prone to ending in the small dips created by the erosion drops
	// river pass
	for (var i = 0; i < 400; i++) {
		var result = this.flow(
			this.getRandomInt(0, this.slopeMap.dim),
			this.getRandomInt(0, this.slopeMap.dim),  
			0.02, 
			true,
			this.map
		)

		for (var j = 0; j < result.riverTiles.length; j++) {
			allRiverTiles.push(result.riverTiles[j])
		}
	}
	
	// erosion pass
	for (var i = 0; i < 30000; i++) {
		var result = this.flow(
			this.getRandomInt(0, this.slopeMap.dim),
			this.getRandomInt(0, this.slopeMap.dim),  
			0.005, 
			false,
			this.map
		)
	}
	
	var finish = Date.now()
	console.log('eroder completed in', finish - start, 'ms ')
	console.log('riverTiles', allRiverTiles.length)
	return allRiverTiles
}

module.exports = Eroder

},{"../MathEx":1}],8:[function(require,module,exports){
var ChunkMap = require('../map/ChunkMap')

function SlopeMap(dim, map) {
	this.chunkMap = new ChunkMap()
	this.dim = dim
	for (var i = 0; i < dim; i++) {
		for (var j = 0; j < dim; j++) {

			var sx = map.getTile(i<dim-1 ? i+1 : i, j).value 
				- map.getTile(i-1>=0 ? i-1 : i, j).value

			var sy = map.getTile(i, j<dim-1 ? j+1 : j).value 
				- map.getTile(i, j-1 >=0 ? j-1 : j).value

			this.chunkMap.setTile(i,j, { x: sx, y: sy })
		}
	}
}

SlopeMap.prototype.setTile = function(x, y, object) {
	this.chunkMap.setTile(x, y, object)
}

SlopeMap.prototype.getTile = function(x, y) {
	return this.chunkMap.getTile(x, y)
}

SlopeMap.prototype.boundsCheck = function(x, y) {
	return (x >= 0 && x < this.dim && y >= 0 && y < this.dim)
}

SlopeMap.prototype.recalculate = function(x,y, map) {
	var i = x
	var j = y
	if (!this.boundsCheck(x,y))
		return

	if (!this.boundsCheck(x+1,y))
		return

	if (!this.boundsCheck(x,y+1))
		return

	if (!this.boundsCheck(x-1,y))
		return

	if (!this.boundsCheck(x,y-1))
		return

	var sx = map.getTile(i<this.dim-1 ? i+1 : i, j).value 
		- map.getTile(i-1>=0 ? i-1 : i, j).value
	var sy = map.getTile(i, j<this.dim-1 ? j+1 : j).value 
		- map.getTile(i, j-1 >=0 ? j-1 : j).value

	this.chunkMap.setTile(i,j, { x: sx, y: sy })
}

SlopeMap.prototype.recalculateAll = function(map) {
	for (var i = 0; i < this.dim; i++) {
		for (var j = 0; j < this.dim; j++) {	
			this.recalculate(i,j, map)
		}
	}
}

module.exports = SlopeMap


},{"../map/ChunkMap":26}],9:[function(require,module,exports){
(function (root, factory) {
    'use strict';

    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.MersenneTwister = factory();
    }
}(this, function () {
    /**
     * A standalone, pure JavaScript implementation of the Mersenne Twister pseudo random number generator. Compatible
     * with Node.js, requirejs and browser environments. Packages are available for npm, Jam and Bower.
     *
     * @module MersenneTwister
     * @author Raphael Pigulla <pigulla@four66.com>
     * @license See the attached LICENSE file.
     * @version 0.1.1
     */

    /*
     * Most comments were stripped from the source. If needed you can still find them in the original C code:
     * http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/CODES/mt19937ar.c
     *
     * The original port to JavaScript, on which this file is based, was done by Sean McCullough. It can be found at:
     * https://gist.github.com/banksean/300494
     */
    'use strict';

    var MAX_INT = 4294967296.0,
        N = 624,
        M = 397,
        UPPER_MASK = 0x80000000,
        LOWER_MASK = 0x7fffffff,
        MATRIX_A = 0x9908b0df;

    /**
     * Instantiates a new Mersenne Twister.
     *
     * @constructor
     * @alias module:MersenneTwister
     * @since 0.1.0
     * @param {number=} seed The initial seed value.
     */
    var MersenneTwister = function (seed) {
        if (typeof seed === 'undefined') {
            seed = new Date().getTime();
        }

        this.mt = new Array(N);
        this.mti = N + 1;

        this.seed(seed);
    };

    /**
     * Initializes the state vector by using one unsigned 32-bit integer "seed", which may be zero.
     *
     * @since 0.1.0
     * @param {number} seed The seed value.
     */
    MersenneTwister.prototype.seed = function (seed) {
        var s;

        this.mt[0] = seed >>> 0;

        for (this.mti = 1; this.mti < N; this.mti++) {
            s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] =
                (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
            this.mt[this.mti] >>>= 0;
        }
    };

    /**
     * Initializes the state vector by using an array key[] of unsigned 32-bit integers of the specified length. If
     * length is smaller than 624, then each array of 32-bit integers gives distinct initial state vector. This is
     * useful if you want a larger seed space than 32-bit word.
     *
     * @since 0.1.0
     * @param {array} vector The seed vector.
     */
    MersenneTwister.prototype.seedArray = function (vector) {
        var i = 1,
            j = 0,
            k = N > vector.length ? N : vector.length,
            s;

        this.seed(19650218);

        for (; k > 0; k--) {
            s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);

            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) +
                vector[j] + j;
            this.mt[i] >>>= 0;
            i++;
            j++;
            if (i >= N) {
                this.mt[0] = this.mt[N - 1];
                i = 1;
            }
            if (j >= vector.length) {
                j = 0;
            }
        }

        for (k = N - 1; k; k--) {
            s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] =
                (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i;
            this.mt[i] >>>= 0;
            i++;
            if (i >= N) {
                this.mt[0] = this.mt[N - 1];
                i = 1;
            }
        }

        this.mt[0] = 0x80000000;
    };

    /**
     * Generates a random unsigned 32-bit integer.
     *
     * @since 0.1.0
     * @returns {number}
     */
    MersenneTwister.prototype.int = function () {
        var y,
            kk,
            mag01 = new Array(0, MATRIX_A);

        if (this.mti >= N) {
            if (this.mti === N + 1) {
                this.seed(5489);
            }

            for (kk = 0; kk < N - M; kk++) {
                y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
                this.mt[kk] = this.mt[kk + M] ^ (y >>> 1) ^ mag01[y & 1];
            }

            for (; kk < N - 1; kk++) {
                y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
                this.mt[kk] = this.mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 1];
            }

            y = (this.mt[N - 1] & UPPER_MASK) | (this.mt[0] & LOWER_MASK);
            this.mt[N - 1] = this.mt[M - 1] ^ (y >>> 1) ^ mag01[y & 1];
            this.mti = 0;
        }

        y = this.mt[this.mti++];

        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);

        return y >>> 0;
    };

    /**
     * Generates a random unsigned 31-bit integer.
     *
     * @since 0.1.0
     * @returns {number}
     */
    MersenneTwister.prototype.int31 = function () {
        return this.int() >>> 1;
    };

    /**
     * Generates a random real in the interval [0;1] with 32-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    MersenneTwister.prototype.real = function () {
        return this.int() * (1.0 / (MAX_INT - 1));
    };

    /**
     * Generates a random real in the interval ]0;1[ with 32-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    MersenneTwister.prototype.realx = function () {
        return (this.int() + 0.5) * (1.0 / MAX_INT);
    };

    /**
     * Generates a random real in the interval [0;1[ with 32-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    MersenneTwister.prototype.rnd = function () {
        return this.int() * (1.0 / MAX_INT);
    };

    /**
     * Generates a random real in the interval [0;1[ with 32-bit resolution.
     * 
     * Same as .rnd() method - for consistency with Math.random() interface.
     *
     * @since 0.2.0
     * @returns {number}
     */
    MersenneTwister.prototype.random = MersenneTwister.prototype.rnd;

    /**
     * Generates a random real in the interval [0;1[ with 53-bit resolution.
     *
     * @since 0.1.0
     * @returns {number}
     */
    MersenneTwister.prototype.rndHiRes = function () {
        var a = this.int() >>> 5,
            b = this.int() >>> 6;

        return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
    };

    var instance = new MersenneTwister();

    /**
     * A static version of [rnd]{@link module:MersenneTwister#rnd} on a randomly seeded instance.
     *
     * @static
     * @function random
     * @memberof module:MersenneTwister
     * @returns {number}
     */
    MersenneTwister.random = function () {
        return instance.rnd();
    };

    return MersenneTwister;
}));
},{}],10:[function(require,module,exports){
/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 *
 * Copyright (C) 2012 Jonas Wagner
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
(function () {

var F2 = 0.5 * (Math.sqrt(3.0) - 1.0),
    G2 = (3.0 - Math.sqrt(3.0)) / 6.0,
    F3 = 1.0 / 3.0,
    G3 = 1.0 / 6.0,
    F4 = (Math.sqrt(5.0) - 1.0) / 4.0,
    G4 = (5.0 - Math.sqrt(5.0)) / 20.0;


function SimplexNoise(random) {
    if (!random) random = Math.random;
    this.p = new Uint8Array(256);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 256; i++) {
        this.p[i] = random() * 256;
    }
    for (i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
    }

}
SimplexNoise.prototype = {
    grad3: new Float32Array([1, 1, 0,
                            - 1, 1, 0,
                            1, - 1, 0,

                            - 1, - 1, 0,
                            1, 0, 1,
                            - 1, 0, 1,

                            1, 0, - 1,
                            - 1, 0, - 1,
                            0, 1, 1,

                            0, - 1, 1,
                            0, 1, - 1,
                            0, - 1, - 1]),
    grad4: new Float32Array([0, 1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1,
                            0, - 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1,
                            1, 0, 1, 1, 1, 0, 1, - 1, 1, 0, - 1, 1, 1, 0, - 1, - 1,
                            - 1, 0, 1, 1, - 1, 0, 1, - 1, - 1, 0, - 1, 1, - 1, 0, - 1, - 1,
                            1, 1, 0, 1, 1, 1, 0, - 1, 1, - 1, 0, 1, 1, - 1, 0, - 1,
                            - 1, 1, 0, 1, - 1, 1, 0, - 1, - 1, - 1, 0, 1, - 1, - 1, 0, - 1,
                            1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1, 0,
                            - 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1, 0]),
    noise2D: function (xin, yin) {
        var permMod12 = this.permMod12,
            perm = this.perm,
            grad3 = this.grad3;
        var n0=0, n1=0, n2=0; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin) * F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var X0 = i - t; // Unskew the cell origin back to (x,y) space
        var Y0 = j - t;
        var x0 = xin - X0; // The x,y distances from the cell origin
        var y0 = yin - Y0;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        else {
            i1 = 0;
            j1 = 1;
        } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        var ii = i & 255;
        var jj = j & 255;
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            var gi0 = permMod12[ii + perm[jj]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    },
    // 3D simplex noise
    noise3D: function (xin, yin, zin) {
        var permMod12 = this.permMod12,
            perm = this.perm,
            grad3 = this.grad3;
        var n0, n1, n2, n3; // Noise contributions from the four corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);
        var t = (i + j + k) * G3;
        var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
        var Y0 = j - t;
        var Z0 = k - t;
        var x0 = xin - X0; // The x,y,z distances from the cell origin
        var y0 = yin - Y0;
        var z0 = zin - Z0;
        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // X Y Z order
            else if (x0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // X Z Y order
            else {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // Z X Y order
        }
        else { // x0<y0
            if (y0 < z0) {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Z Y X order
            else if (x0 < z0) {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Y Z X order
            else {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // Y X Z order
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
        var y2 = y0 - j2 + 2.0 * G3;
        var z2 = z0 - k2 + 2.0 * G3;
        var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
        var y3 = y0 - 1.0 + 3.0 * G3;
        var z3 = z0 - 1.0 + 3.0 * G3;
        // Work out the hashed gradient indices of the four simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) n0 = 0.0;
        else {
            var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) n1 = 0.0;
        else {
            var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) n2 = 0.0;
        else {
            var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) n3 = 0.0;
        else {
            var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
            t3 *= t3;
            n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 32.0 * (n0 + n1 + n2 + n3);
    },
    // 4D simplex noise, better simplex rank ordering method 2012-03-09
    noise4D: function (x, y, z, w) {
        var permMod12 = this.permMod12,
            perm = this.perm,
            grad4 = this.grad4;

        var n0, n1, n2, n3, n4; // Noise contributions from the five corners
        // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
        var s = (x + y + z + w) * F4; // Factor for 4D skewing
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var k = Math.floor(z + s);
        var l = Math.floor(w + s);
        var t = (i + j + k + l) * G4; // Factor for 4D unskewing
        var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
        var Y0 = j - t;
        var Z0 = k - t;
        var W0 = l - t;
        var x0 = x - X0; // The x,y,z,w distances from the cell origin
        var y0 = y - Y0;
        var z0 = z - Z0;
        var w0 = w - W0;
        // For the 4D case, the simplex is a 4D shape I won't even try to describe.
        // To find out which of the 24 possible simplices we're in, we need to
        // determine the magnitude ordering of x0, y0, z0 and w0.
        // Six pair-wise comparisons are performed between each possible pair
        // of the four coordinates, and the results are used to rank the numbers.
        var rankx = 0;
        var ranky = 0;
        var rankz = 0;
        var rankw = 0;
        if (x0 > y0) rankx++;
        else ranky++;
        if (x0 > z0) rankx++;
        else rankz++;
        if (x0 > w0) rankx++;
        else rankw++;
        if (y0 > z0) ranky++;
        else rankz++;
        if (y0 > w0) ranky++;
        else rankw++;
        if (z0 > w0) rankz++;
        else rankw++;
        var i1, j1, k1, l1; // The integer offsets for the second simplex corner
        var i2, j2, k2, l2; // The integer offsets for the third simplex corner
        var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
        // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
        // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
        // impossible. Only the 24 indices which have non-zero entries make any sense.
        // We use a thresholding to set the coordinates in turn from the largest magnitude.
        // Rank 3 denotes the largest coordinate.
        i1 = rankx >= 3 ? 1 : 0;
        j1 = ranky >= 3 ? 1 : 0;
        k1 = rankz >= 3 ? 1 : 0;
        l1 = rankw >= 3 ? 1 : 0;
        // Rank 2 denotes the second largest coordinate.
        i2 = rankx >= 2 ? 1 : 0;
        j2 = ranky >= 2 ? 1 : 0;
        k2 = rankz >= 2 ? 1 : 0;
        l2 = rankw >= 2 ? 1 : 0;
        // Rank 1 denotes the second smallest coordinate.
        i3 = rankx >= 1 ? 1 : 0;
        j3 = ranky >= 1 ? 1 : 0;
        k3 = rankz >= 1 ? 1 : 0;
        l3 = rankw >= 1 ? 1 : 0;
        // The fifth corner has all coordinate offsets = 1, so no need to compute that.
        var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
        var y1 = y0 - j1 + G4;
        var z1 = z0 - k1 + G4;
        var w1 = w0 - l1 + G4;
        var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
        var y2 = y0 - j2 + 2.0 * G4;
        var z2 = z0 - k2 + 2.0 * G4;
        var w2 = w0 - l2 + 2.0 * G4;
        var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
        var y3 = y0 - j3 + 3.0 * G4;
        var z3 = z0 - k3 + 3.0 * G4;
        var w3 = w0 - l3 + 3.0 * G4;
        var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
        var y4 = y0 - 1.0 + 4.0 * G4;
        var z4 = z0 - 1.0 + 4.0 * G4;
        var w4 = w0 - 1.0 + 4.0 * G4;
        // Work out the hashed gradient indices of the five simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var ll = l & 255;
        // Calculate the contribution from the five corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        if (t0 < 0) n0 = 0.0;
        else {
            var gi0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4;
            t0 *= t0;
            n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        if (t1 < 0) n1 = 0.0;
        else {
            var gi1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4;
            t1 *= t1;
            n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        if (t2 < 0) n2 = 0.0;
        else {
            var gi2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4;
            t2 *= t2;
            n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        if (t3 < 0) n3 = 0.0;
        else {
            var gi3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4;
            t3 *= t3;
            n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
        }
        var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        if (t4 < 0) n4 = 0.0;
        else {
            var gi4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4;
            t4 *= t4;
            n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
        }
        // Sum up and scale the result to cover the range [-1,1]
        return 27.0 * (n0 + n1 + n2 + n3 + n4);
    }


};

// amd
if (typeof define !== 'undefined' && define.amd) define(function(){return SimplexNoise;});
//common js
if (typeof exports !== 'undefined') exports.SimplexNoise = SimplexNoise;
// browser
else if (typeof navigator !== 'undefined') this.SimplexNoise = SimplexNoise;
// nodejs
if (typeof module !== 'undefined') {
    module.exports = SimplexNoise;
}

})();
},{}],11:[function(require,module,exports){
/**
* Generator, wraps the generator functions
* usage: Generator.radialGradient(etc)
*/
module.exports.clouds = require('./clouds')
module.exports.radialGradient = require('./radialGradient')
module.exports.verticalGradient = require('./verticalGradient')
},{"./clouds":12,"./radialGradient":13,"./verticalGradient":14}],12:[function(require,module,exports){
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


},{"../map/ChunkMap":26}],13:[function(require,module,exports){
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


},{"../MathEx":1,"../map/ChunkMap":26}],14:[function(require,module,exports){
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


},{"../MathEx":1,"../map/ChunkMap":26}],15:[function(require,module,exports){

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


},{}],16:[function(require,module,exports){
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
},{"../MathEx":1,"./ColorHelper":15}],17:[function(require,module,exports){
module.exports = {	
	//'ocean': 'black',

	// ocean biomes
	'tropical-ocean': '#67C9C8',
	'temperate-ocean': '#67A2C9',
	'arctic-ocean': '#3859B5',	
	

	// glaciery
	'glacier': 'white',
	'snow': '#EEE',


	// chilly biomes
	'cold-desert': '#CCE6DC', 		// very pale grey blue green
	'tundra': '#B3BDA2', 			// grey green
	'taiga-frontier': '#7D8A60', 	// sage green
	'taiga': '#466B33', 			// army green
	'taiga-rainforest': '#26570D', 	// dark green


	// temperate biomes
	'temperate-desert': '#EAF2B3',
	'temperate-grassland': '#BBD47D',
	'temperate-frontier': '#A5BF63',
	'temperate-forest': '#83A137',
	'temperate-rainforest': '#728A36',


	// hot biomes
	'hot-desert': '#E8DE99', 		// sandy
	'hot-savanna': '#D2DBA4', 		// light yellow green
	'tropical-frontier': '#B6DB74', // more green than prev
	'tropical-forest': '#8CC94F',
	'tropical-rainforest': '#84D631',


	// used as a filler, nice and bright so i can see anything i missed
	'void': '#FF69B4' // hot pink
}
},{}],18:[function(require,module,exports){
module.exports = {
	'vegetation': '#46902F', // mediumy gree
	'tree': '#2A5E2E', // darker green than above
	'rock': '#666', // moderately dark grey
}
},{}],19:[function(require,module,exports){
/**
* Gradients, wraps and initializes all of the gradients
* usage: Gradients.grayscale.colorRGBA(n)
* usage: Gradients.oahu.colorRGBA(n) etc
*/
var Gradient1D = require('../Gradient1D')
var ColorHelper = require('../ColorHelper')

var oahuColors = require('./oahuColors')
var grayscaleColors = require('./grayscaleColors')
var precipitationColors = require('./precipitationColors')
var temperatureColors = require('./temperatureColors')

module.exports.oahu = new Gradient1D(oahuColors)
module.exports.grayscale = new Gradient1D(grayscaleColors)
module.exports.precipitation = new Gradient1D(precipitationColors)
module.exports.temperature = new Gradient1D(temperatureColors)
},{"../ColorHelper":15,"../Gradient1D":16,"./grayscaleColors":20,"./oahuColors":21,"./precipitationColors":22,"./temperatureColors":23}],20:[function(require,module,exports){

/**
* A grayscale gradient, really its jsut white and black, and the gradient code
* will handle blending all of the greys inbetween
*/
module.exports = {
	'1.0': '#FFFFFF',
	'-1.0': '#000000'
}
},{}],21:[function(require,module,exports){

/**
* A multicolor gradient themed after Hanauma Bay and other aerial photos of Oahu
* Transitions from dark blue in the ocean (-1.0) to bright tropical water colors
* followed by sand, and then green/browns further inland
*/
module.exports = {
	'1.0': '#3D4629',
	'0.6': '#76854E',
	'0.38': '#99924E',
	'0.18': '#A1A44D',
	'0.09': '#C5C06F',
	'0.06': '#E1D184',
	'0.02': '#F8EECA',
	'0.00': '#DBBB82',
	'-0.02': '#0AC2B8',
	'-0.04': '#088297',
	'-0.08': '#005B82',
	'-0.3': '#002764',
	'-0.5': '#07103B',
	'-0.7': '#07103B',
	'-1.0': '#0B0A2A'
}
},{}],22:[function(require,module,exports){

/**
* A multicolor gradient themed after a precipitation map of Texas
* Transitions from pink @ 1.0 through blues, greens, yellows, oranges and to red
* ugly n bright
*/
module.exports = {
	'1.00000': '#FF00FF', // pink
	'0.83333': '#9900CC', // purple
	'0.66666': '#009999', // solid teal
	'0.50000': '#00CCCC', // lighter teal
	'0.33333': '#00FFFF', // bright teal
	'0.16666': '#009900', // green
	'0.00000': '#00CC00', // brighter greens
	'-0.1666': '#00FF00', // sonic green
	'-0.3333': '#FFFF00', // bright yellow
	'-0.4999': '#FFCC00', // yellow-orange
	'-0.6666': '#FF9811', // orange-yellow
	'-0.8333': '#FF5A00', // orange
	'-1.0000': '#FF0000'  // red
}
},{}],23:[function(require,module,exports){

/**
* A multicolor gradient ## Just the opposite of the precipitation colors
* Transitions from pink @ -1.0 through blues, greens, yellows, oranges and to red
* ugly n bright
*/
module.exports = {
	'-1.0000': '#FF00FF', // pink
	'-0.8333': '#9900CC', // purple
	'-0.6666': '#009999', // solid teal
	'-0.5000': '#00CCCC', // lighter teal
	'-0.3333': '#00FFFF', // bright teal
	'-0.1666': '#009900', // green
	'0.0000': '#00CC00', // brighter greens
	'0.1666': '#00FF00', // sonic green
	'0.3333': '#FFFF00', // bright yellow
	'0.4999': '#FFCC00', // yellow-orange
	'0.6666': '#FF9811', // orange-yellow
	'0.8333': '#FF5A00', // orange
	'1.0000': '#FF0000'  // red
}
},{}],24:[function(require,module,exports){

var SimplexNoise = require('./external/simplex-noise')
var MersenneTwister = require('./external/MersenneTwister')
var MathEx = require('./MathEx')
var ChunkMap = require('./map/ChunkMap')
var Generator = require('./generators/Generator')
var Compositor = require('./compositors/Compositor')
var Gradients = require('./graphics/gradients/Gradients')
var biomeColors = require('./graphics/flats/biomeColors')
var floraColors = require('./graphics/flats/floraColors')
var SlopeMap = require('./effects/SlopeMap')
var Eroder = require('./effects/Eroder')
var MapRenderer = require('./renderers/MapRenderer')
var BiomeMap = require('./classifiers/BiomeMap')
var FloraMap = require('./classifiers/FloraMap')

// Create a few instaces of the PRNGs with different seeds to use later
// type in any number you want ! Or if you want different results every time
// call new MersenneTwister() without any seed (it'll use the cpu clock)
var seed1 = 123456789
var mersenneTwister1 = new MersenneTwister(seed1)
var simplex1 = new SimplexNoise(function() { return mersenneTwister1.random() })

var seed2 = 123
var mersenneTwister2 = new MersenneTwister(seed2)
var simplex2 = new SimplexNoise(function() { return mersenneTwister2.random() })

var seed3 = 456
var mersenneTwister3 = new MersenneTwister(seed3)
var simplex3 = new SimplexNoise(function() { return mersenneTwister3.random() })
/* NOTE: the only time it matters which of the above simplexes is used, is if
*   multiple maps get combined together all of which use the exact same simplex.
*   Because these are seeded (aka produce the same results every time) adding 
*   two maps made from the same simplex will mean that the peaks and valleys in 
*	each map are in the same spot!*/

// tileWidth in units of pixels. Only affects rendering
var tileWidth = 1
// square dimension of the map in units of tiles
var dim = 600

// a random function, uses mersenneTwister1 which uses a SEED
//TODO: add this to the MathEx
function getRandomInt(min, max) {
    return Math.floor(mersenneTwister1.random() * (max - min + 1)) + min
}

// the position of the volcano, right in the center of a 600x600 map
var volcano = { x: 300, y: 300 }

/* HeightMap for the volcano!
* 1) radial gradient
* 2) organic noise to represent bumps in the land
* 3) combine 'em, weighed slightly more towards the gradient */
// make a radial gradient
var radialMap = Generator.radialGradient(
	dim, // map size
	volcano.x, // center of the gradient x
	volcano.y, // center of the gradient y
	440, // radius of the gradient, 440 was enough to reach past the edges
	-1.0, // start at -1.0 (min height, ocean floor)
	1.0 // end at 1.0 (max height, tallest mountain)
)
// make some organic noise
var organicNoise1 = Generator.clouds(simplex1, dim)
// combine the gradient and organic noise! Volcano height map DONE
var volcanicMap = Compositor.weightedMean(dim, radialMap, organicNoise1, 1.33)



/* Precipitation!
* 1) organic noise to represent rain
* 2) rain shadow
*   a) choose a wind direction
*   b) make one radial gradient centered on the volcano
*   c) make another radial gradient offset from the volcano by the wind
*   d) subtract the two gradients from one another
* 3) mix the rain shadow and the organic noise */

// organic noise
var organicNoise2 = Generator.clouds(simplex3, dim)
// random wind direction
var windVector = {
	x: getRandomInt(-50, 50),
	y: getRandomInt(-50, 50)
}
// radial gradient centered on the volcano
var radialMap1 = Generator.radialGradient(
	dim, 
	volcano.x, 
	volcano.y, 
	200, // radius
	0.0, // gradient begins at 0 (sealevel) so that it has no negative values
	1.0 // gradient ends at 1.0 (max elevation)
)
// another radial gradient, offset by the wind
var radialMap2 = Generator.radialGradient(
	dim, 
	300 + windVector.x,
	300 + windVector.y, 
	200, 0.0, 1.0
)
// the rain shadow, created by subtracting the two radial gradients
var rainShadow = Compositor.subtract(dim, radialMap1, radialMap2)
// mixing in organic noise to the rainshadow, weighed more to the noise DONE
var precipitationMap = Compositor.weightedMean(
	dim, 
	rainShadow, 
	organicNoise2, 
	2.5 // weighed quite a bit in favor of the noise, b/c the rainShadow is 
		//	so harsh on its own
)


/* Temperature!
* 1) linear gradient from north to south
* 2) organic noise
* 3) mix the organic noise and the linear gradient, weighed towards the noise
* 4) compare to the volcano heightMap, lowering temperature at higher elevation*/

// linear gradient, represents north-south temperature
var northSouthGradient = Generator.verticalGradient(dim, 0, dim, -1.0, 1.0)
// some more organic noise
var organicNoise3 = Generator.clouds(simplex3, dim)
// mix (average) the linear gradient and the organic noise
var rawTemperatureMap = Compositor.weightedMean(
	dim, 
	northSouthGradient, 
	organicNoise3, 
	1.5 // weighed 1.5x in favor of the gradient
)

// compare to volcano's heightmap, lower temperature at higher elevation
var temperatureMap = new ChunkMap()
for (var i = 0; i < dim; i++) {
	for (var j = 0; j < dim; j++) {
		var t = rawTemperatureMap.getTile(i,j).value // temperature
		var h = volcanicMap.getTile(i,j).value // elevation aka height

		var value = t

		if (h > 0.0) {
			// if above sealevel, subtract temperature based on elevation
			// 0.16 is just an offset which makes things even colder at a high
			// elevation, but a little warmer in the lowlands
			value -= (h-0.16) * 1.0
		}
		temperatureMap.setTile(i, j, { value: value })
	}
}

/* Erosion!
* 	A totally option extra effect. The erosion is just applied to the volcano's
*	heightMap */
// slow performance 5-10 seconds to run, also enables rivers, 
//  comment this out if doing lots of trial and error
var slopeMap = new SlopeMap(dim, volcanicMap)
var eroder = new Eroder(slopeMap, volcanicMap, getRandomInt)
//var riverTiles = eroder.applyErosion() // uncomment this to enable erosion 


/* Biomes!
* 	Create by via combination of elevation, temperature, and rain. 
*	See BiomeMap source code */
var biomeMap = new BiomeMap(dim, volcanicMap, temperatureMap, precipitationMap)

/* Flora and rocks!
* 	Also created by via combination of elevation, temperature, and rain. Well,
*	not so much temperature, but its in here for future options.
*	See FloraMap source code */
var floraMap = new FloraMap(
	dim, 
	volcanicMap, 
	temperatureMap, 
	precipitationMap, 
	getRandomInt // hackish, passing in the seeded ranomizer created earlier
)


/* Rendering/Drawing */
var canvas, context
window.onload = function() {
	console.log('HTML Loaded')

	canvas = document.getElementById('canvas')
	context = canvas.getContext('2d')

	// canvas (and thus right-clickable "save as..." images) that are the exact
	//  size of the map
	canvas.height = dim * tileWidth
	canvas.width = dim * tileWidth

	// canvas big as the browser window, good for giant stuff. Renable 
	//  scrollbars in index.html if you want them! (remove overflow:hidden)
	//canvas.height = window.innerHeight
	//canvas.width = window.innerWidth

	var renderer = new MapRenderer(tileWidth, dim, dim, context)	


	// Renders tropical island, flora (subtle), and biomes (very subtle)
	// This is as seen on the tumblr post with 5 islands: 
	// http://timetocode.tumblr.com/post/93759757461/the-generator-is-done-for-now-any-impetus-for
	renderer.renderGradientMap(volcanicMap, Gradients.oahu)
	if (typeof riverTiles !== 'undefined') renderer.drawRiverTiles(riverTiles)
	renderer.renderFlatMap(floraMap, 'flora', floraColors, 0.5)
	renderer.renderFlatMap(biomeMap, 'biome', biomeColors, 0.2)

	// To see the individual stages of generating a map, comment the above 4 
	// 	lines, uncomment any of these, and reload index.html:


	// volcano creation, step by step

	// initial radial gradient, which forms the cone of the mountain:
	//renderer.renderGradientMap(radialMap, Gradients.grayscale)

	// organic noise
	//renderer.renderGradientMap(organicNoise1, Gradients.grayscale)

	// combining organic noise and gradient shape
	//renderer.renderGradientMap(volcanicMap, Gradients.grayscale)

	// same as above, but with sexy colors
	//renderer.renderGradientMap(volcanicMap, Gradients.oahu)


	// rain creation, step by step

	// first radial gradient
	//renderer.renderGradientMap(radialMap1, Gradients.grayscale)

	// second radial gradient
	//renderer.renderGradientMap(radialMap2, Gradients.grayscale)

	// the two radial gradients subtracted form the rainshadow
	//renderer.renderGradientMap(rainShadow, Gradients.grayscale)

	// more organic noise
	//renderer.renderGradientMap(organicNoise2, Gradients.grayscale)

	// combine rainshadow with organic noise
	//renderer.renderGradientMap(precipitationMap, Gradients.grayscale)

	// colored ! blue = very wet, yellowish = dry
	//renderer.renderGradientMap(precipitationMap, Gradients.precipitation)


	// temperature creation, step by step

	// a simple linear gradient
	//renderer.renderGradientMap(northSouthGradient, Gradients.grayscale)

	// more organic noise
	//renderer.renderGradientMap(organicNoise3, Gradients.grayscale)

	// linear gradient mixed with noise (pretty, imo)
	//renderer.renderGradientMap(rawTemperatureMap, Gradients.grayscale)

	// now chilled at the high points from the volcano
	//renderer.renderGradientMap(temperatureMap, Gradients.grayscale)

	// same thing, but colored like a weather map
	//renderer.renderGradientMap(temperatureMap, Gradients.temperature)
	
	
	// biome map
	//renderer.renderFlatMap(biomeMap, 'biome', biomeColors)

	// flora / rocks / resource map
	//renderer.renderFlatMap(floraMap, 'flora', floraColors)

	console.log('All operations complete')	
}

},{"./MathEx":1,"./classifiers/BiomeMap":2,"./classifiers/FloraMap":3,"./compositors/Compositor":4,"./effects/Eroder":7,"./effects/SlopeMap":8,"./external/MersenneTwister":9,"./external/simplex-noise":10,"./generators/Generator":11,"./graphics/flats/biomeColors":17,"./graphics/flats/floraColors":18,"./graphics/gradients/Gradients":19,"./map/ChunkMap":26,"./renderers/MapRenderer":27}],25:[function(require,module,exports){
/**
* Chunk is a data structure that holds tile data for a Map
* @class Chunk
* @constructor
*/
function Chunk() {
  this.x = null
  this.y = null
  this.tiles = null
}

/**
* Creates an empty chunk, where each tile is { }
* @method newEmpty
* @static
*/
Chunk.newEmpty = function() {
  var chunk = new Chunk() 
  chunk.tiles = new Array(Chunk.dim * Chunk.dim)
  for (var i = 0; i < chunk.tiles.length; i++) {
    chunk.tiles[i] = { }
  }
  return chunk
}

/**
* Creates a chunk, where each tile is self labeled with x, y
* @method newTest
* @static
*/
Chunk.newTest = function() {
  var chunk = new Chunk()
  chunk.tiles = new Array(Chunk.dim * Chunk.dim)
  for (var i = 0; i < Chunk.dim; i++) {
    for (var j = 0; j < Chunk.dim; j++) {
      // are i & j correct? or inverted?
      chunk.tiles[Chunk.index(i, j)] = { x: i, y: j }
    }
  }
  return chunk
}

/** 
* Converts 2D coords to 1D index
* @method index
* @static
* @param {Integer} x The x coordinate in the context of this chunk
* @param {Integer} y The y coordinate in the context of this chunk
* @return {Integer} Returns index
*/
Chunk.index = function(x, y) {
  return (y * Chunk.dim) + x
}

/** 
* Converts 1D index to 2D coords
* @method index
* @static
* @param {Integer} index
* @return {Object} Returns object containing x, y
*/
Chunk.xy = function(index) {
  return { x: Math.floor(index / Chunk.dim), y: index % Chunk.dim }
}

/** 
* Gets a tile
* @method getTile
* @param {Integer} x The x coordinate in the context of this chunk
* @param {Integer} y The y coordinate in the context of this chunk
* @return {Object} Returns tile
*/
Chunk.prototype.getTile = function(x, y) {
  return this.tiles[Chunk.index(x, y)]
}

/** 
* Sets a tile
* @method setTile
* @param {Integer} x The x coordinate in the context of this chunk
* @param {Integer} y The y coordinate in the context of this chunk
*/
Chunk.prototype.setTile = function(x, y, value) {
  this.tiles[Chunk.index(x, y)] = value
}

/**
* The square dimensions of a chunk
* @property dim
* @type Integer
* @static
*/
Chunk.dim = 32


module.exports = Chunk

},{}],26:[function(require,module,exports){
var Chunk = require('./Chunk')
/**
* Map describes a physical world
* provides interaction with ground, surface, and (later) air blocks
* answers questions about mobility at any given position ##NOT THIS VERSION
* abstracts underlying Chunk implementation away
* Underlying Chunks are stored as a dictionary by key chunkX, chunkY, see: Chunk
*/
function ChunkMap() {
  // an object (not an array) keyed to strings of  "chunkX,chunkY"
  // allows for a sparse map
  this.chunks = {}
}

ChunkMap.prototype.addChunk = function(chunk) {
  this.chunks[Map.keyify(chunk)] = chunk
}

ChunkMap.prototype.getTile = function(x, y) {
  var pos = convertToFullCoords(x, y)
  var key = keyify(pos.cx, pos.cy)
  if (!(key in this.chunks)) {
    this.chunks[key] = Chunk.newEmpty()
  }
  return this.chunks[keyify(pos.cx, pos.cy)].getTile(pos.tx, pos.ty)
}

ChunkMap.prototype.setTile = function(x, y, value) {
  var pos = convertToFullCoords(x, y)
  var key = keyify(pos.cx, pos.cy)
  if (!(key in this.chunks)) {
    this.chunks[key] = Chunk.newEmpty()
  }
  this.chunks[keyify(pos.cx, pos.cy)].setTile(pos.tx, pos.ty, value)
}

/**
* Converts a world x,y to a chunk (cx, cy) and corresponding tile (tx, ty) coordinate
* @method converToFullCoords
* @param {Integer} cx The x coordinate of a chunk
* @param {Integer} cy The y coordinate of a chunk
* @return {Object} Returns object with chunk (cx, cy) and tile (tx, ty) coordinates
*/
var convertToFullCoords = function(x, y) {
  return {
    // calculate chunk coordinates 
    cx: Math.floor(x / Chunk.dim),
    cy: Math.floor(y / Chunk.dim),

    // calculate tile coordinates (within the chunk)
    tx: (x >= 0) ? x % Chunk.dim : Chunk.dim + x % Chunk.dim,
    ty: (y >= 0) ? y % Chunk.dim : Chunk.dim + y % Chunk.dim
  }
}

/** 
* Creates a uniqe key for a chunk, so that it may be stored as a key value pair
* @method keyify
* @param {Integer} cx The x coordinate of a chunk
* @param {Integer} cy The y coordinate of a chunk
* @return {String} Returns a string key
*/
var keyify = function(cx, cy) {
  return cx + ',' + cy
}

/** 
* Converts a chunk key string into chunk coordinates (not tile coordinates)
* @method parseKey
* @param {String} chunkKey A chunkKey to convert
* @return {Object} Returns the x, y coordinates of the chunk
*/
var parseKey = function(chunkKey) {
  var parts = chunkKey.split(',')
  return { x: parts[0], y : parts[1] }
}

module.exports = ChunkMap
},{"./Chunk":25}],27:[function(require,module,exports){
/**
* A renderer for rectangular ChunkMaps
* @class MapRenderer
* @constructor
* @param {ChunkMap} map The map to render
* @param {Gradient1D} theme The color gradient to use
* @param {Context} context An HTML5 canvas's 2d context 
*/
function MapRenderer(tileWidth, mapWidth, mapHeight, context) {
	this.tileWidth = tileWidth
	this.mapWidth = mapWidth
	this.mapHeight = mapHeight
	this.context = context
}

/**
* Renders a map using a gradient
* @method renderMap
* @param {ChunkMap} map The map to render
* @param {Gradient1D} theme The color gradient to use
* @param {Number} opacity Optional, opacity from 0.0 to 1.0
*/
MapRenderer.prototype.renderGradientMap = function(map, theme, opacity) {
	opacity = typeof opacity !== 'undefined' ? opacity : 1.0
	var context = this.context
	context.save()
	context.globalAlpha = opacity
	var start = Date.now()
	for (var i = 0; i < this.mapWidth; i++) {
		for (var j = 0; j < this.mapHeight; j++) {
			var tile = map.getTile(i, j)
			if (tile) {		
				context.beginPath()
				context.fillStyle = theme.getRGBA(tile.value)				
				context.rect(i * this.tileWidth, j * this.tileWidth, 
					this.tileWidth, this.tileWidth)
				context.fill()
				context.closePath()
			}
		}
	}
	var stop = Date.now()
	context.restore()
	console.log('map rendered', stop-start, 'ms')
}

/**
* Renders a map with a flat color theme
* @method renderFlatMap
* @param {ChunkMap} map The map to render
* @param {String} propName The name of the property to access 'flora'|'biome'
* @param {Object} colors An object contain propValues and respective colors
* @param {Number} opacity Optional, opacity from 0.0 to 1.0
*/
MapRenderer.prototype.renderFlatMap = function(map, propName, colors, opacity) {
	opacity = typeof opacity !== 'undefined' ? opacity : 1.0
	var context = this.context
	context.save()
	context.globalAlpha = opacity
	var start = Date.now()
	for (var i = 0; i < this.mapWidth; i++) {
		for (var j = 0; j < this.mapHeight; j++) {
			var tile = map.getTile(i, j)
			if (tile) {
				if (tile[propName] === 'nothing') // i.e if tile.flora=='nothing'
					continue // skip this iteration
				context.beginPath()
				context.fillStyle = colors[tile[propName]]				
				context.rect(i * this.tileWidth, j * this.tileWidth, 
					this.tileWidth, this.tileWidth)
				context.fill()
				context.closePath()
			}
		}
	}
	var stop = Date.now()
	context.restore()
	console.log(propName + ' map rendered', stop-start, 'ms')
}

MapRenderer.prototype.drawRiverTiles = function(riverTiles) {
	var context = this.context
	for (var i = 0; i < riverTiles.length; i++) {
		var tile = riverTiles[i]
		context.beginPath()
		context.fillStyle = 'rgba(50,110,255, 0.8)'			
		context.rect(tile.x * this.tileWidth, tile.y * this.tileWidth, 
			this.tileWidth, this.tileWidth)
		context.fill()
		context.closePath()
	}
}



/**
* Draws a vector (really, it just draws a line)
* used for testing slope, though the tileWidth should be 5+ or things are
* 	very hard to see. These vector lines are properly aligned, but do not 
*	clearly indicate which direction they're pointing to/from
* @method drawVector
* @param {Integer} x A tile's x (whose center is then used to start the vector)
* @param {Integer} y A tile's y (whose center is then used to start the vector)
* @param {Vector} vector An object with x, y props representing a vector
*/

MapRenderer.prototype.drawVector = function(x, y, vector) {
	this.context.beginPath() // is this even a path? idk
	this.context.moveTo(x + 0.5 * this.tileWidth, y + 0.5 * this.tileWidth)
	this.context.lineTo(x+vector.x*1000, y+vector.y*1000)
	this.context.strokeStyle = 'rgba(0,0,255,0.25)'
	this.context.lineWidth = 2
	this.context.stroke()
	this.context.closePath() // is this even a path? idk
}

module.exports = MapRenderer
},{}]},{},[24])