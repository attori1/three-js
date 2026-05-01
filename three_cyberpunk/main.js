import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import resize from './resize.js';
import { setupLumieres, setupLumieresArcade } from './lumiere.js';
import { sceneConfig } from './assets.js'; 
import { setupArcade } from './objets/decor.js';
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 3;

const controls = new OrbitControls(camera, canvas);
controls.minDistance = 2;
controls.maxDistance = 6;
controls.minAzimuthAngle = -Math.PI / 4; 
controls.maxAzimuthAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2; 
controls.target.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

resize(canvas, camera, renderer);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const controls = new OrbitControls(camera, canvas);
controls.enabled = false; 

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

sceneConfig.models.forEach(item => {
    gltfLoader.load(item.path, (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
            if (item.ignoreEmbeddedLights && child.isLight) child.visible = false;
            if (child.isMesh && item.intensity !== undefined) {
                if (child.material) child.material.emissiveIntensity = item.intensity;
            }
        });

        model.position.set(...item.pos);
        model.scale.set(...item.scale);
        model.rotation.y = item.rotY || 0;
        
        scene.add(model);
    });
});

const animate = () => {
    requestAnimationFrame(animate);
    
    controls.update(); 
    
    renderer.render(scene, camera);
};

animate();