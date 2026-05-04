// =============================================================================
// main.js — Point d'entrée de l'application
// =============================================================================
//
// CE FICHIER fait trois choses dans l'ordre :
//   1. Crée la scène 3D (caméra, renderer, lumières)
//   2. Charge tous les objets 3D (fichiers .glb)
//   3. Lance les features du jeu une fois que l'utilisateur clique "Jouer"
//
// FLUX D'ÉVÉNEMENTS (comment les modules se parlent)
// ──────────────────────────────────────────────────
//  main.js         → émet 'sceneReady'      quand tous les modèles sont chargés
//  landingPage.js  → émet 'gameStart'       quand l'utilisateur clique "Jouer"
//  objectClick.js  → émet 'objectSelected'  quand l'utilisateur clique un objet 3D
//  cardGame.js     → émet 'cardCorrect'     quand la bonne carte est glissée
//  successAnim.js  → émet 'objectCompleted' quand l'utilisateur clique "Continuer"
//  successAnim.js  → émet 'gameComplete'    quand les 15 objets sont validés
//
// =============================================================================

import * as THREE from 'three';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader }   from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { sceneConfig }                        from './assets.js';
import { setupLumieres, setupLumieresArcade } from './lumiere.js';

import { initLandingPage }                    from './features/landingPage/landingPage.js';
import { initObjectClick, updateObjectClick } from './features/objectClick/objectClick.js';
import { initCardGame }                       from './features/cardGame/cardGame.js';
import { initSuccessAnimation }               from './features/successAnimation/successAnimation.js';
import { initVictoryScreen }                  from './features/victoryScreen/victoryScreen.js';


// =============================================================================
// 1. CRÉATION DE LA SCÈNE 3D
// =============================================================================

// Le canvas HTML sur lequel Three.js va dessiner
const canvas = document.querySelector('#canvas');

// La scène = le conteneur de tous les objets 3D
const scene = new THREE.Scene();

// Liste des objets sur lesquels l'utilisateur peut cliquer
const interactableObjects = [];

// Le renderer convertit la scène 3D en pixels sur le canvas
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // limité à 2 pour les performances
renderer.toneMapping         = THREE.ACESFilmicToneMapping;   // rendu cinématographique
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace    = THREE.SRGBColorSpace;

// La caméra = le point de vue du joueur (champ de vision 75°)
const camera = new THREE.PerspectiveCamera(
  75,                                    // champ de vision en degrés
  window.innerWidth / window.innerHeight, // ratio largeur/hauteur
  0.1,                                   // distance minimale de rendu
  1000                                   // distance maximale de rendu
);
camera.position.z = 3; // on recule la caméra de 3 unités pour voir la scène

// Les OrbitControls permettent de tourner/zoomer avec la souris
const controls = new OrbitControls(camera, canvas);
controls.enableDamping   = true;          // mouvement fluide (inertie)
controls.minDistance     = 2;             // zoom minimum
controls.maxDistance     = 6;             // zoom maximum
controls.minAzimuthAngle = -Math.PI / 4;  // rotation horizontale limitée à ±45°
controls.maxAzimuthAngle =  Math.PI / 4;
controls.maxPolarAngle   =  Math.PI / 2;  // on ne peut pas passer sous la scène
controls.target.set(0, 0, 0);            // la caméra regarde le centre


// =============================================================================
// 2. LUMIÈRES
// =============================================================================

// setupLumieres() ajoute les lumières générales (ambiance cyberpunk)
setupLumieres(scene);

// setupLumieresArcade() ajoute des lumières spécifiques à la borne arcade
setupLumieresArcade(scene);


// =============================================================================
// 3. CHARGEMENT DES MODÈLES 3D
// =============================================================================

// Le LoadingManager suit la progression du chargement de tous les fichiers
const loadingManager = new THREE.LoadingManager(

  // Appelé quand TOUS les fichiers sont chargés
  // (ou immédiatement s'il n'y a aucun fichier à charger)
  () => {
    // Petit délai pour laisser la landing page s'initialiser dans le DOM
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('sceneReady'));
    }, 500);
  },

  // Appelé à chaque fichier chargé (pour la barre de progression)
  (url, loaded, total) => {
    const pourcentage = Math.round((loaded / total) * 100);
    const barEl       = document.getElementById('loader-bar');
    const percentEl   = document.getElementById('loader-percent');
    const statusEl    = document.getElementById('loader-status');

    if (barEl)     barEl.style.width      = pourcentage + '%';
    if (percentEl) percentEl.textContent  = pourcentage + '%';
    if (statusEl)  statusEl.textContent   = `Chargement : ${url.split('/').pop()}`;
  },

  // Appelé en cas d'erreur
  (url) => console.error(`Erreur de chargement : ${url}`)
);

