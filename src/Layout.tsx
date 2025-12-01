import { Outlet } from 'react-router';
import { useDarkMode } from './hooks/useDarkMode';
import SiteFooter from './components/ui/SiteFooter';

function Layout() {
	useDarkMode(); // ensures html.dark toggles so Tailwind dark: works
	return (
		<div className='app-root flex h-screen flex-col'>
			{/* Floating glass toolbar */}
			<header className='app-header pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4'>
				<div className='pointer-events-auto rounded-lg bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md dark:bg-black/20'>
					<h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
						ThreeDepth
					</h1>
				</div>
				{/* Toolbar slot: children will be portaled here */}
				<div
					id='app-toolbar-slot'
					className='pointer-events-auto flex items-center'
				></div>
			</header>

			<div id='main-content' className='flex flex-1 flex-col'>
				<Outlet />
				<SiteFooter />
			</div>
		</div>
	);
}

export default Layout;
