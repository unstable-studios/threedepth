import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Main Toolbar container in Layout - just the styled wrapper
export function Toolbar({ children }: { children?: ReactNode }) {
	return (
		<div className='pointer-events-auto flex items-center gap-2 rounded-lg bg-white/10 px-2 py-2 shadow-lg backdrop-blur-md dark:bg-black/20'>
			{children}
		</div>
	);
}

// ToolbarItem - portal individual items to the toolbar from anywhere
export function ToolbarItem({ children }: { children: ReactNode }) {
	const [el, setEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setEl(document.getElementById('app-toolbar-slot'));
	}, []);

	if (!el) return null;
	return createPortal(children, el);
}
