/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useNavigate } from 'react-router';
import { Modal } from '../components/ui/Modal';

export default function Privacy() {
	const navigate = useNavigate();

	return (
		<Modal isOpen={true} onClose={() => navigate('/')} title='Privacy Policy'>
			<div className='flex flex-col gap-4'>
				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Overview
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						ThreeDepth respects your privacy. This policy explains how we handle
						your data. In short: we don't collect, store, or transmit your data.
						Everything happens in your browser.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Data Processing
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						All 3D model processing happens entirely in your browser using
						WebGL. Your models are never sent to any server. They exist only in
						your browser's memory while the application is open.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Local Storage
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						We store only your theme preference (light/dark/auto) in your
						browser's local storage. This data never leaves your device and can
						be cleared anytime through your browser settings.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Your Files
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						3D models you import are kept only in your browser's memory. They
						are not transmitted to servers, not stored persistently, and not
						shared with anyone. When you close the application, your models are
						automatically discarded.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Exported Files
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						When you export a depth map, the depth map file is generated in your
						browser and downloaded directly to your device. We don't see, store,
						or process your exports.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Analytics & Tracking
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						This application does not use any analytics, tracking services,
						cookies, or telemetry. We don't collect usage data, behavior
						information, or any metrics about how you use ThreeDepth.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Third-Party Services
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						ThreeDepth does not integrate with external APIs or third-party
						services. All functionality uses open-source libraries (React,
						Three.js, React Three Fiber) that run entirely client-side.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Browser Security
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Your browser's WebGL context is sandboxed and isolated from other
						websites. ThreeDepth cannot access files outside your browser or
						communicate with external servers without your direct action.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						GDPR & Privacy Laws
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Since we don't collect personal data, GDPR, CCPA, and similar
						privacy regulations don't apply to ThreeDepth. You maintain complete
						control and ownership of all your data.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Updates to This Policy
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						If this privacy policy changes, we will update this page. Your
						continued use of ThreeDepth means you accept the updated policy.
					</p>
				</section>
			</div>
		</Modal>
	);
}
