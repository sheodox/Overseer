uniform vec3 uExistingColor;
uniform vec3 uNewColor;
uniform float delta;
uniform float uColorFadeCompletion;
uniform vec3 uBackgroundColor;
uniform vec3 uResolution;
uniform float uAspectRatio;
uniform vec3 uMouse;
uniform float uDisplayGeometry;
varying vec4 vNormal;
varying vec3 vPos;
const vec2 geometryCenter = vec2(0.5, 0.9);
const vec2 geometryCenterST = 2. * geometryCenter - 1.;

float when_between(float a, float b, float x) {
    return sign(clamp(b - x, 0.0, 1.0)) - sign(clamp(a - x, 0.0, 1.0));
}
float when_eq(float a, float b) {
    return 1.0 - abs(sign(a - b));
}

float not(float x) {
    return 1.0 - x;
}

float random(vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233))) * 43758.5453123);
}

//chose between two vectors based on a boolean as a float
vec3 choose(vec3 ifFalse, vec3 ifTrue, float f_boolean) {
    return not(f_boolean) * ifFalse + f_boolean * ifTrue;
}

vec2 square_aspect(vec2 v) {
    return vec2(0.5 - (0.5 - v.x) * uAspectRatio, v.y);
}
vec3 inverse_color(vec3 c) {
    return vec3(1. - c.r, 1. - c.g, 1. - c.b);
}

float distance_from_center() {
    return distance(
        geometryCenter,
        square_aspect(gl_FragCoord.xy / uResolution.xy)
    );
}

float get_radial_shade() {
    float gradient_min = 0.1;
    float gradient_max = 1.;

    float dist = distance_from_center();
    //the amount of mixing within the gradient space
    return smoothstep(gradient_min, gradient_max, dist);
}

float get_sided_shape(vec2 center, int sides, float size, float angle) {
    float a = atan(center.x, center.y) + angle;
    float b = 6.28319/float(sides);
    return step(size, cos(floor(.5+a/b)*b-a)*length(center.xy));
}

vec2 get_shape_center_pos(vec2 st, float angle, float dist) {
    return vec2(st.x + sin(angle) * dist, st.y + cos(angle) * dist) - geometryCenterST;
}

float get_triangle(vec2 st, float angle) {
    float tDist = 0.7;
    float tSize = 0.1;
    return 1. - get_sided_shape(get_shape_center_pos(st, angle, tDist), 3, tSize, -1. * angle);
}
float get_inset_triangle(vec2 st, float angle) {
    float tDist = 0.2;
    float tSize = 0.05;
    angle - 3.14159;
    return 1. - get_sided_shape(get_shape_center_pos(st, angle, tDist), 3, tSize, -1. * angle);
}

float is_in_geometry() {
    //sometimes show random geometry
//    vec2 midpoint = uResolution.xy * 0/**/.5;
    float ringDistance = distance_from_center();
    vec2 st = 2. * square_aspect(gl_FragCoord.xy / uResolution.xy) - 1.;

    float ring = when_between(0.2, 0.22, ringDistance);
    float triangleBaseAngle = delta;
    float insetTriangleBaseAngle = -2. * delta;
    
    //far away outwards pointed triangles
    float tri1 = get_triangle(st, triangleBaseAngle);
    float tri2 = get_triangle(st, triangleBaseAngle + (6.28319 * 2./3.));
    float tri3 = get_triangle(st, triangleBaseAngle + (6.28319 * 1./3.));
    //triangles inside the ring
    float triMax = 4.;
    float in_tri1 = get_inset_triangle(st, insetTriangleBaseAngle);
    float in_tri2 = get_inset_triangle(st, insetTriangleBaseAngle + (6.28319 * 1./triMax));
    float in_tri3 = get_inset_triangle(st, insetTriangleBaseAngle + (6.28319 * 2./triMax));
    float in_tri4 = get_inset_triangle(st, insetTriangleBaseAngle + (6.28319 * 3./triMax));

    return step(0.5,
        ring + tri1 + tri2 + tri3 + in_tri1 + in_tri2 + in_tri3 + in_tri4
    );
}

//[include snoise]

void main() {
    float fragY = gl_FragCoord.y;
    float fragX = gl_FragCoord.x;

    float checkerSize = 50.0;
    float checkerY = floor(fragY / checkerSize);
    float checkerX = floor(fragX / checkerSize);

    //changing colors over time bit by bit
    //compute strength of new color
    float changeThreshold = (checkerX / uResolution.x) * ((uResolution.y - checkerY) / uResolution.y);

    //color changed computed between the existing/new colors
    vec2 checkerVec2 = vec2(checkerX, checkerY);
    vec3 c = mix(uExistingColor, uNewColor,
        //step based on the progression through the color change completion compared how far across the screen the location is
        step(0.5, uColorFadeCompletion / (length(checkerVec2) / length(vec2(30.0, 30.0))) - 0.15 * snoise(checkerVec2))
    );

    float radialShading = get_radial_shade();

    //time delta shifting the color a bit
    float damper = 0.15;
    //fake shading based on delta and the normal
    vec3 normalColorChange = abs(vec3(sin(delta * vNormal.x) * damper, sin(delta * vNormal.y) * damper, sin(delta * vNormal.z) * damper));
    vec3 colorWithNormal = c - normalColorChange;

    //sometimes color shift some noisy texture
    float inGeometry = is_in_geometry();
    vec3 geometryColor = vec3(1., 1., 1.);

    gl_FragColor = vec4(choose(
        mix(
            colorWithNormal,
            uBackgroundColor, //colorWithNormal - (1. - radialShading) * uBackgroundColor,
            radialShading
        ),
        geometryColor,
        inGeometry
    ), 1.0);

}
