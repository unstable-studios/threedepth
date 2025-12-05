import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import clsx from 'clsx';
import { HiX } from 'react-icons/hi';

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	className?: string;
	children: React.ReactNode;
};

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	className,
}: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (modalRef.current && e.target === modalRef.current) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div
			ref={modalRef}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			className='fixed inset-0 z-100 flex items-start justify-center overflow-y-auto py-16 backdrop-blur-xs'
		>
			<div className='pointer-events-none w-full px-4'>
				<div
					onClick={(e) => e.stopPropagation()}
					className={clsx(
						'pointer-events-auto relative mx-auto flex w-full max-w-lg flex-col rounded-2xl p-6 shadow-2xl',
						'text-primary dark:text-primary-dark bg-white/80 dark:bg-black/80',
						className
					)}
				>
					{/* Header */}
					<div className='mb-4 flex items-center justify-between'>
						{title && <h2 className='text-2xl font-bold'>{title}</h2>}
						<button
							onClick={onClose}
							className='hover:bg-secondary/20 dark:hover:bg-secondary-dark/20 -mt-2 -mr-2 rounded-lg p-2 transition-colors'
							aria-label='Close modal'
						>
							<HiX className='h-6 w-6' />
						</button>
					</div>

					{/* Content */}
					<div>{children}</div>
				</div>
			</div>
		</div>,
		document.body
	);
}
