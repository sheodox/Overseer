const React = require('react'),
    THREE = require('three'),
    FrameScaler = require('./FrameScaler'),
    {Link} = require('react-router-dom'),
    SVG = require('./SVG');

function getGLSL(name) {
    return document.querySelector(`script#${name}`).textContent;
}
class LoadingRenderer {
    constructor() {
        this.fs = new FrameScaler();
        //cool colors to use
        const pink = 0xd81b60,
            cyan = 0x00bcd4,
            mint =  0x33bc2f,
            yellow = 0xffff00,
            orange = 0xff8800,
            red = 0xcc0000;
        this.colors = {pink, cyan, mint, yellow, orange, red};
        //base uniforms, updated every frame with updateUniforms(), anything dynamic should be changed there
        this.uniforms = {
            delta: {type: 'f', value: 0},
            uResolution: {value: new THREE.Vector2(160, 160)},
            uBackgroundColor: {value: new THREE.Color(0x1a1e26)}
        };
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        // const d = 3;
        // this.camera = new THREE.OrthographicCamera(-d, d, d, -d, 0.1, 1000);
        this.camera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
        this.camera.position.y = 1;
        this.camera.position.x = 1;
        this.camera.position.z = 1;
        this.camera.updateProjectionMatrix();
        this.scene.add(this.camera);
        this.spawnMesh();

        //delta is an ever increasing number that things changing over time is based on
        this.delta = 5;
    }
    showAnimation(container) {
        if (!container) {
            return;
        }
        this.container = container;
        this.renderer.setSize(160, 160);

        // const backgroundColor = 0x272c38;
        // this.renderer.setClearColor(backgroundColor);
        this.container.appendChild(this.renderer.domElement);

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
        /**
         * Uniforms that update/randomize each frame
         */
        const updateUniforms = () => {
            this.fs.tick();
            const frameScale = this.fs.frameTimeScaler();
            this.delta += 0.01 * frameScale;
            uniform('delta', this.delta);
        };
        updateUniforms();

        const animate = () => {
            this.animFrameId = requestAnimationFrame(animate);
            updateUniforms();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
    stopAnimation() {
        cancelAnimationFrame(this.animFrameId);
    }
    spawnMesh() {
        const geo = new THREE.PlaneGeometry(100, 100, 1),
            mat = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: `
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
                }`,
                fragmentShader: getGLSL('loading-frag')
            });
        this.scene.add(new THREE.Mesh(geo, mat));
    }
}
const renderer = new LoadingRenderer();
class Loading extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillUnmount() {
        renderer.stopAnimation();
    }
    render() {
        if (this.props.renderWhen === false) {
            return null;
        }
        return (
            <div className="loading-indicator" ref={c => {renderer.showAnimation(c)}}/>
        );
    }
}

module.exports = Loading;
