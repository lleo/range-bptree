/**
 *
 * @module RangeBpTree
 * \@submodule
 * @main range-bptree
 */

var assert = require('assert')
  , util = require('util')
  , format = util.format
  , async = require('async')
  , u = require('lodash')

var Range = require('./range')
  , Node = require('./node')
  , Leaf = require('./leaf')
  , Branch = require('./branch')
  , Store = require('./store')
  , rngStats = require('./randge_stats')
  , utils = require('./utils')
  , isInt = utils.isInt
  , assertIsInt = utils.assertIsInt

/**
 * @class RangeBpTree
 * @constructor
 * @param {Object} args plain ole object
 *     args = {
 *       order       : <number>
 *     , leafOrder   : <number>
 *     , branchOrder : <number>
 *     , storage     : <Store>
 *     }
 */
exports = module.exports = RangeBpTree
function RangeBpTree(args){
  assert(u.isPlainObject(args))
  assert(args.storage)

  if ( typeof args.leafOrder == 'number' &&
       typeof args.branchOrder == 'number' ) {
    assertIsInt(args.leafOrder)
    assertIsInt(args.branchOrder)
    this.leafOrder = args.leafOrder
    this.branchOrder = args.branchOrder
  }
  else {
    assertIsInt(args.order)
    this.leafOrder = args.order
    this.branchOrder = args.order
  }

  //args.storage required
  assert.ok(args.storage instanceof Store)
  this.storage = args.storage

  this.root = null
  this.writing = false
  this.depth = 0
}

RangeBpTree.Node = Node
RangeBpTree.Leaf = Leaf
RangeBpTree.Branch = Branch
RangeBpTree.Range = Range



rngStats =
RangeBpTree.STATS = rngStats


/**
 * Test if a point exists in RangeBpTree
 *
 * @method exists
 * @public
 * @param {number} pnt
 * @param {Function} cb cb(err, bool)
 */
RangeBpTree.prototype.exists = function(pnt, cb){
  var self = this
    , opData = new OpData('exists')

  this.findLeaf(pnt, opData, function(err, leaf){
    if (err) { cb(err); return }
    cb(null, !!leaf.get(pnt))
  })
}


/**
 * Insert a point into RangeBpTree
 *
 * @method put
 * @public
 * @param {number} pnt
 * @param {Function} cb cb(err)
 */
RangeBpTree.prototype.put = function(pnt, cb){
  var self = this
    , opData = new OpData('put')

  if (this.root === null) {
    var leaf = new Leaf(null, this.leafOrder, [new Range(pnt, pnt)], [true])
    this.storeRoot(leaf, opData, cb)
    return
  }


  this.findLeaf(pnt, opData, function(err, leaf){
    if (err) { cb(err); return }
    self.insertPoint(leaf, pnt, opData, cb)
  })
}


/**
 * Delete a Point from the RangeBpTree
 *
 * @method del
 * @public
 * @param {number} pnt
 * @paran {Function} cb cb(err)
 */
RangeBpTree.prototype.del = function(pnt, cb){
  throw new Error("not implemented")
  var self = this

  this.findLeaf(rng, function(err, leaf){
    self.removePoint(leaf, pnt, function(err, /*...*/){
      //...
    })
  })
}


/**
 * Find the Leaf that contains a given Point OR the Leaf that should contain
 * that given Point.
 *
 * @method findLeaf
 * @private
 * @param {number} pnt
 * @param {Function} cb cb(err, leaf)
 */
RangeBpTree.prototype.findLeaf = function(pnt, cb){
  var self = this

  function find(err, node) {
    var idx, cnt

    if (node instanceof Leaf) {
      cb(null, node)
      return
    }
    //node instanceof Branch


    for (idx=0; idx<node.ranges.length; idx+=1) {
      cnt = node.ranges[idx].contains(pnt)
      if (cnt == Range.CONTAINS || cnt == Range.GTHEN) break
      //if (cnt <= Range.CONTAINS) break
      //if (cnt <= 0) break
    }

    self.load(node.children[idx], find)
    return
  }

  find(null, this.root)
}


/**
 * Insert a Point into the RangeBpTree
 *
 * @method insertPoint
 * @private
 * @param {Leaf} leaf
 * @param {number} pnt
 * @param {OpData} opData
 * @param {Function} cb cb(err)
 */
