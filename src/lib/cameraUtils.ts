import * as THREE from 'three';

/**
 * Setup orthographic camera for top-down heightmap rendering.
 * Camera is positioned above the model looking straight down.
 * 
 * @param bbox - Bounding box of the geometry
 * @param zoom - Zoom level (1 = fit to view, >1 = closer)
 * @returns Configured orthographic camera
 */
export function setupOrthographicCamera(
	bbox: THREE.Box3,
	zoom: number
): THREE.OrthographicCamera {
	const sizeX = bbox.max.x - bbox.min.x;
	const sizeY = bbox.max.y - bbox.min.y;
	const baseSize = Math.max(sizeX, sizeY) || 1;
	const viewSize = baseSize / (zoom || 1);

	const camera = new THREE.OrthographicCamera(
		-viewSize / 2,
		viewSize / 2,
		viewSize / 2,
		-viewSize / 2,
		-1000,
		1000
	);

	const camDist = (bbox.max.z - bbox.min.z) * 2 + 100;
	camera.position.set(0, 0, bbox.max.z + camDist);
	camera.lookAt(0, 0, 0);

	return camera;
}
