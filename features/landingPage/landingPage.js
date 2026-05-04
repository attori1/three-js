// =============================================================================
// landingPage.js — Landing page style émission TV cyberpunk
// =============================================================================
//
// Ambiance : on regarde une émission en direct sur CYBER_TV.
// La chaîne diffuse "CYBERPUNK STATION", une émission de jeu.
// Au clic "Jouer", la caméra recule hors du téléviseur pour révéler la scène 3D.
//
// ÉVÉNEMENTS
//   Écoute → 'sceneReady'  : scène 3D chargée, bouton Jouer actif
//   Émet   → 'gameStart'   : le jeu peut commencer
//
// =============================================================================

import './landingPage.css';


// =============================================================================
// ACTUALITÉS DU TICKER (bandeau défilant en bas)
// =============================================================================

const TICKER_HEADLINES = [
  'ALERTE — Night City déclare l\'état d\'urgence suite à des attaques de hackers corporatifs',
  'CORP WATCH — Arasaka annonce l\'acquisition de trois sociétés de biotechnologie pour 4,2 milliards de crédits',
  'EXCLUSIF — Un runner aurait pénétré les serveurs de Militech et exfiltré des plans d\'armes classifiés',
  'MÉTÉO TECH — Pluie acide signalée dans le secteur Pacifica, portez vos filtres respiratoires',
  'SPORT VIRTUEL — Les Prochains Championnats d\'OASIS débuteront le 15 prochain dans la zone Jade',
  'SANTÉ — De nouveaux implants neuronaux de gen-4 disponibles dans les cliniques agréées de Watson',
  'FLASH INFO — La Sentinelle de la Matrix aperçue dans les tunnels de Zion, niveau d\'alerte 3',
  'CULTURE — Le festival néo-rétro d\'Akira célèbre ses 40 ans avec une rétrospective à Neo-Tokyo',
];


// =============================================================================
// CONTENU DES MODALES
// =============================================================================

const CONTENU_MODALES = {
  regles: {
    titre: '// Les Règles',
    corps: `
      <strong>01 — Explorer</strong>
      La scène 3D contient 17 objets iconiques de l'univers Cyberpunk.
      Utilisez la souris pour naviguer dans l'espace.

      <strong>02 — Identifier</strong>
      Cliquez sur un objet pour zoomer dessus.
      17 cartes apparaissent en bas — une seule est la bonne.

      <strong>03 — Glisser</strong>
      Faites glisser la bonne carte vers la zone centrale pour valider.
      Chaque erreur consomme une tentative (max 3).

      <strong>04 — Indice</strong>
      Après 3 erreurs, un indice de catégorie s'affiche :
      Jeu Vidéo · Film · Série · Manga · Animé.

      <strong>05 — Victoire</strong>
      Identifiez les 17 objets pour devenir Légende du Cyberpunk.
    `
  },
  apropos: {
    titre: '// Qui sommes-nous ?',
    corps: `
      <strong>CYBERPUNK STATION</strong>
      Une expérience interactive immersive dédiée à l'univers Cyberpunk.
      Découvrez et identifiez les objets emblématiques de vos œuvres favorites.

      <strong>Univers couverts</strong>
      Jeux vidéo · Films · Séries · Mangas · Animés.
      De Blade Runner à NieR:Automata, de Ghost in the Shell à Akira.

      <strong>Technologie</strong>
      Construit avec Three.js · WebGL · Vite.
      Modèles 3D chargés en GLTF/DRACO.

      <strong>Contact</strong>
      Une question ? Une suggestion ?
      Retrouvez-nous sur nos réseaux.
    `
  }
};


// =============================================================================
// CRÉATION DU HTML
// =============================================================================

const ecranTV = document.createElement('div');
ecranTV.id    = 'tv-outer';
ecranTV.innerHTML = `
  <div id="tv-bezel">
    <div id="tv-screen">

      <div id="tv-sweep"></div>

      <!-- ── Barre de diffusion haute ─────────────────────────────────── -->
      <div id="tv-broadcast-bar">

        <div id="tv-channel-logo">
          <span id="tv-channel-name">CYBER_TV</span>
          <span id="tv-channel-num">CH · 07</span>
        </div>

        <div id="tv-live-badge">
          <span id="tv-live-dot"></span>
          <span id="tv-live-text">EN DIRECT</span>
        </div>

        <div id="tv-broadcast-right">
          <div id="tv-signal-bars">
            <span class="signal-bar"></span>
            <span class="signal-bar"></span>
            <span class="signal-bar"></span>
            <span class="signal-bar"></span>
          </div>
          <span id="tv-clock">--:--:--</span>
        </div>

      </div>

      <!-- ── Zone centrale : titre + boutons ──────────────────────────── -->
      <div id="tv-content">

        <div id="tv-title-block">
          <span id="tv-main-title">CYBERPUNK<br>STATION</span>
          <span id="tv-tagline">∙ Identifiez les légendes de l'ère numérique ∙</span>
        </div>

        <div id="tv-buttons">
          <button id="btn-play">▶ &nbsp; Jouer</button>
          <button class="btn-secondary" id="btn-regles">Les Règles</button>
          <button class="btn-secondary" id="btn-apropos">Qui sommes-nous ?</button>
        </div>

      </div>

      <!-- ── Lower third : nom de l'émission ──────────────────────────── -->
      <div id="tv-lower-third">
        <div id="tv-lower-accent"></div>
        <div id="tv-lower-content">
          <span id="tv-show-name">Cyberpunk Station</span>
          <span id="tv-show-meta">S01 · E01 · 17 objets · Jeu de culture digitale</span>
        </div>
      </div>

      <!-- ── Ticker d'actualités ───────────────────────────────────────── -->
      <div id="tv-ticker-bar">
        <span id="tv-ticker-label">Actu</span>
        <div id="tv-ticker-track">
          <span id="tv-ticker-content"></span>
        </div>
      </div>

      <!-- ── Modale partagée ───────────────────────────────────────────── -->
      <div id="tv-modal-overlay">
        <div id="tv-modal-box">
          <span id="modal-title"></span>
          <div  id="modal-body"></div>
          <button id="modal-close">Fermer</button>
        </div>
      </div>

    </div>
  </div>
`;
document.body.appendChild(ecranTV);