RangeBpTree.prototype.insertPoint = function(leaf, pnt, opData, cb){
  var self = this

  this.findLeaf(pnt, function(err, leaf){
    var idx, cnt, adj, last, origRng

    last = leaf.ranges.length - 1
    origRng = leaf.range()

    for (idx=0; idx<=last; idx+=1) {

      cnt = leaf.ranges[idx].contains(pnt)
      if (cnt == Range.CONTAINS) {
        process.nextTick(function(){ cb(null) })
        return
      }

      adj = leaf.ranges[idx].adjacent(pnt)
      if (adj == Range.ADJHI) {
        //extend range
        var shrunk = leaf.extendHi(idx) //also marks dirty

        if ( idx < last ) {
          if ( shrunk ) {
            self.storeShrunkNode(leaf, origRng, opData, cb)
            return
          }

          self.storeNode(leaf, origRng, opData, cb)
          return
        }

        if ( idx == last ) {
          //shrunk == false
          assert.ok(!shrunk)
          self.findNextLeaf(leaf, opData, function(err, nextLeaf){
            if (nextLeaf == null) {
              self.storeNode(leaf, origRng, opData, cb)
              return
            }

            var nxtRng = nextLeaf.ranges[0]

            if ( leaf.ranges[last].adjacent(nxtRng.beg) == Range.ADJHI ) {
              nextLeaf.remove(nxtRng)

              self.storeShrunkNode(nextLeaf, origRng, opData, function(err){
                if (err) { cb(err); return }

                leaf.ranges[last].merge(nxtRng)
                self.storeNode(leaf, origRng, opData, cb)
              })
            }
            else {
              self.storeNode(leaf, origRng, opData, cb)
            }
          })
          return
        }
      } //end: if ADJHI

      if (adj == Range.ADJLO) {
        //extend range
        leaf.ranges[idx].extendLo(idx)
        //NOTE: we never have to consider being adjacent to the previous node,
        //  because the previous node would have already merged with this node
        //  via the adjacent hi logic or this leaf is the first leaf of the Tree
        //  in which case there is nothing previous to merge with.
        self.storeNode(leaf, origRng, opData, cb)
        return
      }

      if (cnt == Range.GTHEN) {
        //insert new range & stop scanning
        leaf.ranges.splice(idx, 0, new Range(pnt, pnt))
        leaf.children.splice(idx, 0, true )

        self.storeGrownNode(leaf, origRng, opData, cb)
        return
      }

//      if (cnt == Range.LTHEN) { /* keep scanning */ }
    } //end: for-loop
    assert.ok(idx == this.ranges.length)

    leaf.ranges.push(new Range(pnt, pnt))
    leaf.children.push(true)

    self.storeGrownNode(leaf, origRng, opData, cb)
    return
  }) //.findLeaf
}


/**
 * Find the next Leaf from a given Leaf (or null).
 *
 * @method findNextLeaf
 * @private
 * @param leaf
 * @param opData
 * @param cb cb(err, nextLeaf) nextLeaf may be null
 */
RangeBpTree.prototype.findNextLeaf = function(leaf, opData, cb){
  var cur = leaf
    , curRng, i

  while (cur.parent) {
    curRng = cur.range()

    //find the index of the current node
    for (i=0; i<cur.parent.ranges.length; i+=1)
      if ( Range.equal(curRng, cur.parent.ranges[i]) )
        break

    // if the index is not the last index
    if (i < cur.parent.ranges.length - 1) {
      self.load(cur.parent.children[i+1], cur.parent, function(err, node){
        if (err) { cb(err); return }

        self.findLeftMostLeaf(node, opData, cb)
      })
      return
    }

    cur = cur.parent
  }
  assert.ok( cur.parent === null )

  process.nextTick(function(){
    cb(null, null)
  })
}


/**
 * Find Left Most Leaf from given Node.
 * ?? assumes it was called from a load
 *
 * @method findLeftMostLeaf
 * @private
 * @param {Node} node
 * @param {OpData} opData
 * @param {Function} cb cb(err, leaf) leaf could be node
 */
RangeBpTree.prototype.findLeftMostLeaf = function(node, opData, cb){
  var self = this

  if (node instanceof Leaf) {
//    process.nextTick(function(){ cb(null, node)  })
    cb(null, node)
    return
  }
  assert.ok(node instanceof Branch)

  this.load(node.children[0], node, function(err, child){
    if (err) { cb(err); return }
    self.findLeftMostLeaf(child, opData, cb)
  })
}


