attribute vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform float uPointSize;
uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = mvpMatrix * vec4(position, 1.0);
  gl_PointSize = uPointSize;

  vec3 pos = position;
  pos.x -= 1.0;
  pos.xy += uMouse;
  pos.x += floor(uTime * 1.0) * 0.04;
  vec4 mvpPos = mvpMatrix * vec4(pos, 1.0);

  vUv = (mvpPos.xy / mvpPos.w) * 0.5 + 0.5;
}