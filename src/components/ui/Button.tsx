import React, { forwardRef } from 'react';
import clsx from 'clsx';

export type ButtonVariant =
	| 'accent'
	| 'primary'
	| 'outline'
	| 'ghost'
	| 'destructive';
export type IconPosition = 'start' | 'end';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonMinWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BaseProps {
	variant?: ButtonVariant;
	icon?: React.ReactNode;
	iconPosition?: IconPosition;
	size?: ButtonSize;
	loading?: boolean;
	loadingText?: string;
	as?: 'button' | 'a' | 'div'; // allow rendering as anchor/div/etc.
	fullWidth?: boolean; // stretch to container width
	minWidth?: ButtonMinWidth; // enforce a minimum width token
}

type ButtonProps = BaseProps &
	Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
		href?: string; // convenience when using as 'a'
	};

const variantClasses: Record<ButtonVariant, string> = {
	accent: 'bg-accent text-gray-50 shadow-sm',
	primary: 'bg-primary text-inverse shadow-sm',
	outline:
		'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-200',
	ghost: 'bg-transparent text-gray-600 dark:text-gray-300',
	destructive: 'bg-red-600 text-white shadow-sm dark:bg-red-500',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'text-xs px-2.5 py-1.5 gap-1',
	md: 'text-sm px-4 py-2 gap-2',
	lg: 'text-base px-5 py-3 gap-2.5',
};

const minWidthClasses: Record<ButtonMinWidth, string> = {
	xs: 'min-w-[4rem]', // 64px
	sm: 'min-w-[6rem]', // 96px
	md: 'min-w-[8rem]', // 128px
	lg: 'min-w-[10rem]', // 160px
	xl: 'min-w-[12rem]', // 192px
};

// Shared hover/focus styles applied to all variants.
const sharedInteraction =
	'hover:bg-gray-800 hover:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

// Base layout classes.
const baseClasses =
	'inline-flex items-center self-start justify-center rounded-md font-semibold transition-colors cursor-pointer duration-150 disabled:opacity-50 disabled:cursor-not-allowed w-auto';

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
	{
		variant = 'accent',
		size = 'md',
		icon,
		iconPosition = 'start',
		loading = false,
		loadingText,
		children,
		className,
		as = 'button',
		disabled,
		href,
		fullWidth = false,
		minWidth,
		...props
	},
	ref
) {
	const ElementType = as;
	const isIconOnly = icon && !children;
	const showSpinner = loading;
	const contentText = loading && loadingText ? loadingText : children;

	const commonProps = {
		'data-variant': variant,
		'aria-busy': loading || undefined,
		className: clsx(
			baseClasses,
			variantClasses[variant],
			sharedInteraction,
			isIconOnly ? 'p-2' : sizeClasses[size],
			fullWidth && 'w-full justify-center',
			minWidth && minWidthClasses[minWidth],
			loading && 'cursor-wait',
			className
		),
	};

	const content = (
		<>
			{showSpinner && (
				<span className={clsx('flex items-center')}>
					<svg
						className={clsx('h-4 w-4 animate-spin', contentText ? '' : '')}
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<circle className='opacity-25' cx='12' cy='12' r='10'></circle>
						<path className='opacity-75' d='M12 2a10 10 0 0 1 10 10h-4'></path>
					</svg>
				</span>
			)}
			{!showSpinner && icon && iconPosition === 'start' && (
				<span className={clsx(isIconOnly ? '' : 'flex items-center')}>
					{icon}
				</span>
			)}
			{contentText &&
				(typeof contentText === 'string' || typeof contentText === 'number' ? (
					<span className='leading-none'>{contentText}</span>
				) : (
					// When custom node content is passed (e.g., multiple icons), render directly to preserve layout
					contentText
				))}
			{!showSpinner && icon && iconPosition === 'end' && (
				<span className={clsx(isIconOnly ? '' : 'flex items-center')}>
					{icon}
				</span>
			)}
		</>
	);

	if (ElementType === 'a') {
		return (
			<a
				ref={ref as React.ForwardedRef<HTMLAnchorElement>}
				href={href}
				{...commonProps}
				{...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
			>
				{content}
			</a>
		);
	}

	if (ElementType === 'div') {
		return (
			<div
				ref={ref as React.ForwardedRef<HTMLDivElement>}
				{...commonProps}
				{...(props as React.HTMLAttributes<HTMLDivElement>)}
			>
				{content}
			</div>
		);
	}

	return (
		<button
			ref={ref as React.ForwardedRef<HTMLButtonElement>}
			disabled={disabled || loading}
			{...commonProps}
			{...props}
		>
			{content}
		</button>
	);
});

export default Button;
