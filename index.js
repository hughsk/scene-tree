const getNormal = require('gl-mat3/normal-from-mat4')
const DisplayTreeNode = require('display-tree')
const translate = require('gl-mat4/translate')
const identity = require('gl-mat4/identity')
const multiply = require('gl-mat4/multiply')
const rotateX = require('gl-mat4/rotateX')
const rotateY = require('gl-mat4/rotateY')
const rotateZ = require('gl-mat4/rotateZ')
const scale = require('gl-mat4/scale')
const copy = require('gl-mat4/copy')
const inherits = require('inherits')

module.exports = SceneTreeNode

inherits(SceneTreeNode, DisplayTreeNode)
function SceneTreeNode (data) {
  if (!(this instanceof SceneTreeNode)) {
    return new SceneTreeNode(data)
  }

  data = data || {}
  DisplayTreeNode.call(this, data)

  data.position = data.position || new Float32Array(3)
  data.rotation = data.rotation || new Float32Array(3)
  data.scale = typeof data.scale === 'number'
    ? defaultScale(data.scale)
    : data.scale || defaultScale(1)

  this.normalMatrix = identity(new Float32Array(9))
  this.modelMatrix = identity(new Float32Array(16))
  this.baseModelMatrix = identity(new Float32Array(16))
  this.matrixDirty = true
}

SceneTreeNode.prototype.tick = function () {
  tickNode(this)
  this.each(tickNode)
}

function tickNode (node) {
  var data = node.data
  var model = node.modelMatrix
  var baseModel = node.baseModelMatrix

  if (node.matrixDirty) {
    identity(baseModel)

    var rotation = data.rotation
    var position = data.position
    var scaleDat = data.scale

    if (position[0] || position[1] || position[2]) {
      translate(baseModel, baseModel, data.position)
    }
    if (scaleDat[0] !== 1 || scaleDat[1] !== 1 || scaleDat[2] !== 1) {
      scale(baseModel, baseModel, data.scale)
    }
    if (rotation[0]) rotateX(baseModel, baseModel, rotation[0])
    if (rotation[1]) rotateY(baseModel, baseModel, rotation[1])
    if (rotation[2]) rotateZ(baseModel, baseModel, rotation[2])
  }

  if (node.parent && node.parent.modelMatrix) {
    multiply(model, node.parent.modelMatrix, baseModel)
  } else {
    copy(model, baseModel)
  }

  getNormal(node.normalMatrix, model)
  node.matrixDirty = false
}

SceneTreeNode.prototype.setPosition = function (x, y, z) {
  var pos = this.data.position
  this.matrixDirty = true
  if (Array.isArray(x)) {
    pos[0] = x[0]
    pos[1] = x[1]
    pos[2] = x[2]
  } else {
    pos[0] = x
    pos[1] = y
    pos[2] = z
  }
  return this
}

SceneTreeNode.prototype.setRotation = function (x, y, z) {
  var rot = this.data.rotation
  this.matrixDirty = true
  if (Array.isArray(x)) {
    rot[0] = x[0]
    rot[1] = x[1]
    rot[2] = x[2]
  } else {
    rot[0] = x
    rot[1] = y
    rot[2] = z
  }
  return this
}

SceneTreeNode.prototype.setScale = function (x, y, z) {
  var scale = this.data.scale
  this.matrixDirty = true
  if (Array.isArray(x)) {
    scale[0] = x[0]
    scale[1] = x[1]
    scale[2] = x[2]
  } else
  if (arguments.length === 1) {
    scale[0] =
    scale[1] =
    scale[2] = x
  } else {
    scale[0] = x
    scale[1] = y
    scale[2] = z
  }
  return this
}

function defaultScale (n) {
  var scale = new Float32Array(3)
  scale[0] = n
  scale[1] = n
  scale[2] = n
  return scale
}
