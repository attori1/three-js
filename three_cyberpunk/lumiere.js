import * as THREE from 'three';

export function setupLumieres(scene) {

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 1.2);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const cyanLight = new THREE.PointLight(0x00ccff, 6, 30);
    cyanLight.position.set(0, 2, -1);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x9933ff, 5, 25);
    violetLight.position.set(-3, 3, 2);
    scene.add(violetLight);

    const pinkLight = new THREE.PointLight(0xff0077, 4, 20);
    pinkLight.position.set(3, 2, 1);
    scene.add(pinkLight);
}

export function setupLumieresArcade(scene) {

    const arcadeLight1 = new THREE.PointLight(0xff44cc, 30, 12);
    arcadeLight1.position.set(4.0, 0.5, 2.5);
    scene.add(arcadeLight1);

    const arcadeLight2 = new THREE.PointLight(0xff0077, 25, 10);
    arcadeLight2.position.set(5.3, -1.0, 2.0);
    scene.add(arcadeLight2);

    const arcadeLight3 = new THREE.PointLight(0xffffff, 20, 8);
    arcadeLight3.position.set(5.3, -1.8, 1.5);
    scene.add(arcadeLight3);

    const arcadeLight4 = new THREE.PointLight(0x00eeff, 20, 10);
    arcadeLight4.position.set(5.3, 1.5, 1.2);
    scene.add(arcadeLight4);
}