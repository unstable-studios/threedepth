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
				'flex items-center',
				'h-12 rounded-lg px-3',
				'bg-glass dark:bg-glass-dark backdrop-blur-sm',
				'transition-colors duration-300 ease-out',
				'hover:bg-accent/40 dark:hover:bg-accent-dark/70',
				// Extend hover area to include half of gap (4px on each side)
				'before:absolute before:inset-0 before:-right-1 before:-left-1',
				'before:pointer-events-auto',
				disabled && 'cursor-not-allowed opacity-50',
				className
			)}
		>
			{/* Icon - always visible */}
			<span className='flex h-8 w-8 shrink-0 items-center justify-center text-xl'>
				{icon}
			</span>

			{/* Label - hidden by default, slides in on hover */}
			<div
				className={clsx(
					'grid grid-cols-[0fr] opacity-0',
					'transition-all duration-300 ease-out',
					'group-hover:grid-cols-[1fr] group-hover:opacity-100'
				)}
			>
				<div className='overflow-hidden'>
					<span className='pl-2 text-sm font-medium whitespace-nowrap'>
						{label}
					</span>
				</div>
			</div>
		</button>
	);
}
