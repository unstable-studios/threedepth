import React, { useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import type { AxisChoice } from '../lib/types';
import { orientGeometry } from '../lib/geometryUtils';

type Props = {
	buffer: ArrayBuffer;
	axis: AxisChoice;
	className?: string;
};

/**
 * Component that displays the oriented 3D model
 */
function Model({ buffer, axis }: { buffer: ArrayBuffer; axis: AxisChoice }) {
	const geometry = useMemo(() => {
		const loader = new STLLoader();
		const rawGeometry = loader.parse(
			buffer as ArrayBuffer
		) as THREE.BufferGeometry;
		const geom = orientGeometry(rawGeometry, axis);
		geom.computeVertexNormals();

		// Center the geometry
		geom.computeBoundingBox();
		const bbox = geom.boundingBox!;
		const center = new THREE.Vector3();
		bbox.getCenter(center);
		geom.translate(-center.x, -center.y, -center.z);

		return geom;
	}, [buffer, axis]);

	return (
		<mesh geometry={geometry}>
			<meshStandardMaterial color='#cccccc' metalness={0.1} roughness={0.8} />
		</mesh>
	);
}

/**
 * Component that fits camera to the model
 */
function CameraFitter({
	buffer,
	axis,
}: {
	buffer: ArrayBuffer;
	axis: AxisChoice;
}) {
	const { camera } = useThree();

	useEffect(() => {
		const loader = new STLLoader();
		const rawGeometry = loader.parse(
			buffer as ArrayBuffer
		) as THREE.BufferGeometry;
		const geom = orientGeometry(rawGeometry, axis);
		geom.computeBoundingBox();
		const bbox = geom.boundingBox!;
		const size = new THREE.Vector3();
		bbox.getSize(size);
		const maxDim = Math.max(size.x, size.y, size.z);
		const fitDistance = maxDim * 1.8;

		camera.position.set(0, 0, fitDistance);
		camera.lookAt(0, 0, 0);

		geom.dispose();
	}, [buffer, axis, camera]);

	return null;
}

export const InteractiveViewer: React.FC<Props> = ({
	buffer,
	axis,
	className,
}) => {
	return (
		<Canvas
			className={className}
			camera={{ position: [0, 0, 200], fov: 50, near: 0.1, far: 5000 }}
			dpr={Math.min(window.devicePixelRatio, 2)}
		>
			<color attach='background' args={['#0b0b0b']} />
			<ambientLight intensity={0.6} />
			<directionalLight position={[1, 1, 2]} intensity={0.8} />
			<Model buffer={buffer} axis={axis} />
			<CameraFitter buffer={buffer} axis={axis} />
			<OrbitControls makeDefault enableDamping dampingFactor={0.05} />
		</Canvas>
	);
};

export default InteractiveViewer;
