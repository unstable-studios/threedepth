import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import clsx from 'clsx';
import { useDarkMode } from '../hooks/useDarkMode';

type ThemeOption = 'dark' | 'light' | 'system';

export default function ThemeToggle() {
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
		'h-6 w-6 transition-colors group-hover:text-stone-50 text-primary',
		theme === 'dark' ? '' : 'opacity-30'
	);
	const sunClass = clsx(
		'h-6 w-6 transition-colors group-hover:text-stone-50 text-primary',
		theme === 'light' ? '' : 'opacity-30'
	);

	return (
		<button
			type='button'
			onClick={handleClick}
			aria-label={aria}
			title={aria}
			className={clsx(
				'inline-flex items-center rounded-full p-2',
				'group hover:bg-accent transition-colors hover:cursor-pointer'
			)}
		>
			<HiOutlineMoon className={moonClass} />
			<HiOutlineSun className={sunClass} />
		</button>
	);
}
