import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function Select({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	className,
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () =>
				document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isOpen]);

	return (
		<div ref={containerRef} className='relative'>
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className={clsx(
					'glass',
					isOpen && 'bg-white/30 dark:bg-black/50',
					className
				)}
			>
				<div className='flex h-8 w-8 items-center justify-center text-xl leading-none'>
					{selectedOption?.label || placeholder}
				</div>
			</button>

			{isOpen && (
				<div
					className={clsx(
						'absolute top-full right-0 z-120 mt-2',
						'rounded-xl shadow-lg',
						'glass flex px-2 py-2'
					)}
				>
					{options.map((option) => (
						<button
							key={option.value}
							type='button'
							onClick={() => {
								onChange(option.value);
								setIsOpen(false);
							}}
							className={clsx(
								'w-full rounded-lg px-4 py-2 text-left text-xl',
								'transition-colors',
								option.value === value
									? 'bg-blue-500 text-white'
									: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
							)}
						>
							{option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