// =============================================================================
// RÉFÉRENCES DOM
// =============================================================================

const btnJouer       = ecranTV.querySelector('#btn-play');
const btnRegles      = ecranTV.querySelector('#btn-regles');
const btnApropos     = ecranTV.querySelector('#btn-apropos');
const modalOverlay   = ecranTV.querySelector('#tv-modal-overlay');
const modalTitre     = ecranTV.querySelector('#modal-title');
const modalCorps     = ecranTV.querySelector('#modal-body');
const modalFermer    = ecranTV.querySelector('#modal-close');
const titrePrincipal = ecranTV.querySelector('#tv-main-title');
const horlogeEl      = ecranTV.querySelector('#tv-clock');
const tickerEl       = ecranTV.querySelector('#tv-ticker-content');


// =============================================================================
// ÉTAT
// =============================================================================

let sceneEstPrete = false;


// =============================================================================
// INITIALISATION
// =============================================================================

export function initLandingPage() {
  const loaderScreen = document.getElementById('loader-screen');
  if (loaderScreen) loaderScreen.style.display = 'none';

  const hintsNavigation = document.getElementById('controls-hint');
  if (hintsNavigation) hintsNavigation.style.display = 'none';

  // Démarrage des éléments dynamiques
  demarrerHorloge();
  demarrerTicker();

  // Glitch aléatoire toutes les ~4–6 secondes
  setInterval(declencherGlitch, 3800 + Math.random() * 2000);

  // Boutons
  btnJouer.addEventListener('click',   onClicJouer);
  btnRegles.addEventListener('click',  () => ouvrirModal('regles'));
  btnApropos.addEventListener('click', () => ouvrirModal('apropos'));
  modalFermer.addEventListener('click', fermerModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fermerModal();
  });

  window.addEventListener('sceneReady', onScenePrete);
}


// =============================================================================
// HORLOGE EN TEMPS RÉEL
// =============================================================================

function demarrerHorloge() {
  function mettreAJour() {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');
    horlogeEl.textContent = `${hh}:${mm}:${ss}`;
  }
  mettreAJour();
  setInterval(mettreAJour, 1000);
}


// =============================================================================
// TICKER D'ACTUALITÉS
// =============================================================================

function demarrerTicker() {
  // On assemble toutes les actualités séparées par un séparateur
  const texte = TICKER_HEADLINES.join('   ·   ');
  tickerEl.textContent = texte;
}


// =============================================================================
// SCÈNE 3D PRÊTE
// =============================================================================

function onScenePrete() {
  sceneEstPrete = true;
  if (btnJouer.classList.contains('loading')) {
    btnJouer.classList.remove('loading');
    lancerAnimationSortie();
  }
}


// =============================================================================
// CLIC "JOUER"
// =============================================================================

function onClicJouer() {
  if (!sceneEstPrete) {
    btnJouer.textContent = '· chargement ·';
    btnJouer.classList.add('loading');
    return;
  }
  lancerAnimationSortie();
}


// =============================================================================
// ANIMATION DE SORTIE DE LA TÉLÉ
// =============================================================================

function lancerAnimationSortie() {
  ecranTV.classList.add('exiting');

  setTimeout(() => {
    ecranTV.classList.add('shrinking');
    ecranTV.addEventListener('animationend', onAnimationSortieTerminee, { once: true });
  }, 580);
}

function onAnimationSortieTerminee() {
  ecranTV.style.display = 'none';

  const hintsNavigation = document.getElementById('controls-hint');
  if (hintsNavigation) hintsNavigation.style.display = 'flex';

  window.dispatchEvent(new CustomEvent('gameStart'));
}


// =============================================================================
// MODALES
// =============================================================================

function ouvrirModal(cle) {
  const contenu       = CONTENU_MODALES[cle];
  modalTitre.textContent = contenu.titre;
  modalCorps.innerHTML   = contenu.corps;
  modalOverlay.classList.add('visible');
}

function fermerModal() {
  modalOverlay.classList.remove('visible');
}


// =============================================================================
// EFFET GLITCH TITRE
// =============================================================================

function declencherGlitch() {
  if (ecranTV.style.display === 'none') return;
  titrePrincipal.classList.add('glitch');
  titrePrincipal.addEventListener('animationend', () => {
    titrePrincipal.classList.remove('glitch');
  }, { once: true });
}
