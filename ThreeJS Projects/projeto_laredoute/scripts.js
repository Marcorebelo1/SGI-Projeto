import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";



// Inicialização do Three.js
const canvas = document.getElementById("meuCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(650, 550); //(largura, altura)
renderer.setClearColor("black"); // Cor de fundo
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
let mixer; // Mixer para animações
let actionFlag; // Ação atual da animação
let actions = []; // Lista de ações de animação (Array)

// Função para alternar imagens e o modelo 3D
function mudarImagem(elemento) {
    const imagemPrincipal = document.getElementById("imagem_principal_produto");
    const canvas3D = document.getElementById("modelo_3d");
    const buttonContainer = document.getElementById("animation_buttons"); // Contêiner dos botões
    const controlButtonsContainer = document.getElementById("control_buttons"); // Contêiner dos botões de controle

    // Verifica se a miniatura é a do 3D
    if (elemento.alt === "Ver em 3D") {
        // Esconde a imagem principal e mostra o canvas 3D
        imagemPrincipal.style.display = "none";
        canvas3D.style.display = "block";

        // Limpa o contêiner de botões antes de recriar
        buttonContainer.innerHTML = "";
        controlButtonsContainer.innerHTML = ""; // Limpa os botões de controle

        // Carrega o modelo 3D
        loader.load("/projeto_laredoute/BlenderFiles/CandeeiroAnimationsSembake.glb", (gltf) => {

            // Remove modelos anteriores
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }

            // Adiciona o novo modelo
            scene.add(gltf.scene);

            // Configura animação, se disponível
            mixer = new THREE.AnimationMixer(gltf.scene);

            // Limpa a lista de ações e cria os botões para as novas animações
            actions = [];
            gltf.animations.forEach((clip) => {
                let action = mixer.clipAction(clip);
                actions.push(action);

                // Cria botões para as animações
                createAnimationButton(clip.name, action);
            });

            // Cria os botões gerais (Play, Pause, Stop)
            createControlButtons(controlButtonsContainer);
        });
    } else {
        // Mostra a imagem principal
        canvas3D.style.display = "none";
        imagemPrincipal.style.display = "block";
        imagemPrincipal.src = elemento.src;

        // Remove os botões de animação e controle ao sair da visualização 3D
        buttonContainer.innerHTML = ""; // Limpa todos os botões de animação
        controlButtonsContainer.innerHTML = ""; // Limpa os botões de controle
    }
}



// Torna a função disponível globalmente
window.mudarImagem = mudarImagem;

// Create button for each animation
function createAnimationButton(name, action) {
    let buttonContainer = document.getElementById("animation_buttons");

    // Verifica se o botão já existe pelo seu ID único
    let buttonId = `btn_${name}`;
    let existingButton = document.getElementById(buttonId);

    if (!existingButton) {
        // Cria novo botão se ainda não existir
        let button = document.createElement('button');
        button.id = buttonId; // Define o ID único
        button.innerText = `Play ${name}`;
        button.onclick = function () {
            // Para todas as ações antes de tocar a selecionada
            actions.forEach(a => a.stop());

            // Toca a animação selecionada
            action.reset().play();
        };

        buttonContainer.appendChild(button);
    } else {
        // Atualiza o texto ou comportamento do botão existente, se necessário
        existingButton.innerText = `Play ${name}`; // Exemplo de atualização
        existingButton.onclick = function () {
            // Para todas as ações antes de tocar a selecionada
            actions.forEach(a => a.stop());

            // Toca a animação selecionada
            action.reset().play();
        };
    }
}

function createControlButtons(container) {
    // Botão Play (O objetivo é utilizar o mesmo comportamento do paused para dar play)
    let playButton = document.createElement('button');
    playButton.innerText = "Play";
    playButton.onclick = function () {
        actions.forEach(action => {
            action.paused = !action.paused; // Alterna o estado de pausa
        });
    };
    container.appendChild(playButton);

    // Botão Pause
    let pauseButton = document.createElement('button');
    pauseButton.innerText = "Pause";
    pauseButton.onclick = function () {
        actions.forEach(action => {
            action.paused = !action.paused; // Alterna o estado de pausa
        });
    };
    container.appendChild(pauseButton);

    // Botão Stop
    let stopButton = document.createElement('button');
    stopButton.innerText = "Stop";
    stopButton.onclick = function () {
        actions.forEach(action => {
            action.stop(); // Para todas as animações
        });
    };
    container.appendChild(stopButton);
}


// Função para alterar a cor do candeeiro
function alterarCor(cor) {
    console.log('Alterando cor para:', cor);

    scene.traverse((child) => {
        if (child.isMesh) {
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                        if (mat.color) {
                            mat.color.set(cor);
                            mat.needsUpdate = true;
                        }
                    });
                } else if (child.material.color) {
                    child.material.color.set(cor);
                    child.material.needsUpdate = true;
                } else {
                    console.log('Material sem cor. Criando um novo material padrão.');
                    child.material = new THREE.MeshStandardMaterial({
                        color: cor,
                        metalness: 0.5,
                        roughness: 0.5,
                    });
                    child.material.needsUpdate = true;
                }
            } else {
                console.log('Mesh encontrada sem material:', child.name);
            }
        }
    });

    console.log('Cor alterada com sucesso');
    renderer.render(scene, camera);
}


// Torne a função global
window.alterarCor = alterarCor;


// Loop de animação
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    // Atualiza animações
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}
animate();
