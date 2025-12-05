/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './Layout';
import Editor from './Editor';
import About from './pages/About';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					{/* Editor is the base content; child routes render as modals over it */}
					<Route path='/' element={<Editor />}>
						<Route path='about' element={<About />} />
						<Route path='help' element={<Help />} />
						<Route path='privacy' element={<Privacy />} />
						<Route path='terms' element={<Terms />} />
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
