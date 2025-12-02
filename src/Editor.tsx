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
import { Select } from './components/ui/Select';
import Toggle from './components/ui/Toggle';
import { HiUpload } from 'react-icons/hi';
import { Model } from './components/3d/ModelLoaders';
import defaultStlUrl from './assets/3d/ThreeDepth.stl?url';
import { useDarkMode } from './hooks/useDarkMode';
import { ToolbarItem } from './components/ui/Toolbar';
import * as THREE from 'three';
import { exportDepthPNG } from './utils/exportDepth';

function CameraController({
	setResetFn,
	setExportFn,
}: {
	setResetFn: (fn: () => void) => void;
	setExportFn: (fn: () => void) => void;
}) {
	const { scene, gl } = useThree();
	const controlsRef = useRef<CameraControls | null>(null);
	// No need for a persistent export camera; util creates a temp one

	// Export camera handled inside export utility

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
				const cam = controlsRef.current.camera as THREE.PerspectiveCamera;
				const fov = cam.fov * (Math.PI / 180);
				const distance = maxDim / (2 * Math.tan(fov / 2));
				await controlsRef.current.setLookAt(
					center.x,
					center.y,
					center.z + distance * 1.5,
					center.x,
					center.y,
					center.z,
					true
				);
			}
		};
		setResetFn(reset);

		const exportImage = () => {
			exportDepthPNG(scene, gl);
		};
		setExportFn(exportImage);
	}, [scene, setResetFn, setExportFn, gl]);

	return (
		<CameraControls
			ref={controlsRef}
			makeDefault
			/* Polar angle range (Pi) */
			minPolarAngle={Math.PI * (1 / 6)}
			maxPolarAngle={Math.PI * (5 / 6)}
			/* Azimuth angle range (2Pi) */
			minAzimuthAngle={Math.PI * (-3 / 8)}
			maxAzimuthAngle={Math.PI * (3 / 8)}
			minDistance={5}
			maxDistance={60}
			smoothTime={0.3}
			draggingSmoothTime={0.12}
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
	const [invertDepth, setInvertDepth] = useState<boolean>(false);
	// const [showDepth, setShowDepth] = useState<boolean>(true);
	const showDepth = true;
	const fileInputRef = useRef<HTMLInputElement>(null);
	const resetCameraRef = useRef<(() => void) | null>(null);
	const exportRef = useRef<(() => void) | null>(null);
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

	const handleExport = useCallback(() => {
		exportRef.current?.();
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
			<ToolbarItem>
				<button className='glass' onClick={handleFileImport}>
					<HiUpload /> Open Model
				</button>
			</ToolbarItem>
			<ToolbarItem>
				<Select
					options={upAxisOptions}
					value={upAxis}
					onChange={handleUpAxisChange}
					size='lg'
				/>
			</ToolbarItem>
			<ToolbarItem>
				<button className='glass' onClick={handleResetCamera}>
					Recenter
				</button>
			</ToolbarItem>
			<ToolbarItem>
				<Toggle
					isOn={invertDepth}
					handleToggle={() => setInvertDepth(!invertDepth)}
					label='Invert'
					labelRight
				/>
			</ToolbarItem>
			{/* <ToolbarItem>
				<button
					className='glass'
					onClick={() => setShowDepth(!showDepth)}
				>
					{showDepth ? 'Show Model' : 'Show Depth'}
				</button>
			</ToolbarItem> */}
			<ToolbarItem>
				<button
					className='glass hover:bg-accent dark:hover:bg-accent-dark'
					onClick={handleExport}
				>
					Export PNG
				</button>
			</ToolbarItem>
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
						userData={{ isHelper: true }}
					/>

					<Suspense fallback={null}>
						{modelUrl && modelFormat ? (
							<Model
								url={modelUrl}
								format={modelFormat}
								upAxis={upAxis}
								showDepth={showDepth}
								invertDepth={invertDepth}
								onReady={() => resetCameraRef.current?.()}
							/>
						) : (
							<Model
								url={defaultStlUrl}
								format={'stl'}
								upAxis={upAxis}
								showDepth={showDepth}
								invertDepth={invertDepth}
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
						setExportFn={(fn) => (exportRef.current = fn)}
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
