const THREE = require('three');

class Trancemaker {
    constructor() {
        const iw = window.innerWidth,
            ih = window.innerHeight;
        this.spawnInterval = 10;
        this.meshTTL = 5000;
        this.fadeInterval = 300;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, iw / ih, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(iw, ih);
        this.renderer.setClearColor(0x303138);
        document.body.appendChild(this.renderer.domElement);

        const light = new THREE.SpotLight(0xffffff);
        light.position.y = -20;
        this.scene.add(light);

        this.cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
        this.colors = [0xd81b60, 0x00bcd4];
        this.meshes = [];

        this.camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera);
            this.meshes.forEach(mesh => {
                mesh.rotation.x += 0.01;
                mesh.rotation.y += 0.01;
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
            material = new THREE.MeshLambertMaterial({color}),
            cube = new THREE.Mesh(this.cubeGeometry, material);
        material.transparent = true;
        this.meshes.push(cube);
        this.scene.add(cube);

        cube.position.x += Trancemaker.random(15, true) - 7.5;
        cube.position.y += Trancemaker.random(15, true) - 7.5;
        cube.position.z += Trancemaker.random(15, true) - 15;

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
