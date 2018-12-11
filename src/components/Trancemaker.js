const THREE = require('three'),
    twopi = 2 * Math.PI;
function getGLSL(name) {
    return document.querySelector(`script#${name}`).textContent;
}
/**
 * Helper class to scale numbers to 60fps so even at faster framerates animations don't speed up
 */
class FrameScaler {
    constructor() {
        this.tick();
        this._frameTimeBase = 1000 / 60;
    }
    tick() {
        const now = Date.now();
        this._lastFrameTime = now - this._lastTick;
        this._lastTick = now;
    }

    /**
     * For making things smaller based on frame time, like deltas, so things don't change too much
     * @returns {number}
     */
    frameTimeScaler() {
        return this._lastFrameTime / this._frameTimeBase;
    }

    /**
     * For making things bigger based on frame time, like random chance, so rare things don't happen too often
     */
    frameTimeScalerInverse() {
        return 1 / this.frameTimeScaler();
    }
}

class Trancemaker {
    constructor() {
        this.fs = new FrameScaler();

        let iw = window.innerWidth,
            ih = window.innerHeight,
            aspect = iw/ih;
        //how often the color is randomized
        this.colorRotationInterval = 60 * 1000;
        //how quickly it takes to transition the full screen to the new color
        this.colorFadeTime = 2000;

        this.scene = new THREE.Scene();
        const d = 3;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(iw, ih);
        const backgroundColor = 0x272c38;
        this.renderer.setClearColor(backgroundColor);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            iw = window.innerWidth;
            ih = window.innerHeight;
            aspect = iw/ih;
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(iw, ih);

            uniform('uResolution', new THREE.Vector3(iw, ih, 1));
            uniform('uAspectRatio', aspect);
        });

        const light = new THREE.PointLight(0xffffff);
        light.position.x = 15;
        light.position.y = 15;
        light.position.z = 30;
        this.scene.add(light);

        //cool colors to use
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

        //base uniforms, updated every frame with updateUniforms(), anything dynamic should be changed there
        this.uniforms = {
            delta: {type: 'f', value: 0},
            uExistingColor: {value: this.randomColor()},
            uNewColor: {value: this.randomColor()},
            uBackgroundColor: {value: new THREE.Color(backgroundColor)},
            //color changing
            uColorFadeCompletion: {type: 'f', value: this.colorFadeTime},
            uResolution: {value: new THREE.Vector3(iw, ih, 1)},
            uAspectRatio: {value: aspect, type: 'f'},
            uMouse: {value: new THREE.Vector3(0, 0, 0)},
            //random geometric shapes
            uDisplayGeometry: {value: 0, type: 'f'}
        };

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

        //delta is an ever increasing number that things changing over time is based on
        let delta = 5,
            //time that we will switch colors
            nextColorChange = 0,
            //timestamp of when we should stop showing glitch effects
            glitchUntil = null;
        /**
         * Uniforms that update/randomize each frame
         */
        const updateUniforms = () => {
            this.fs.tick();
            const frameScale = this.fs.frameTimeScaler();
            delta += 0.01 * frameScale;
            uniform('delta', delta);

            const now = Date.now();
            if (now > nextColorChange) {
                uniform('uExistingColor', uniform('uNewColor'));
                uniform('uNewColor', this.randomColor());
                nextColorChange = now + this.colorRotationInterval;
            }

            let timeUntilChange = nextColorChange - now;
            uniform('uColorFadeCompletion', 1 - (timeUntilChange / this.colorFadeTime));

            //currently glitching
            if (glitchUntil > now) {
                uniform('uDisplayGeometry', 1);
            }
            //not glitching
            else {
                uniform('uDisplayGeometry', 0);
                //possibly glitch next frame
                if (!Trancemaker.random(100 * this.fs.frameTimeScalerInverse())) {
                    glitchUntil = now + Trancemaker.random(1000);
                }
            }

        };
        updateUniforms();

        //currently unused, to be used with shader effects that react to mouse position
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

    /**
     * Get a random integer/float or element from an array.
     * @param thing - either an array to chose randomly from, or a maximum number
     * @param asFloat - if random numbers should include floating points
     * @returns {*}
     */
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
    /**
     * Creates a large mesh geometry, a plane made of tons of tiny triangles.
     * @returns {THREE.Geometry}
     */
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
        const snoise = getGLSL('snoise');
        const material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: getGLSL('tm-vert'),
                fragmentShader: getGLSL('tm-frag').replace('//[include snoise]', snoise)
            }),
            mesh = new THREE.Mesh(this.createLowPolyGeometry(), material);
        this.mesh = mesh;
        this.scene.add(mesh);
    }
}

module.exports = Trancemaker;
