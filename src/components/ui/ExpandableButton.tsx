/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';

interface ExpandableButtonProps {
	id?: string;
	icon: ReactNode;
	label: string;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
	expanded?: boolean;
}

export function ExpandableButton({
	id,
	icon,
	label,
	onClick,
	className,
	disabled = false,
	expanded = false,
}: ExpandableButtonProps) {
	const [isDrawerOwner, setIsDrawerOwner] = useState(false);

	// Check if this button owns the currently open drawer
	useEffect(() => {
		if (!id) return;

		const onOpen = (e: Event) => {
			const customEvent = e as CustomEvent<{ ownerId?: string }>;
			setIsDrawerOwner(customEvent.detail?.ownerId === id);
		};

		const onClose = () => {
			setIsDrawerOwner(false);
		};

		window.addEventListener('toolbar-drawer:open', onOpen as EventListener);
		window.addEventListener('toolbar-drawer:close', onClose);

		return () => {
			window.removeEventListener(
				'toolbar-drawer:open',
				onOpen as EventListener
			);
			window.removeEventListener('toolbar-drawer:close', onClose);
		};
	}, [id]);

	const isExpanded = expanded || isDrawerOwner;

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				'group relative overflow-visible',
				'cursor-pointer',
				'flex items-center justify-center',
				'h-12 gap-0 rounded-xl px-3',
				'transition-colors duration-200 ease-out',
				isExpanded
					? 'bg-accent dark:bg-accent-dark text-onaccent dark:text-onaccent-dark'
					: 'hover:bg-accent dark:hover:bg-accent-dark hover:text-onaccent dark:hover:text-onaccent-dark',
				// Extend hover area to include half of gap (4px on each side)
				'before:absolute before:inset-0 before:-right-1 before:-left-1',
				'before:pointer-events-auto',
				disabled && 'cursor-not-allowed opacity-50',
				className
			)}
		>
			{/* Dual-phase wipe: base icon collapses as reveal icon+label expands */}
			{/* Collapsing base icon (keeps original color) */}
			<div
				className={clsx(
					'grid',
					'transition-all duration-200 ease-out',
					isExpanded
						? 'grid-cols-[0fr]'
						: 'grid-cols-[1fr] group-hover:grid-cols-[0fr]'
				)}
			>
				<div className='overflow-hidden'>
					<span className='text-primary dark:text-primary-dark flex h-8 w-8 items-center justify-center text-xl'>
						{icon}
					</span>
				</div>
			</div>

			{/* Expanding reveal: accent/onaccent icon followed by label */}
			<div
				className={clsx(
					'grid',
					'transition-all duration-200 ease-out',
					isExpanded
						? 'grid-cols-[1fr]'
						: 'grid-cols-[0fr] group-hover:grid-cols-[1fr]'
				)}
			>
				<div className='flex items-center overflow-hidden'>
					<span className='text-onaccent dark:text-onaccent-dark flex h-8 w-8 items-center justify-center text-xl'>
						{icon}
					</span>
					<span className='text-onaccent dark:text-onaccent-dark text-md ml-2 font-semibold whitespace-nowrap'>
						{label}
					</span>
				</div>
			</div>
		</button>
	);
}
