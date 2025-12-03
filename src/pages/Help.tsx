import { useNavigate } from 'react-router';
import { Modal } from '../components/ui/Modal';

export default function Help() {
	const navigate = useNavigate();

	return (
		<Modal isOpen={true} onClose={() => navigate('/')} title='Help'>
			<div className='flex flex-col gap-4'>
				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Getting Started
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Click "Import Model" to load a 3D file (STL, GLTF, GLB, or OBJ). The
						model will be automatically centered and scaled to fit the viewport.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Camera Controls
					</h3>
					<ul className='text-secondary dark:text-secondary-dark ml-4 list-disc space-y-1 text-sm'>
						<li>
							<strong>Left Click + Drag:</strong> Rotate camera
						</li>
						<li>
							<strong>Scroll / Middle Click + Drag:</strong> Zoom in/out
						</li>
						<li>
							<strong>Recenter Button:</strong> Reset camera to default view
						</li>
					</ul>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Exporting
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						The "Export PNG" button generates an orthographic depth map. Closer
						surfaces appear lighter, distant surfaces darker. Use "Invert" to
						reverse this behavior.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Up-Axis Orientation
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Different 3D software uses different coordinate systems. Use the
						up-axis selector to match your model's original orientation.
					</p>
				</section>
			</div>
		</Modal>
	);
}
