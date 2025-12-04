import { type ReactNode, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

// Main Toolbar container in Layout - just the styled wrapper
export default function Toolbar({ children }: { children?: ReactNode }) {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [drawerOwnerId, setDrawerOwnerId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onOpen = (e: Event) => {
			const customEvent = e as CustomEvent<{ ownerId?: string }>;
			setDrawerOpen(true);
			setDrawerOwnerId(customEvent.detail?.ownerId || null);
		};
		const onClose = () => {
			setDrawerOpen(false);
			setDrawerOwnerId(null);
		};
		window.addEventListener('toolbar-drawer:open', onOpen as EventListener);
		window.addEventListener('toolbar-drawer:close', onClose as EventListener);
		return () => {
			window.removeEventListener(
				'toolbar-drawer:open',
				onOpen as EventListener
			);
			window.removeEventListener(
				'toolbar-drawer:close',
				onClose as EventListener
			);
		};
	}, []);

	// Close on ESC and outside click
	useEffect(() => {
		if (!drawerOpen) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				window.dispatchEvent(new Event('toolbar-drawer:close'));
			}
		};
		const onMouseDown = (e: MouseEvent) => {
			const el = containerRef.current;
			if (!el) return;
			if (!el.contains(e.target as Node)) {
				window.dispatchEvent(new Event('toolbar-drawer:close'));
			}
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('mousedown', onMouseDown);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('mousedown', onMouseDown);
		};
	}, [drawerOpen]);

	return (
		<div ref={containerRef} className='relative'>
			<div className='relative'>
				<div
					data-drawer-owner-id={drawerOwnerId}
					className={clsx(
						'pointer-events-auto flex items-center gap-2 rounded-xl px-2 py-2',
						'bg-glass dark:bg-glass-dark shadow-lg backdrop-blur-sm'
					)}
				>
					{children}
				</div>
				{/* Overlay to blur and block clicks on main toolbar while drawer is open */}
				{drawerOpen && (
					<div
						onClick={() =>
							window.dispatchEvent(new Event('toolbar-drawer:close'))
						}
						className='pointer-events-auto absolute inset-0 z-30 cursor-default bg-transparent backdrop-blur-[2px]'
					/>
				)}
			</div>

			{/* Drawer: slides up on mobile, down on desktop */}
			<div
				className={clsx(
					// Constrain drawer to toolbar width
					'absolute right-0 left-auto z-40',
					// Positioning: mobile above the toolbar, desktop below
					'bottom-full mb-2 md:top-full md:bottom-auto md:mt-2'
				)}
			>
				<div
					className={clsx(
						// Constrain size and enable horizontal scroll inside
						'max-w-full overflow-x-auto overflow-y-hidden rounded-xl px-2 py-2',
						'bg-glass dark:bg-glass-dark shadow-lg backdrop-blur-sm',
						'transition-all duration-300 ease-out',
						// Mobile: start below (translate-y-full) and slide up
						drawerOpen
							? 'pointer-events-auto opacity-100'
							: 'pointer-events-none opacity-0',
						// Responsive slide direction
						drawerOpen ? 'translate-y-0' : 'translate-y-3 md:-translate-y-3'
					)}
				>
					{/* Prevent page scroll; allow content to scroll horizontally */}
					<div
						id='app-toolbar-drawer-slot'
						className='contents whitespace-nowrap'
					/>
				</div>
			</div>
		</div>
	);
}

// ToolbarItem - portal individual items to the toolbar from anywhere
export function ToolbarItem({ children }: { children: ReactNode }) {
	const [el, setEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		// Find all potential slots (desktop+mobile) and pick the visible one
		const slots = Array.from(
			document.querySelectorAll<HTMLElement>('#app-toolbar-slot')
		);
		// Choose the slot that is currently rendered and visible
		const visible =
			slots.find((node) => node.offsetParent !== null) || slots[0] || null;
		setEl(visible);

		// Re-evaluate on resize since responsive layout can swap slots
		const onResize = () => {
			const slots = Array.from(
				document.querySelectorAll<HTMLElement>('#app-toolbar-slot')
			);
			const visible =
				slots.find((node) => node.offsetParent !== null) || slots[0] || null;
			setEl(visible);
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	if (!el) return null;
	return createPortal(children, el);
}

// Drawer item - portal contents into the drawer slot only if ownerId matches
export function ToolbarDrawerItem({
	children,
	ownerId,
}: {
	children: ReactNode;
	ownerId: string;
}) {
	const [el, setEl] = useState<HTMLElement | null>(null);
	const [currentOwnerId, setCurrentOwnerId] = useState<string | null>(null);

	useEffect(() => {
		setEl(document.getElementById('app-toolbar-drawer-slot'));
	}, []);

	useEffect(() => {
		const onOpen = (e: Event) => {
			const customEvent = e as CustomEvent<{ ownerId?: string }>;
			setCurrentOwnerId(customEvent.detail?.ownerId || null);
		};
		const onClose = () => {
			setCurrentOwnerId(null);
		};
		window.addEventListener('toolbar-drawer:open', onOpen as EventListener);
		window.addEventListener('toolbar-drawer:close', onClose as EventListener);
		return () => {
			window.removeEventListener(
				'toolbar-drawer:open',
				onOpen as EventListener
			);
			window.removeEventListener(
				'toolbar-drawer:close',
				onClose as EventListener
			);
		};
	}, []);

	// Only render if this drawer item's ownerId matches the current drawer owner
	if (!el || currentOwnerId !== ownerId) return null;
	return createPortal(children, el);
}

// Helpers to open/close the drawer from anywhere
export function openToolbarDrawer(ownerId?: string) {
	window.dispatchEvent(
		new CustomEvent('toolbar-drawer:open', { detail: { ownerId } })
	);
}

export function closeToolbarDrawer() {
	window.dispatchEvent(new Event('toolbar-drawer:close'));
}
