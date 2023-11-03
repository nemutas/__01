precision mediump float;

uniform sampler2D t01;
uniform sampler2D tText;
uniform vec2 uCoveredScale;

varying vec2 vUv;

void main() {
  vec3 color = vec3(0.15);

  vec2 uv = gl_PointCoord;
  uv.x *= 0.5;
  vec3 zero = texture2D(t01, uv).rgb;
  color *= zero;

  vec2 screenUv = (vUv - 0.5) * uCoveredScale + 0.5;
  vec3 text = texture2D(tText, screenUv).rgb;
  float t = dot(vec3(1), text);

  if (0.1 < t) {
    uv.x += 0.5;
    vec3 one = texture2D(t01, uv).rgb;
    vec3 green = vec3(0.27, 0.94, 0.00);
    color = mix(color, green, one.r);
  }

  gl_FragColor = vec4(color, 1);
}