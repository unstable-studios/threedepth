import * as THREE from 'three';
import type { AxisChoice } from './types';

/**
 * Reorient geometry so that the chosen axis becomes the "height" (Z) axis.
 * This allows generating heightmaps from different orientations.
 * 
 * @param geometry - Source geometry to reorient
 * @param axis - Which axis to treat as height (Z, Y, or X)
 * @returns New geometry with reoriented vertices
 */
export function orientGeometry(
	geometry: THREE.BufferGeometry,
	axis: AxisChoice
): THREE.BufferGeometry {
	const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
	const count = pos.count;

	const newPositions = new Float32Array(count * 3);

	for (let i = 0; i < count; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		const z = pos.getZ(i);

		let nx: number, ny: number, nz: number;

		switch (axis) {
			case 'Z':
				nx = x;
				ny = y;
				nz = z;
				break;
			case 'Y':
				// Y is height, project onto X–Z
				nx = x;
				ny = z;
				nz = y;
				break;
			case 'X':
				// X is height, project onto Y–Z
				nx = y;
				ny = z;
				nz = x;
				break;
			default:
				nx = x;
				ny = y;
				nz = z;
		}

		newPositions[i * 3 + 0] = nx;
		newPositions[i * 3 + 1] = ny;
		newPositions[i * 3 + 2] = nz;
	}

	const newGeom = new THREE.BufferGeometry();
	newGeom.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));

	if (geometry.getIndex()) {
		newGeom.setIndex(geometry.getIndex()!.clone());
	}

	return newGeom;
}
