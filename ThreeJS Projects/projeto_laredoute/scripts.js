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
let selectedPart = null; // Pate selecionada ppelo user

let gltfModel = null; // modelo gltf
let mixer = null; // mixer das animações
let actions = []; // vetor de animações

// Função para alternar imagens e o modelo 3D
function mudarImagem(elemento) {
    const imagemPrincipal = document.getElementById("imagem_principal_produto");
    const canvas3D = document.getElementById("modelo_3d");
    const buttonContainer = document.getElementById("animation_buttons");
    const controlButtonsContainer = document.getElementById("control_buttons");

    if (elemento.alt === "Ver em 3D") {

        alert(
            "Bem-vindo à secção 3D do Aplique Articulado!\n\n" +
            "Aqui estão as funcionalidades disponíveis:\n" +
            "1. Pode mudar a textura do aplique utilizando os botões de 'Textura Madeira' ou 'Remover Madeira'.\n" +
            "2. Pode alterar a cor do aplique selecionando uma das opções disponíveis e escolher a parte que prentede trocar a cor ('Selecionar Suporte', 'Selecionar Tudo').\n" +
            "3. Clique nos botões de animação para iniciar diferentes animações para ver os diferentes movimentos do Aplique (e.x., 'Play SupportJointAnimation').\n" +
            "4. Use os botões 'Play', 'Pause' e 'Stop' para controlar as animações.\n" +
            "Explore todas as funcionalidades e ajusta o Aplique ao seu gosto!"
        );

        imagemPrincipal.style.display = "none";
        canvas3D.style.display = "block";
        buttonContainer.innerHTML = "";
        controlButtonsContainer.innerHTML = "";

        loader.load("/projeto_laredoute/BlenderFiles/Animacoes.glb", (gltf) => {
            // Remover modelos
            removeCurrentModel();
            gltfModel = gltf;



            // adicionar novo modelo
            scene.add(gltf.scene);

            // animações
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

// remover modelo da cena
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


        scene.remove(gltfModel.scene);


        gltfModel = null;
    }
}
function removeTexture() {
    if (gltfModel && gltfModel.scene) {
        gltfModel.scene.traverse((child) => {
            if (child.isMesh && (!selectedPart || child.name === selectedPart)) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                        mat.map = null; // remover textura
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.map = null; // Remover textura
                    child.material.needsUpdate = true;
                }
            }
        });

        renderer.render(scene, camera);
    } else {
        console.warn("Model not loaded or part not found.");
    }
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
    removeTexture();
};
document.getElementById("colorGold").onclick = function () {

    changeColor('gold'); // chamar funcao


};

document.getElementById("colorWhite").onclick = function () {
    changeColor('white');
};

document.getElementById("colorBlack").onclick = function () {
    changeColor('black');
};

document.getElementById("selectCone").onclick = function () {
    selectedPart = 'ArmToAbajurJoint'; // muda selected part
    console.log("Selected part: Cone (Abajur)");
};

document.getElementById("selectRest").onclick = function () {
    selectedPart = null; // selected part = null (todo o modelo)
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


// Botão para cada animação
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
//cria botoes de controlo
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

