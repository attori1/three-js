// =============================================================================
// objectClick.js — Clic sur les objets 3D + zoom caméra + rotation
// =============================================================================
//
// Ce module gère tout ce qui se passe quand l'utilisateur interagit
// avec les objets 3D de la scène.
//
// COMPORTEMENT
//   1. Survol d'un objet  → le curseur change, un badge "[ cliquez ]" apparaît
//   2. Clic sur un objet  → zoom animé de la caméra vers l'objet, l'objet tourne
//   3. Clic sur ✕        → zoom arrière, retour à la vue normale
//   4. Carte validée      → zoom arrière automatique (événement 'objectCompleted')
//
// ÉTATS POSSIBLES (machine à états)
//   IDLE        → aucun objet sélectionné, l'utilisateur peut naviguer
//   ZOOMING_IN  → la caméra se déplace vers l'objet (animation en cours)
//   FOCUSED     → caméra arrivée, l'objet tourne, les cartes sont visibles
//   ZOOMING_OUT → la caméra revient à sa position d'origine
//
// ÉVÉNEMENTS
//   Émet    → 'objectSelected'   quand le zoom est lancé { objectId: string }
//   Écoute  → 'objectCompleted'  pour déclencher le zoom arrière
//
// =============================================================================

import './objectClick.css';
import * as THREE from 'three';


// =============================================================================
// CONSTANTES
// =============================================================================

const ETATS = {
  IDLE:        0, // en attente
  ZOOMING_IN:  1, // zoom avant en cours
  FOCUSED:     2, // objet sélectionné, vue rapprochée
  ZOOMING_OUT: 3  // zoom arrière en cours
};

const DUREE_ZOOM_FRAMES = 55;   // durée de l'animation de zoom (en frames ~60fps)
const DISTANCE_ZOOM     = 1.8;  // distance finale entre la caméra et l'objet
const VITESSE_ROTATION  = 0.012; // radians par frame


// =============================================================================
// VARIABLES DE MODULE
// =============================================================================

// Ces variables sont partagées entre les fonctions du module
let camera, renderer, controls;
let objetsInteractifs = [];

let etatActuel      = ETATS.IDLE;
let objetSelectionne = null;
let frameZoom       = 0;

// Positions de la caméra pour l'animation (départ → arrivée)
const cameraPosDepart  = new THREE.Vector3();
const cameraPosCible   = new THREE.Vector3();
const targetPosDepart  = new THREE.Vector3();
const targetPosCible   = new THREE.Vector3();

// Positions d'origine sauvegardées avant chaque zoom-in
// → utilisées par le zoom-back pour toujours revenir au bon endroit
const cameraOrigine = new THREE.Vector3();
const targetOrigine = new THREE.Vector3();

// Compteur de frames pour l'animation de surbrillance
let frameSurbrillance = 0;

// Objet survolé actuellement (pour le highlight de survol)
let objetSurvole = null;

// Détection des clics (raycasting = lancer un rayon depuis la caméra)
const raycaster = new THREE.Raycaster();
const souris    = new THREE.Vector2();


// =============================================================================
// CRÉATION DES ÉLÉMENTS D'INTERFACE
// =============================================================================

// Badge qui apparaît au survol d'un objet interactif
const badge = document.createElement('div');
badge.id          = 'interaction-badge';
badge.textContent = '[ cliquez ]';
document.body.appendChild(badge);

// Bouton pour fermer la vue focalisée
const boutonFermer = document.createElement('button');
boutonFermer.id          = 'close-focus-btn';
boutonFermer.textContent = '✕';
document.body.appendChild(boutonFermer);


// =============================================================================
// INITIALISATION (appelée depuis main.js après le clic "Jouer")
// =============================================================================

export function initObjectClick(cam, rend, ctrl, objets) {
  camera           = cam;
  renderer         = rend;
  controls         = ctrl;
  objetsInteractifs = objets;

  // Écoute les clics et mouvements sur le canvas 3D
  renderer.domElement.addEventListener('click',     onClicCanvas);
  renderer.domElement.addEventListener('mousemove', onSurvolCanvas);

  // Bouton ✕ pour quitter la vue focalisée
  boutonFermer.addEventListener('click', onClicFermer);

  // Quand une carte est validée → zoom arrière automatique
  window.addEventListener('objectCompleted', onObjetTermine);
}


// =============================================================================
// DÉTECTION DES CLICS (raycasting)
// =============================================================================

