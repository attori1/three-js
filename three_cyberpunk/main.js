import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import resize from './resize.js';

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
