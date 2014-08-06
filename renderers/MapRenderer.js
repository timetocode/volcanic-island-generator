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