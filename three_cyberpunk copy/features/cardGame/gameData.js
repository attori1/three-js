// =============================================================================
// gameData.js — Données des 18 objets du jeu
// =============================================================================
//
// Ce fichier contient toutes les données du jeu :
//   - Les 18 objets cyberpunk avec leur catégorie et leurs informations
//   - Les constantes de catégories et de couleurs
//
// COMMENT AJOUTER UN NOUVEL OBJET
//   1. Ajoutez son modèle .glb dans assets.js avec interact: true
//   2. Ajoutez une entrée dans le tableau gameObjects ci-dessous
//   3. Le jeu le prendra en compte automatiquement
//
// =============================================================================


// =============================================================================
// CATÉGORIES
// =============================================================================

export const CATEGORIES = {
  VIDEOGAME: 'videogame',
  FILM:      'film',
  MANGA:     'manga'
};

// Labels affichés dans l'interface
export const CATEGORY_LABELS = {
  videogame: 'Jeu Vidéo',
  film:      'Film · Série',
  manga:     'Manga · Animé'
};

// Couleurs des cartes par catégorie (utilisées dans le CSS)
export const CARD_COLORS = {
  videogame: '#6633EE', // violet
  film:      '#EE3D1A', // orange-rouge
  manga:     '#C5E63C'  // citron vert
};


