import { Canvas, useThree } from '@react-three/fiber';
import {
	CameraControls,
	CameraControlsImpl,
	GizmoHelper,
	GizmoViewport,
	Grid,
} from '@react-three/drei';
const { ACTION } = CameraControlsImpl;
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Button } from './components/ui/Button';
import { Select } from './components/ui/Select';
import { HiUpload } from 'react-icons/hi';
import { Model } from './utils/ModelLoaders';
import defaultStlUrl from './assets/3d/ThreeDepth.stl?url';
import ThemeToggle from './components/ui/ThemeToggle';
import { useDarkMode } from './hooks/useDarkMode';
import ToolbarPortal from './utils/ToolbarPortal';
import * as THREE from 'three';

function CameraController({
	setResetFn,
}: {
	setResetFn: (fn: () => void) => void;
}) {
	const { scene } = useThree();
	const controlsRef = useRef<CameraControls | null>(null);

	useEffect(() => {
		const reset = async () => {
			if (!controlsRef.current) return;
			const box = new THREE.Box3();
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh || object instanceof THREE.Group) {
					box.expandByObject(object);
				}
			});
			if (!box.isEmpty()) {
				const center = box.getCenter(new THREE.Vector3());
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);
				const camera = controlsRef.current.camera;
				const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
				const distance = maxDim / (2 * Math.tan(fov / 2));

				await controlsRef.current.setLookAt(
					center.x,
					center.y,
					center.z + distance * 1.5, // 1.5x for padding
					center.x,
					center.y,
					center.z,
					true
				);
			}
		};
		setResetFn(reset);
	}, [scene, setResetFn]);

	return (
		<CameraControls
			ref={controlsRef}
			makeDefault
			minPolarAngle={Math.PI / 6}
			maxPolarAngle={(Math.PI * 5) / 6}
			minAzimuthAngle={-Math.PI / 3}
			maxAzimuthAngle={Math.PI / 3}
			minDistance={5}
			maxDistance={60}
			dampingFactor={0.1}
			mouseButtons={{
				left: ACTION.ROTATE,
				middle: ACTION.DOLLY,
				right: ACTION.NONE,
				wheel: ACTION.DOLLY,
			}}
			touches={{
				one: ACTION.TOUCH_ROTATE,
				two: ACTION.TOUCH_DOLLY,
				three: ACTION.TOUCH_DOLLY,
			}}
		/>
	);
}

export default function Editor() {
	const [modelUrl, setModelUrl] = useState<string | null>(null);
	const [modelFormat, setModelFormat] = useState<
		'gltf' | 'glb' | 'stl' | 'obj' | null
	>(null);
	const [upAxis, setUpAxis] = useState<string>('Z+');
	const [showDepth, setShowDepth] = useState<boolean>(true);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const resetCameraRef = useRef<(() => void) | null>(null);
	const { isDark } = useDarkMode();

	const upAxisOptions = [
		{ value: 'Z+', label: 'Up: Z+' },
		{ value: 'Z-', label: 'Up: Z-' },
		{ value: 'Y+', label: 'Up: Y+' },
		{ value: 'Y-', label: 'Up: Y-' },
		{ value: 'X+', label: 'Up: X+' },
		{ value: 'X-', label: 'Up: X-' },
	];

	const handleFileImport = () => {
		fileInputRef.current?.click();
	};

	const handleResetCamera = useCallback(() => {
		resetCameraRef.current?.();
	}, []);

	const handleUpAxisChange = useCallback((newAxis: string) => {
		setUpAxis(newAxis);
		// Reset camera after a short delay to allow model to update
		setTimeout(() => resetCameraRef.current?.(), 100);
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

	return (
		<main className='relative h-full w-full overflow-hidden'>
			<ToolbarPortal>
				<div className='flex items-center gap-2 rounded-lg bg-white/10 px-2 py-2 shadow-lg backdrop-blur-md dark:bg-black/20'>
					<ThemeToggle />
					<Button
						size='lg'
						variant='ghost'
						onClick={handleFileImport}
						icon={<HiUpload />}
					>
						Import Model
					</Button>
					<Select
						options={upAxisOptions}
						value={upAxis}
						onChange={handleUpAxisChange}
						size='lg'
					/>
					<Button size='lg' variant='ghost' onClick={handleResetCamera}>
						Recenter
					</Button>
					<Button
						size='lg'
						variant={showDepth ? 'accent' : 'ghost'}
						onClick={() => setShowDepth(!showDepth)}
					>
						{showDepth ? 'Show Model' : 'Show Depth'}
					</Button>
					<Button size='lg' variant='ghost'>
						Export
					</Button>
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
				<Canvas camera={{ position: [0, 0, 30], near: 1, far: 100 }}>
					<color attach='background' args={[isDark ? '#1a1a1a' : '#f8fafc']} />

					{/* Subtle infinite grid: follows camera and hints at scale */}
					<Grid
						infiniteGrid
						fadeDistance={80}
						fadeStrength={0.2}
						cellSize={0.5}
						cellThickness={0.7}
						sectionSize={5}
						sectionThickness={1}
						cellColor={isDark ? '#2f2f30' : '#e5e7eb'}
						sectionColor={isDark ? '#4b4b4d' : '#cbd5e1'}
						position={[0, 0, -0.01]} // slight offset to avoid z-fighting
						rotation={[Math.PI / 2, 0, 0]}
					/>

					<Suspense fallback={null}>
						{modelUrl && modelFormat ? (
							<Model
								url={modelUrl}
								format={modelFormat}
								upAxis={upAxis}
								showDepth={showDepth}
								onReady={() => resetCameraRef.current?.()}
							/>
						) : (
							<Model
								url={defaultStlUrl}
								format={'stl'}
								upAxis={upAxis}
								showDepth={showDepth}
								onReady={() => resetCameraRef.current?.()}
							/>
						)}
					</Suspense>

					<ambientLight intensity={0.5} />
					<directionalLight position={[5, 5, 5]} intensity={1.2} />
					<directionalLight position={[-3, -3, 3]} intensity={0.6} />
					<pointLight position={[20, 50, 30]} intensity={0.6} />

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
