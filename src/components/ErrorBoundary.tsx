/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Component } from 'react';
import type { ReactNode } from 'react';
import { logger } from '../utils/diagnostics';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
		logger.error('React error boundary caught error', {
			error: error.toString(),
			stack: error.stack,
			componentStack: errorInfo.componentStack,
		});
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className='flex h-screen items-center justify-center bg-neutral-950 text-neutral-50'>
					<div className='max-w-md p-8'>
						<h1 className='mb-4 text-2xl font-bold'>Something went wrong</h1>
						<p className='mb-4 text-neutral-400'>
							An error occurred while rendering this component. Please refresh
							the page.
						</p>
						<div className='space-y-2'>
							<button
								onClick={() => window.location.reload()}
								className='w-full rounded bg-blue-600 px-4 py-2 hover:bg-blue-700'
							>
								Reload Page
							</button>
							<button
								onClick={() => logger.exportLogs()}
								className='w-full rounded bg-neutral-800 px-4 py-2 hover:bg-neutral-700'
							>
								Export Diagnostic Logs
							</button>
						</div>
						{this.state.error && (
							<details className='mt-4 rounded bg-neutral-900 p-4 text-xs'>
								<summary className='cursor-pointer font-mono text-red-400'>
									Error Details
								</summary>
								<pre className='mt-2 overflow-auto text-neutral-400'>
									{this.state.error.toString()}
									{'\n\n'}
									{this.state.error.stack}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