function onClicCanvas(evenement) {
  // On ne gère les clics que si aucune animation n'est en cours
  if (etatActuel !== ETATS.IDLE) return;

  mettreAJourPositionSouris(evenement);
  raycaster.setFromCamera(souris, camera);

  // On cherche tous les objets 3D touchés par le rayon
  const intersections = raycaster.intersectObjects(objetsInteractifs, true);
  if (!intersections.length) return;

  // On remonte la hiérarchie pour trouver l'objet interactif parent
  const objetCible = trouverParentInteractif(intersections[0].object);
  if (objetCible) demarrerZoomAvant(objetCible);

  // Effet visuel de ripple au point de clic
  afficherRipple(evenement.clientX, evenement.clientY);
}


// =============================================================================
// BADGE DE SURVOL
// =============================================================================

function onSurvolCanvas(evenement) {
  if (etatActuel !== ETATS.IDLE) return;

  mettreAJourPositionSouris(evenement);
  raycaster.setFromCamera(souris, camera);

  const intersections = raycaster.intersectObjects(objetsInteractifs, true);
  const cible = intersections.length ? trouverParentInteractif(intersections[0].object) : null;

  if (cible) {
    renderer.domElement.classList.add('hovering-object');
    badge.style.left = (evenement.clientX + 14) + 'px';
    badge.style.top  = (evenement.clientY - 10) + 'px';
    badge.classList.add('visible');
    objetSurvole = cible;
  } else {
    renderer.domElement.classList.remove('hovering-object');
    badge.classList.remove('visible');
    objetSurvole = null;
  }
}


// =============================================================================
// ZOOM AVANT (vers l'objet)
// =============================================================================

function demarrerZoomAvant(objet) {
  objetSelectionne = objet;
  etatActuel       = ETATS.ZOOMING_IN;
  frameZoom        = 0;

  // Réinitialise la surbrillance sur tous les objets
  objetsInteractifs.forEach(o => {
    o.traverse(partie => {
      if (partie.isMesh && partie.material && (partie.material.emissiveIntensity ?? 0) < 3) {
        partie.material.emissiveIntensity = 0;
      }
    });
  });

  // Sauvegarde de la position d'origine pour pouvoir y revenir
  cameraOrigine.copy(camera.position);
  targetOrigine.copy(controls.target);

  cameraPosDepart.copy(camera.position);
  targetPosDepart.copy(controls.target);

  // On calcule la position cible : DISTANCE_ZOOM devant l'objet
  const positionObjet = new THREE.Vector3();
  objet.getWorldPosition(positionObjet);
  targetPosCible.copy(positionObjet);

  // Direction = vecteur normalisé de l'objet vers la caméra
  const direction = new THREE.Vector3()
    .subVectors(camera.position, positionObjet)
    .normalize();
  cameraPosCible.copy(positionObjet).addScaledVector(direction, DISTANCE_ZOOM);

  // On désactive les contrôles souris pendant le zoom
  controls.enabled = false;
  renderer.domElement.classList.add('zooming');

  // On prévient cardGame.js que l'objet est sélectionné
  window.dispatchEvent(new CustomEvent('objectSelected', {
    detail: { objectId: objet.userData.name }
  }));
}


// =============================================================================
// ZOOM ARRIÈRE (retour à la vue normale)
// =============================================================================

function demarrerZoomArriere() {
  if (!objetSelectionne) return;

  etatActuel = ETATS.ZOOMING_OUT;
  frameZoom  = 0;

  // On part de la position actuelle (quelle que soit l'avancée du zoom)
  cameraPosDepart.copy(camera.position);
  targetPosDepart.copy(controls.target);

  // On revient toujours à la position sauvegardée avant le zoom-in
  cameraPosCible.copy(cameraOrigine);
  targetPosCible.copy(targetOrigine);

  renderer.domElement.classList.add('zooming');
  boutonFermer.classList.remove('visible');
}

// Appelé quand l'utilisateur clique le bouton ✕
function onClicFermer() {
  if (etatActuel !== ETATS.FOCUSED) return;
  window.dispatchEvent(new CustomEvent('objectAborted'));
  demarrerZoomArriere();
}

// Appelé quand l'utilisateur valide une carte et clique "Continuer"
// Gère aussi le cas du re-clic où le zoom est encore en cours (ZOOMING_IN)
function onObjetTermine() {
  if (etatActuel === ETATS.FOCUSED || etatActuel === ETATS.ZOOMING_IN) {
    demarrerZoomArriere();
  }
}


