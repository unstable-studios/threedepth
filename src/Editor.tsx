import { Canvas, useThree } from '@react-three/fiber';
import { Outlet } from 'react-router';
import { CameraControls, CameraControlsImpl, Grid } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { HiDownload, HiUpload } from 'react-icons/hi';
import { Model } from './components/3d/ModelLoaders';
import defaultStlUrl from './assets/3d/ThreeDepth.stl?url';
import useDarkMode from './hooks/useDarkMode';
import {
	ToolbarItem,
	ToolbarDrawerItem,
	openToolbarDrawer,
	closeToolbarDrawer,
} from './components/ui/Toolbar';
import { ExpandableButton } from './components/ui/ExpandableButton';
import * as THREE from 'three';
import { exportDepthPNG } from './utils/exportDepth';
import {
	MdOutlineCenterFocusStrong,
	MdOutlineInvertColors,
} from 'react-icons/md';
import clsx from 'clsx';

const { ACTION } = CameraControlsImpl;

function CameraController({
	setResetFn,
	setExportFn,
}: {
	setResetFn: (fn: () => void) => void;
	setExportFn: (fn: () => void) => void;
}) {
	const { scene, gl } = useThree();
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
				const cam = controlsRef.current.camera as THREE.PerspectiveCamera;
				const aspect = cam.aspect || gl.domElement.width / gl.domElement.height;
				const fov = cam.fov * (Math.PI / 180); // vertical fov in radians

				// Compute required distance to fit both vertical and horizontal extents
				const halfHeight = size.y / 2;
				const halfWidth = size.x / 2;
				const distVert = halfHeight / Math.tan(fov / 2);
				const distHorz = halfWidth / Math.tan(fov / 2) / aspect;
				const distance = Math.max(distVert, distHorz) + size.z; // add some depth margin

				await controlsRef.current.setLookAt(
					center.x,
					center.y,
					center.z + distance * 1.2,
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
		{ value: 'Z+', label: 'Z+' },
		{ value: 'Z-', label: 'Z-' },
		{ value: 'Y+', label: 'Y+' },
		{ value: 'Y-', label: 'Y-' },
		{ value: 'X+', label: 'X+' },
		{ value: 'X-', label: 'X-' },
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
		// Close drawer after selection
		closeToolbarDrawer();
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
				<ExpandableButton
					icon={<HiUpload className='h-8 w-8' />}
					label='Import'
					onClick={handleFileImport}
				/>
			</ToolbarItem>
			<ToolbarItem>
				<ExpandableButton
					id='depth-axis'
					icon={
						<span className='flex h-8 w-8 items-center justify-center text-xl font-bold'>
							{upAxis}
						</span>
					}
					label='Depth Axis'
					onClick={() => openToolbarDrawer('depth-axis')}
				/>
			</ToolbarItem>
			<ToolbarItem>
				<ExpandableButton
					icon={<MdOutlineCenterFocusStrong className='h-8 w-8' />}
					label='Recenter'
					onClick={handleResetCamera}
				/>
			</ToolbarItem>

			{/* Drawer contents: Up Axis options */}
			<ToolbarDrawerItem>
				<div className='flex items-center gap-2'>
					{upAxisOptions.map((option) => (
						<button
							key={option.value}
							className={clsx(
								'glass text-md rounded-lg px-3 py-2 font-semibold',
								option.value === upAxis &&
									'bg-accent dark:bg-accent-dark text-onaccent dark:text-onaccent-dark'
							)}
							onClick={() => handleUpAxisChange(option.value)}
						>
							{option.label}
						</button>
					))}
				</div>
			</ToolbarDrawerItem>
			<ToolbarItem>
				<ExpandableButton
					icon={
						<MdOutlineInvertColors
							className={clsx(
								'h-8 w-8 transition-transform',
								invertDepth && '-scale-x-100'
							)}
						/>
					}
					label='Invert'
					onClick={() => setInvertDepth(!invertDepth)}
				/>
			</ToolbarItem>
			<ToolbarItem>
				<ExpandableButton
					icon={<HiDownload className='h-8 w-8' />}
					label='Export'
					onClick={handleExport}
				/>
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
				</Canvas>
			</div>
			<Outlet />
		</main>
	);
}
