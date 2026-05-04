// =============================================================================
// cardGame.js — Interface des cartes (glisser-déposer)
// =============================================================================
//
// Ce module affiche les 15 cartes en bas de l'écran quand un objet 3D
// est sélectionné. L'utilisateur doit glisser la bonne carte vers
// la zone centrale pour valider.
//
// RÈGLES DU JEU
//   - Les 15 cartes sont mélangées et affichées dans un panneau bas
//   - L'utilisateur glisse une carte vers le cercle central
//   - Si c'est la bonne carte → succès
//   - Si c'est la mauvaise → +1 erreur (max 3 erreurs)
//   - Après 3 erreurs → un indice de catégorie s'affiche
//
// ÉVÉNEMENTS
//   Écoute  → 'objectSelected'   affiche les cartes { objectId }
//   Écoute  → 'objectAborted'    masque les cartes (bouton ✕ cliqué)
//   Émet    → 'cardCorrect'      la bonne carte a été glissée { objectId, objectData, dejaValide? }
//
// =============================================================================

import './cardGame.css';
import { gameObjects } from './gameData.js';


// =============================================================================
// ICÔNES PAR CATÉGORIE
// =============================================================================
// Pour changer une icône, modifiez simplement l'emoji ici

const ICONES_CATEGORIES = {
  videogame: '🎮',
  film:      '🎬',
  manga:     '📖'
};


// =============================================================================
// CONSTANTES
// =============================================================================

const MAX_ERREURS = 3; // nombre d'erreurs avant d'afficher l'indice


// =============================================================================
// ÉTAT DU JEU
// =============================================================================

let idObjetCourant = null; // id de l'objet 3D actuellement sélectionné
let nombreErreurs  = 0;    // compteur d'erreurs pour l'objet courant
let idCarteSaisie  = null; // id de la carte en cours de glissement

// Objets déjà validés : id → données (pour affichage direct au re-clic)
const objetsCompletes = new Map();


// =============================================================================
// CRÉATION DU HTML
// =============================================================================

// Panneau du bas contenant les cartes
const panneau = document.createElement('div');
panneau.id    = 'card-game-panel';
panneau.innerHTML = `
  <div id="card-game-header">
    <span id="card-game-instruction">Glissez la bonne carte vers l'objet</span>
    <span id="card-game-attempts"></span>
  </div>

  <!-- Barre d'indice (visible après 3 erreurs) -->
  <div id="card-hint-bar">
    <span id="hint-icon">💡</span>
    <span id="hint-text"></span>
  </div>

  <!-- Les cartes s'affichent ici, avec défilement horizontal -->
  <div id="card-scroll-track"></div>
`;
document.body.appendChild(panneau);

// Zone de dépôt (le cercle central)
const zoneDepot = document.createElement('div');
zoneDepot.id    = 'drop-zone';
zoneDepot.innerHTML = `<span id="drop-zone-label">Déposez<br>ici</span>`;
document.body.appendChild(zoneDepot);


// =============================================================================
// RÉFÉRENCES AUX ÉLÉMENTS DU DOM
// =============================================================================

const affichageErreurs = panneau.querySelector('#card-game-attempts');
const barreIndice      = panneau.querySelector('#card-hint-bar');
const texteIndice      = panneau.querySelector('#hint-text');
const pisteCartes      = panneau.querySelector('#card-scroll-track');


// =============================================================================
// INITIALISATION (appelée depuis main.js après le clic "Jouer")
// =============================================================================

export function initCardGame() {
  // On écoute les événements du jeu
  window.addEventListener('objectSelected', onObjetSelectionne);
  window.addEventListener('objectAborted',  masquerCartes);

  // Gestion du glisser-déposer sur la zone centrale
  zoneDepot.addEventListener('dragover',  onDragOver);
  zoneDepot.addEventListener('dragleave', onDragLeave);
  zoneDepot.addEventListener('drop',      onDrop);
}


// =============================================================================
// AFFICHAGE DES CARTES
// =============================================================================

// Appelé quand l'utilisateur clique sur un objet 3D
function onObjetSelectionne(evenement) {
  const id = evenement.detail.objectId;

  // Si l'objet a déjà été validé → on affiche directement la carte d'info
  if (objetsCompletes.has(id)) {
    window.dispatchEvent(new CustomEvent('cardCorrect', {
      detail: { objectId: id, objectData: objetsCompletes.get(id), dejaValide: true }
    }));
    return;
  }

  // Sinon → jeu normal
  idObjetCourant = id;
  nombreErreurs  = 0;

  reinitialiserIndice();
  afficherCartes();
  afficherPanneau();
}

function afficherPanneau() {
  panneau.classList.add('visible');
  // La zone de dépôt n'apparaît que quand l'utilisateur commence à glisser
  mettreAJourAffichageErreurs();
}

function masquerCartes() {
  panneau.classList.remove('visible');
  zoneDepot.classList.remove('visible');
  zoneDepot.classList.remove('drag-over');
  idObjetCourant = null;
}

// Génère le HTML des cartes dans un ordre aléatoire,
// en excluant les objets déjà validés
function afficherCartes() {
  pisteCartes.innerHTML = '';

  const cartesMelangees = gameObjects
    .filter(objet => !objetsCompletes.has(objet.id))
    .sort(() => Math.random() - 0.5);

  cartesMelangees.forEach(objet => {
    const carte = document.createElement('div');
    carte.className       = `game-card cat-${objet.category}`;
    carte.draggable       = true;
    carte.dataset.cardId  = objet.id; // on stocke l'id pour la vérification

    carte.innerHTML = `
      <div class="card-window-bar">
        <span class="card-dot"></span>
        <span class="card-dot"></span>
        <span class="card-dot"></span>
      </div>
      <div class="card-body">
        <span class="card-icon">${ICONES_CATEGORIES[objet.category]}</span>
        <span class="card-label">${objet.cardLabel}</span>
      </div>
    `;

    carte.addEventListener('dragstart', onDragStart);
    carte.addEventListener('dragend',   onDragEnd);
    pisteCartes.appendChild(carte);
  });
}


