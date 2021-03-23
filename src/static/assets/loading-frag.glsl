uniform float delta;
uniform vec2 uResolution;
uniform vec3 uBackgroundColor;
const vec2 geometryCenter = vec2(0.5, 0.5);
const vec2 geometryCenterST = 2. * geometryCenter - 1.;

float not(float x) {
    return 1.0 - x;
}
float when_between(float a, float b, float x) {
    return sign(clamp(b - x, 0.0, 1.0)) - sign(clamp(a - x, 0.0, 1.0));
}
float get_sided_shape(vec2 center, int sides, float size, float angle) {
    float a = atan(center.x, center.y) + angle;
    float b = 6.28319/float(sides);
    return step(size, cos(floor(.5+a/b)*b-a)*length(center.xy));
}
vec2 get_shape_center_pos(vec2 st, float angle, float dist) {
    return vec2(st.x + sin(angle) * dist, st.y + cos(angle) * dist) - geometryCenterST;
}

float distance_from_center() {
    return distance(
        geometryCenter,
        (gl_FragCoord.xy / uResolution.xy)
    );
}

float get_triangle(vec2 st, float angle) {
    float tDist = 0.4;
    float tSize = 0.1;
    return 1. - get_sided_shape(get_shape_center_pos(st, angle, tDist), 3, tSize, -1. * angle);
}

void main() {
    float ringDistance = distance_from_center();
    vec2 st = 2. * (gl_FragCoord.xy / uResolution.xy) - 1.;

    float ring = when_between(0.2, 0.22, ringDistance);
    float triangleBaseAngle = delta * 10.;
    
    //far away outwards pointed triangles
    float tri1 = get_triangle(st, triangleBaseAngle);
    float tri2 = get_triangle(st, triangleBaseAngle + (6.28319 * 2./3.));
    float tri3 = get_triangle(st, triangleBaseAngle + (6.28319 * 1./3.));
    
    float inGeo = step(0.5,
        tri1 + tri2 + tri3);
    gl_FragColor = vec4(inGeo * vec3(1., 1., 1.) + not(inGeo) * uBackgroundColor, 1.);
}
