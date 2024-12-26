import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Create scene
let scene = new THREE.Scene();

// Enable animations
let mixer = new THREE.AnimationMixer(scene);
let actionFlag = null;

// Create camera
let camera = new THREE.PerspectiveCamera(70, 800 / 600, 0.1, 500);
camera.position.set(6, 4, 7);
camera.lookAt(0, 0, 0);

// Renderer
let canvas = document.getElementById('meuCanvas');
let renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(800, 600);
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled = true;

// OrbitControls
new OrbitControls(camera, renderer.domElement);

/*
// Grid helper
let grid = new THREE.GridHelper(10, 10);
scene.add(grid);*/

// Load the flag model and its animation
let loader = new GLTFLoader();
loader.load("/projeto_laredoute/BlenderFiles/ApliqueArticuladoPecaUnica.glb", function (gltf) {
    scene.add(gltf.scene);

    // Find the "KeyAction" animation and create an action for it
    let clip = THREE.AnimationClip.findByName(gltf.animations, 'KeyAction');
    actionFlag = mixer.clipAction(clip);
});

// Button event handlers
document.getElementById("btn_play").onclick = function () {
    if (actionFlag) {
        actionFlag.reset();
        actionFlag.play();
    }
};

document.getElementById("btn_pause").onclick = function () {
    if (actionFlag) {
        actionFlag.paused = !actionFlag.paused;
    }
};

document.getElementById("btn_stop").onclick = function () {
    if (actionFlag) {
        actionFlag.stop();
    }
};


// Light
let light = new THREE.PointLight("white", 50);
light.position.set(3, 4, 0);
scene.add(light);
light.castShadow = true;

const lightHelper = new THREE.PointLightHelper(light, 0.2);
scene.add(lightHelper);



// Luz ambiente para preencher sombras
let ambientLight = new THREE.AmbientLight("white", 0.4);  // Luz ambiente com intensidade de 0.4
scene.add(ambientLight);

// Render and animate
let clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

animate();
