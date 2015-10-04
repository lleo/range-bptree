
var format = require('util').format
  , assert = require('assert')

var utils = require('./utils')
  , isInt = utils.isInt
  , assertIsInt = utils.assertIsInt

exports = module.exports = Range
function Range(beg, end){
  assert(typeof beg == 'number', "beg is not a number")
  assert(beg%1 == 0, "beg is not a integer")

  assert(typeof end == 'number', "end is not an number")
  assert(end%1 == 0, "end is not an integer")

  assert(beg <= end, "beg is not less than or equal to end")

  this.beg = beg
  this.end = end
}

Object.defineProperty(Range, 'ADJLO',
                      { value: -1
                      , writable: false
                      , configurable: false
                      , enumerable: true })

Object.defineProperty(Range, 'ADJHI',
                      { value: 1
                      , writable: false
                      , configurable: false
                      , enumerable: true })

Object.defineProperty(Range, 'NOTADJ',
                      { value: 0
                      , writable: false
                      , configurable: false
                      , enumerable: true })

Object.defineProperty(Range, 'LTHEN',
                      { value: -1
                      , writable: false
                      , configurable: false
                      , enumerable: true })

Object.defineProperty(Range, 'CONTAINS',
                      { value: 0
                      , writable: false
                      , configurable: false
                      , enumerable: true })


/**
 * This is an immutable operations (ie. it does not alter the given ranges).
 *
 * Create a new Range by merging two adjacent Ranges.
 * Throws error if not adjacent.
 *
 * @param {Range} a
 * @param {Range} b
 * @return {Range} new Range
 */
Range.merge = function(lo, hi){
  assert(lo.adjacent(hi.beg) == Range.ADJHI, "lo not adjacent to hi")
  return new Range(lo.beg, hi.end)
}


/**
 * This is an imutable operation like Range.merge().
 *
 * Remove a point from the given Range and return a pair of Ranges.
 * There are four possabilities:
 *   1) if given range is would be deleted (ie. given.beg == given.end == point)
 *      return pair [null, null]
 *   2) if point == given.beg alocate a `new Range(given.beg+1, given.end)`
 *      return pair [newRng, null]
 *   3) if point == given.end alocate a `new Range(given.beg, given.end-1)`
 *      return pair [newRng, null]
 *   4) if given.contains(point) allocate two new Ranges
 *      `loRng = new Range(given.beg, point-1)` and
 *      `hiRng = new Range(point+1, given.end)`
 *      return pair [loRng, hiRng]
 *
 * @method remove
 * @static
 * @param {Range} rng
 * @param {number} pnt
 * @return {Array} pair of [null, null], [rng, null], [rng, splitRng]
 */
Range.remove = function(rng, pnt){
  if ( rng.beg == rng.end == pnt ) {
    return [ null, null ]
  }

  if ( rng.beg == pnt )
    return [ new Range(rng.beg+1, rng.end), null ]

  if ( rng.end == pnt )
    return [ new Range(rng.beg, rng.end-1), null ]

  //split the given range
  var loRng = new Range(rng.beg, pnt-1)
    , hiRng = new Range(pnt+1, rng.end)

  return [ loRng, hiRng ]
}


/**
 * Return true if one Range intersects with another Range.
 *
 * @method intersects
 * @static
 * @param {Node} a
 * @param {Node} b
 * @return {boolean}
 */
Range.intersects = function(a, b){
  assert(a instanceof Node, "a !instanceof Node")
  assert(b instanceof Node, "b !instanceof Node")

  if ( a.contains(b.beg) ) return true
  if ( a.contains(b.end) ) return true
  if ( b.contains(a.beg) ) return true
  if ( b.contains(a.end) ) return true

  return false
}


/**
 * Return true if two ranges are equal.
 *
 * @method equal
 * @static
 * @param {Node} a
 * @param {Node} b
 * @return {boolean}
 */
Range.equal = function(a, b) {
  assert.ok(a instanceof Node)
  assert.ok(b instanceof Node)

  return a.beg == b.beg && a.end == b.end
}


/**
 * Range `a` is a superset of Range `b`. In other words, all points in `b` are
 * contained withing `b`.
 *
 * @method superset
 * @static
 * @param {Range} a
 * @param {Range} b
 * @return {boolean}
 */
Range.superset = function(a, b){
  assert.ok(a instanceof Node)
  assert.ok(b instanceof Node)

  return a.beg <= b.beg && b.end <= a.end
}


/**
 * Range `a` is a subeset or Range `b`. In other words, all points inside `a` are
 * contained within `b`.
 *
 * @method subset
 * @static
 * @param {Range} a
 * @param {Range} b
 * @return {boolean}
 */
Range.subset = function(a, b){
  assert.ok(a instanceof Node)
  assert.ok(b instanceof Node)

  return a.beg <= b.beg && b.end <= a.end
}

/**
 * Test if given Point is contained within Range.
 *
 * @method contains
 * @param {number} pnt Point
 * @return -1 (less-than Range), 1 (greater-than Range), or 0 (within Range)
 */
Range.prototype.contains = function(pnt){
//  assertIsInt(pnt)

  if (pnt < this.beg)
    return Range.LTHEN
//    return -1

  if (pnt > this.end)
    return Range.GTHEN
//    return 1

  return Range.CONTAINS
//  return 0
}


/**
 * Test if given Point is adjacent to Range.
 *
 * @method adjacent
 * @param {number} pnt
 * @return -1 (adjacent lo-side), 1 (adjacent hi-side), or 0 (not adjacent at all)
 */
Range.prototype.adjacent = function(pnt){
//  assertIsInt(pnt)

  if (pnt == this.beg-1)
    return Range.ADJLO
//    return -1

  if (pnt == this.end+1)
    return Range.ADJHI
//    return 1

  return Range.NOTADJ
//  return 0
}

Range.prototype.extendHi = function(){
  this.end += 1
}


Range.prototype.extendLo = function(){
  assert.notStrictEqual(this.beg, 0)
  this.beg -= 1
}


/**
 * Merge this range with another ADJACENT range. Assert if not adjacent.
 *
 * @method merge
 * @param {Range} other
 * @return {Range} this Range
 */
Range.prototype.merge = function(other){
  assert.ok(this.adjacent(other.beg) == Range.ADJHI)
  this.end = other.end
  return this
}


/**
 * Duh!
 *
 * @method toString
 * @return {string}
 */
Range.prototype.toString = function(){
  return "["+this.beg+", "+this.end+"]"
}