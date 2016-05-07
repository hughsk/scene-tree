# scene-tree

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Modular scene graph for composing and manipulating objects in a 3D scene. Built on top of [display-tree](https://npmjs.com/package/display-tree), with additional functionality for calculating model/normal matrices.

## Usage

[![NPM](https://nodei.co/npm/scene-tree.png)](https://www.npmjs.com/package/scene-tree)

**See [demo.js](demo.js) for a full example.**

***Nodes also inherit additional methods from `display-tree` — see [the README](https://github.com/hughsk/display-tree#api) for the rest.***

### `node = Node(data)`

Creates a new node. data is an optional object that may be supplied for assigning additional data to a node. This accepts any data you supply, but the following properties take on special behavior:

* `position`: an `[x, y, z]` array specifying the node's position relative to its parent.
* `scale`: an `[x, y, z]` array specifying the node's scale. You can also pass in a single number.
* `rotation`: an `[x, y, z, w]` array specifying the node's rotation as a quaternion.

``` javascript
var Node = require('scene-tree')

var node = Node({
  position: [0, 1, 0],
  scale: 5,
  rotation: [0, 0, Math.PI / 2]
})
```

### `node.setPosition(x, y, z)`

Updates the node's position. Note that this method should be used instead of modifying `node.data.position` directly, as it also triggers an update of the node's matrices.

``` javascript
var node = Node()

node.setPosition(0, 1, 0)
node.setPosition([1, 1, 1])
```

### `node.setRotation(x, y, z)`

Updates the node's rotation quaternion. Again, this should be called instead of modifying `node.data.rotation` directly.

``` javascript
var node = Node()

node.setRotation(0, 0, 0, 1)
node.setRotation([0, 0, 0, 1])
```

### `node.setEuler(x, y, z, order)`

Update the node's rotation quaternion using euler (XYZ) angles. Optionally you can pass in an `order` string to specify the order in which to apply the rotations. This method is included for convenience, but is generally slower than using `node.setRotation` directly.

``` javascript
var node = Node()

node.setRotation(Math.PI, 1, Math.PI * 2)
node.setRotation(Math.PI, 1, Math.PI * 2, 'xyz')
node.setRotation([Math.PI, Math.PI, 1])
node.setRotation([Math.PI, Math.PI, 1], 'zxy')
```

### `node.setScale(x, y, z)`

Updates the node's scale. Again, this should be called instead of modifying `node.data.rotation` directly.

``` javascript
var node = Node()

node.setScale(1, 2, 1)
node.setScale([2, 3, 2])
node.setScale(1.5)
```

### `node.tick()`

Traverses through the node and its descendants, updating their normal and model matrices relative to `node`. You should call this once per frame, generally just before rendering the scene.

### `node.modelMatrix`

4x4 `Float32Array` matrix that contains the transformation required to place the node at its correct position in the scene.

### `node.normalMatrix`

3x3 `Float32Array` matrix that contains the transformation required for the node's normals to correctly light the object given its new position in the scene.

## See also

* [regl](https://github.com/mikolalysenko/regl)
* [display-tree](https://github.com/hughsk/display-tree)

## License

MIT, see [LICENSE.md](http://github.com/hughsk/scene-tree/blob/master/LICENSE.md) for details.
