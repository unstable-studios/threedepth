import * as THREE from 'three';
import { applyDebugColors } from './colorUtils';

/**
 * Compute vertex colors for a heightmap based on Z values.
 * Each vertex is assigned an RGB color representing its normalized height.
 * 
 * @param geom - Geometry with position attribute
 * @param zMin - Minimum Z value in the geometry
 * @param zMax - Maximum Z value in the geometry
 * @param debugColors - Whether to apply debug color tints
 * @param invert - Whether to invert the grayscale values
 * @returns Float32Array of RGB colors (3 values per vertex)
 */
export function computeVertexColors(
	geom: THREE.BufferGeometry,
	zMin: number,
	zMax: number,
	debugColors: boolean,
	invert: boolean
): Float32Array {
	const pos = geom.getAttribute('position') as THREE.BufferAttribute;
	const vertexCount = pos.count;
	const colors = new Float32Array(vertexCount * 3);
	const span = zMax - zMin || 1;
	const eps = 1e-5;

	for (let i = 0; i < vertexCount; i++) {
		const vz = pos.getZ(i);
		const rawNorm = (vz - zMin) / span;
		let norm = THREE.MathUtils.clamp(rawNorm, 0, 1);
		if (invert) norm = 1 - norm;

		const { r, g, b } = applyDebugColors(norm, rawNorm, eps, debugColors, invert);

		colors[i * 3 + 0] = r;
		colors[i * 3 + 1] = g;
		colors[i * 3 + 2] = b;
	}

	return colors;
}
