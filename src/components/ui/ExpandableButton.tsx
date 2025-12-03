import { type ReactNode } from 'react';
import clsx from 'clsx';

interface ExpandableButtonProps {
	icon: ReactNode;
	label: string;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
}

export function ExpandableButton({
	icon,
	label,
	onClick,
	className,
	disabled = false,
}: ExpandableButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				'group relative overflow-visible',
				'flex items-center justify-center',
				'h-12 gap-0 rounded-xl px-3',
				'transition-colors duration-200 ease-out',
				'hover:bg-accent dark:hover:bg-accent-dark hover:text-onaccent dark:hover:text-onaccent-dark',
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
					'grid grid-cols-[1fr]',
					'transition-all duration-200 ease-out',
					'group-hover:grid-cols-[0fr]'
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
					'grid grid-cols-[0fr]',
					'transition-all duration-200 ease-out',
					'group-hover:grid-cols-[1fr]'
				)}
			>
				<div className='flex items-center overflow-hidden'>
					<span className='text-onaccent dark:text-onaccent-dark flex h-8 w-8 items-center justify-center text-xl'>
						{icon}
					</span>
					<span className='text-onaccent dark:text-onaccent-dark ml-2 text-sm font-medium whitespace-nowrap'>
						{label}
					</span>
				</div>
			</div>
		</button>
	);
}
