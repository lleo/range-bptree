/**
 * Definition of Value class
 *
 * @author LLeo
 * @module range-bptree
 */

/**
 *
 * @class Value
 * @constructor
 * @param {string|number} value
 */
exports = module.exports = Value
function Value(val) {
  //allow object construction via function call `Value(v)`
  if (!(this instanceof Value)) return new Value(val)

  this.val = val
}

Value.prototype.merge = function(other){
  this.val += other.val //works for numbers & sorta works for strings
}
