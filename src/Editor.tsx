import { Canvas } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useState, useEffect } from 'react';
import { useToolbar } from './contexts/ToolbarContext';
import { Button } from './components/Button';

export default function Editor() {
	const [active, setActive] = useState(false);
	const { setToolbarContent } = useToolbar();

	// Add controls to the floating toolbar
	useEffect(() => {
		setToolbarContent(
			<>
				<Button size='md' variant='ghost'>
					Reset Camera
				</Button>
				<Button size='md' variant='ghost'>
					Export
				</Button>
			</>
		);

		// Cleanup when component unmounts
		return () => setToolbarContent(null);
	}, [setToolbarContent]);

	return (
		<main className='relative h-full w-full overflow-hidden'>
			<div className='absolute inset-0'>
				<Canvas camera={{ position: [4, 3, 4] }}>
					<color attach='background' args={['#1a1a1a']} />
					<mesh onClick={() => setActive(!active)}>
						<boxGeometry args={[4, 2, 2]} />
						<meshStandardMaterial
							color='#ffffff'
							roughness={0.3}
							metalness={0.1}
						/>
					</mesh>
					<ambientLight intensity={0.5} />
					<directionalLight position={[5, 5, 5]} intensity={1.2} />
					<directionalLight position={[-3, -3, 3]} intensity={0.6} />
					<pointLight position={[0, 5, 0]} intensity={0.5} />

					{/* drag to orbit, scroll to zoom, right-click to pan */}
					<OrbitControls enableDamping dampingFactor={0.05} rotateSpeed={0.5} />

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
