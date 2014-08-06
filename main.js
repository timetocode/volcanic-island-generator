
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
