import { useRef, useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { PiTagSimpleFill } from 'react-icons/pi';

interface SliderProps {
	min: number;
	max: number;
	value: number;
	onChange: (value: number) => void;
	step?: number;
	className?: string;
	label?: string;
}

export function Slider({
	min,
	max,
	value,
	onChange,
	step = 0.1,
	className,
	label,
}: SliderProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = useState<boolean>(false);

	const clamp = (val: number) => Math.max(min, Math.min(max, val));

	const snapToStep = (val: number) => {
		return Math.round(val / step) * step;
	};

	const getValueFromPosition = useCallback(
		(clientX: number) => {
			if (!trackRef.current) return min;
			const rect = trackRef.current.getBoundingClientRect();
			const percent = (clientX - rect.left) / rect.width;
			const val = min + percent * (max - min);
			return snapToStep(clamp(val));
		},
		[min, max, step]
	);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setDragging(true);
	}, []);

	useEffect(() => {
		if (!dragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const newValue = getValueFromPosition(e.clientX);
			onChange(newValue);
		};

		const handleMouseUp = () => {
			setDragging(false);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [dragging, getValueFromPosition, onChange]);

	const percent = ((value - min) / (max - min)) * 100;

	return (
		<div className={clsx('flex flex-col gap-2', className)}>
			{label && (
				<div className='text-md flex items-center justify-between font-semibold'>
					<span className='text-lg'>{label}</span>
					<span className='text-secondary dark:text-secondary-dark'>
						{value.toFixed(2)}
					</span>
				</div>
			)}
			<div className='relative mx-4 h-10 select-none'>
				{/* Track background */}
				<div
					ref={trackRef}
					className='bg-secondary dark:bg-secondary-dark absolute top-1/2 h-2 w-full -translate-y-1/2 cursor-pointer rounded-full'
				/>

				{/* Active range (0 to value) */}
				<div
					className='bg-accent dark:bg-accent-dark absolute top-1/2 h-2 -translate-y-1/2 rounded-full'
					style={{
						left: '0%',
						width: `${percent}%`,
					}}
				/>

				{/* Thumb */}
				<div
					className={clsx(
						'h-5 w-7 rounded-xs bg-gray-300 dark:bg-gray-300',
						'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab transition-transform active:cursor-grabbing',
						dragging && 'scale-120'
					)}
					style={{ left: `${percent}%` }}
					onMouseDown={handleMouseDown}
				/>
			</div>
		</div>
	);
}
