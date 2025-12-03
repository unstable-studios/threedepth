import { useNavigate } from 'react-router';
import { Modal } from '../components/ui/Modal';

export default function About() {
	const navigate = useNavigate();

	return (
		<Modal isOpen={true} onClose={() => navigate('/')} title='About ThreeDepth'>
			<div className='flex flex-col gap-4'>
				<p className='text-secondary dark:text-secondary-dark'>
					ThreeDepth is a 3D model depth map generator. Import your 3D models in
					STL, GLTF, GLB, or OBJ formats and export orthographic depth maps as
					PNG images.
				</p>
				<div className='text-secondary dark:text-secondary-dark text-sm'>
					<p className='mb-2 font-semibold'>Features:</p>
					<ul className='ml-4 list-disc space-y-1'>
						<li>Multiple 3D format support (STL, GLTF, GLB, OBJ)</li>
						<li>Adjustable depth-axis orientation</li>
						<li>Invertible depth rendering</li>
						<li>High-resolution PNG export with alpha channel</li>
						<li>Real-time 3D preview with camera controls</li>
					</ul>
				</div>
				<div className='text-secondary dark:text-secondary-dark border-secondary/20 dark:border-secondary-dark/20 border-t pt-4 text-xs'>
					<p>Built with React, Three.js, and react-three-fiber</p>
				</div>
			</div>
		</Modal>
	);
}
