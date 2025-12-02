import { Canvas, useThree } from '@react-three/fiber';
import {
	OrbitControls,
	GizmoHelper,
	GizmoViewport,
	Grid,
} from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Button } from './components/ui/Button';
import { HiUpload } from 'react-icons/hi';
import { Model } from './utils/ModelLoaders';
import defaultStlUrl from './assets/3d/ThreeDepth.stl?url';
import ThemeToggle from './components/ui/ThemeToggle';
import { useDarkMode } from './hooks/useDarkMode';
import ToolbarPortal from './utils/ToolbarPortal';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { computeSceneBoundingBox, computeCameraReset } from './utils/camera';

function CameraController({
	setResetFn,
}: {
	setResetFn: (fn: () => void) => void;
}) {
	const { camera, scene } = useThree();
	const controlsRef = useRef<OrbitControlsImpl | null>(null);

	useEffect(() => {
		const reset = () => {
			const box = computeSceneBoundingBox(scene as unknown as THREE.Scene);
			const { position, target } = computeCameraReset(
				box,
				camera as THREE.PerspectiveCamera
			);
			camera.position.copy(position);
			(camera as THREE.PerspectiveCamera).lookAt(target);
			if (controlsRef.current) {
				controlsRef.current.target.copy(target);
				controlsRef.current.update();
			}
		};
		setResetFn(reset);
	}, [camera, scene, setResetFn]);

	return (
		<OrbitControls
			ref={controlsRef}
			enableDamping
			enablePan={false}
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
						size='lg'
						variant='ghost'
						onClick={handleFileImport}
						icon={<HiUpload />}
					>
						Import Model
					</Button>
					<Button size='lg' variant='ghost' onClick={handleResetCamera}>
						Reset Camera
					</Button>
					<Button size='lg' variant='ghost'>
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
				<Canvas>
					<color attach='background' args={[isDark ? '#1a1a1a' : '#f8fafc']} />

					{/* Subtle infinite grid: follows camera and hints at scale */}
					<Grid
						infiniteGrid
						fadeDistance={50}
						fadeStrength={0.5}
						cellSize={0.5}
						cellThickness={0.7}
						sectionSize={5}
						sectionThickness={1}
						cellColor={isDark ? '#2f2f30' : '#e5e7eb'}
						sectionColor={isDark ? '#4b4b4d' : '#cbd5e1'}
						position={[0, 0, -0.01]} // slight offset to avoid z-fighting
						rotation={[Math.PI / 2, 0, 0]}
						side={THREE.DoubleSide}
					/>

					<Suspense fallback={null}>
						{modelUrl && modelFormat ? (
							<Model
								url={modelUrl}
								format={modelFormat}
								onReady={() => resetCameraRef.current?.()}
							/>
						) : (
							<Model
								url={defaultStlUrl}
								format={'stl'}
								onReady={() => resetCameraRef.current?.()}
							/>
						)}
					</Suspense>

					<ambientLight intensity={0.5} />
					<directionalLight position={[5, 5, 5]} intensity={1.2} />
					<directionalLight position={[-3, -3, 3]} intensity={0.6} />
					<pointLight position={[0, 5, 0]} intensity={0.5} />

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
