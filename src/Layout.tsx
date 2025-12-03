import { Outlet } from 'react-router';
// No JS breakpoints: rely on Tailwind responsive classes
import useDarkMode from './hooks/useDarkMode';
import MainMenu from './components/ui/MainMenu';
import Toolbar from './components/ui/Toolbar';

function Layout() {
	useDarkMode(); // ensures html.dark toggles so Tailwind dark: works

	return (
		<div className='flex h-screen flex-col'>
			{/* Menubar: desktop top-right; mobile fixed top-left */}
			<div className='pointer-events-none'>
				<div className='absolute inset-x-0 top-0 z-50 hidden items-start justify-between px-6 py-4 md:flex'>
					<MainMenu />
					{/* Toolbar sits in header on desktop via responsive positioning below */}
				</div>
				{/* Mobile: show menu top-left */}
				<div className='fixed top-4 left-4 z-50 md:hidden'>
					<div className='pointer-events-auto'>
						<MainMenu />
					</div>
				</div>
			</div>

			{/* Single Toolbar instance with responsive positioning */}
			<div
				className={
					// Mobile: bottom-center with safe-area padding; Desktop: static in header
					'pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+16px)] md:static md:inset-auto md:bottom-auto md:pb-0'
				}
			>
				<div className='pointer-events-auto md:absolute md:top-4 md:right-6'>
					<Toolbar>
						<div id='app-toolbar-slot' className='contents'></div>
					</Toolbar>
				</div>
			</div>

			<div id='main-content' className='flex flex-1 flex-col'>
				<Outlet />
			</div>
		</div>
	);
}

export default Layout;
