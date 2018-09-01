const THREE = require('three');

class Trancemaker {
    constructor() {
        const iw = window.innerWidth,
            ih = window.innerHeight;
        this.spawnInterval = 5;
        this.meshTTL = 1000;
        this.fadeInterval = 300;
        this.colorRotationInterval = 5000;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, iw / ih, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(iw, ih);
        this.renderer.setClearColor(0x303138);
        document.body.appendChild(this.renderer.domElement);

        const light = new THREE.PointLight(0xffffff);
        // light.position.y = -20;
        this.scene.add(light);

        this.cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
        const pink = 0xd81b60,
            cyan = 0x00bcd4,
            mint =  0x00ff48,
            yellow = 0xffff00,
            orange = 0xff8800,
            red = 0xff0000;
        const colorSets = [
            [pink, cyan],
            [mint, cyan],
            [mint, yellow],
            [yellow, orange],
            [red, pink]
        ];
        const rotateColor = () => {
            this.colors = Trancemaker.random(colorSets);
        };
        setInterval(rotateColor, this.colorRotationInterval);
        rotateColor();

        this.meshes = [];

        this.camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera);
            this.meshes.forEach(mesh => {
                mesh.rotation.x += mesh.xRotationFactor;
                mesh.rotation.y += mesh.yRotationFactor;
            });
        };
        animate();
        setInterval(this.spawnMesh.bind(this), this.spawnInterval);
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
    spawnMesh() {
        const color = Trancemaker.random(this.colors),
            material = new THREE.MeshBasicMaterial({color}),
            cube = new THREE.Mesh(this.cubeGeometry, material);
        material.transparent = true;
        this.meshes.push(cube);
        this.scene.add(cube);

        cube.position.set(
            Trancemaker.random(15, true) - 7.5,
            Trancemaker.random(15, true) - 7.5,
            Trancemaker.random(15, true) - 15
        );

        function randomRotation() {
            const rotationFactorMax = 0.02;
            return Trancemaker.random(rotationFactorMax * 2, true) - rotationFactorMax;
        }
        cube.xRotationFactor = randomRotation();
        cube.yRotationFactor = randomRotation();

        material.opacity = 0.5;
        setTimeout(() => {
            material.opacity = 1;
        }, this.fadeInterval);

        setTimeout(() => {
            material.opacity = 0.5;

            setTimeout(() => {
                this.meshes.splice(this.meshes.indexOf(cube), 1);
                this.scene.remove(cube);
            }, this.fadeInterval);
        }, this.meshTTL - this.fadeInterval);
    }
}

module.exports = Trancemaker;
