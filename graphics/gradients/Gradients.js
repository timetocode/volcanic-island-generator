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