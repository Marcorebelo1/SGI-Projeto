import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Inicialização do Three.js
const textureLoader = new THREE.TextureLoader();
const canvas = document.getElementById("meuCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(450, 450); //(largura, altura)
renderer.setClearColor("white"); // Cor de fundo
renderer.shadowMap.enabled = true; // Ativa sombras

// Cena
const scene = new THREE.Scene();

// Câmera
const camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 0.1, 500);
camera.position.set(2, 4, 13);
camera.lookAt(0, 0, 0);
scene.add(camera);

// Luzes
const light = new THREE.PointLight("white", 1);
light.position.set(3, 4, 0);
scene.add(light);

const ambientLight = new THREE.AmbientLight("white", 0.4);
scene.add(ambientLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// GLTFLoader para carregar modelos 3D
const loader = new GLTFLoader();
let selectedPart = null; // This will store the name of the selected part

let gltfModel = null; // Global variable for the GLTF model
let mixer = null; // Mixer for animations
let actions = []; // Array of animation actions

// Função para alternar imagens e o modelo 3D
function mudarImagem(elemento) {
    const imagemPrincipal = document.getElementById("imagem_principal_produto");
    const canvas3D = document.getElementById("modelo_3d");
    const buttonContainer = document.getElementById("animation_buttons");
    const controlButtonsContainer = document.getElementById("control_buttons");

    if (elemento.alt === "Ver em 3D") {
        imagemPrincipal.style.display = "none";
        canvas3D.style.display = "block";
        buttonContainer.innerHTML = "";
        controlButtonsContainer.innerHTML = "";

        loader.load("/projeto_laredoute/BlenderFiles/CandeeiroAnimationsSembake.glb", (gltf) => {
            // Remove previous models´
            removeCurrentModel();
            gltfModel = gltf;
            // while (scene.children.length > 0) {



            //}

            // Store the loaded model globally


            // Add the new model to the scene
            scene.add(gltf.scene);

            // Set up animations
            mixer = new THREE.AnimationMixer(gltf.scene);
            actions = [];
            gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                actions.push(action);
                createAnimationButton(clip.name, action);
            });

            createControlButtons(controlButtonsContainer);
        });
    } else {
        canvas3D.style.display = "none";
        imagemPrincipal.style.display = "block";
        imagemPrincipal.src = elemento.src;
        buttonContainer.innerHTML = "";
        controlButtonsContainer.innerHTML = "";
    }
}
// Function to remove the current model from the scene
function removeCurrentModel() {
    if (gltfModel && gltfModel.scene) {
        gltfModel.scene.traverse((child) => {
            if (child.isMesh) {
                // Dispose of geometries
                if (child.geometry) child.geometry.dispose();

                // Dispose of materials
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });

        // Remove the model from the scene
        scene.remove(gltfModel.scene);

        // Clear references to the model
        gltfModel = null;
    }
}
function removeTexture() {
    if (gltfModel && gltfModel.scene) {
        gltfModel.scene.traverse((child) => {
            if (child.isMesh && (!selectedPart || child.name === selectedPart)) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                        mat.map = null; // Remove texture
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.map = null; // Remove texture
                    child.material.needsUpdate = true;
                }
            }
        });

        renderer.render(scene, camera); // Update the renderer
    } else {
        console.warn("Model not loaded or part not found.");
    }
}

function selectPart(partName) {
    selectedPart = partName;
    console.log("Selected part:", selectedPart);
}
// Function to change color
function changeColor(color) {
    if (gltfModel && gltfModel.scene) {
        gltfModel.scene.traverse((child) => {
            if (child.isMesh && (!selectedPart || child.name === selectedPart)) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                        mat.color.set(color);
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.color.set(color);
                    child.material.needsUpdate = true;
                }
            }
        });
        renderer.render(scene, camera); // Update the renderer
    } else {
        console.warn("Model not loaded yet or part not found.");
    }
}
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".cor").forEach((span) => {
        span.addEventListener("click", function () {
            console.log("Span clicked:", this.id);
        });
    });
});
document.getElementById("removeTexture").onclick = function () {
    removeTexture(); // Calls the function to remove the texture
};
document.getElementById("colorGold").onclick = function () {

    changeColor('gold'); // Calls the function when clicked


};

document.getElementById("colorWhite").onclick = function () {
    changeColor('white'); // Calls the function when clicked
};

document.getElementById("colorBlack").onclick = function () {
    changeColor('black'); // Calls the function when clicked
};
// Attach changeColor to buttons
document.getElementById("selectCone").onclick = function () {
    selectedPart = 'ArmToAbajurJoint'; // Replace with the actual name of the cone in your GLB file
    console.log("Selected part: Cone (Abajur)");
};

document.getElementById("selectRest").onclick = function () {
    selectedPart = null; // Reset selected part to indicate "rest of the model"
    console.log("Selected part: Rest of the model");
};
document.getElementById("textureWood").onclick = function () {
    changeTexture("/projeto_laredoute/BlenderFiles/wood.jpg");

};

// Torna a função disponível globalmente
window.mudarImagem = mudarImagem;
function changeTexture(texturePath) {
    if (gltfModel && gltfModel.scene) {
        const texture = textureLoader.load(texturePath, () => {
            console.log(`Texture ${texturePath} loaded successfully.`);
            renderer.render(scene, camera); // Update renderer after loading
        });

        gltfModel.scene.traverse((child) => {
            if (child.isMesh && (!selectedPart || child.name === selectedPart)) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                        mat.map = texture;
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            }
        });
    } else {
        console.warn("Model not loaded or part not found.");
    }
}


// Create button for each animation
function createAnimationButton(name, action) {
    const buttonContainer = document.getElementById("animation_buttons");
    const buttonId = `btn_${name}`;
    let existingButton = document.getElementById(buttonId);

    if (!existingButton) {
        const button = document.createElement("button");
        button.id = buttonId;
        button.innerText = `Play ${name}`;
        button.onclick = function () {
            actions.forEach((a) => a.stop());
            action.reset().play();
        };

        buttonContainer.appendChild(button);
    }
}

function createControlButtons(container) {
    const playButton = document.createElement("button");
    playButton.innerText = "Play";
    playButton.onclick = function () {
        actions.forEach((action) => {
            action.paused = !action.paused;
        });
    };
    container.appendChild(playButton);

    const pauseButton = document.createElement("button");
    pauseButton.innerText = "Pause";
    pauseButton.onclick = function () {
        actions.forEach((action) => {
            action.paused = !action.paused;
        });
    };
    container.appendChild(pauseButton);

    const stopButton = document.createElement("button");
    stopButton.innerText = "Stop";
    stopButton.onclick = function () {
        actions.forEach((action) => action.stop());
    };
    container.appendChild(stopButton);
}

// Função para alterar a cor do candeeiro
function alterarCor(cor) {
    if (gltfModel && gltfModel.scene) {
        gltfModel.scene.traverse((child) => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                        mat.color.set(cor);
                        mat.needsUpdate = true;
                    });
                } else if (child.material.color) {
                    child.material.color.set(cor);
                    child.material.needsUpdate = true;
                } else {
                    child.material = new THREE.MeshStandardMaterial({
                        color: cor,
                        metalness: 0.5,
                        roughness: 0.5,
                    });
                    child.material.needsUpdate = true;
                }
            }
        });

        renderer.render(scene, camera); // Update the renderer
    } else {
        console.warn("Model not loaded yet.");
    }
}



// Torne a função global
window.alterarCor = alterarCor;

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }
    renderer.render(scene, camera);
}
animate();

