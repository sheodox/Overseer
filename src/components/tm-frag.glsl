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
        vec2(0.5, 0.5),
        square_aspect(gl_FragCoord.xy / uResolution.xy)
    );
}

float get_radial_shade() {
    float gradient_min = 0.1;
    float gradient_max = 1.;

    float dist = distance_from_center();
    //the amount of mixing within the gradient space
    return smoothstep(gradient_min, gradient_max, dist);
//    float inGradient = step(gradient_min, dist);
//    return inGradient * ((dist - gradient_min) / (gradient_max - gradient_min));
}

float is_in_geometry() {
    //sometimes show random geometry
//    vec2 midpoint = uResolution.xy * 0/**/.5;
    float ringDistance = distance_from_center();
    float onRing = when_between(0.2, 0.25, ringDistance);
    return onRing;
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
