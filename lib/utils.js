
var assert = require('assert')

var utils = {}

exports = module.exports = utils

utils.isInt = function isInt(x){
  return typeof x == 'number' && x%1 == 0
}

utils.assertIsInt = function assertIsInt(x{
  assert(typeof x == 'number', x+" is not a number")
  assert(x%1 == 0, x+" is not an integer")
}

//