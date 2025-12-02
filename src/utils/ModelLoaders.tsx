import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { normalizeObject, normalizeObjectInPlace } from './geometry';

export function STLModel({
	url,
	normalizeMode = 'clone',
	onReady,
}: {
	url: string;
	normalizeMode?: 'clone' | 'mutate';
	onReady?: () => void;
}) {
	const geometry = useLoader(STLLoader, url);
	const mesh = useMemo(
		() =>
			new THREE.Mesh(
				geometry,
				new THREE.MeshStandardMaterial({
					color: '#ffffff',
					roughness: 0.3,
					metalness: 0.1,
				})
			),
		[geometry]
	);
	const output = useMemo(
		() =>
			normalizeMode === 'mutate'
				? normalizeObjectInPlace(mesh)
				: normalizeObject(mesh),
		[mesh, normalizeMode]
	);

	useEffect(() => {
		if (onReady) onReady();
	}, [output, onReady]);
	return <primitive object={output} />;
}

export function GLTFModel({
	url,
	normalizeMode = 'clone',
	onReady,
}: {
	url: string;
	normalizeMode?: 'clone' | 'mutate';
	onReady?: () => void;
}) {
	const gltf = useLoader(GLTFLoader, url);
	const normalized = useMemo(
		() =>
			normalizeMode === 'mutate'
				? normalizeObjectInPlace(gltf.scene)
				: normalizeObject(gltf.scene),
		[gltf.scene, normalizeMode]
	);
	useEffect(() => {
		if (onReady) onReady();
	}, [normalized, onReady]);
	return <primitive object={normalized} />;
}

export function OBJModel({
	url,
	normalizeMode = 'clone',
	onReady,
}: {
	url: string;
	normalizeMode?: 'clone' | 'mutate';
	onReady?: () => void;
}) {
	const model = useLoader(OBJLoader, url);
	const normalized = useMemo(
		() =>
			normalizeMode === 'mutate'
				? normalizeObjectInPlace(model)
				: normalizeObject(model),
		[model, normalizeMode]
	);
	useEffect(() => {
		if (onReady) onReady();
	}, [normalized, onReady]);
	return <primitive object={normalized} />;
}

export function Model({
	url,
	format,
	normalizeMode = 'clone',
	onReady,
}: {
	url: string;
	format: 'gltf' | 'glb' | 'stl' | 'obj';
	normalizeMode?: 'clone' | 'mutate';
	onReady?: () => void;
}) {
	if (format === 'stl')
		return (
			<STLModel url={url} normalizeMode={normalizeMode} onReady={onReady} />
		);
	if (format === 'gltf' || format === 'glb')
		return (
			<GLTFModel url={url} normalizeMode={normalizeMode} onReady={onReady} />
		);
	if (format === 'obj')
		return (
			<OBJModel url={url} normalizeMode={normalizeMode} onReady={onReady} />
		);
	return null;
}
