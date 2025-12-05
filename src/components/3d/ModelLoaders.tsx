/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useEffect, useMemo, useRef } from 'react';
import {
	Box3,
	Vector3,
	Group,
	Mesh,
	MeshStandardMaterial,
	Object3D,
} from 'three';
import { OrthographicDepthMaterial } from '../../utils/DepthMaterial';

// Normalize object to fit in 20x20x20 cube with base at z=0
// Then apply rotation to match the desired up axis
function normalizeObject(
	object: Object3D,
	upAxis: string = 'Z+',
	zScale: number = 1
): Object3D {
	const clone = object.clone();
	const box = new Box3().setFromObject(clone);
	const size = new Vector3();
	box.getSize(size);

	// Scale to fit in 20x20x20 cube
	const maxDim = Math.max(size.x, size.y, size.z);
	const scale = 20 / maxDim;
	clone.scale.multiplyScalar(scale);

	// Recalculate box after scaling
	box.setFromObject(clone);
	const newCenter = new Vector3();
	box.getCenter(newCenter);

	// Center XY, place base at z=0
	clone.position.set(-newCenter.x, -newCenter.y, -box.min.z);

	// Apply rotation based on up axis
	// Default is Z+ (no rotation needed)
	const rotationGroup = new Group();
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
	const finalBox = new Box3().setFromObject(rotationGroup);
	rotationGroup.position.z = -finalBox.min.z;

	// Apply Z-scale
	const scaleGroup = new Group();
	scaleGroup.add(rotationGroup);
	scaleGroup.scale.set(1, 1, zScale);

	return scaleGroup;
}

export function STLModel({
	url,
	upAxis = 'Z+',
	showDepth = false,
	invertDepth = false,
	depthMin = 0,
	depthMax = 1,
	zScale = 1,
	onReady,
}: {
	url: string;
	upAxis?: string;
	showDepth?: boolean;
	invertDepth?: boolean;
	depthMin?: number;
	depthMax?: number;
	zScale?: number;
	onReady?: () => void;
}) {
	const geometry = useLoader(STLLoader, url);
	const mesh = useMemo(() => {
		const material = showDepth
			? new OrthographicDepthMaterial()
			: new MeshStandardMaterial({
					color: '#d6d3d1',
					roughness: 0.5,
					metalness: 0.3,
				});
		const m = new Mesh(geometry, material);
		const normalized = normalizeObject(m, upAxis, zScale);

		// Set depth range based on actual model bounds
		if (showDepth && material instanceof OrthographicDepthMaterial) {
			const box = new Box3().setFromObject(normalized);
			// Scale maxZ inversely: higher zScale = flatter depth map
			const scaledMaxZ = box.min.z + (box.max.z - box.min.z) / zScale;
			material.setDepthRange(box.min.z, scaledMaxZ);
			material.setInvert(invertDepth);
			material.setDepthClipRange(depthMin, depthMax);
		}

		return normalized;
	}, [geometry, upAxis, showDepth, invertDepth, depthMin, depthMax, zScale]);

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
	showDepth = false,
	invertDepth = false,
	depthMin = 0,
	depthMax = 1,
	zScale = 1,
	onReady,
}: {
	url: string;
	upAxis?: string;
	showDepth?: boolean;
	invertDepth?: boolean;
	depthMin?: number;
	depthMax?: number;
	zScale?: number;
	onReady?: () => void;
}) {
	const gltf = useLoader(GLTFLoader, url);
	const normalized = useMemo(() => {
		const obj = normalizeObject(gltf.scene, upAxis, zScale);
		if (showDepth) {
			const box = new Box3().setFromObject(obj);
			// Scale maxZ inversely: higher zScale = flatter depth map
			const scaledMaxZ = box.min.z + (box.max.z - box.min.z) / zScale;
			obj.traverse((child) => {
				if (child instanceof Mesh) {
					const depthMat = new OrthographicDepthMaterial();
					depthMat.setDepthRange(box.min.z, scaledMaxZ);
					depthMat.setInvert(invertDepth);
					depthMat.setDepthClipRange(depthMin, depthMax);
					child.material = depthMat;
				}
			});
		}
		return obj;
	}, [gltf.scene, upAxis, showDepth, invertDepth, depthMin, depthMax, zScale]);

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
	showDepth = false,
	invertDepth = false,
	depthMin = 0,
	depthMax = 1,
	zScale = 1,
	onReady,
}: {
	url: string;
	upAxis?: string;
	showDepth?: boolean;
	invertDepth?: boolean;
	depthMin?: number;
	depthMax?: number;
	zScale?: number;
	onReady?: () => void;
}) {
	const model = useLoader(OBJLoader, url);
	const normalized = useMemo(() => {
		const obj = normalizeObject(model, upAxis, zScale);
		if (showDepth) {
			const box = new Box3().setFromObject(obj);
			// Scale maxZ inversely: higher zScale = flatter depth map
			const scaledMaxZ = box.min.z + (box.max.z - box.min.z) / zScale;
			obj.traverse((child) => {
				if (child instanceof Mesh) {
					const depthMat = new OrthographicDepthMaterial();
					depthMat.setDepthRange(box.min.z, scaledMaxZ);
					depthMat.setInvert(invertDepth);
					depthMat.setDepthClipRange(depthMin, depthMax);
					child.material = depthMat;
				}
			});
		}
		return obj;
	}, [model, upAxis, showDepth, invertDepth, depthMin, depthMax, zScale]);

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
	showDepth = false,
	invertDepth = false,
	depthMin = 0,
	depthMax = 1,
	zScale = 1,
	onReady,
}: {
	url: string;
	format: 'gltf' | 'glb' | 'stl' | 'obj';
	upAxis?: string;
	showDepth?: boolean;
	invertDepth?: boolean;
	depthMin?: number;
	depthMax?: number;
	zScale?: number;
	onReady?: () => void;
}) {
	if (format === 'stl')
		return (
			<STLModel
				url={url}
				upAxis={upAxis}
				showDepth={showDepth}
				invertDepth={invertDepth}
				depthMin={depthMin}
				depthMax={depthMax}
				zScale={zScale}
				onReady={onReady}
			/>
		);
	if (format === 'gltf' || format === 'glb')
		return (
			<GLTFModel
				url={url}
				upAxis={upAxis}
				showDepth={showDepth}
				invertDepth={invertDepth}
				depthMin={depthMin}
				depthMax={depthMax}
				zScale={zScale}
				onReady={onReady}
			/>
		);
	if (format === 'obj')
		return (
			<OBJModel
				url={url}
				upAxis={upAxis}
				showDepth={showDepth}
				invertDepth={invertDepth}
				depthMin={depthMin}
				depthMax={depthMax}
				zScale={zScale}
				onReady={onReady}
			/>
		);
	return null;
}
