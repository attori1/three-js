import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { sceneConfig } from './assets.js';
import { setupLumieres, setupLumieresArcade } from './lumiere.js';

// ─── BASE SETUP ────────────────────────────────────────────────────────────────

// FIX: était '.webgl' mais le canvas a id="canvas"
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

// FIX: controls.enabled était false → scène figée, non interactive
const controls = new OrbitControls(camera, canvas);
controls.enabled = true;
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 6;
controls.minAzimuthAngle = -Math.PI / 4;
controls.maxAzimuthAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 0, 0);

// ─── LUMIÈRES ──────────────────────────────────────────────────────────────────

// FIX: setupLumieresArcade était appelé dans le forEach pour chaque modèle
//      hasSpecialLight → lumières dupliquées x15. Appelées une seule fois ici.
setupLumieres(scene);
setupLumieresArcade(scene);

// ─── LOADERS ───────────────────────────────────────────────────────────────────

// FIX: LoadingManager connecté à l'UI (barre restait bloquée à 0%)
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

// FIX: chemins d'import → three/addons/ au lieu de three/examples/jsm/
const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

// ─── CHARGEMENT DES MODÈLES ────────────────────────────────────────────────────

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
        // FIX: callback d'erreur pour voir les 404 en console
        (err) => console.error(`Erreur modèle "${item.name}" :`, err)
    );
});

// ─── RESIZE ────────────────────────────────────────────────────────────────────

// FIX: resize.js importait depuis 'express/lib/response' → crash Vite immédiat.
//      Le resize est géré directement ici.
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ─── BOUCLE D'ANIMATION ────────────────────────────────────────────────────────

const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

animate();