// =============================================================================
// MISE À JOUR — appelée à chaque frame depuis main.js
// =============================================================================

export function updateObjectClick() {
  frameSurbrillance++;

  // En mode IDLE : effet de surbrillance pulsante sur tous les objets interactifs
  if (etatActuel === ETATS.IDLE) {
    appliquerSurbrillance();
  }

  // Si on est en attente (hors animation), rien d'autre à faire
  if (etatActuel === ETATS.IDLE) return;

  // Animation de zoom (avant ou arrière)
  if (etatActuel === ETATS.ZOOMING_IN || etatActuel === ETATS.ZOOMING_OUT) {
    frameZoom++;

    // t varie de 0 à 1 pendant la durée du zoom
    const t    = Math.min(frameZoom / DUREE_ZOOM_FRAMES, 1);
    const ease = easeOutCubic(t); // courbe d'accélération douce

    // On déplace progressivement la caméra vers sa cible
    camera.position.lerpVectors(cameraPosDepart, cameraPosCible, ease);
    controls.target.lerpVectors(targetPosDepart, targetPosCible, ease);
    camera.lookAt(controls.target);

    // Animation terminée (t == 1)
    if (t >= 1) {
      if (etatActuel === ETATS.ZOOMING_IN) {
        // Zoom avant terminé → on passe en mode FOCUSED
        etatActuel = ETATS.FOCUSED;
        renderer.domElement.classList.remove('zooming');
        boutonFermer.classList.add('visible');

      } else {
        // Zoom arrière terminé → on revient en mode IDLE
        etatActuel       = ETATS.IDLE;
        objetSelectionne = null;
        controls.enabled = true;
        renderer.domElement.classList.remove('zooming');
      }
    }
  }

  // En mode FOCUSED : l'objet tourne sur lui-même en continu
  if (etatActuel === ETATS.FOCUSED && objetSelectionne) {
    objetSelectionne.rotation.y += VITESSE_ROTATION;
  }
}


// =============================================================================
// SURBRILLANCE PULSANTE
// =============================================================================
// Applique un léger effet de glow sur les objets interactifs pour indiquer
// qu'ils sont cliquables. Le survol augmente l'intensité.

function appliquerSurbrillance() {
  // Onde sinusoïdale lente : 0.0 → 1.0 → 0.0 en boucle
  const pulse = (Math.sin(frameSurbrillance * 0.035) + 1) / 2;

  objetsInteractifs.forEach(objet => {
    const estSurvole = objet === objetSurvole;

    // Intensité de base : légère (0.05 → 0.25)
    // Au survol : plus forte (0.4 → 0.8)
    const intensiteMin = estSurvole ? 0.4 : 0.05;
    const intensiteMax = estSurvole ? 0.8 : 0.25;
    const intensite    = intensiteMin + pulse * (intensiteMax - intensiteMin);

    objet.traverse(partie => {
      if (partie.isMesh && partie.material) {
        // On ne touche pas aux objets qui ont déjà une emissiveIntensity forte
        // (ceux définis dans assets.js avec ignoreEmbeddedLights)
        const baseIntensity = partie.material.emissiveIntensity ?? 0;
        if (baseIntensity < 3) {
          partie.material.emissiveIntensity = intensite;
        }
      }
    });
  });
}


// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

// Convertit la position de la souris (pixels) en coordonnées normalisées (-1 à 1)
// nécessaires pour le raycasting Three.js
function mettreAJourPositionSouris(evenement) {
  const rect = renderer.domElement.getBoundingClientRect();
  souris.x =  ((evenement.clientX - rect.left) / rect.width)  * 2 - 1;
  souris.y = -((evenement.clientY - rect.top)  / rect.height) * 2 + 1;
}

// Remonte la hiérarchie d'un objet 3D pour trouver l'ancêtre interactif
// (nécessaire car les modèles GLTF sont composés de plusieurs sous-objets)
function trouverParentInteractif(objet) {
  let courant = objet;
  while (courant) {
    if (courant.userData?.isInteractable) return courant;
    courant = courant.parent;
  }
  return null;
}

// Crée un cercle qui s'agrandit au point de clic (effet "ripple")
function afficherRipple(x, y) {
  const ripple      = document.createElement('div');
  ripple.className  = 'click-ripple';
  ripple.style.left = x + 'px';
  ripple.style.top  = y + 'px';
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// Fonction d'accélération : démarre vite, ralentit à la fin (effet naturel)
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