/**
 * Delete and return the first Point from RangeBpTree
 *
 * @method removeFirstPoint
 * @public
 * @param {Function} cb cb(err, point)
 */
RangeBpTree.prototype.removeFirstPoint = function(cb){
  var opData = new OpData('findFirstPoint')
    , origRng, rng, pnt

  this.findLeftMostLeaf(this.root, opData, function(err, leaf){
    if (err) { cb(err); return }

    origRng = leaf.range()
    rng = leaf.ranges[0]
    pnt = rng.beg

    function found(err){
      if (err) cb(err)
      else cb(null, pnt)
    }

    if (rng.beg == rng.end) {
      leaf.remove(rng)
      self.storeShrunkNode(leaf, origRng, opData, found)
    }
    else {
      rng.beg += 1
      self.storeNode(leaf, origRng, opData, found)
    }
  })
}


/**
 * Store Node and if Handle changed, then update Handle in parent. The updated
 * Handle is changed in Node object here.
 *
 * @method storeNode
 * @private
 * @param {Node} node
 * @param {Range} origRng original range of the given node
 * @param {OpData} opData possably changed handles and know dead handles for the Operation
 * @param {Function} cb cb(err)
 */
RangeBpTree.prototype.storeNode = function(node, origRng, opData, cb){
  var self = this
    , var oldHdl = node.hdl

  if (!node.dirty) {
//    setImmediate(function(){
    process.nextTick(function(){
      cb(null)
    })
    return
  }

  if (node.parent === null) {
    this.storeRoot(node, cb)
    return
  }
  //node is dirty && node IS NOT root

  this.store(node, function(err){
    if (err) { cb(err); return }

    opData.stored(oldHdl, node.hdl)

    var parent = node.parent //already established that node.parent !== null

    if ( !Range.equal(origRng, node.range()) )
      parent.updateRange(origRng, node.range())

    if (oldHdl && !oldHdl.equals(node.hdl))
      parent.updateHdl(oldHdl, node.hdl)

    self.storeNode(parent, opData, cb)
    return
  })
}


/**
 * Deal with a node that shrank.
 *
 * @method storeShrunkNode
 * @private
 * @param {Node} node
 * @param {Range} origRng original range of the given node
 * @param {OpData} opData
 * @param {Function} cb cb(err, ???)
 */
RangeBpTree.prototype.storeShrunkNode = function(node, origRng, opData, cb){
  // confirm node != null or undefined
  assert(node instanceof Node, "node !instanceof Node")

  //deal with possible root node
  if (node == this.root) {
    if (node.ranges.length == 0) {
      opData.deadNode(node)
      this.storeRoot(null, opData, cb)
      return
    }

    this.storeRoot(node, opData, cb)
    return
  }
  //not root node

  if (!node.toSmall()) {
    this.storeNode(node, opData, cb)
    return
  }
  //node is toSmall; need to merge

  var parent = node.parent

  this.mergeNode(node, opData, function(err, mergedNode, deadNode){
    if (err) { cb(err); return }

    if (!mergedNode.toBig()) {
      opData.deadHdl(deadNode.hdl)
      self.storeNode(mergedNode, opData, cb)
      return
    }
    //mergedNode is toBig; needs split

    var rNode = mergedNode.split()

    var origPRng = parent.range()
      , rmHdl = parent.remove(origRng)
      , rNodeOldHdl = rNode.hdl = deadNode.hdl //recycle a known dead handle

    self.store(rNode, function(err){
      if (err) { cb(err); return }

      self.storeNode(mergedNode, opData, cb)
    })

  })
}


/**
 * Deal with a node that grew.
 *
 * @method storeGrownNode
 * @private
 * @param {Node} node
 * @param {Range} origRng original range of the given node
 * @param {OpData} opData
 * @param {Function} cb cb(err, ???)
 */
RangeBpTree.prototype.storeGrownNode = function(node, origRng, opData, cb){
  //confirm node != null or undefined
  assert(node instanceof Node, "node !instanceof Node")

  //deal with possible root node
  if (node === this.root) {
    this.storeRoot(node, opData, cb)
    return
  }
  //not root node

  if (!node.toBig()) {
    this.storeNode(node, opData, cb)
    return
  }
  //node is toBig; needs split

  var rNode = node.split()

  this.store(rNode, opData, function(err){
    if (err) { cb(err); return }

    self.storeNode(node, opData, nfn)
  })
}


