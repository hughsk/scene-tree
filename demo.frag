precision mediump float;

varying vec3 vnorm;
varying vec3 vpos;

uniform vec3 eye;
uniform float sphereDepth;
uniform float time;

#pragma glslify: gauss = require('glsl-specular-gaussian')
#pragma glslify: hsl = require('glsl-hsl2rgb')

void main() {
  vec3 ldir = vec3(0, 1, 0);
  vec3 edir = normalize(eye - vpos);
  float diffuse = max(0.0, 0.2 + dot(vnorm, ldir)) * 0.8;
  float spec = gauss(ldir, edir, vnorm, 0.4) * 0.6;

  gl_FragColor = vec4(hsl(fract(0.3 * sin(time * 0.1) + sphereDepth * 0.03), 0.5, 0.5)
    + (spec + vec3(1.1, 0.7, 0.3) * diffuse
    + vec3(0.08, 0.05, 0.2)) * 0.75
  , 1);
}
