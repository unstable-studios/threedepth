import { useRef, useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';

interface RangeSliderProps {
	min: number;
	max: number;
	valueMin: number;
	valueMax: number;
	onChange: (min: number, max: number) => void;
	step?: number;
	className?: string;
	label?: string;
}

export function RangeSlider({
	min,
	max,
	valueMin,
	valueMax,
	onChange,
	step = 0.01,
	className,
	label,
}: RangeSliderProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

	const clamp = (value: number) => Math.max(min, Math.min(max, value));

	const snapToStep = (value: number) => {
		return Math.round(value / step) * step;
	};

	const getValueFromPosition = useCallback(
		(clientX: number) => {
			if (!trackRef.current) return min;
			const rect = trackRef.current.getBoundingClientRect();
			const percent = (clientX - rect.left) / rect.width;
			const value = min + percent * (max - min);
			return snapToStep(clamp(value));
		},
		[min, max, step]
	);

	const handleMouseDown = useCallback(
		(thumb: 'min' | 'max') => (e: React.MouseEvent) => {
			e.preventDefault();
			setDragging(thumb);
		},
		[]
	);

	useEffect(() => {
		if (!dragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const newValue = getValueFromPosition(e.clientX);

			if (dragging === 'min') {
				// Min thumb: can't go past max
				onChange(Math.min(newValue, valueMax - step), valueMax);
			} else {
				// Max thumb: can't go below min
				onChange(valueMin, Math.max(newValue, valueMin + step));
			}
		};

		const handleMouseUp = () => {
			setDragging(null);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [dragging, getValueFromPosition, onChange, valueMin, valueMax, step]);

	const minPercent = ((valueMin - min) / (max - min)) * 100;
	const maxPercent = ((valueMax - min) / (max - min)) * 100;

	return (
		<div className={clsx('flex flex-col gap-2', className)}>
			{label && (
				<div className='flex items-center justify-between text-sm'>
					<span className='font-medium'>{label}</span>
					<span className='text-muted dark:text-muted-dark'>
						{valueMin.toFixed(2)} – {valueMax.toFixed(2)}
					</span>
				</div>
			)}
			<div className='relative h-10 select-none'>
				{/* Track background */}
				<div
					ref={trackRef}
					className='bg-surface-container dark:bg-surface-container-dark absolute top-1/2 h-2 w-full -translate-y-1/2 cursor-pointer rounded-full'
				/>

				{/* Active range */}
				<div
					className='bg-accent dark:bg-accent-dark absolute top-1/2 h-2 -translate-y-1/2 rounded-full'
					style={{
						left: `${minPercent}%`,
						width: `${maxPercent - minPercent}%`,
					}}
				/>

				{/* Min thumb */}
				<div
					className={clsx(
						'border-accent dark:border-accent-dark bg-surface dark:bg-surface-dark absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 shadow-md transition-transform active:cursor-grabbing',
						dragging === 'min' && 'scale-125'
					)}
					style={{ left: `${minPercent}%` }}
					onMouseDown={handleMouseDown('min')}
				/>

				{/* Max thumb */}
				<div
					className={clsx(
						'border-accent dark:border-accent-dark bg-surface dark:bg-surface-dark absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 shadow-md transition-transform active:cursor-grabbing',
						dragging === 'max' && 'scale-125'
					)}
					style={{ left: `${maxPercent}%` }}
					onMouseDown={handleMouseDown('max')}
				/>
			</div>
		</div>
	);
}
