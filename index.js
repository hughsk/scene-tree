var getNormal = require('gl-mat3/normal-from-mat4')
var DisplayTreeNode = require('display-tree')
var quatIdentity = require('gl-quat/identity')
var identity = require('gl-mat4/identity')
var multiply = require('gl-mat4/multiply')
var copy = require('gl-mat4/copy')
var inherits = require('inherits')
var rotateX = require('gl-quat/rotateX')
var rotateY = require('gl-quat/rotateY')
var rotateZ = require('gl-quat/rotateZ')

module.exports = SceneTreeNode

inherits(SceneTreeNode, DisplayTreeNode)
function SceneTreeNode (data) {
  if (!(this instanceof SceneTreeNode)) {
    return new SceneTreeNode(data)
  }

  data = data || {}
  DisplayTreeNode.call(this, data)

  data.position = data.position || new Float32Array(3)
  data.scale = typeof data.scale === 'number'
    ? defaultScale(data.scale)
    : data.scale || defaultScale(1)

  if (!data.rotation) {
    data.rotation = new Float32Array(4)
    data.rotation[3] = 1
  }

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

    fromRotationTranslationScale(baseModel, rotation, position, scaleDat)
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

SceneTreeNode.prototype.setRotation = function (x, y, z, w) {
  var rot = this.data.rotation
  this.matrixDirty = true
  if (Array.isArray(x)) {
    rot[0] = x[0]
    rot[1] = x[1]
    rot[2] = x[2]
    rot[3] = x[3]
  } else {
    rot[0] = x
    rot[1] = y
    rot[2] = z
    rot[3] = w
  }
  return this
}

SceneTreeNode.prototype.setEuler = function (x, y, z, order) {
  var rot = this.data.rotation
  this.matrixDirty = true
  quatIdentity(rot)

  var X, Y, Z, O
  if (Array.isArray(x)) {
    X = x[0]
    Y = x[1]
    Z = x[2]
    O = y || ''
  } else {
    X = x
    Y = y
    Z = z
    O = order || ''
  }

  switch (O.toLowerCase()) {
    case 'xzy':
      rotateX(rot, rot, X)
      rotateZ(rot, rot, Y)
      rotateY(rot, rot, Z)
      break
    case 'yxz':
      rotateY(rot, rot, X)
      rotateX(rot, rot, Y)
      rotateZ(rot, rot, Z)
      break
    case 'yzx':
      rotateY(rot, rot, X)
      rotateZ(rot, rot, Y)
      rotateX(rot, rot, Z)
      break
    case 'zxy':
      rotateZ(rot, rot, X)
      rotateX(rot, rot, Y)
      rotateY(rot, rot, Z)
      break
    case 'zyx':
      rotateZ(rot, rot, X)
      rotateY(rot, rot, Y)
      rotateX(rot, rot, Z)
      break
    default:
      rotateX(rot, rot, X)
      rotateY(rot, rot, Y)
      rotateZ(rot, rot, Z)
      break
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

// From @toji's gl-matrix, pulled out to save some time :')
// http://glmatrix.net/docs/mat4.html#.fromRotationTranslationScale
function fromRotationTranslationScale (out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3],
    x2 = x + x,
    y2 = y + y,
    z2 = z + z,

    xx = x * x2,
    xy = x * y2,
    xz = x * z2,
    yy = y * y2,
    yz = y * z2,
    zz = z * z2,
    wx = w * x2,
    wy = w * y2,
    wz = w * z2,
    sx = s[0],
    sy = s[1],
    sz = s[2]

  out[0] = (1 - (yy + zz)) * sx
  out[1] = (xy + wz) * sx
  out[2] = (xz - wy) * sx
  out[3] = 0
  out[4] = (xy - wz) * sy
  out[5] = (1 - (xx + zz)) * sy
  out[6] = (yz + wx) * sy
  out[7] = 0
  out[8] = (xz + wy) * sz
  out[9] = (yz - wx) * sz
  out[10] = (1 - (xx + yy)) * sz
  out[11] = 0
  out[12] = v[0]
  out[13] = v[1]
  out[14] = v[2]
  out[15] = 1

  return out
}
