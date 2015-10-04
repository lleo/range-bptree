/**
 * @main stress.js
 * @author LLeo <lleoem@gmail.com>
 * @module range-bptree
 * *requires
 * *catagorey
 */

var RangeBpTree = require('..')
  , TrivialStore = require('..lib/trivial_store')


var triv = new TrivialStore()
  , tree = new RangeBpTree({ leafOrder   : 5
                           , branchOrder : 3
                           , storage     : triv})

tree.isnertPoint(1)
tree.isnertPoint(2)
tree.isnertPoint(3)
tree.isnertPoint(4)
tree.isnertPoint(5)
tree.isnertPoint(6) //split & first branch & new root
tree.isnertPoint(7)
tree.isnertPoint(8)
tree.isnertPoint(9)
tree.isnertPoint(10) //split
tree.isnertPoint(11)
tree.isnertPoint(12)
tree.isnertPoint(13)
tree.isnertPoint(14) //split & new Branch & new root
//tree.isnertPoint(15)
//tree.isnertPoint(15)

//tree.isnertPoint(pnt)