// =============================================================================
// LES 18 OBJETS DU JEU
// =============================================================================
//
// Chaque objet contient :
//   id          → identifiant unique (doit correspondre au `name` dans assets.js)
//   category    → 'videogame', 'film', ou 'manga'
//   cardLabel   → texte affiché sur la carte
//   hint        → indice affiché après 3 erreurs
//   info        → données statiques affichées sur la face arrière de la carte
//   apiEndpoint → URL de votre API (null = données statiques)
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  CONNEXION API                                                          ║
// ╠══════════════════════════════════════════════════════════════════════════╣
// ║  Remplacez `apiEndpoint: null` par votre URL :                          ║
// ║    apiEndpoint: 'https://votre-api.com/objets/arcade'                   ║
// ║                                                                         ║
// ║  Votre API doit retourner un JSON avec ce format :                      ║
// ║    {                                                                    ║
// ║      "title":       "Titre de l'œuvre",                                 ║
// ║      "description": "Description courte",                               ║
// ║      "year":        "1982",    ← optionnel                              ║
// ║      "imageUrl":    "https://..." ← optionnel, non utilisé pour l'instant ║
// ║    }                                                                    ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export const gameObjects = [


  // ─────────────────────────────────────────────────────────────────────────
  // JEUX VIDÉO  —  cartes violettes
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:          'b12_robot',
    category:    CATEGORIES.VIDEOGAME,
    cardLabel:   'STRAY',
    hint:        'Jeu Vidéo',
    info: {
      title:       'B-12 · Stray',
      description: 'Drone compagnon d\'un chat errant dans une cité dystopique abandonnée par les humains, gérée par des robots.',
      year:        '2022'
    },
    apiEndpoint: null  // → remplacez par votre URL
  },

  {
    id:          'deus_ex',
    category:    CATEGORIES.VIDEOGAME,
    cardLabel:   'DEUS EX',
    hint:        'Jeu Vidéo',
    info: {
      title:       'Deus Ex',
      description: 'Emblème du jeu transhumaniste. Adam Jensen, agent augmenté de Sarif Industries, navigue entre conspirations mondiales.',
      year:        '2000'
    },
    apiEndpoint: null
  },

  {
    id:          'buster_sword',
    category:    CATEGORIES.VIDEOGAME,
    cardLabel:   'FINAL FANTASY VII',
    hint:        'Jeu Vidéo',
    info: {
      title:       'Épée Buster · Final Fantasy VII Remake',
      description: 'Arme iconique de Cloud Strife, ex-SOLDAT combattant la corporation Shinra dans les bas-fonds de Midgar.',
      year:        '2020'
    },
    apiEndpoint: null
  },

  {
    id:          'nier_robot',
    category:    CATEGORIES.VIDEOGAME,
    cardLabel:   'NIER:AUTOMATA',
    hint:        'Jeu Vidéo',
    info: {
      title:       'Unité Robot · NieR:Automata',
      description: 'Automate de la Légion Machine. Dans un monde post-apocalyptique, machines et androïdes YoRHa s\'affrontent pour une humanité disparue.',
      year:        '2017'
    },
    apiEndpoint: null
  },

  {
    id:          'errata',
    category:    CATEGORIES.VIDEOGAME,
    cardLabel:   'CYBERPUNK 2077',
    hint:        'Jeu Vidéo',
    info: {
      title:       'Cyberpunk 2077',
      description: 'Dans Night City, V s\'allie à la conscience numérique de Johnny Silverhand pour survivre avec un chip neural volé.',
      year:        '2020'
    },
    apiEndpoint: null
  },



  // ─────────────────────────────────────────────────────────────────────────
  // FILMS & SÉRIES  —  cartes orange-rouge
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:          'deckard_gun',
    category:    CATEGORIES.FILM,
    cardLabel:   'BLADE RUNNER',
    hint:        'Film · Série',
    info: {
      title:       'Sidearm de Deckard · Blade Runner',
      description: 'L\'arme de service du blade runner Rick Deckard, conçue pour retirer les réplicants Nexus-6 rebelles dans Los Angeles 2019.',
      year:        '1982'
    },
    apiEndpoint: null
  },

  {
    id:          'robocop',
    category:    CATEGORIES.FILM,
    cardLabel:   'ROBOCOP',
    hint:        'Film · Série',
    info: {
      title:       'RoboCop',
      description: 'Cyborg policier d\'OCP dans un Detroit dystopique. Alex Murphy, tué en service, ressuscité en machine de justice.',
      year:        '1987'
    },
    apiEndpoint: null
  },

  {
    id:          'sentinel_matrix',
    category:    CATEGORIES.FILM,
    cardLabel:   'THE MATRIX',
    hint:        'Film · Série',
    info: {
      title:       'Sentinelle · The Matrix',
      description: 'Machine de surveillance de Zion. Ces créatures tentaculaires patrouillent les tunnels, dernier bastion de l\'humanité libre.',
      year:        '1999'
    },
    apiEndpoint: null
  },

  {
    id:          'tron_disk',
    category:    CATEGORIES.FILM,
    cardLabel:   'TRON',
    hint:        'Film · Série',
    info: {
      title:       'Disque Identité · Tron',
      description: 'Arme et mémoire d\'un programme dans la Grille. Le disque contient l\'identité complète de son porteur.',
      year:        '1982'
    },
    apiEndpoint: null
  },

  {
    id:          'generic_obj',
    category:    CATEGORIES.FILM,
    cardLabel:   'READY PLAYER ONE',
    hint:        'Film · Série',
    info: {
      title:       'Ready Player One',
      description: 'Dans l\'OASIS, univers virtuel créé par James Halliday, Wade Watts part à la chasse aux œufs de Pâques pour hériter du contrôle du métavers.',
      year:        '2018'
    },
    apiEndpoint: null
  },


  // ─────────────────────────────────────────────────────────────────────────
  // MANGA & ANIMÉ  —  cartes citron vert
  // ─────────────────────────────────────────────────────────────────────────

  {
    id:          'dominator',
    category:    CATEGORIES.MANGA,
    cardLabel:   'PSYCHO-PASS',
    hint:        'Manga · Animé',
    info: {
      title:       'Dominator · Psycho-Pass',
      description: 'Arme de l\'Inspectorat qui adapte sa létalité selon le Crime Coefficient de la cible. Impossible à utiliser contre un innocent.',
      year:        '2012'
    },
    apiEndpoint: null
  },

  {
    id:          'spear_longinus',
    category:    CATEGORIES.MANGA,
    cardLabel:   'EVANGELION',
    hint:        'Manga · Animé',
    info: {
      title:       'Lance de Longin · Neon Genesis Evangelion',
      description: 'Arme divine capable de percer l\'A.T. Field absolu de l\'Adam. Utilisée lors du Second Impact.',
      year:        '1995'
    },
    apiEndpoint: null
  },

  {
    id:          'zerocasco',
    category:    CATEGORIES.MANGA,
    cardLabel:   'CODE GEASS',
    hint:        'Manga · Animé',
    info: {
      title:       'Casque de Zéro · Code Geass',
      description: 'Masque emblématique de Lelouch vi Britannia, leader masqué de l\'Ordre des Chevaliers Noirs.',
      year:        '2006'
    },
    apiEndpoint: null
  },

  {
    id:          'ghost_shell_eye',
    category:    CATEGORIES.MANGA,
    cardLabel:   'GHOST IN THE SHELL',
    hint:        'Manga · Animé',
    info: {
      title:       'Œil Cybernétique · Ghost in the Shell',
      description: 'Implant optique de la Major Motoko Kusanagi, Section 9. Interface directe avec le cyberespace.',
      year:        '1995'
    },
    apiEndpoint: null
  },

  {
    id:          'akira_bike',
    category:    CATEGORIES.MANGA,
    cardLabel:   'AKIRA',
    hint:        'Manga · Animé',
    info: {
      title:       'Moto de Kaneda · Akira',
      description: 'La moto rouge de Shotaro Kaneda. Symbole absolu du cyberpunk post-apocalyptique, déchirant les rues de Neo-Tokyo 2019.',
      year:        '1988'
    },
    apiEndpoint: null
  }

];
