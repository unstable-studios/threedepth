import { useNavigate } from 'react-router';
import { Modal } from '../components/ui/Modal';

export default function Privacy() {
	const navigate = useNavigate();

	return (
		<Modal isOpen={true} onClose={() => navigate('/')} title='Privacy Policy'>
			<div className='flex flex-col gap-4'>
				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Data Processing
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						ThreeDepth processes all 3D models entirely in your browser. No
						files are uploaded to any server.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Local Storage
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						We store only your theme preference (light/dark/auto) in browser
						local storage. No personally identifiable information is collected
						or stored.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Analytics
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						This application does not use any analytics or tracking services.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Third-Party Services
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						ThreeDepth does not integrate with any third-party services or APIs.
						All processing happens client-side using open-source libraries.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Your Files
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Imported 3D models remain in your browser's memory only while the
						application is open. Files are never transmitted, stored on servers,
						or shared with any third parties.
					</p>
				</section>
			</div>
		</Modal>
	);
}
