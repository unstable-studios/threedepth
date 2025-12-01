export default function Toggle({
	isOn,
	handleToggle,
	label,
	labelRight = false,
}: {
	isOn: boolean;
	handleToggle: () => void;
	label?: string;
	labelRight?: boolean;
}) {
	const labelClass = 'text-primary font-semibold text-xl';
	return (
		<div className='flex items-center'>
			{label && !labelRight && (
				<span className={`mr-2 ${labelClass}`}>{label}</span>
			)}
			<div
				onClick={handleToggle}
				className={`flex h-8 w-14 cursor-pointer items-center rounded-full p-1 ${
					isOn ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
				}`}
			>
				<div
					className={`h-6 w-6 transform rounded-full bg-white shadow-md duration-300 ease-in-out ${
						isOn ? 'translate-x-6' : ''
					}`}
				></div>
			</div>
			{label && labelRight && (
				<span className={`ml-2 ${labelClass}`}>{label}</span>
			)}
		</div>
	);
}
