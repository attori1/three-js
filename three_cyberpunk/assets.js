// assets.js
export const sceneConfig = {
    models: [
        {
            name: 'decor',
            path: 'objets/decor.glb',
            pos: [0, -2, 5.2],
            scale: [2.3, 2, 2],
            rotY: 0,
            interact: false,
            hasSpecialLight: true
        },
        {
            name: 'arcade',
            path: 'objets/rusty_japanese_arcade.glb',
            pos: [5.2, -2, 1.5],
            scale: [0.65, 0.7, 0.8],
            rotY: -0.9,
            interact: true,
            hasSpecialLight: true
        },
        {
            name: 'errata',
            path: 'objets/errata.glb',
            pos: [0, 0, 0],
            scale: [0.2, 0.2, 0.2],
            rotY: 0,
            interact: true,
            useGui: true
        },
        {
            name: 'b12_robot',
            path: 'objets/b12_robot_from_stray.glb',
            pos: [1.5, 0.8, 0],
            scale: [0.3, 0.3, 0.3],
            rotY: -0.5,
            interact: true
        },
        {
            name: 'deckard_gun',
            path: 'objets/deckards_sidearm_from_blade_runner.glb',
            pos: [-1.2, 0.9, 0.5],
            scale: [0.12, 0.12, 0.12],
            rotY: Math.PI / 4,
            interact: true
        },
        {
            name: 'deus_ex',
            path: 'objets/deus_ex.glb',
            pos: [2.5, 0, -1.5],
            scale: [0.2, 0.2, 0.2],
            rotY: 0,
            interact: true
        },
        {
            name: 'spear_longinus',
            path: 'objets/evangelion_the_spear_of_longinus.glb',
            pos: [0, 0, -4],
            scale: [0.04, 0.04, 0.04],
            rotY: 0.2,
            interact: false
        },
        {
            name: 'buster_sword',
            path: 'objets/final_fantasy_7_remake_buster_sword.glb',
            pos: [-2, 0.5, -2],
            scale: [0.1, 0.1, 0.1],
            rotY: -Math.PI / 3,
            interact: true
        },
        {
            name: 'dominator',
            path: 'objets/low-poly_cerevo_dominator_paralyzer.glb',
            pos: [0, 1, 0],
            scale: [0.25, 0.25, 0.25],
            rotY: 0.1,
            interact: true,
            intensity: 0.6, 
            ignoreEmbeddedLights: true 
        },
        {
            name: 'nier_robot',
            path: 'objets/nier_automata__small_robot.glb',
            pos: [-2.5, 0, 1.5],
            scale: [0.2, 0.2, 0.2],
            rotY: 0.5,
            interact: true
        },
        {
            name: 'robocop',
            path: 'objets/robocop.glb',
            pos: [-4, 0, -1],
            scale: [0.18, 0.18, 0.18],
            rotY: Math.PI / 6,
            interact: false,
            intensity: 0.4, 
            ignoreEmbeddedLights: true
        },
        {
            name: 'sentinel_matrix',
            path: 'objets/sentinelle_-_matrix.glb',
            pos: [3, 2, -5],
            scale: [0.015, 0.015, 0.015],
            rotY: 0,
            interact: false
        },
        {
            name: 'tron_disk',
            path: 'objets/tron_disk.glb',
            pos: [0.8, 1.2, 1.2],
            scale: [0.003, 0.003, 0.003],
            rotY: 0,
            interact: true,
            intensity: 0.5,
            ignoreEmbeddedLights: true
        },
        {
            name: 'zerocasco',
            path: 'objets/zerocasco_code_geass.glb',
            pos: [1.8, 1, -0.8],
            scale: [0.15, 0.15, 0.15],
            rotY: -0.2,
            interact: true,
        },
        {
            name: 'generic_obj',
            path: 'objets/obj.glb', 
            pos: [0, -1, 5],
            scale: [1, 1, 1],
            rotY: 0,
            interact: false,
            intensity: 0.5,
            ignoreEmbeddedLights: true

        }
    ]
};