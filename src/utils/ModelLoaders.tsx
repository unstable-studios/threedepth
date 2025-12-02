import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Normalize object to fit in 20x20x20 cube with base at z=0
// Then apply rotation to match the desired up axis
function normalizeObject(
	object: THREE.Object3D,
	upAxis: string = 'Z+'
): THREE.Object3D {
	const clone = object.clone();
	const box = new THREE.Box3().setFromObject(clone);
	const size = box.getSize(new THREE.Vector3());

	// Scale to fit in 20x20x20 cube
	const maxDim = Math.max(size.x, size.y, size.z);
	const scale = 20 / maxDim;
	clone.scale.multiplyScalar(scale);

	// Recalculate box after scaling
	box.setFromObject(clone);
	const newCenter = box.getCenter(new THREE.Vector3());

	// Center XY, place base at z=0
	clone.position.set(-newCenter.x, -newCenter.y, -box.min.z);

	// Apply rotation based on up axis
	// Default is Z+ (no rotation needed)
	const rotationGroup = new THREE.Group();
	rotationGroup.add(clone);

	switch (upAxis) {
		case 'Z-':
			rotationGroup.rotation.set(Math.PI, 0, 0);
			break;
		case 'Y+':
			rotationGroup.rotation.set(-Math.PI / 2, 0, 0);
			break;
		case 'Y-':
			rotationGroup.rotation.set(Math.PI / 2, 0, 0);
			break;
		case 'X+':
			rotationGroup.rotation.set(0, Math.PI / 2, 0);
			break;
		case 'X-':
			rotationGroup.rotation.set(0, -Math.PI / 2, 0);
			break;
		// Z+ is default, no rotation
	}

	// After rotation, recalculate bounding box and ensure base sits at z=0
	const finalBox = new THREE.Box3().setFromObject(rotationGroup);
	rotationGroup.position.z = -finalBox.min.z;

	return rotationGroup;
}

export function STLModel({
	url,
	upAxis = 'Z+',
	onReady,
}: {
	url: string;
	upAxis?: string;
	onReady?: () => void;
}) {
	const geometry = useLoader(STLLoader, url);
	const mesh = useMemo(() => {
		const m = new THREE.Mesh(
			geometry,
			new THREE.MeshStandardMaterial({
				color: '#ffffff',
				roughness: 0.3,
				metalness: 0.1,
			})
		);
		return normalizeObject(m, upAxis);
	}, [geometry, upAxis]);

	const firedRef = useRef<string | null>(null);
	useEffect(() => {
		if (firedRef.current !== url) {
			firedRef.current = url;
			if (onReady) onReady();
		}
	}, [url, onReady]);

	return <primitive object={mesh} />;
}

export function GLTFModel({
	url,
	upAxis = 'Z+',
	onReady,
}: {
	url: string;
	upAxis?: string;
	onReady?: () => void;
}) {
	const gltf = useLoader(GLTFLoader, url);
	const normalized = useMemo(
		() => normalizeObject(gltf.scene, upAxis),
		[gltf.scene, upAxis]
	);

	const firedRef = useRef<string | null>(null);
	useEffect(() => {
		if (firedRef.current !== url) {
			firedRef.current = url;
			if (onReady) onReady();
		}
	}, [url, onReady]);

	return <primitive object={normalized} />;
}

export function OBJModel({
	url,
	upAxis = 'Z+',
	onReady,
}: {
	url: string;
	upAxis?: string;
	onReady?: () => void;
}) {
	const model = useLoader(OBJLoader, url);
	const normalized = useMemo(
		() => normalizeObject(model, upAxis),
		[model, upAxis]
	);

	const firedRef = useRef<string | null>(null);
	useEffect(() => {
		if (firedRef.current !== url) {
			firedRef.current = url;
			if (onReady) onReady();
		}
	}, [url, onReady]);

	return <primitive object={normalized} />;
}

export function Model({
	url,
	format,
	upAxis = 'Z+',
	onReady,
}: {
	url: string;
	format: 'gltf' | 'glb' | 'stl' | 'obj';
	upAxis?: string;
	onReady?: () => void;
}) {
	if (format === 'stl')
		return <STLModel url={url} upAxis={upAxis} onReady={onReady} />;
	if (format === 'gltf' || format === 'glb')
		return <GLTFModel url={url} upAxis={upAxis} onReady={onReady} />;
	if (format === 'obj')
		return <OBJModel url={url} upAxis={upAxis} onReady={onReady} />;
	return null;
}
