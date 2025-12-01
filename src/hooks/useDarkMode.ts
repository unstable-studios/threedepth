import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
	const getStoredTheme = (): Theme =>
		(localStorage.getItem('theme') as Theme | null) || 'system';

	const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

	const computeIsDark = (t: Theme) =>
		t === 'system'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
			: t === 'dark';

	const [isDark, setIsDark] = useState<boolean>(() => computeIsDark(theme));

	// Apply dark class and optional background color for immediate feedback
	const applyDarkMode = (dark: boolean) => {
		const root = document.documentElement;
		if (dark) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	};

	// React to local theme changes and system changes
	useEffect(() => {
		if (theme === 'system') {
			const media = window.matchMedia('(prefers-color-scheme: dark)');
			const handle = (e: MediaQueryListEvent) => {
				setIsDark(e.matches);
				applyDarkMode(e.matches);
				// announce resolved change for any passive listeners
				window.dispatchEvent(new CustomEvent('themechange-resolved', { detail: e.matches ? 'dark' : 'light' }));
			};
			// initial apply
			setIsDark(media.matches);
			applyDarkMode(media.matches);
			media.addEventListener('change', handle);
			return () => media.removeEventListener('change', handle);
		} else {
			const dark = theme === 'dark';
			setIsDark(dark);
			applyDarkMode(dark);
		}
	}, [theme]);

	// Cross-component sync: listen for custom themechange events
	useEffect(() => {
		const onThemeChange = (e: Event) => {
			// primary event carries explicit theme when set by toggle
			const detail = (e as CustomEvent<Theme>).detail;
			const nextTheme = detail || getStoredTheme();
			setThemeState(nextTheme);
			setIsDark(computeIsDark(nextTheme));
			applyDarkMode(computeIsDark(nextTheme));
		};
		window.addEventListener('themechange', onThemeChange as EventListener);
		return () => window.removeEventListener('themechange', onThemeChange as EventListener);
	}, []);

	const setTheme = (newTheme: Theme) => {
		if (newTheme === 'system') {
			localStorage.removeItem('theme');
		} else {
			localStorage.setItem('theme', newTheme);
		}
		setThemeState(newTheme);
		const resolved = computeIsDark(newTheme);
		setIsDark(resolved);
		applyDarkMode(resolved);
		// notify other hook consumers in the same document
		window.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: newTheme }));
	};

	return { theme, isDark, setTheme };
}
