import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import ThreeDepthLogo from '../../assets/2d/ThreeDepthLogo.svg?react';
import { HiInformationCircle, HiChevronRight, HiCheck } from 'react-icons/hi';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Modal } from './Modal';

function AnimatedMenuIcon({
	isOpen,
	className,
}: {
	isOpen: boolean;
	className?: string;
}) {
	return (
		<button
			className={`text-primary dark:text-primary-dark relative h-6 w-6 p-0 ${className}`}
			aria-label='Toggle menu'
			style={{ transition: 'color 100ms ease-in-out' }}
		>
			<span className='absolute top-1/2 left-1/2 flex w-6 -translate-x-1/2 -translate-y-1/2 flex-col gap-1'>
				<span
					className='h-[3px] w-full rounded-full bg-current'
					style={{
						transition: 'transform 200ms ease-in-out',
						transform: isOpen
							? 'translateY(7px) rotate(45deg)'
							: 'translateY(0) rotate(0)',
					}}
				/>
				<span
					className='h-[3px] w-full rounded-full bg-current'
					style={{
						transition:
							'transform 200ms ease-in-out, opacity 200ms ease-in-out',
						transform: isOpen ? 'rotate(-45deg)' : 'rotate(0)',
						opacity: isOpen ? 0 : 1,
					}}
				/>
				<span
					className='h-[3px] w-full rounded-full bg-current'
					style={{
						transition: 'transform 200ms ease-in-out',
						transform: isOpen
							? 'translateY(-7px) rotate(-45deg)'
							: 'translateY(0) rotate(0)',
					}}
				/>
			</span>
		</button>
	);
}

type MenuItemProps = {
	label?: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	children?: React.ReactNode;
} & (
	| { variant?: 'default'; checked?: never; hasSubmenu?: never }
	| { variant: 'toggle'; checked: boolean; hasSubmenu?: never }
	| { variant: 'submenu'; checked?: never; hasSubmenu: true }
);

function MenuItem({
	label,
	icon,
	onClick,
	disabled = false,
	variant = 'default',
	checked,
	hasSubmenu,
	children,
}: MenuItemProps) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				'text-primary dark:text-primary-dark w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
				disabled
					? 'cursor-not-allowed opacity-50'
					: 'hover:bg-accent dark:hover:bg-accent-dark hover:text-white dark:hover:text-white'
			)}
		>
			<span className='flex items-center justify-between gap-2'>
				<span className='flex items-center gap-2'>
					{variant === 'toggle' && (
						<span className='w-4'>
							{checked && <HiCheck className='h-4 w-4' />}
						</span>
					)}
					{icon && <span className='shrink-0'>{icon}</span>}
					{label || children}
				</span>
				{variant === 'submenu' && hasSubmenu && (
					<HiChevronRight className='h-4 w-4' />
				)}
			</span>
		</button>
	);
}

function MenuDivider() {
	return (
		<hr className='border-secondary/20 dark:border-secondary-dark/20 my-1' />
	);
}

export default function Menu() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [aboutOpen, setAboutOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useDarkMode();

	const cycleTheme = () => {
		const nextTheme =
			theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
		setTheme(nextTheme);
	};

	const getThemeLabel = () => {
		switch (theme) {
			case 'system':
				return 'Theme (Auto)';
			case 'light':
				return 'Theme (Light)';
			case 'dark':
				return 'Theme (Dark)';
		}
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		};

		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [menuOpen]);

	return (
		<>
			<div
				className={clsx(
					'text-primary dark:text-primary-dark glass pointer-events-auto z-50 flex flex-col items-start justify-start gap-0 rounded-xl transition-all duration-300'
				)}
				ref={menuRef}
			>
				<div className='flex w-full items-center justify-between gap-4 px-6 py-4'>
					<h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
						<ThreeDepthLogo className='h-7 w-auto' />
						ThreeDepth
					</h1>
					<div
						onClick={() => setMenuOpen(!menuOpen)}
						className='cursor-pointer'
					>
						<AnimatedMenuIcon isOpen={menuOpen} />
					</div>
				</div>

				<div
					className={clsx(
						'grid w-full transition-all duration-300 ease-in-out',
						menuOpen
							? 'mt-4 grid-rows-[1fr] opacity-100'
							: 'mt-0 grid-rows-[0fr] opacity-0'
					)}
				>
					<div className='flex w-full flex-col overflow-hidden px-3 pb-3'>
						<div className='flex flex-col gap-0.5'>
							<MenuItem label={getThemeLabel()} onClick={cycleTheme} />
							<MenuDivider />
							<MenuItem
								icon={<HiInformationCircle />}
								label='About'
								onClick={() => setAboutOpen(true)}
							/>
						</div>
					</div>
				</div>
			</div>

			<Modal
				isOpen={aboutOpen}
				onClose={() => setAboutOpen(false)}
				title='About ThreeDepth'
			>
				<div className='flex flex-col gap-4'>
					<p className='text-secondary dark:text-secondary-dark'>
						ThreeDepth is a 3D model depth map generator. Import your 3D models
						in STL, GLTF, GLB, or OBJ formats and export orthographic depth maps
						as PNG images.
					</p>
					<div className='text-secondary dark:text-secondary-dark text-sm'>
						<p className='mb-2 font-semibold'>Features:</p>
						<ul className='ml-4 list-disc space-y-1'>
							<li>Multiple 3D format support (STL, GLTF, GLB, OBJ)</li>
							<li>Adjustable up-axis orientation</li>
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
		</>
	);
}
