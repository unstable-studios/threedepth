import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

// Main Toolbar container in Layout - just the styled wrapper
export default function Toolbar({ children }: { children?: ReactNode }) {
	return (
		<div
			className={clsx(
				'pointer-events-auto flex items-center gap-2 rounded-xl px-2 py-2',
				'bg-glass dark:bg-glass-dark shadow-lg backdrop-blur-sm'
			)}
		>
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
