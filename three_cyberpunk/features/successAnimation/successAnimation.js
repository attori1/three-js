// =============================================================================
// successAnimation.js — Animations de succès + affichage des informations
// =============================================================================
//
// Ce module se déclenche quand l'utilisateur glisse la bonne carte.
// Il joue trois animations enchaînées :
//   1. Flash de l'écran + explosion de particules colorées
//   2. Une carte se retourne pour révéler les informations de l'objet
//   3. Un bouton "Continuer" apparaît pour passer à la suite
//
// Il suit aussi la progression du joueur (combien d'objets validés sur 18).
//
// ÉVÉNEMENTS
//   Écoute → 'cardCorrect'      lance l'animation { objectId, objectData }
//   Émet   → 'objectCompleted'  quand le joueur clique "Continuer" { objectId }
//   Émet   → 'gameComplete'     quand les 15 objets sont validés
//
// =============================================================================

import './successAnimation.css';
import { gameObjects } from '../cardGame/gameData.js';


// =============================================================================
// CONSTANTES
// =============================================================================

const TOTAL_OBJETS   = gameObjects.length; // 17
const NB_PARTICULES  = 40;

// Couleurs des particules selon la catégorie de l'objet validé
const COULEURS_PARTICULES = {
  videogame: ['#00ffff', '#00aaff', '#ffffff'],
  film:      ['#ff0077', '#ff66aa', '#ffffff'],
  manga:     ['#ffd700', '#ffaa00', '#ffffff']
};


// =============================================================================
// ÉTAT
// =============================================================================

let nbObjetsValides  = 0;    // progression du joueur
let idObjetCourant   = null; // objet en cours de validation


// =============================================================================
// CRÉATION DU HTML
// =============================================================================

// Conteneur invisible pour les particules (elles s'y ajoutent dynamiquement)
const conteneurParticules = document.createElement('div');
conteneurParticules.id    = 'particle-container';
document.body.appendChild(conteneurParticules);

// Carte qui se retourne pour révéler les informations
const carteRetournement = document.createElement('div');
carteRetournement.id    = 'flip-card-wrapper';
carteRetournement.innerHTML = `
  <div class="flip-card-inner">

    <!-- Face avant : message de succès -->
    <div class="flip-card-front">
      <span class="flip-front-icon">✓</span>
      <span class="flip-front-label">Correct !</span>
    </div>

    <!-- Face arrière : informations sur l'objet -->
    <div class="flip-card-back">
      <span class="flip-back-title" id="info-title"></span>
      <span class="flip-back-year"  id="info-year"></span>
      <div  class="flip-back-sep"></div>
      <span class="flip-back-desc"  id="info-desc"></span>
    </div>

  </div>
`;
document.body.appendChild(carteRetournement);

// Bouton pour continuer vers l'objet suivant
const boutonContinuer = document.createElement('button');
boutonContinuer.id    = 'continue-btn';
boutonContinuer.textContent = '▶ Continuer';
document.body.appendChild(boutonContinuer);

// Compteur de progression [ X / 18 ] affiché en haut
const compteur = document.createElement('div');
compteur.id    = 'progress-counter';
document.body.appendChild(compteur);


// =============================================================================
// INITIALISATION (appelée depuis main.js après le clic "Jouer")
// =============================================================================

export function initSuccessAnimation() {
  window.addEventListener('cardCorrect', onBonneCarte);
  boutonContinuer.addEventListener('click', onClicContinuer);
  mettreAJourCompteur();
}


// =============================================================================
// DÉCLENCHEMENT DE L'ANIMATION
// =============================================================================

// Appelé quand cardGame.js émet 'cardCorrect'
function onBonneCarte(evenement) {
  const { objectId, objectData, dejaValide } = evenement.detail;
  idObjetCourant = objectId;

  if (dejaValide) {
    // Re-clic : on attend la fin du zoom (55 frames à 60fps ≈ 920ms)
    // avant d'afficher la carte pour ne pas couvrir l'animation de zoom
    setTimeout(() => afficherCarteVerso(objectData), 920);
    return;
  }

  // Première validation → on incrémente le compteur
  nbObjetsValides++;
  mettreAJourCompteur();

  const objet    = gameObjects.find(o => o.id === objectId);
  const categorie = objet?.category ?? 'videogame';

  lancerParticules(categorie);
  lancerFlash();
  afficherCarteRetournement(objectData);
}


