import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import clsx from 'clsx';
import { useDarkMode } from '../hooks/useDarkMode';
import Button from './Button';

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
		'h-6 w-6 transition-colors group-hover:text-gray-50 text-gray-400',
		theme === 'dark' ? '' : 'opacity-30'
	);
	const sunClass = clsx(
		'h-6 w-6 transition-colors group-hover:text-gray-50 text-gray-400',
		theme === 'light' ? '' : 'opacity-30'
	);

	return (
		<Button
			type='button'
			onClick={handleClick}
			variant='ghost'
			size='md'
			className='group'
			aria-label={aria}
			title={aria}
		>
			<HiOutlineMoon className={moonClass} />
			<HiOutlineSun className={sunClass} />
		</Button>
	);
}
