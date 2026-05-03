import * as THREE from 'three';

export function setupMarche(camera, options = {}) {
    const vitesse     = options.vitesse     ?? 0.05;
    const hauteur     = options.hauteur     ?? 1.7;
    const sensibilite = options.sensibilite ?? 0.002;

    const keys = { z: false, q: false, s: false, d: false };
    let yaw = 0, pitch = 0;

    const dir   = new THREE.Vector3();
    const front = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up    = new THREE.Vector3(0, 1, 0);

    const onKeyDown = e => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; };
    const onKeyUp   = e => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; };

    const onMouseMove = e => {
        if (!document.pointerLockElement) return;
        yaw   -= e.movementX * sensibilite;
        pitch  = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch - e.movementY * sensibilite));
    };

    const onCanvasClick = () => document.body.requestPointerLock();

    function update() {
        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;

        camera.getWorldDirection(front);
        front.y = 0;
        front.normalize();
        right.crossVectors(front, up).normalize();

        dir.set(0, 0, 0);
        if (keys.z) dir.add(front);
        if (keys.s) dir.sub(front);
        if (keys.d) dir.add(right);
        if (keys.q) dir.sub(right);

        if (dir.lengthSq() > 0) camera.position.addScaledVector(dir.normalize(), vitesse);
        camera.position.y = hauteur;
    }

    function destroy() {
        window.removeEventListener('keydown',   onKeyDown);
        window.removeEventListener('keyup',     onKeyUp);
        window.removeEventListener('mousemove', onMouseMove);
        document.body.removeEventListener('click', onCanvasClick);
    }

    window.addEventListener('keydown',   onKeyDown);
    window.addEventListener('keyup',     onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('click', onCanvasClick);

    return { update, destroy };
}