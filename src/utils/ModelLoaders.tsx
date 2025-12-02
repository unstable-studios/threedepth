import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useEffect, useRef } from 'react';

export function STLModel({
	url,
	onReady,
}: {
	url: string;
	onReady?: () => void;
}) {
	const geometry = useLoader(STLLoader, url);
	const firedRef = useRef<string | null>(null);
	useEffect(() => {
		if (firedRef.current !== url) {
			firedRef.current = url;
			if (onReady) onReady();
		}
	}, [url, onReady]);

	return (
		<mesh geometry={geometry}>
			<meshStandardMaterial color='#ffffff' roughness={0.3} metalness={0.1} />
		</mesh>
	);
}

export function GLTFModel({
	url,
	onReady,
}: {
	url: string;
	onReady?: () => void;
}) {
	const gltf = useLoader(GLTFLoader, url);
	const firedRef = useRef<string | null>(null);
	useEffect(() => {
		if (firedRef.current !== url) {
			firedRef.current = url;
			if (onReady) onReady();
		}
	}, [url, onReady]);
	return <primitive object={gltf.scene} />;
}

export function OBJModel({
	url,
	onReady,
}: {
	url: string;
	onReady?: () => void;
}) {
	const model = useLoader(OBJLoader, url);
	const firedRef = useRef<string | null>(null);
	useEffect(() => {
		if (firedRef.current !== url) {
			firedRef.current = url;
			if (onReady) onReady();
		}
	}, [url, onReady]);
	return <primitive object={model} />;
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
