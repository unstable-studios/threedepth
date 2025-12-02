import { Outlet } from 'react-router';
import { useDarkMode } from './hooks/useDarkMode';
import Menu from './components/ui/Menu';
import SiteFooter from './components/ui/SiteFooter';

function Layout() {
	useDarkMode(); // ensures html.dark toggles so Tailwind dark: works
	return (
		<div className='app-root flex h-screen flex-col'>
			{/* Floating glass toolbar */}
			<header className='app-header pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4'>
				<Menu />
				{/* Toolbar slot: children will be portaled here */}
				<div id='app-toolbar-slot'></div>
			</header>

			<div id='main-content' className='flex flex-1 flex-col'>
				<Outlet />
				<SiteFooter />
			</div>
		</div>
	);
}

export default Layout;