// =============================================================================
// GLISSER-DÉPOSER
// =============================================================================

// L'utilisateur commence à glisser une carte → la zone de dépôt apparaît
function onDragStart(evenement) {
  idCarteSaisie = evenement.currentTarget.dataset.cardId;
  evenement.currentTarget.classList.add('dragging');
  evenement.dataTransfer.effectAllowed = 'move';
  zoneDepot.classList.add('visible');
}

// L'utilisateur relâche la carte → la zone de dépôt disparaît
function onDragEnd(evenement) {
  evenement.currentTarget.classList.remove('dragging');
  zoneDepot.classList.remove('visible');
  zoneDepot.classList.remove('drag-over');
}

// La carte entre dans la zone de dépôt
function onDragOver(evenement) {
  evenement.preventDefault(); // nécessaire pour autoriser le drop
  evenement.dataTransfer.dropEffect = 'move';
  zoneDepot.classList.add('drag-over');
}

// La carte sort de la zone de dépôt sans être relâchée
function onDragLeave() {
  zoneDepot.classList.remove('drag-over');
}

// La carte est relâchée dans la zone de dépôt
function onDrop(evenement) {
  evenement.preventDefault();
  zoneDepot.classList.remove('drag-over');

  if (!idCarteSaisie || !idObjetCourant) return;

  if (idCarteSaisie === idObjetCourant) {
    onBonneCarte();
  } else {
    onMauvaiseCarte();
  }
}


// =============================================================================
// RÉSULTATS DU GLISSEMENT
// =============================================================================

// L'utilisateur a glissé la bonne carte
async function onBonneCarte() {
  const donnees = await chargerDonneesObjet(idObjetCourant);

  // On mémorise cet objet comme validé pour les re-clics futurs
  objetsCompletes.set(idObjetCourant, donnees);

  masquerCartes();

  window.dispatchEvent(new CustomEvent('cardCorrect', {
    detail: { objectId: idObjetCourant, objectData: donnees }
  }));
}

// L'utilisateur a glissé la mauvaise carte
function onMauvaiseCarte() {
  nombreErreurs++;
  mettreAJourAffichageErreurs();

  // Effet de secousse sur la carte incorrecte
  const carteIncorrecte = pisteCartes.querySelector(`[data-card-id="${idCarteSaisie}"]`);
  if (carteIncorrecte) {
    carteIncorrecte.classList.add('wrong-shake');
    carteIncorrecte.addEventListener('animationend', () => {
      carteIncorrecte.classList.remove('wrong-shake');
    }, { once: true });
  }

  // Après MAX_ERREURS erreurs, on affiche un indice
  if (nombreErreurs >= MAX_ERREURS) afficherIndice();
}


// =============================================================================
// INDICE (après trop d'erreurs)
// =============================================================================

function afficherIndice() {
  const objet = gameObjects.find(o => o.id === idObjetCourant);
  if (!objet) return;

  texteIndice.textContent = `Indice : c'est un(e) ${objet.hint}`;
  barreIndice.classList.add('visible');
}

function reinitialiserIndice() {
  barreIndice.classList.remove('visible');
  texteIndice.textContent = '';
}


// =============================================================================
// AFFICHAGE DU COMPTEUR D'ERREURS
// =============================================================================

function mettreAJourAffichageErreurs() {
  if (nombreErreurs === 0) {
    affichageErreurs.textContent = '';
    return;
  }

  const restantes = MAX_ERREURS - nombreErreurs;
  affichageErreurs.textContent = restantes > 0
    ? `[ ${nombreErreurs}/${MAX_ERREURS} tentatives ]`
    : `[ indice activé ]`;
}


// =============================================================================
// CHARGEMENT DES DONNÉES D'UN OBJET (API ou statique)
// =============================================================================
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  COMMENT CONNECTER VOTRE API                                            ║
// ╠══════════════════════════════════════════════════════════════════════════╣
// ║  1. Ouvrez  features/cardGame/gameData.js                               ║
// ║  2. Trouvez l'objet concerné dans le tableau gameObjects                ║
// ║  3. Remplacez   apiEndpoint: null                                       ║
// ║     par         apiEndpoint: 'https://votre-api.com/objet/id'           ║
// ║                                                                         ║
// ║  Format de réponse attendu (JSON) :                                     ║
// ║  {                                                                      ║
// ║    "title":       "Nom de l'œuvre",                                     ║
// ║    "description": "Texte descriptif",                                   ║
// ║    "year":        "2077",   ← optionnel                                 ║
// ║    "imageUrl":    "https://..." ← optionnel                             ║
// ║  }                                                                      ║
// ║                                                                         ║
// ║  Si l'API ne répond pas, les données statiques de gameData.js           ║
// ║  sont utilisées automatiquement comme solution de secours.              ║
// ╚══════════════════════════════════════════════════════════════════════════╝

async function chargerDonneesObjet(objectId) {
  const objet = gameObjects.find(o => o.id === objectId);
  if (!objet) return null;

  // Pas d'API configurée → on utilise les données statiques directement
  if (!objet.apiEndpoint) return objet.info;

  // Tentative d'appel API
  try {
    const reponse = await fetch(objet.apiEndpoint);
    if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`);
    return await reponse.json();

  } catch (erreur) {
    // En cas d'échec, on se rabat sur les données statiques
    console.warn(`[cardGame] API indisponible pour "${objectId}", utilisation des données statiques.`, erreur);
    return objet.info;
  }
}