/**
 *
 *
 * @method mergeNode
 * @private
 * @param {Node} node
 * @param {OpData} opData
 * @param {Function} cb cb(err, ...)
 */
RangeBpTree.prototype.mergeNode = function(node, opData, cb){
  assert(node !== this.root, "node is root node")
  assert(node instanceof Node, "node !instanceof Node")
  assert(node.parent != null, "node might be root node")

  var self = this
    , i, rng, sibHdl, lNode, rNode
    , parent = node.parent

  for (i=0, rng = node.range(); i<parent.ranges.length; i+=1)
    if ( Range.equal(this.ranges[i], rng) ) break

  if (i == parent.ranges.length) {
    cb(new Error(format("Invalid Tree: Child range not found in Parent; child.range=%s", rng)))
    //throw new Error(format("Invalid Tree: Child range not found in Parent; child.range=%s", rng))
    return
  }

  if (i == parent.ranges.length) {
    rNode = node
    sibHdl = parent.children[i-1]
  }
  else {
    lNode = node
    sibHdl = parent.children[i+1]
  }

  this.load(sibHdl, parent, function(err, opData, sibNode){
    if (err) { cb(err); return }

    if (lNode) rNode = sibNode
    else       lNode = sibNode

    lNode.merge(rNode)

    //(err, mergedNode, deadNode)
    cb(null, lNode, rNode)
  })
}


/**
 *
 *
 * @method splitNode
 * @private
 * @param {Node} node
 * @param {OpData} opData
 * @param {Function} cb cb(err, lNode, rNode)
 */
RangeBpTree.prototype.splitNode = function(node, opData, cb){

}



/**
 * Change the root property of the BpTree, collect the handle if dead, and
 * store the new root handl in the underlying storage engine.
 *
 * @method storeRoot
 * @private
 * @param {Node} newRoot
 * @param {OpData} opData
 * @param {Function} cb cb(err)
 */
