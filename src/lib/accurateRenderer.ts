import * as THREE from 'three';
import { setupOrthographicCamera } from './cameraUtils';

/**
 * Render heightmap using accurate raycast method.
 * This samples each pixel by raycasting from above, finding the topmost intersection.
 * Slower but accurate for complex geometries with overlapping surfaces.
 * 
 * @param geom - Geometry to render (color attribute optional)
 * @param bbox - Bounding box of the geometry
 * @param zoom - Zoom level
 * @param width - Output width in pixels
 * @param height - Output height in pixels
 * @param zMin - Minimum Z value (darkest)
 * @param zMax - Maximum Z value (brightest)
 * @param invert - If true, invert the grayscale (lower is brighter)
 * @param onProgress - Optional progress callback (fraction: 0..1)
 * @returns Data URL of the rendered PNG
 */
export function renderAccurateHeightmap(
	geom: THREE.BufferGeometry,
	bbox: THREE.Box3,
	zoom: number,
	width: number,
	height: number,
	zMin: number,
	zMax: number,
	invert: boolean,
	onProgress?: (fraction: number) => void
): string {
	const scene = new THREE.Scene();
	const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
	const mesh = new THREE.Mesh(geom, material);
	scene.add(mesh);

	// Center mesh
	const cx = (bbox.min.x + bbox.max.x) / 2;
	const cy = (bbox.min.y + bbox.max.y) / 2;
	mesh.position.set(-cx, -cy, 0);

	const camera = setupOrthographicCamera(bbox, zoom);
	const raycaster = new THREE.Raycaster();

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) throw new Error('Could not get 2D context');

	const imageData = ctx.createImageData(width, height);
	const data = imageData.data;

	const zRange = zMax - zMin;

	const cam = camera as THREE.OrthographicCamera;
	const worldWidth = (cam.right - cam.left) * zoom;
	const worldHeight = (cam.top - cam.bottom) * zoom;

	const worldLeft = -worldWidth / 2;
	const worldBottom = -worldHeight / 2;

	const totalPixels = width * height;

	for (let py = 0; py < height; py++) {
		for (let px = 0; px < width; px++) {
			const wx = worldLeft + (px / width) * worldWidth;
			const wy = worldBottom + ((height - 1 - py) / height) * worldHeight;

			const origin = new THREE.Vector3(wx, wy, 1000);
			const direction = new THREE.Vector3(0, 0, -1);

			raycaster.set(origin, direction);
			const intersects = raycaster.intersectObject(mesh, false);

			let gray = 0;
			if (intersects.length > 0) {
				// Find topmost (highest Z) intersection
				let topZ = -Infinity;
				for (const hit of intersects) {
					if (hit.point.z > topZ) topZ = hit.point.z;
				}

				const t = zRange > 1e-9 ? (topZ - zMin) / zRange : 0.5;
				gray = invert ? 255 * (1 - t) : 255 * t;
			}

			const idx = (py * width + px) * 4;
			data[idx] = gray;
			data[idx + 1] = gray;
			data[idx + 2] = gray;
			data[idx + 3] = 255;
		}

		if (onProgress && py % 10 === 0) {
			const done = (py + 1) * width;
			onProgress(done / totalPixels);
		}
	}

	if (onProgress) onProgress(1.0);

	ctx.putImageData(imageData, 0, 0);

	material.dispose();

	return canvas.toDataURL('image/png');
}