// DRACOLoader décompresse les fichiers .glb compressés (plus légers)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

// GLTFLoader charge les fichiers 3D au format .glb
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

// On charge chaque modèle défini dans assets.js
sceneConfig.models.forEach(modelConfig => {
  gltfLoader.load(
    modelConfig.path, // chemin du fichier .glb

    // Succès : le modèle est chargé
    (gltf) => {
      const model = gltf.scene;

      // On parcourt toutes les pièces du modèle pour les configurer
      model.traverse((partie) => {

        // Certains modèles ont des lumières intégrées qu'on veut ignorer
        if (modelConfig.ignoreEmbeddedLights && partie.isLight) {
          partie.visible = false;
        }

        // On peut ajuster l'intensité lumineuse des matériaux
        if (partie.isMesh && modelConfig.intensity !== undefined) {
          if (partie.material) {
            partie.material.emissiveIntensity = modelConfig.intensity;
          }
        }
      });

      // Positionnement, échelle et rotation définis dans assets.js
      model.position.set(...modelConfig.pos);
      model.scale.set(...modelConfig.scale);
      model.rotation.y = modelConfig.rotY || 0;

      // Si l'objet est interactif, on l'ajoute à la liste de clics
      if (modelConfig.interact) {
        model.userData.isInteractable = true;
        model.userData.name           = modelConfig.name;
        interactableObjects.push(model);
      }

      scene.add(model);
    },

    undefined, // pas de callback de progression par fichier

    // Erreur : le fichier n'a pas pu être chargé
    (err) => console.error(`Erreur sur le modèle "${modelConfig.name}" :`, err)
  );
});


// =============================================================================
// 4. INITIALISATION DES FEATURES
// =============================================================================

// La landing page (écran TV) s'affiche immédiatement au démarrage
initLandingPage();

// Les autres features ne démarrent qu'après le clic sur "Jouer"
// { once: true } = l'écouteur se supprime automatiquement après le premier appel
window.addEventListener('gameStart', () => {
  initObjectClick(camera, renderer, controls, interactableObjects);
  initCardGame();
  initSuccessAnimation();
  initVictoryScreen();
}, { once: true });


// =============================================================================
// 5. NAVIGATION AU CLAVIER (touches fléchées)
// =============================================================================
// ← → : rotation horizontale autour de la scène
// ↑ ↓ : avancer / reculer (zoom)

const VITESSE_ROTATION_CLAVIER = 0.04; // radians par frame
const VITESSE_ZOOM_CLAVIER     = 0.15; // unités par frame

const touchesActives = new Set();

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
    e.preventDefault(); // empêche le scroll de la page
    touchesActives.add(e.key);
  }
});

window.addEventListener('keyup', (e) => {
  touchesActives.delete(e.key);
});

// Appelée dans la boucle d'animation pour appliquer le déplacement
function appliquerNavigationClavier() {
  if (!touchesActives.size || !controls.enabled) return;

  // Rotation horizontale : on tourne la caméra autour de la cible
  if (touchesActives.has('ArrowLeft') || touchesActives.has('ArrowRight')) {
    const angle = touchesActives.has('ArrowLeft')
      ? -VITESSE_ROTATION_CLAVIER
      :  VITESSE_ROTATION_CLAVIER;

    // On fait pivoter la position caméra autour du point cible
    const dx = camera.position.x - controls.target.x;
    const dz = camera.position.z - controls.target.z;
    camera.position.x = controls.target.x + dx * Math.cos(angle) - dz * Math.sin(angle);
    camera.position.z = controls.target.z + dx * Math.sin(angle) + dz * Math.cos(angle);
    camera.lookAt(controls.target);
  }

  // Zoom avant / arrière
  if (touchesActives.has('ArrowUp') || touchesActives.has('ArrowDown')) {
    const direction = new THREE.Vector3()
      .subVectors(controls.target, camera.position)
      .normalize();

    const deplacement = touchesActives.has('ArrowUp')
      ?  VITESSE_ZOOM_CLAVIER
      : -VITESSE_ZOOM_CLAVIER;

    // On vérifie qu'on ne dépasse pas les limites de zoom
    const distanceActuelle = camera.position.distanceTo(controls.target);
    const nouvelleDistance = distanceActuelle - deplacement;

    if (nouvelleDistance >= controls.minDistance && nouvelleDistance <= controls.maxDistance) {
      camera.position.addScaledVector(direction, deplacement);
    }
  }
}


// =============================================================================
// 6. REDIMENSIONNEMENT DE LA FENÊTRE
// =============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


// =============================================================================
// 7. BOUCLE D'ANIMATION
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  appliquerNavigationClavier(); // ← navigation clavier
  updateObjectClick();
  renderer.render(scene, camera);
}

animate();
