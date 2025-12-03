import { Outlet } from 'react-router';
import useDarkMode from './hooks/useDarkMode';
import Menu from './components/ui/Menu';
import Toolbar from './components/ui/Toolbar';

function Layout() {
	useDarkMode(); // ensures html.dark toggles so Tailwind dark: works
	return (
		<div className='flex h-screen flex-col'>
			<header className='pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between px-6 py-4'>
				<Menu />
				<Toolbar>
					{/* Toolbar slot: ToolbarItems will be portaled here */}
					<div id='app-toolbar-slot' className='contents'></div>
				</Toolbar>
			</header>

			<div id='main-content' className='flex flex-1 flex-col'>
				<Outlet />
			</div>
		</div>
	);
}

export default Layout;