RangeBpTree.prototype.storeRoot = function(newRoot, opData, cb){
  var self = this
    , oldRoot = this.root
    , oldRootHdl = oldRoot ? oldRoot.hdl : null

//  console.warn("BpTre#replaceRoot: newRoot=%s", newRoot)
//  console.warn("BpTre#replaceRoot: oldRoot=%s", oldRoot)

  if (newRoot instanceof Node) {
    this.store(newRoot, function(err){
      if (err) { cb(err); return }

      if (oldRootHdl === null || !newRoot.hdl.equals(oldRootHdl))
        self.storage.storeRootHandle(newRoot.hdl, function(err){
          if (err) { cb(err); return }

          self.root = newRoot
          cb(null)
        }
      else {
        self.root = newRoot
        cb(null)
      }
    })
    return
  }
  /* else newRoot === null */
  assert(newRoot === null, "newRoot !instanceof Node && newRoot !== null")

  if (oldRoot !== null) {
    self.storage.storeRootHandle(null /*newRootHdl*/, function(err){
      if (err) { cb(err); return }

      self.root = null //newRoot
      cb(null)
    })
  }
  else //oldRoot === null && newRoot === null
    setImmediate(function(){
      cb(null)
    })
}


/**
 * Clean up handles no longer used by the tree.
 *
 * @method cleanHandles
 * @private
 * @param {OpData} opData
 * @param {Function} cb cb(err)
 */
RangeBpTree.prototype.cleanHandles = function(opData, cb){
  var self = this
    , deadHdls

  deadHdls = opData.deadHdls()

  async.eachSeries(
    deadHdls
  , function(deadHdl, ecb){
      assert.ok(deadHdl)
      self.storage.release(deadHdl, ecb)
    }
  , function(err, res){
      if (err) { cb(err); return }
//      self.storage.flush(cb)
      cb(null)
    }) //async.eachSeries
}


/**
 * Create a Plain-ole-JSON object to represet a given node.
 *
 * @method nodeToJson
 * @public
 * @param {Node} node a Leaf or Branch object
 * @return {Object} a Plain-ole-JSON object
 */
RangeBpTree.prototype.nodeToJson = function(node){
  var self = this
    , n

  if (node instanceof Leaf) {
    n = { "type"     : "Leaf"
        , "order"    : node.order
        , "keys"     : node.keys
        , "children" : node.children
        }
  }
  else if (node instanceof Branch) {
    n = { "type"     : "Branch"
        , "order"    : node.order
        , "keys"     : node.keys
        , "children" : node.children.map(function(hdl){
                         return self.storage.handleToJson(hdl)
                       })
        }
  }
  else throw new Error("WTF! node !instanceof Leaf || Branch")

  return n
}


/**
 * Create a node from a Plain-ole-JSON object created to represet this node.
 *
 * @method nodeFromJson
 * @public
 * @param {Object} n Plain-old-JSON object
 * @return {Node} a Leaf or Branch object
 */
RangeBpTree.prototype.nodeFromJson = function(n){
  var self = this
    , node

  if (n.type == "Leaf") {
    node = new Leaf(n.order, n.keys, n.children, this.keyCmp)
  }
  else if (n.type == "Branch") {
    var children = n.children.map(function(c){
                     return self.storage.handleFromJson(c)
                   })
    node = new Branch(n.order, n.keys, children, this.keyCmp)
  }
  else throw new Error('WTF! n.type != "Leaf" || "Branch"')

  return node
}


/**
 * Get a handle to represent a given Node. This is a policy
 * decision. Currently that policy is:
 *   1. if this.cow is true, allocate a new Handle
 *   2. if the given node does not have a handle, allocate a new Handle
 *   3. if the given node.hdl is not big enough to store the handle,
 *      allocate a new Handle
 *   4. re-use given node.hdl
 *
 * @method getHandle
 * @private
 * @param {Node} node
 * @return {Handle}
 */
RangeBpTree.prototype.getHandle = function(node){
  var hdl, n

  n = this.nodeToJson(node)

  if (this.cow || node.hdl == null || !this.storage.isBigEnough(node.hdl, n)) {
    hdl = this.storage.reserve( n )
    assert(hdl, "getHandle: Failed to reserve() handle for node")
  }
  else
    hdl = node.hdl

  return hdl
}


/**
 * Load a Node from a given Handle.
 *
 * @method load
 * @private
 * @param {Handle} hdl
 * @param {Node} parent
 * @param {Function} cb cb(err, node)
 */
RangeBpTree.prototype.load = function(hdl, parent, cb){
  assert.ok( (parent instanceof Node) || parent === null
           , "parent must be defined or null")

  var self = this

//  var loadedNS = bptStats.get('tt_load').start()

  this.storage.load(hdl, function(err, n){
    if (err) { cb(err); return }

    var node = self.nodeFromJson(n)

    node.hdl = hdl
    node.parent = parent

//    loadedNS()

    cb(err, node)
  })
}


/**
 * Store a Node, setting the Handle `node.hdl`
 *
 * @method store
 * @private
 * @param {Node} node
 * @param {Function} cb cb(err)
 */
RangeBpTree.prototype.store = function(node, cb){
  var self = this

  if (this.writing) {
    console.error("*** this.writing == true; node = %s", node)
    cb(new Error("RangeBpTree.prototype.store: store already in progress."))
  }

  this.writing = true

//  var storedNS = bptStats.get('tt_store').start()

  var n = this.nodeToJson(node)
    , hdl = this.getHandle(node)

  //for a fresh new node (leaf or branch) node.hdl will be null
  this.storage.store(n, hdl, function(err, newHdl){
    self.writing = false

    if (err) { cb(err); return }

    //if (node.hdl.cmp(hdl) != 0) //node.hdl != hdl
    node.hdl = newHdl //this is done here AUTHORITATIVE!

    node.dirty = false //NOTE: only matters for Branch nodes

//    storedNS()

    cb(null)
  })
}


/**
 * Helper object trace actions during top-level Operation (put, get, del) aka
 * (insertPoint, exists, removeFirstPoint & removeLastPoint).
 *
 * @class OpData
 * @constructor
 * @param {string} opName name of operation. insertPoint, exists, or
 *                        removeFirstPoint & removeLastPoint.
 */
function OpData(opName) {
  this.name = opName
  this.stored = []
  this.loaded = []
  this.deadHdls = []
}

OpData.prototype.storedNode = function(node){
  this.stored.push(node)
  return this
}

OpData.prototype.loadedNode = function(hdl, n){
  this.loaded.push([hdl,n])
}

OpData.prototype.storedHdl = function(oldHdl, newHdl){
  if (oldHdl != null && !oldHdl.equals(newHdl) ) {
    this.deadHdls.push(oldHdl)
  }
}

OpData.prototype.deadHdl = function(deadHdl){
  this.deadHdls.push(deadHdl)
}

//THE END