const THREE = require('three'),
    twopi = 2 * Math.PI;


class Trancemaker {
    constructor() {
        const iw = window.innerWidth,
            ih = window.innerHeight,
            aspect = iw/ih;
        this.colorRotationInterval = 5000;
        this.colorFadeTime = 4000;

        this.scene = new THREE.Scene();
        const d = 3;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(iw, ih);
        this.renderer.setClearColor(0x303138);
        document.body.appendChild(this.renderer.domElement);

        const light = new THREE.PointLight(0xffffff);
        light.position.x = 15;
        light.position.y = 15;
        light.position.z = 30;
        this.scene.add(light);

        const pink = 0xd81b60,
            cyan = 0x00bcd4,
            mint =  0x33bc2f,
            yellow = 0xffff00,
            orange = 0xff8800,
            red = 0xcc0000;
        this.colors = [pink, cyan, mint, yellow, orange, red];

        this.camera.position.z = 5;
        this.camera.position.x = 15;
        this.camera.position.y = 20;

        this.camera.rotation.x = twopi / 12;
        this.camera.rotation.y = twopi / 12;
        this.camera.updateProjectionMatrix();

        //base uniforms, updated every frame with updateUniforms()
        this.uniforms = {
            delta: {type: 'f', value: 0},
            uExistingColor: {value: this.randomColor()},
            uNewColor: {value: this.randomColor()},
            lightPos: {value: new THREE.Vector3(0, 20, 0)},
            uColorFadeTime: {type: 'f', value: this.colorFadeTime},
            uColorFadeCompletion: {type: 'f', value: this.colorFadeTime},
            uResolution: {value: new THREE.Vector3(iw, ih, 1)},
            uMouse: {value: new THREE.Vector3(0, 0, 0)},
            uRandomY: {value: 0, type: 'f'},
            uRandomX: {value: 0, type: 'f'},
            uShiftYInterval: {value: 0, type: 'f'},
            uShiftXInterval: {value: 0, type: 'f'}
        };

        let nextColorChange = 0;
        /**
         * set or get a uniform
         * @param uniformName
         * @param [value]
         * @returns {*}
         */
        const uniform = (uniformName, value) => {
            if (typeof value !== 'undefined') { //set
                this.uniforms[uniformName].value = value;
            }
            else { //get
                return this.uniforms[uniformName].value;
            }
        };

        let delta = 5,
            glitchUntil = null;
        /**
         * Uniforms that update/randomize each frame
         */
        const updateUniforms = () => {
            delta += 0.01;
            uniform('delta', delta);
            const now = Date.now();
            if (now > nextColorChange) {
                uniform('uExistingColor', uniform('uNewColor'));
                uniform('uNewColor', this.randomColor());
                nextColorChange = now + this.colorRotationInterval;
            }
            let timeUntilChange = nextColorChange - now;
            uniform('uColorFadeCompletion', 1 - (timeUntilChange / this.colorFadeTime));
            uniform('uRandomY', Trancemaker.random(ih));
            uniform('uRandomX', Trancemaker.random(iw));

            //currently glitching
            if (glitchUntil > now) {
                uniform('uShiftYInterval', Trancemaker.random(50));
                uniform('uShiftXInterval', Trancemaker.random(iw));
            }
            //not glitching
            else {
                uniform('uShiftYInterval', 0);
                uniform('uShiftXInterval', 0);

                //possibly glitch next frame
                if (!Trancemaker.random(1000)) {
                    glitchUntil = now + Trancemaker.random(1000);
                }
            }

        };
        updateUniforms();

        const ray = new THREE.Raycaster();
        document.addEventListener('mousemove', e => {
            const vec = new THREE.Vector2();

            vec.set((e.clientX / iw) * 2 - 1, -(e.clientY / ih) * 2 + 1);
            ray.setFromCamera(vec, this.camera);
            const [intersect] = ray.intersectObject(this.mesh);
            uniform('uMouse', intersect.point);
        });

        const animate = () => {
            requestAnimationFrame(animate);
            updateUniforms();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
        this.spawnMesh();
    }
    randomColor() {
        return new THREE.Color(Trancemaker.random(this.colors));
    }
    static random(thing, asFloat) {
        if (Array.isArray(thing)) {
            const index = Math.floor(Math.random() * thing.length);
            return thing[index];
        }
        else if (!asFloat) {
            return Math.floor(Math.random() * thing);
        }
        else {
            return Math.random() * thing;
        }
    }
    createLowPolyGeometry() {
        const max = 30,
            geo = new THREE.Geometry(),
            vertsTable = [];

        for (let i = 0; i < max; i++) {
            vertsTable[i] = [];
            for (let j = 0; j < max; j++) {
                const vertex = new THREE.Vector3(i, j, Trancemaker.random(1, true) - 0.75),
                    index = geo.vertices.length;

                geo.vertices.push(vertex);
                vertsTable[i][j] = {vertex, index};
            }
        }

        function getVertexNumber(i, j) {
            return vertsTable[i][j].index;
        }
        for (let i = 0; i+1 < max; i++) {
            for (let j = 0; j+1 < max; j++) {
                geo.faces.push(
                    new THREE.Face3(
                        getVertexNumber(i + 1, j),
                        getVertexNumber(i, j + 1),
                        getVertexNumber(i, j)
                    ),
                    new THREE.Face3(
                        getVertexNumber(i + 1, j),
                        getVertexNumber(i + 1, j + 1),
                        getVertexNumber(i, j + 1)
                    )
                );
            }
        }
        geo.computeBoundingSphere();
        geo.computeFaceNormals();

        return geo;
    }
    spawnMesh() {
        const material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: `
                    varying vec4 vNormal;
                    varying vec3 vPos;
                    uniform float delta;

                    void main() {
                        vec3 newPos = vec3(position.xy, position.z * sin((delta * 4.0 * position.x * position.y) / 500.0));
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
                        vNormal = vec4(normal, 1.0) * viewMatrix * modelMatrix;
                        vPos = newPos;
                    }`,
                fragmentShader: `
                    uniform vec3 uExistingColor;
                    uniform vec3 uNewColor;
                    uniform float delta;
                    uniform float uColorFadeTime;
                    uniform float uColorFadeCompletion;
                    uniform vec3 uResolution;
                    uniform vec3 uMouse;
                    uniform float uRandomX;
                    uniform float uRandomY;
                    uniform float uShiftXInterval;
                    uniform float uShiftYInterval;
                    varying vec4 vNormal;
                    varying vec3 vPos;
                    
                    float fractionalRound(in float f, in float denominator) {
                        return float(f * denominator) / denominator;
                    }
                    
                    float when_between(float a, float b, float x) {
                        return sign(clamp(b - x, 0.0, 1.0)) - sign(clamp(a - x, 0.0, 1.0));
                    }
                    float when_eq(float a, float b) {
                        return 1.0 - abs(sign(a - b));
                    }
                    
                    float not(float x) {
                        return 1.0 - x;
                    }

                    void main() {
                        //time delta shifting the color a bit
                        float damper = 0.15;
                        // float norm = abs(clamp(dot(vNormal.xyz, cameraPosition), -1.0, 0.0));
                        
                        //changing colors over time bit by bit
                        //compute strength of new color
                        float changeThreshold = (vPos.x / uResolution.x) * ((uResolution.y - vPos.y) / uResolution.y);
                        float mouseDist = distance(vPos, uMouse);
                        
                        // vec3 mouseProximityNoise = mix(vec3(0.0,0.0,0.0), vec3(1.0, 1.0, 1.0), smoothstep(0.5, 1.0, mouseDist));
                        
                        vec3 c = mix(uExistingColor, uNewColor, step(0.5, uColorFadeCompletion / (length(vPos) / length(vec2(30.0, 30.0)))));
                        
                        float shiftingColor = mod(delta * uRandomY, 3.0);
                        float colorShiftEnabled = when_between(uRandomY - uShiftYInterval, uRandomY, gl_FragCoord.y) *
                            when_between(uRandomX - uShiftXInterval, uRandomX, gl_FragCoord.x);
                        vec3 cChange = colorShiftEnabled * vec3(c.x * not(when_between(0.0, 1.0, shiftingColor)),
                            c.y * not(when_between(1.0, 2.0, shiftingColor)),
                            c.z * not(when_between(2.0, 3.0, shiftingColor))
                        );
                        vec3 deltaOffset = not(colorShiftEnabled) * abs(vec3(sin(delta * vNormal.x) * damper, sin(delta * vNormal.y) * damper, sin(delta * vNormal.z) * damper));
                        
                        gl_FragColor = vec4((c - cChange) - deltaOffset, 1.0);
                    }`
            }),
            mesh = new THREE.Mesh(this.createLowPolyGeometry(), material);
        this.mesh = mesh;
        this.scene.add(mesh);
    }
}

module.exports = Trancemaker;
