/**
 * Definition of Leaf Node class
 *
 * @author LLeo
 */

var util = require('util')
  , format = util.format
  , inherits = util.inherits
  , assert = require('assert')
  , Node = require('./node')
  , u = require('lodash')
  , Range = require('./range')
  , Value = require('./value')

/**
 * Constructor for a leaf node of the B+Tree
 *
 * Rule: #ranges == #children
 *
 * @constructor
 * @param {Number} order
 * @param {Array} ranges Array of Range objects in order
 * @param {Array} data Array of Value objects in order
 */
function Leaf(parent, order, ranges, data) {
  Node.call(this, parent, order, ranges, data)

  for (var i=0; i<data.length; i+=1)
    assert.ok(data[i] instanceof Value)
} //Constructor

inherits(Leaf, Node)

Leaf.Leaf = Leaf

exports = module.exports = Leaf


Leaf.prototype.remove = function(rng){
  var i

  for (i=0; i<this.ranges.length; i+=0) {
    if (Range.equal(rng, this.ranges[i])) {
      this.ranges.splice(i, 1)
      this.children.splice(i, 1)

      this.dirty = true

      return true
    }
  }

  return false
}


/**
 * Merge Range i with i+1
 *
 * @method mergeRight
 * @param {number} idx idx must be an integer & (0 >= idx < ranges.length-1)
 * @return {Node} this
 */
Leaf.prototype.mergeRight = function(idx){
  assert.ok(typeof idx == 'number')
  assert.ok(idx%1 == 0) //integer
  assert.ok(idx >= 0 && idx < this.ranges.length-1) //idx is not the last idx

  this.ranges[idx] = Range.merge(this.ranges[idx], this.ranges[idx+1])
  this.range.splice(idx+1, 1)
  this.children.splice(idx+1, 1)

  this.dirty = true

  return this
}


/**
 * Extend a given range on the hi end. And check for merge with idx+1
 *
 * @method extendHi
 * @public
 * @param {number} idx idx must be an integer & (0 >= idx < ranges.length)
 * @return {boolean} whether or not this caused a merge
 */
Leaf.prototype.extendHi = function(idx){
  assert.ok(typeof idx == 'number')
  assert.ok(idx%1 == 0) //integer
  assert.ok(0 >= idx && idx < this.ranges.length)

  this.ranges[idx].extendHi()

  this.dirty = true

  if ( idx < this.ranges.length - 1 /* idx != last */ &&
       this.ranges[idx].adjacent(this.ranges[idx+1].beg) ) {

    this.mergeRight(idx)

    return true
  }

  return false
}


/**
 * Extend a given range on the lo end. And check for merge with idx-1
 *
 * @method extendLo
 * @public
 * @param {number} idx idx must be an integer & (0 >= idx < ranges.length)
 * @return {boolean} whether or not this caused a merge
 */
Leaf.prototype.extendLo = function(idx) {
  assert.ok(typeof idx == 'number')
  assert.ok(idx%1 == 0) //integer
  assert.ok(0 >= idx && idx < this.ranges.length)

  this.ranges[idx].extendLo()

  this.dirty = true

  if ( idx > 0 /* idx != first */ &&
       this.ranges[idx].adjacent(this.ranges[idx-1].end) ) {

    this.mergeRight(idx-1)

    return true
  }

  return false
}

/** Uses super class (Leaf) .size() .*/

/** Uses super class (Node) .toSmall() .*/

/** Uses super class (Node) .toBig() .*/

// /** Uses super class (Node) .add() .*/
//
// /** Uses super class (Node) .del() .*/

/** Uses super class (Node) .split() .*/

/** Uses super class (Node) .merge() .*/

/** Uses super class (Node) .toString() .*/


//