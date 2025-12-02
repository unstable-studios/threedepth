import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Normalize object to fit in 20x20x20 cube with base at z=0
function normalizeObject(object: THREE.Object3D): THREE.Object3D {
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

	return clone;
}

export function STLModel({
	url,
	onReady,
}: {
	url: string;
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
		return normalizeObject(m);
	}, [geometry]);

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
	onReady,
}: {
	url: string;
	onReady?: () => void;
}) {
	const gltf = useLoader(GLTFLoader, url);
	const normalized = useMemo(() => normalizeObject(gltf.scene), [gltf.scene]);

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
	onReady,
}: {
	url: string;
	onReady?: () => void;
}) {
	const model = useLoader(OBJLoader, url);
	const normalized = useMemo(() => normalizeObject(model), [model]);

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
	onReady,
}: {
	url: string;
	format: 'gltf' | 'glb' | 'stl' | 'obj';
	onReady?: () => void;
}) {
	if (format === 'stl') return <STLModel url={url} onReady={onReady} />;
	if (format === 'gltf' || format === 'glb')
		return <GLTFModel url={url} onReady={onReady} />;
	if (format === 'obj') return <OBJModel url={url} onReady={onReady} />;
	return null;
}
