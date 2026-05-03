import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sceneConfig } from './assets.js';
import { setupLumieres, setupLumieresArcade } from './lumiere.js';
import { setupMurs } from './mur.js'; 
import { setupMarche } from './marche.js';

const canvas = document.querySelector('#canvas');

const scene = new THREE.Scene();
const interactableObjects = [];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 6;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 0, 0);

const murs = setupMurs({ xMin: -14, xMax: 6, zMin: -2, zMax: 7 });
const marche = setupMarche(camera, { vitesse: 0.1, hauteur: 1.3, sensibilite: 0.002 });

setupLumieres(scene);
setupLumieresArcade(scene);

const manager = new THREE.LoadingManager(
    () => {
        const loaderScreen = document.getElementById('loader-screen');
        if (loaderScreen) loaderScreen.style.display = 'none';
    },
    (url, loaded, total) => {
        const pct     = Math.round((loaded / total) * 100);
        const bar     = document.getElementById('loader-bar');
        const percent = document.getElementById('loader-percent');
        const status  = document.getElementById('loader-status');
        if (bar)     bar.style.width   = pct + '%';
        if (percent) percent.textContent = pct + '%';
        if (status)  status.textContent  = `Chargement : ${url.split('/').pop()}`;
    },
    (url) => console.error(`Erreur asset : ${url}`)
);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

sceneConfig.models.forEach(item => {
    gltfLoader.load(
        item.path,
        (gltf) => {
            const model = gltf.scene;

            model.traverse((child) => {
                if (item.ignoreEmbeddedLights && child.isLight) {
                    child.visible = false;
                }
                if (child.isMesh && item.intensity !== undefined) {
                    if (child.material) {
                        child.material.emissiveIntensity = item.intensity;
                    }
                }
            });

            model.position.set(...item.pos);
            model.scale.set(...item.scale);
            model.rotation.y = item.rotY || 0;

            if (item.interact) {
                model.userData.isInteractable = true;
                model.userData.name = item.name;
                interactableObjects.push(model);
            }

            scene.add(model);
        },
        undefined,
        (err) => console.error(`Erreur modèle "${item.name}" :`, err)
    );
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const animate = () => {
    requestAnimationFrame(animate);
    marche.update();
    murs.checkCollision(camera);
    renderer.render(scene, camera);
};

animate();