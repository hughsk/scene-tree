const perspective = require('gl-mat4/perspective')
const faceNormals = require('face-normals')
const unindex = require('unindex-mesh')
const icosphere = require('icosphere')
const Camera = require('camera-spin')
const Geom = require('gl-geometry')
const Shader = require('gl-shader')
const glslify = require('glslify')
const eye = require('eye-vector')
const Fit = require('canvas-fit')
const raf = require('raf')
const Node = require('./')

const canvas = document.body.appendChild(document.createElement('canvas'))
const gl = canvas.getContext('webgl')

const start = Date.now()
const eyeVector = new Float32Array(3)
const scene = Node({ position: [28, -1, 0] })
const getNodes = scene.list()
const proj = new Float32Array(16)
const camera = Camera(canvas)
const sphere = createSphereGeom()
const shader = Shader(gl
  , glslify('./demo.vert')
  , glslify('./demo.frag')
)

;[
  [+1.5, +0.5, 0],
  [-1.5, -0.5, 0],
  [0, +1.5, +0.5],
  [0, -1.5, -0.5]
].forEach(function (offset) {
  var tendrilLength = 14
  var previousNode = scene

  for (var i = 0; i < tendrilLength; i++) {
    previousNode.add(previousNode = Node({
      scale: 0.9,
      position: offset,
      depth: i
    }))
  }
})

render()
function render () {
  raf(render)

  const height = canvas.height
  const width = canvas.width
  const nodes = getNodes()

  gl.viewport(0, 0, width, height)
  gl.clearColor(0.08, 0.04, 0.15, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  sphere.bind(shader)
  shader.uniforms.proj = perspective(proj, Math.PI / 4, width / height, 0.1, 100)
  shader.uniforms.view = camera.tick()
  shader.uniforms.eye = eye(camera.view(), eyeVector)
  shader.uniforms.time = (Date.now() - start) / 1000
  scene.each(function (node) {
    node.setEuler(
      1.20 * Math.sin(Date.now() / 10000 * 1.5),
      0.80 * Math.sin(Date.now() / 2339 * 1.5),
      0.45 * Math.sin(Date.now() / 9000)
    )
  })

  scene.tick()

  for (var i = 0; i < nodes.length; i++) {
    shader.uniforms.model = nodes[i].modelMatrix
    shader.uniforms.normalMatrix = nodes[i].normalMatrix
    shader.uniforms.sphereDepth = nodes[i].data.depth
    sphere.draw()
  }
}

function createSphereGeom () {
  const positions = unindex(icosphere(0))
  const normals = faceNormals(positions)

  return Geom(gl)
    .attr('position', positions)
    .attr('normal', normals)
}

window.addEventListener('resize', Fit(canvas), false)
