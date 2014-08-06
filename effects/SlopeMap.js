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

