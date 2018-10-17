uniform vec3 uExistingColor;
uniform vec3 uNewColor;
uniform float delta;
uniform float uColorFadeCompletion;
uniform vec3 uResolution;
uniform vec3 uMouse;
uniform float uRandomX;
uniform float uRandomY;
uniform float uShiftXInterval;
uniform float uShiftYInterval;
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

bool round_to_bool(float f) {
    return f > 0.5;
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
        //step based on the progression th rough the color change completion compared how far across the plane the location is
        step(0.5, uColorFadeCompletion / (length(checkerVec2) / length(vec2(30.0, 30.0))) - 0.15 * snoise(checkerVec2))
    );

    //a number to figure out which one of the three color channels to black out
    float shiftingColor = mod(delta * uRandomY, 3.0);
    //if the fragment is within the random coordinates, mess with the rgb
    float colorShiftEnabled = when_between(uRandomY - uShiftYInterval, uRandomY, fragY) *
        when_between(uRandomX - uShiftXInterval, uRandomX, fragX);
    //blank out one of the color channels for the rgb glitch, randomized
    vec3 rgbShift = colorShiftEnabled * vec3(c.x * not(when_between(0.0, 1.0, shiftingColor)),
        c.y * not(when_between(1.0, 2.0, shiftingColor)),
        c.z * not(when_between(2.0, 3.0, shiftingColor))
    );

    //time delta shifting the color a bit
    float damper = 0.15;
    //fake shading based on delta and the normal
    vec3 normalColorChange = not(colorShiftEnabled) * abs(vec3(sin(delta * vNormal.x) * damper, sin(delta * vNormal.y) * damper, sin(delta * vNormal.z) * damper));

    gl_FragColor = vec4((c - rgbShift) - normalColorChange, 1.0);
}
