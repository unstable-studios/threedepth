import * as THREE from 'three';
import { setupOrthographicCamera } from './cameraUtils';

/**
 * Render heightmap using fast WebGL vertex-color method.
 * This renders the geometry with pre-computed vertex colors from a top-down view.
 * Fast but may not accurately represent the top surface for complex geometries.
 * 
 * @param geom - Geometry with color attribute already set
 * @param bbox - Bounding box of the geometry
 * @param zoom - Zoom level
 * @param width - Output width in pixels
 * @param height - Output height in pixels
 * @returns Data URL of the rendered PNG
 */
export function renderFastHeightmap(
	geom: THREE.BufferGeometry,
	bbox: THREE.Box3,
	zoom: number,
	width: number,
	height: number
): string {
	const scene = new THREE.Scene();
	const material = new THREE.MeshBasicMaterial({
		vertexColors: true,
		side: THREE.FrontSide,
	});
	const mesh = new THREE.Mesh(geom, material);
	scene.add(mesh);

	// Center mesh in XY
	const cx = (bbox.min.x + bbox.max.x) / 2;
	const cy = (bbox.min.y + bbox.max.y) / 2;
	mesh.position.set(-cx, -cy, 0);

	const camera = setupOrthographicCamera(bbox, zoom);

	const renderer = new THREE.WebGLRenderer({
		antialias: false,
		alpha: false,
		preserveDrawingBuffer: true,
	});
	renderer.setSize(width, height);
	renderer.setClearColor(0x000000, 1);

	renderer.render(scene, camera);

	const dataUrl = renderer.domElement.toDataURL('image/png');

	renderer.dispose();
	material.dispose();

	return dataUrl;
}
