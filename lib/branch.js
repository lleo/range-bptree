/**
 * Definition of Branch (inner node) class of the B+Tree
 *
 * @author LLeo
 * @module range-bptree
 */

var util = require('util')
  , format = util.format
  , inherits = util.inherits
  , assert = require('assert')
  , Leaf = require('./leaf')
  , Node = require('./node')
  , u = require('lodash')

/**
 * Constructor for an inner node of B+Tree
 *
 * Rule: #ranges+1 == #children
 *
 * @class Branch
 * @constructor
 * @param {Number} order
 * @param {Array} ranges Array of Key objects in order
 * @param {Array} children Array of Leaf xor Branch objects in order
 */
function Branch(parent, order, ranges, children) {
  Node.call(this, parent, order, ranges, children)
  for (var i=0; i<children.length; i+=1) {
    assert( typeof children[i] != 'undefined'
          , format("typeof children[%d] == 'undefined'", i) )
//    assert( children[i] instanceof Node )
  }
} //constructor

inherits(Branch, Node)

Branch.Branch = Branch

exports = module.exports = Branch


/**
 * Find and Replace `oldRng` with `newRng`.
 * pukes and throws an Error if `oldRng` not found.
 *
 * @method updateRange
 * @public
 * @param {Range} oldRng
 * @param {Range} newRng
 * @return {Branch} this
 */
Branch.prototype.updateRange = function(oldRng, newRng){
  var i

  for (i=0; i<this.children.length; i+=1) {
    if ( oldRng.equals(this.children[i]) ) {
      this.children[i] = newRng

      this.dirty = true

      return this
    }
  }

  console.error("***Branch#updateRange: hdl = %s not found", oldRng)
  console.error("***Branch#updateRange: this.children=[%j]"
               , this.children.map(function(c){ return c.toString() })
                 .join(', ') )
  throw new Error(format("Branch#updateRange: failed to find oldRng = %s", oldRng))
}


/**
 * Find and Replace `oldHdl` with `newHdl`.
 * pukes and throws an Error if `oldHdl` not found.
 *
 * @method updateHdl
 * @public
 * @param {Handle} oldHdl
 * @param {Handle} newHdl
 * @return {Branch} this
 */
Branch.prototype.updateHdl = function(oldHdl, newHdl) {
  var i

  for (i=0; i<this.children.length; i+=1) {
    if ( oldHdl.equals(this.children[i]) ) {
      this.children[i] = newHdl

      this.dirty = true

      return this
    }
  }

  console.error("***Branch#updateHdl: hdl = %s not found", oldHdl)
  console.error("***Branch#updateHdl: this.children=[%j]"
               , this.children.map(function(c){ return c.toString() })
                 .join(', ') )
  throw new Error(format("Branch#updateHdl: failed to find oldHdl = %s", oldHdl))
} //.updateHdl()


/** Uses super class (Node) .size() .*/

/** Uses super class (Node) .toSmall() .*/

/** Uses super class (Node) .toBig() .*/

/** Uses super class (Node) .add() .*/

/** Uses super class (Node) .del() .*/

/** Uses super class (Node) .split() .*/

/** Uses super class (Node) .merge() .*/

/** Uses super class (Node) .toString() .*/

//THE END