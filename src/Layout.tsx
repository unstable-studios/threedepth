import { Outlet } from 'react-router';
import { useDarkMode } from './hooks/useDarkMode';
import SiteFooter from './components/SiteFooter';
import { ToolbarProvider, useToolbar } from './contexts/ToolbarContext';

function LayoutContent() {
	const { toolbarContent } = useToolbar();

	return (
		<div className='app-root flex h-screen flex-col'>
			{/* Floating glass toolbar */}
			<header className='app-header pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4'>
				<div className='pointer-events-auto rounded-lg bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md dark:bg-black/20'>
					<h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
						ThreeDepth
					</h1>
				</div>
				{toolbarContent && (
					<div className='pointer-events-auto flex items-center gap-2 rounded-lg bg-white/10 px-2 py-2 shadow-lg backdrop-blur-md dark:bg-black/20'>
						{toolbarContent}
					</div>
				)}
			</header>

			<div id='main-content' className='flex flex-1 flex-col'>
				<Outlet />
				<SiteFooter />
			</div>
		</div>
	);
}

function Layout() {
	useDarkMode();
	return (
		<ToolbarProvider>
			<LayoutContent />
		</ToolbarProvider>
	);
}

export default Layout;