// =============================================================================
// EXPLOSION DE PARTICULES
// =============================================================================

function lancerParticules(categorie) {
  const couleurs  = COULEURS_PARTICULES[categorie] ?? COULEURS_PARTICULES.videogame;
  const centreX   = window.innerWidth  / 2;
  const centreY   = window.innerHeight / 2;

  for (let i = 0; i < NB_PARTICULES; i++) {
    const particule = document.createElement('div');
    particule.className = 'particle';

    // Chaque particule part dans une direction aléatoire autour du centre
    const angle    = (i / NB_PARTICULES) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 80 + Math.random() * 140;
    const deplX    = Math.cos(angle) * distance;
    const deplY    = Math.sin(angle) * distance;
    const duree    = 0.55 + Math.random() * 0.45;
    const couleur  = couleurs[Math.floor(Math.random() * couleurs.length)];

    // Les variables CSS --tx, --ty, --dur sont utilisées par l'animation CSS
    particule.style.cssText = `
      left: ${centreX}px;
      top: ${centreY}px;
      background: ${couleur};
      box-shadow: 0 0 4px ${couleur};
      --tx: ${deplX}px;
      --ty: ${deplY}px;
      --dur: ${duree}s;
    `;

    conteneurParticules.appendChild(particule);

    // On supprime la particule du DOM quand son animation est terminée
    particule.addEventListener('animationend', () => particule.remove());
  }
}


// =============================================================================
// FLASH D'ÉCRAN
// =============================================================================

function lancerFlash() {
  const flash = document.createElement('div');
  flash.id    = 'success-flash';
  document.body.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());
}


// =============================================================================
// CARTE QUI SE RETOURNE
// =============================================================================

// Remplit les champs de la face verso avec les données de l'objet
function remplirCarte(donnees) {
  document.getElementById('info-title').textContent = donnees?.title ?? '';
  document.getElementById('info-year').textContent  = donnees?.year  ? `— ${donnees.year} —` : '';
  document.getElementById('info-desc').textContent  = donnees?.description ?? '';
}

// Première validation : animation de retournement complète (recto → verso)
function afficherCarteRetournement(donnees) {
  remplirCarte(donnees);

  const interieur = carteRetournement.querySelector('.flip-card-inner');
  interieur.style.animation = 'none';
  interieur.style.transform = '';
  void interieur.offsetWidth; // force le reflow pour relancer l'animation
  interieur.style.animation  = '';

  carteRetournement.classList.add('visible');
  boutonContinuer.classList.add('visible');
}

// Re-clic sur objet déjà validé : affiche directement la face verso
function afficherCarteVerso(donnees) {
  remplirCarte(donnees);

  const interieur = carteRetournement.querySelector('.flip-card-inner');
  interieur.style.animation = 'none';
  interieur.style.transform = 'rotateY(180deg)';

  carteRetournement.classList.add('visible');
  boutonContinuer.classList.add('visible');
}


// =============================================================================
// BOUTON "CONTINUER"
// =============================================================================

function onClicContinuer() {
  carteRetournement.classList.remove('visible');
  boutonContinuer.classList.remove('visible');

  // Réinitialise le transform forcé (cas re-clic)
  const interieur = carteRetournement.querySelector('.flip-card-inner');
  interieur.style.transform = '';

  const idObjet  = idObjetCourant;
  idObjetCourant = null;

  // On prévient objectClick.js de faire le zoom arrière
  window.dispatchEvent(new CustomEvent('objectCompleted', {
    detail: { objectId: idObjet }
  }));

  // gameComplete est émis uniquement quand tous les objets sont validés pour la 1ère fois
  if (nbObjetsValides >= TOTAL_OBJETS) {
    window.dispatchEvent(new CustomEvent('gameComplete'));
  }
}


// =============================================================================
// COMPTEUR DE PROGRESSION
// =============================================================================

function mettreAJourCompteur() {
  compteur.textContent = `[ ${nbObjetsValides} / ${TOTAL_OBJETS} ]`;
}
