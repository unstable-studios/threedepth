import { useState, useRef, useEffect } from 'react';
import ThreeDepthLogo from '../../assets/2d/ThreeDepthLogo.svg?react';
import ThemeToggle from './ThemeToggle';
import { HiChevronDown, HiInformationCircle } from 'react-icons/hi';

export default function Menu() {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className='menu-container relative' ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='pointer-events-auto flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md transition-colors hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30'
			>
				<ThreeDepthLogo className='h-7 w-auto' />
				<h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
					ThreeDepth
				</h1>
				<HiChevronDown
					className={`h-5 w-5 text-gray-700 transition-transform dark:text-gray-300 ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{isOpen && (
				<div className='pointer-events-auto absolute top-full left-0 mt-2 w-64 rounded-lg bg-white/95 shadow-xl backdrop-blur-md dark:bg-gray-800/95'>
					<div className='space-y-4 p-4'>
						<div className='flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700'>
							<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Theme
							</span>
							<ThemeToggle />
						</div>

						<div className='space-y-2'>
							<div className='flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400'>
								<HiInformationCircle className='mt-0.5 h-5 w-5 shrink-0' />
								<div>
									<p className='font-medium text-gray-900 dark:text-gray-100'>
										About ThreeDepth
									</p>
									<p className='mt-1'>
										Generate depth maps from 3D models with customizable
										orientation and export settings.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
