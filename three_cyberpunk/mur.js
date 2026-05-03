export function setupMurs(options = {}) {
    const xMin = options.xMin ?? -8;
    const xMax = options.xMax ??  8;
    const zMin = options.zMin ?? -7.3;
    const zMax = options.zMax ??  7.3;
    const marge = 0.3;

    return {
        checkCollision(camera) {
            const p = camera.position;
            p.x = Math.max(xMin + marge, Math.min(xMax - marge, p.x));
            p.z = Math.max(zMin + marge, Math.min(zMax - marge, p.z));
        }
    };
}