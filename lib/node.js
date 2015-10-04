/**
 * @fileOverview Definition of Inner Node class
 * @author LLeo
 * @version 0.0.0
 */

var assert = require('assert')
  , format = require('util').format
  , Range = require('./range')

/**
 * Constructor for an base class node of B+Tree
 *
 * @class Node
 * @constructor
 * @param {Node} parent
 * @param {Number} order
 * @param {Array} ranges Array of Range objects in order
 * @param {Array} children Array of Node objects in order
 */
function Node(parent, order, ranges, children) {
  assert.ok(ranges instanceof Array)
  assert.ok(children instanceof Array)
  assert.equal(ranges.length, children.length)

  for (var i=0; i<ranges.length; i+=1)
    assert.ok(ranges[i] instanceof Range)

  this.order = order
  this.min = Math.floor(order/2)
  this.max = order

  this.hdl = null
  this.parent = parent

  //ranges are non-intersecting & non-adjacent Ranges
  this.ranges = ranges
  //children are Nodes or boolean true (no-op for leaf)
  this.children = children

  this.dirty = false //bool flag if node has been modified

}

Node.Node = Node

exports = module.exports = Node


/**
 * How wide is this Node with respect to order
 *
 * @method size
 * @public
 * @return {number}
 */
Node.prototype.size = function(){
  return this.ranges.length
}


/**
 * This is to small.
 *
 * @method toSmall
 * @public
 * @return {boolean}
 */
Node.prototype.toSmall = function(){
  assert.ok(!isNaN(this.min))
  return this.size() < this.min
}


/**
 * This is to big.
 *
 * @method toBig
 * @public
 * @return {boolean}
 */
Node.prototype.toBig = function(){
  assert.ok(!isNaN(this.max))
  return this.size() > this.max
}


/**
 * Return a constucted Range that spans all ranges in this Node.
 *
 * @method range
 * @public
 * @return {Range}
 */
Node.prototype.range = function(){
  return new Range(this.ranges[0].beg, this.ranges[this.ranges.length-1].end)
}


/**
 * Perform a split operation on this Node.
 *
 * @method split
 * @public
 * @return {Node} rNode
 */
Node.prototype.split = function(){
  var m = Math.ceil( this.ranges.length / 2 )
    , tRanges   = this.ranges.splice(m)
    , tChildren = this.children.splice(m)
    , type      = this.__proto__.constructor
    , nNode     = new type(this.order, tRanges, tChildren)

  return nNode
}


/**
 * Perform a merge operation on this Node and its immediate right sibling.
 *
 * @method merge
 * @public
 * @param {Node} rSib
 * @return {Node} this node
 */
Node.prototype.merge = function(rSib){
  assert.ok(rSib instanceof this.__proto__.constructor)
  assert.ok(this.range().contains(rSib.range().beg) == Range.GTHEN)

  this.ranges = this.ranges.concat(rSib.ranges)
  this.children = this.children.concat(rSib.children)

  this.dirty = true

  return this
}


/**
 * Duh!
 *
 * @method toString
 * @public
 * @return {string}
 */
Node.prototype.toString = function(){
  var kStr = this.ranges
             .map(function(rng){ return rng.toString() })
             .join(", ")
    , cStr = this.children
             .map(function(chd){ return chd.toString() })
             .join(", ")
    , typename = this.__proto__.constructor.name

  return format("%s(hdl=%s, min=%d, max=%d, ranges=[%s], children[%s])"
               , typename, this.hdl, this.min, this.max, kStr, cStr)
}

//THE END
// /**
//  * Add operation on this Node. Should be followed by a length check and
//  * possible split call.
//  *
//  * @method add
//  * @param {Range} key linear search finds the i'th placement for this Range
//  * @param {Node|Value} child spliced into the i'th placement
//  * @return {Node} this object just for shits-n-giggles.
//  */
// Node.prototype.add = function(key, child) {
//   var i, len, int
//   for (i=0, len=this.ranges.length; i<len; i+=1) {
//     int = key.intersects(this.ranges[i])
//     if (int === 0) {
//       this.children[i] = value
//       return this
//     }
//     if (int < 0) { //key < ranges[i]
//       //shoe-horn (key,value) in the ith position
//       this.ranges.splice(i,0,key)
//       this.children.splice(i,0,value)
//       return this
//     }
//   }
//   this.ranges.push(key)
//   this.children.push(value)
//   return this
// }


// /**
//  * Remove a key and child from node
//  *
//  * @method del
//  * @param {Range} key
//  * @return {Node} this object just for shits-n-giggles.
//  */
// Node.prototype.del = function(key) {
//   var i, intx
//   for (i=0; i<this.ranges.length; i+=1) {
//     intx = key.intersects(this.ranges[i])
//     if (intx === 0) {
//       var adj = key.adjacentcy(this.ranges[i])
//       if ( adj != 0) {
//         //expand range
//       }
//     }
//     else if (intx > 0) {
//
//     }
//     //else { //int > 0
//     //  //continue
//     //}
//   }
//   console.error("***Node#del: failed to find key = %j", key)
//   console.error("***Node#del: this = %j", this)
//   throw new Error(format("Node#del: failed to find key=%j", key))
// }
