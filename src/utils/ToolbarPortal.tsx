import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ToolbarPortal({ children }: { children: ReactNode }) {
	const [el, setEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setEl(document.getElementById('app-toolbar-slot'));
	}, []);

	if (!el) return null;
	return createPortal(children, el);
}
