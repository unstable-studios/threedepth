import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function centerAndFitObject(
	object: THREE.Object3D,
	camera: THREE.Camera,
	targetSize = 20
) {
	// Compute initial bounding box
	const initialBox = new THREE.Box3().setFromObject(object);
	const initialSize = initialBox.getSize(new THREE.Vector3());
	const initialMaxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);

	// Normalize scale to fit target cube (uniform scale)
	if (initialMaxDim > 0 && isFinite(initialMaxDim)) {
		const scaleFactor = targetSize / initialMaxDim;
		object.scale.multiplyScalar(scaleFactor);
	}

	// Recompute bounding box after scaling
	const box = new THREE.Box3().setFromObject(object);
	const center = box.getCenter(new THREE.Vector3());
	const size = box.getSize(new THREE.Vector3());
	const min = box.min.clone();

	// Center X and Y to origin, place Z-min at z=0
	const translation = new THREE.Vector3(center.x, center.y, min.z);
	object.position.sub(translation);

	// Calculate camera distance to fit object
	const maxDim = Math.max(size.x, size.y, size.z);
	const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
	const cameraDistance = maxDim / (2 * Math.tan(fov / 2));

	// Position camera at orthogonal angle relative to origin
	camera.position.set(cameraDistance, cameraDistance, cameraDistance);
	camera.lookAt(0, 0, 0);
}

export function STLModel({ url }: { url: string }) {
	const geometry = useLoader(STLLoader, url);
	const { camera } = useThree();
	const meshRef = useRef<THREE.Mesh>(null);

	useEffect(() => {
		if (meshRef.current) {
			centerAndFitObject(meshRef.current, camera);
		}
	}, [geometry, camera]);

	return (
		<mesh ref={meshRef} geometry={geometry}>
			<meshStandardMaterial color='#ffffff' roughness={0.3} metalness={0.1} />
		</mesh>
	);
}

export function GLTFModel({ url }: { url: string }) {
	const gltf = useLoader(GLTFLoader, url);
	const { camera } = useThree();
	const groupRef = useRef<THREE.Group>(null);

	useEffect(() => {
		if (groupRef.current) {
			centerAndFitObject(groupRef.current, camera);
		}
	}, [gltf.scene, camera]);

	return <primitive ref={groupRef} object={gltf.scene} />;
}

export function OBJModel({ url }: { url: string }) {
	const model = useLoader(OBJLoader, url);
	const { camera } = useThree();
	const groupRef = useRef<THREE.Group>(null);

	useEffect(() => {
		if (groupRef.current) {
			centerAndFitObject(groupRef.current, camera);
		}
	}, [model, camera]);

	return <primitive ref={groupRef} object={model} />;
}

export function Model({
	url,
	format,
}: {
	url: string;
	format: 'gltf' | 'glb' | 'stl' | 'obj';
}) {
	if (format === 'stl') return <STLModel url={url} />;
	if (format === 'gltf' || format === 'glb') return <GLTFModel url={url} />;
	if (format === 'obj') return <OBJModel url={url} />;
	return null;
}
