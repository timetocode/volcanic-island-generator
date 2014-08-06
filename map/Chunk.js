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
