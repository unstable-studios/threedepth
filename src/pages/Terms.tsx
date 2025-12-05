/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useNavigate } from 'react-router';
import { Modal } from '../components/ui/Modal';

export default function Terms() {
	const navigate = useNavigate();

	return (
		<Modal isOpen={true} onClose={() => navigate('/')} title='Terms of Service'>
			<div className='flex flex-col gap-4'>
				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Acceptance of Terms
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						By using ThreeDepth, you agree to these terms of service. If you
						disagree with any part, you may not use this application.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Use License
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						ThreeDepth is provided as-is for personal, non-commercial use. You
						may not modify, copy, distribute, transmit, or use the software for
						any unlawful purpose or to violate any laws.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Your Responsibility
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						You are responsible for the files you import and export. Ensure you
						have the right to use any 3D models you process through ThreeDepth.
						Do not use this tool to create content that infringes on
						intellectual property rights.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Disclaimer of Warranties
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						ThreeDepth is provided "as-is" without warranties of any kind. We do
						not guarantee that the application will be error-free,
						uninterrupted, or suitable for your specific needs. Use at your own
						risk.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Limitation of Liability
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						We are not liable for any damages, data loss, or issues arising from
						your use of ThreeDepth. This includes direct, indirect, incidental,
						or consequential damages.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Intellectual Property
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						ThreeDepth's source code is open-source and available under the
						license specified in the repository. Your exported depth maps belong
						entirely to you.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Service Availability
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						We strive to keep ThreeDepth available, but we do not guarantee
						uninterrupted service. The application may be unavailable due to
						maintenance, updates, or technical issues.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Prohibited Activities
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						Do not attempt to hack, reverse-engineer, or gain unauthorized
						access to ThreeDepth. Do not use it to create malware, viruses, or
						other harmful content.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Changes to Terms
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						We may update these terms at any time. Continued use of ThreeDepth
						after changes constitutes your acceptance of the new terms.
					</p>
				</section>

				<section>
					<h3 className='text-primary dark:text-primary-dark mb-2 font-semibold'>
						Contact
					</h3>
					<p className='text-secondary dark:text-secondary-dark text-sm'>
						For questions about these terms, please contact us at{' '}
						<a
							href='mailto:contact@unstablestudios.com'
							className='text-primary dark:text-primary-dark hover:underline'
						>
							contact@unstablestudios.com
						</a>
						.
					</p>
				</section>
			</div>
		</Modal>
	);
}
