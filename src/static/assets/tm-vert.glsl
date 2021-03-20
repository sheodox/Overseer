varying vec4 vNormal;
varying vec3 vPos;
uniform float delta;

void main() {
    vec3 newPos = vec3(position.xy, position.z * sin((delta * 4.0 * position.x * position.y) / 500.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    vNormal = vec4(normal, 1.0) * viewMatrix * modelMatrix;
    vPos = newPos;
}
