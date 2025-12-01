import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useToolbar } from './contexts/ToolbarContext';
import { Button } from './components/Button';
import { HiUpload } from 'react-icons/hi';
import { Model } from './components/ModelLoaders';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

function CameraController({
	setResetFn,
}: {
	setResetFn: (fn: () => void) => void;
}) {
	const { camera } = useThree();
	const controlsRef = useRef<OrbitControlsImpl | null>(null);

	useEffect(() => {
		// Expose reset function
		const reset = () => {
			const distance = 7; // Default distance for orthogonal view
			camera.position.set(distance, distance, distance);
			camera.lookAt(0, 0, 0);
			if (controlsRef.current) {
				controlsRef.current.target.set(0, 0, 0);
				controlsRef.current.update();
			}
		};
		setResetFn(reset);
	}, [camera, setResetFn]);

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
	const { setToolbarContent } = useToolbar();

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

	// Add controls to the floating toolbar
	useEffect(() => {
		setToolbarContent(
			<>
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
			</>
		);

		// Cleanup when component unmounts
		return () => setToolbarContent(null);
	}, [setToolbarContent, handleResetCamera]);

	return (
		<main className='relative h-full w-full overflow-hidden'>
			<input
				ref={fileInputRef}
				type='file'
				accept='.gltf,.glb,.stl,.obj'
				onChange={handleFileChange}
				className='hidden'
			/>
			<div className='absolute inset-0'>
				<Canvas camera={{ position: [4, 3, 4] }}>
					<color attach='background' args={['#1a1a1a']} />

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
