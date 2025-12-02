import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { HiChevronDown } from 'react-icons/hi';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
	sm: 'text-xs px-2.5 py-1.5 gap-1',
	md: 'text-sm px-4 py-2 gap-2',
	lg: 'text-base px-5 py-3 gap-2.5',
};

export function Select({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	size = 'lg',
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
					'inline-flex items-center justify-center gap-2 self-start rounded-md font-semibold transition-colors',
					'bg-transparent text-gray-600 dark:text-gray-300',
					'hover:bg-gray-800 hover:text-gray-50',
					sizeClasses[size]
				)}
			>
				<span className='leading-none'>
					{selectedOption?.label || placeholder}
				</span>
				<HiChevronDown
					className={clsx(
						'transition-transform duration-200',
						isOpen && 'rotate-180'
					)}
				/>
			</button>

			{isOpen && (
				<div
					className={clsx(
						'absolute top-full left-0 z-50 mt-1',
						'rounded-md shadow-lg',
						'bg-white dark:bg-gray-800',
						'py-1'
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
								'w-full px-4 py-2 text-left text-sm',
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
