function SiteFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className='flex w-full flex-col items-center gap-2 px-4 py-6 font-sans text-sm font-medium tracking-tight text-gray-500 xl:flex-row xl:justify-between xl:px-8'>
			<p>© {year} Unstable Studios. All rights reserved.</p>
			<div className='flex gap-2 lg:gap-4'>
				<a href='/privacy' className='hover:text-accent underline'>
					Privacy Policy
				</a>
				<a href='/terms' className='hover:text-accent underline'>
					Terms of Service
				</a>
			</div>
			<span className='text-sm'>
				ThreeDepth is designed and built by{' '}
				<a
					href='https://unstablestudios.com'
					target='_blank'
					rel='noreferrer'
					className='hover:text-accent underline underline-offset-2'
				>
					Unstable Studios.
				</a>
			</span>
		</footer>
	);
}
export default SiteFooter;
