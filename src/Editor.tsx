import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Button } from './components/Button';
import { HiUpload } from 'react-icons/hi';
import { Model } from './components/ModelLoaders';
import ThemeToggle from './components/ThemeToggle';
import { useDarkMode } from './hooks/useDarkMode';
import ToolbarPortal from './components/ToolbarPortal';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

function CameraController({
	setResetFn,
}: {
	setResetFn: (fn: () => void) => void;
}) {
	const { camera, scene } = useThree();
	const controlsRef = useRef<OrbitControlsImpl | null>(null);

	useEffect(() => {
		// Expose reset function that fits to current scene content
		const reset = () => {
			// Calculate bounding box of all objects in the scene
			const box = new THREE.Box3();
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh || object instanceof THREE.Group) {
					box.expandByObject(object);
				}
			});

			// If box is empty, use default
			if (box.isEmpty()) {
				const distance = 7;
				camera.position.set(distance, distance, distance);
				camera.lookAt(0, 0, 0);
			} else {
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());

				// Calculate camera distance to fit object
				const maxDim = Math.max(size.x, size.y, size.z);
				const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
				const cameraDistance = maxDim / (2 * Math.tan(fov / 2));

				// Position camera at orthogonal angle relative to center
				camera.position.set(
					center.x + cameraDistance,
					center.y + cameraDistance,
					center.z + cameraDistance
				);
				camera.lookAt(center);

				// Update controls target to center of object
				if (controlsRef.current) {
					controlsRef.current.target.copy(center);
					controlsRef.current.update();
				}
			}

			if (controlsRef.current) {
				controlsRef.current.update();
			}
		};
		setResetFn(reset);
	}, [camera, scene, setResetFn]);

	return (
		<OrbitControls
			ref={controlsRef}
			enableDamping
			dampingFactor={0.05}
			rotateSpeed={0.5}
		/>
	);
}

export default function Editor() {
	const [modelUrl, setModelUrl] = useState<string | null>(null);
	const [modelFormat, setModelFormat] = useState<
		'gltf' | 'glb' | 'stl' | 'obj' | null
	>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const resetCameraRef = useRef<(() => void) | null>(null);
	const { isDark } = useDarkMode();

	const handleFileImport = () => {
		fileInputRef.current?.click();
	};

	const handleResetCamera = useCallback(() => {
		resetCameraRef.current?.();
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const extension = file.name.split('.').pop()?.toLowerCase();
		if (!extension || !['gltf', 'glb', 'stl', 'obj'].includes(extension)) {
			alert(
				'Unsupported file format. Please use GLTF, GLB, STL, or OBJ files.'
			);
			return;
		}

		const url = URL.createObjectURL(file);
		setModelUrl(url);
		setModelFormat(extension as 'gltf' | 'glb' | 'stl' | 'obj');
	};

	// no-op: toolbar content now rendered via portal below

	return (
		<main className='relative h-full w-full overflow-hidden'>
			{/* Toolbar content rendered into header via portal */}
			<ToolbarPortal>
				<div className='flex items-center gap-2 rounded-lg bg-white/10 px-2 py-2 shadow-lg backdrop-blur-md dark:bg-black/20'>
					<Button
						size='md'
						variant='ghost'
						onClick={handleFileImport}
						icon={<HiUpload />}
					>
						Import Model
					</Button>
					<Button size='md' variant='ghost' onClick={handleResetCamera}>
						Reset Camera
					</Button>
					<Button size='md' variant='ghost'>
						Export
					</Button>
					<ThemeToggle />
				</div>
			</ToolbarPortal>
			<input
				ref={fileInputRef}
				type='file'
				accept='.gltf,.glb,.stl,.obj'
				onChange={handleFileChange}
				className='hidden'
			/>
			<div className='absolute inset-0'>
				<Canvas camera={{ position: [4, 3, 4] }}>
					<color attach='background' args={[isDark ? '#1a1a1a' : '#f8fafc']} />

					<Suspense fallback={null}>
						{modelUrl && modelFormat ? (
							<Model url={modelUrl} format={modelFormat} />
						) : (
							<mesh>
								<boxGeometry args={[4, 2, 2]} />
								<meshStandardMaterial
									color='#ffffff'
									roughness={0.3}
									metalness={0.1}
								/>
							</mesh>
						)}
					</Suspense>

					<ambientLight intensity={0.5} />
					<directionalLight position={[5, 5, 5]} intensity={1.2} />
					<directionalLight position={[-3, -3, 3]} intensity={0.6} />
					<pointLight position={[0, 5, 0]} intensity={0.5} />

					{/* drag to orbit, scroll to zoom, right-click to pan */}
					<CameraController
						setResetFn={(fn) => (resetCameraRef.current = fn)}
					/>

					<GizmoHelper alignment='bottom-right' margin={[80, 80]}>
						<GizmoViewport
							axisColors={['#ff4444', '#44ff44', '#4444ff']}
							labelColor='white'
						/>
					</GizmoHelper>
				</Canvas>
			</div>
		</main>
	);
}
