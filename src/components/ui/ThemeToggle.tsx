import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import clsx from 'clsx';
import { useDarkMode } from '../../hooks/useDarkMode';

type ThemeOption = 'dark' | 'light' | 'system';

export default function ThemeToggle(
	{ className }: { className?: string },
	...props: any
) {
	const { theme, setTheme } = useDarkMode();

	const nextTheme: Record<ThemeOption, ThemeOption> = {
		dark: 'light',
		light: 'system',
		system: 'dark',
	};

	const handleClick = () => setTheme(nextTheme[theme]);

	const aria = `Theme: ${theme === 'system' ? 'Auto' : theme}`;

	// Icon coloring per state
	const moonClass = clsx(
		'h-6 w-6 transition-colors group-hover:text-gray-50 text-gray-400',
		theme === 'dark' ? '' : 'opacity-30'
	);
	const sunClass = clsx(
		'h-6 w-6 transition-colors group-hover:text-gray-50 text-gray-400',
		theme === 'light' ? '' : 'opacity-30'
	);

	return (
		<button
			onClick={handleClick}
			className={`group ${className}`}
			aria-label={aria}
			title={aria}
			{...props}
		>
			<HiOutlineMoon className={moonClass} />
			<HiOutlineSun className={sunClass} />
		</button>
	);
}
