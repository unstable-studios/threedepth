import { useNavigate } from 'react-router';
import { Modal } from '../components/ui/Modal';

export default function Help() {
	const navigate = useNavigate();

	return (
		<Modal isOpen={true} onClose={() => navigate('/')} title='Help'>
			<div className='flex flex-col gap-4'>
				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Importing Models
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Click "Import Model" to load a 3D file (STL, GLTF, GLB, or OBJ). The
						model will be automatically centered and scaled to fit the viewport.
						Processing happens entirely in your browser—files are never
						uploaded.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Camera Controls
					</h3>
					<ul className='text-secondary dark:text-secondary-dark ml-4 list-disc space-y-1 text-sm'>
						<li>
							<strong>Left Click + Drag:</strong> Rotate the model
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
						Depth Range & Masking
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Use the "Depth Range" slider to control how the model is masked. A
						tighter range can help isolate specific features of the model.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Z-Scale
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Adjust the Z-scale to scale the model in the depth-axis. Higher
						values stretch the depth range, making depth differences more
						pronounced.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Depth-Axis Orientation
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Different 3D software uses different coordinate systems (Y-up, Z-up,
						etc.). Use the depth-axis selector to orient the depth map to match
						your model.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Exporting Depth Maps
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Click "Export" to preview and download an orthographic depth map. By
						default, surfaces closer to the camera appear lighter (whiter),
						distant surfaces appear darker (blacker). Toggle "Invert" to reverse
						this behavior and make closer surfaces darker and distant surfaces
						lighter.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Export Options
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Choose a custom background color for the depth map or keep it
						transparent. Higher export resolutions yield more detail but may
						take longer to generate.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Troubleshooting
					</h3>
					<ul className='text-secondary dark:text-secondary-dark ml-4 list-disc space-y-1 text-sm'>
						<li>
							<strong>Model doesn't appear:</strong> Try clicking "Recenter" to
							reset the camera view
						</li>
						<li>
							<strong>Wrong orientation:</strong> Use the depth-axis selector to
							match your original 3D software
						</li>
						<li>
							<strong>Performance issues:</strong> Try loading a simpler model
							or use a lower-resolution export
						</li>
					</ul>
				</section>
			</div>
		</Modal>
	);
}
