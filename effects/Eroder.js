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
