import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
	const [theme, setThemeState] = useState<Theme>(() => {
		const stored = localStorage.getItem('theme') as Theme | null;
		return stored || 'system';
	});

	const [isDark, setIsDark] = useState(() => {
		if (theme === 'system') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		return theme === 'dark';
	});

	useEffect(() => {
		const root = document.documentElement;

		const updateDarkMode = (dark: boolean) => {
			setIsDark(dark);
			if (dark) {
				root.classList.add('dark');
			} else {
				root.classList.remove('dark');
			}
		};

		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			updateDarkMode(mediaQuery.matches);

			const listener = (e: MediaQueryListEvent) => updateDarkMode(e.matches);
			mediaQuery.addEventListener('change', listener);
			return () => mediaQuery.removeEventListener('change', listener);
		} else {
			updateDarkMode(theme === 'dark');
		}
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		if (newTheme === 'system') {
			localStorage.removeItem('theme');
		} else {
			localStorage.setItem('theme', newTheme);
		}
		setThemeState(newTheme);
	};

	return { theme, isDark, setTheme };
}
