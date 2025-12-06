/**
 * Copyright (C) 2025 Unstable Studios, LLC
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './Layout';
import Editor from './Editor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logger } from './utils/diagnostics';

logger.info('Application starting');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ErrorBoundary>
			<Layout>
				<Editor />
			</Layout>
		</ErrorBoundary>
	</StrictMode>
);
