import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './Layout';
import Editor from './Editor';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<Editor />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
