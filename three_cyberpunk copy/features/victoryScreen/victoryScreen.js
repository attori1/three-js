// =============================================================================
// victoryScreen.js — Écran de victoire final
// =============================================================================
//
// Ce module affiche l'écran de fin quand les 18 objets sont validés.
// Il reçoit l'événement 'gameComplete' et affiche une page plein écran
// avec le titre "Légende du Cyberpunk" et des effets glitch.
//
// ÉVÉNEMENTS
//   Écoute → 'gameComplete'  déclenche l'affichage de l'écran
//
// =============================================================================

import './victoryScreen.css';
import { gameObjects } from '../cardGame/gameData.js';


// =============================================================================
// CONSTANTES
// =============================================================================

const TOTAL_OBJETS    = gameObjects.length; // 18
const NB_GLITCHS      = 5;   // nombre d'effets glitch sur le titre
const INTERVALLE_MS   = 400; // millisecondes entre chaque glitch


// =============================================================================
// CRÉATION DU HTML
// =============================================================================

const ecranVictoire = document.createElement('div');
ecranVictoire.id    = 'victory-screen';
ecranVictoire.innerHTML = `
  <span class="victory-tag">// session terminée</span>

  <span class="victory-merci">Merci d'avoir joué</span>

  <div class="victory-title-block">
    <span class="victory-sub">Vous avez obtenu le titre de</span>
    <span class="victory-main-title" id="victory-main-title">Légende du Cyberpunk</span>
  </div>

  <span class="victory-subtitle">[ Rang S — Décrypté ]</span>

  <div class="victory-separator"></div>

  <span class="victory-score" id="victory-score"></span>
`;
document.body.appendChild(ecranVictoire);


// =============================================================================
// INITIALISATION (appelée depuis main.js après le clic "Jouer")
// =============================================================================

export function initVictoryScreen() {
  window.addEventListener('gameComplete', afficherEcranVictoire);
}


// =============================================================================
// AFFICHAGE DE L'ÉCRAN
// =============================================================================

function afficherEcranVictoire() {
  // On affiche le score final
  document.getElementById('victory-score').textContent =
    `${TOTAL_OBJETS} / ${TOTAL_OBJETS} objets identifiés`;

  // On affiche l'écran (la classe CSS 'visible' déclenche le fondu d'entrée)
  ecranVictoire.classList.add('visible');

  // On lance les effets glitch sur le titre principal
  lancerEffetsGlitch();
}


// =============================================================================
// EFFETS GLITCH SUR LE TITRE
// =============================================================================

function lancerEffetsGlitch() {
  const titre       = document.getElementById('victory-main-title');
  let   nbGlitchs   = 0;

  const intervalle = setInterval(() => {
    // On ajoute la classe 'glitch' qui déclenche l'animation CSS
    titre.classList.add('glitch');

    // On retire la classe quand l'animation est terminée
    titre.addEventListener('animationend', () => {
      titre.classList.remove('glitch');
    }, { once: true });

    // Après NB_GLITCHS répétitions, on arrête
    nbGlitchs++;
    if (nbGlitchs >= NB_GLITCHS) clearInterval(intervalle);

  }, INTERVALLE_MS);
}
