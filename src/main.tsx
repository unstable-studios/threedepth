import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './Layout';

import Editor from './Editor';
import { StlToDepthMap } from './StlToDepthMap';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<Editor />} />
					<Route
						path='/v1'
						element={<StlToDepthMap width={1024} height={1024} />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
