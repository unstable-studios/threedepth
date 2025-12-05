/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	data?: unknown;
}

class DiagnosticsLogger {
	private logs: LogEntry[] = [];
	private maxLogs = 100;
	private startTime = Date.now();

	log(level: LogLevel, message: string, data?: unknown) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			data,
		};

		this.logs.push(entry);
		if (this.logs.length > this.maxLogs) {
			this.logs.shift();
		}

		// Console output with prefix
		const uptime = ((Date.now() - this.startTime) / 1000).toFixed(1);
		const prefix = `[ThreeDepth +${uptime}s]`;

		switch (level) {
			case 'error':
				console.error(prefix, message, data);
				break;
			case 'warn':
				console.warn(prefix, message, data);
				break;
			default:
				console.log(prefix, message, data);
		}
	}

	info(message: string, data?: unknown) {
		this.log('info', message, data);
	}

	warn(message: string, data?: unknown) {
		this.log('warn', message, data);
	}

	error(message: string, data?: unknown) {
		this.log('error', message, data);
	}

	getLogs() {
		return [...this.logs];
	}

	exportLogs() {
		const logText = this.logs
			.map((entry) => {
				const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
				return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${dataStr}`;
			})
			.join('\n');

		const blob = new Blob([logText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `threedepth-logs-${Date.now()}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	clear() {
		this.logs = [];
	}
}

export const logger = new DiagnosticsLogger();

// Track page visibility changes
if (typeof document !== 'undefined') {
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			logger.info('Page hidden (tab backgrounded)');
		} else {
			logger.info('Page visible (tab foregrounded)');
		}
	});

	// Track page lifecycle events
	window.addEventListener('pageshow', (event) => {
		logger.info('Page shown', { persisted: event.persisted });
	});

	window.addEventListener('pagehide', (event) => {
		logger.info('Page hidden (navigating away)', { persisted: event.persisted });
	});

	// Track memory warnings (Safari)
	window.addEventListener('memorywarning', () => {
		logger.error('Memory warning received');
	});

	// Track unhandled errors
	window.addEventListener('error', (event) => {
		logger.error('Unhandled error', {
			message: event.message,
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno,
			error: event.error?.toString(),
		});
	});

	// Track unhandled promise rejections
	window.addEventListener('unhandledrejection', (event) => {
		logger.error('Unhandled promise rejection', {
			reason: event.reason?.toString(),
		});
	});

	// Log initial page load
	logger.info('ThreeDepth initialized', {
		userAgent: navigator.userAgent,
		viewport: `${window.innerWidth}x${window.innerHeight}`,
		pixelRatio: window.devicePixelRatio,
		memory: (performance as any).memory
			? {
					jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
					totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
					usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
			  }
			: 'not available',
	});
}

// Periodic health check
if (typeof window !== 'undefined') {
	setInterval(() => {
		const memory = (performance as any).memory;
		logger.info('Health check', {
			visibility: document.hidden ? 'hidden' : 'visible',
			memory: memory
				? {
						used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
						total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
						limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
				  }
				: 'not available',
		});
	}, 60000); // Every minute
}
