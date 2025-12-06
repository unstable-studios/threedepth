/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Modal } from '../components/ui/Modal';

interface AboutProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function About({ isOpen, onClose }: AboutProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title='About ThreeDepth'>
			<div className='flex flex-col gap-4'>
				<p className='text-secondary dark:text-secondary-dark text-balance'>
					ThreeDepth is a utility for converting 3D models to depth maps. Import
					your 3D models in STL, GLTF, GLB, or OBJ formats and export perfect
					depth maps as PNG images with transparent backgrounds.
				</p>
				<div className='text-secondary dark:text-secondary-dark'>
					<p className='mb-2 font-semibold'>Features:</p>
					<ul className='ml-4 list-disc space-y-1'>
						<li>Multiple 3D format support (STL, GLTF, GLB, OBJ)</li>
						<li>Real-time 3D preview</li>
						<li>Adjustable depth-axis orientation</li>
						<li>Customizable depth range masking</li>
						<li>High-resolution PNG export</li>
					</ul>
				</div>
				<div className='text-secondary dark:text-secondary-dark border-secondary/20 dark:border-secondary-dark/20 border-t pt-4'>
					<p>Built with React, Three.js, and R3F</p>
					<p>© 2025 Unstable Studios, LLC</p>
					<a
						href='https://github.com/unstable-studios/threedepth'
						target='_blank'
						rel='noopener noreferrer'
						className='text-accent dark:text-accent-dark underline underline-offset-2'
					>
						github.com/unstable-studios/threedepth
					</a>
				</div>
			</div>
		</Modal>
	);
}
