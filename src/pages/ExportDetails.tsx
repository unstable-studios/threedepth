import { useCallback, useRef, useEffect, useState } from 'react';
import { Modal } from '../components/ui/Modal';
import { HiCheck } from 'react-icons/hi';
import clsx from 'clsx';
import * as THREE from 'three';

// Helper function to add DPI metadata to PNG
async function addPNGMetadata(blob: Blob, dpi: number): Promise<Blob> {
	const buffer = await blob.arrayBuffer();
	const bytes = new Uint8Array(buffer);

	// DPI to pixels per meter: dpi * 39.3701
	const pixelsPerMeter = Math.round(dpi * 39.3701);

	// Create pHYs chunk data
	const pHYsData = new Uint8Array(9);
	pHYsData[0] = (pixelsPerMeter >> 24) & 0xff;
	pHYsData[1] = (pixelsPerMeter >> 16) & 0xff;
	pHYsData[2] = (pixelsPerMeter >> 8) & 0xff;
	pHYsData[3] = pixelsPerMeter & 0xff;
	pHYsData[4] = (pixelsPerMeter >> 24) & 0xff;
	pHYsData[5] = (pixelsPerMeter >> 16) & 0xff;
	pHYsData[6] = (pixelsPerMeter >> 8) & 0xff;
	pHYsData[7] = pixelsPerMeter & 0xff;
	pHYsData[8] = 1; // unit: 1 = meters

	// Create the full pHYs chunk
	const chunkType = new Uint8Array([112, 72, 89, 115]); // "pHYs"
	const pHYsChunk = createChunk(chunkType, pHYsData);

	// Find the position after IHDR chunk to insert pHYs
	let pos = 8; // Skip PNG signature
	const ihdrLength = readUint32(bytes, pos);
	const insertPos = pos + 4 + 4 + ihdrLength + 4; // length + type + data + crc

	// Combine: everything before insertPos + pHYs chunk + everything after
	const newPNG = new Uint8Array(bytes.length + pHYsChunk.length);
	newPNG.set(bytes.slice(0, insertPos));
	newPNG.set(pHYsChunk, insertPos);
	newPNG.set(bytes.slice(insertPos), insertPos + pHYsChunk.length);

	return new Blob([newPNG], { type: 'image/png' });
}

function readUint32(bytes: Uint8Array, offset: number): number {
	return (
		((bytes[offset] << 24) |
			(bytes[offset + 1] << 16) |
			(bytes[offset + 2] << 8) |
			bytes[offset + 3]) >>>
		0
	);
}

function createChunk(type: Uint8Array, data: Uint8Array): Uint8Array {
	const length = new Uint8Array(4);
	length[0] = (data.length >> 24) & 0xff;
	length[1] = (data.length >> 16) & 0xff;
	length[2] = (data.length >> 8) & 0xff;
	length[3] = data.length & 0xff;

	const crc = calculateCRC(type, data);
	const crcBytes = new Uint8Array(4);
	crcBytes[0] = (crc >> 24) & 0xff;
	crcBytes[1] = (crc >> 16) & 0xff;
	crcBytes[2] = (crc >> 8) & 0xff;
	crcBytes[3] = crc & 0xff;

	const chunk = new Uint8Array(4 + 4 + data.length + 4);
	chunk.set(length);
	chunk.set(type, 4);
	chunk.set(data, 8);
	chunk.set(crcBytes, 8 + data.length);

	return chunk;
}

function calculateCRC(type: Uint8Array, data: Uint8Array): number {
	const table = makeCRCTable();
	let crc = 0xffffffff;

	for (let i = 0; i < type.length; i++) {
		crc = table[(crc ^ type[i]) & 0xff] ^ (crc >>> 8);
	}

	for (let i = 0; i < data.length; i++) {
		crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
	}

	return (crc ^ 0xffffffff) >>> 0;
}

function makeCRCTable(): Uint32Array {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c >>> 0;
	}
	return table;
}

interface ExportDetailsProps {
	isOpen: boolean;
	onClose: () => void;
	scene: THREE.Scene | null;
	gl: THREE.WebGLRenderer | null;
	previewCanvasRef: React.RefObject<HTMLCanvasElement>;
	depthMin: number;
	depthMax: number;
	zScale: number;
	invertDepth: boolean;
}

export function ExportDetails({
	isOpen,
	onClose,
	scene,
	gl,
}: ExportDetailsProps) {
	const [resolution, setResolution] = useState<512 | 1024 | 2048>(1024);
	const [format, setFormat] = useState<'png' | 'jpg'>('png');
	const [backgroundColor, setBackgroundColor] = useState<
		'transparent' | 'white' | 'black' | 'custom'
	>('transparent');
	const [customColor, setCustomColor] = useState<string>('#ffffff');
	const [dpi, setDpi] = useState<72 | 150 | 300>(150);
	const [isExporting, setIsExporting] = useState(false);
	const largePreviewRef = useRef<HTMLCanvasElement>(null);

	// Generate large preview when modal opens or background color changes
	useEffect(() => {
		if (!isOpen || !scene || !gl) return;

		const generatePreview = () => {
			const canvas = document.createElement('canvas');
			const renderSize = 512; // Preview at 512px
			canvas.width = renderSize;
			canvas.height = renderSize;

			const box = new THREE.Box3();
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh && !object.userData?.isHelper) {
					box.expandByObject(object);
				}
			});

			if (box.isEmpty()) return;

			const size = box.getSize(new THREE.Vector3());
			const center = box.getCenter(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y);

			const ortho = new THREE.OrthographicCamera(
				-maxDim / 2,
				maxDim / 2,
				maxDim / 2,
				-maxDim / 2,
				0.1,
				1000
			);
			ortho.position.set(center.x, center.y, box.max.z + 10);
			ortho.lookAt(center.x, center.y, center.z);
			ortho.updateProjectionMatrix();

			const renderTarget = new THREE.WebGLRenderTarget(renderSize, renderSize);

			const hidden: THREE.Object3D[] = [];
			const originalBackground = scene.background;
			scene.background = null;
			scene.traverse((object) => {
				const isGizmo =
					object.name === 'GizmoHelper' ||
					object.parent?.name === 'GizmoHelper';
				const isHelper =
					!!object.userData?.isHelper || object.type === 'GridHelper';
				if (isGizmo || isHelper) {
					if (object.visible) {
						hidden.push(object);
						object.visible = false;
					}
				}
			});

			gl.setRenderTarget(renderTarget);
			gl.render(scene, ortho);
			gl.setRenderTarget(null);
			scene.background = originalBackground;

			hidden.forEach((obj) => (obj.visible = true));

			const pixels = new Uint8Array(renderSize * renderSize * 4);
			gl.readRenderTargetPixels(
				renderTarget,
				0,
				0,
				renderSize,
				renderSize,
				pixels
			);

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				renderTarget.dispose();
				return;
			}

			const imageData = ctx.createImageData(renderSize, renderSize);

			// Get background color (same logic as export)
			let bgColor: [number, number, number] = [0, 0, 0]; // black default
			if (backgroundColor === 'white') {
				bgColor = [255, 255, 255];
			} else if (backgroundColor === 'black') {
				bgColor = [0, 0, 0];
			} else if (backgroundColor === 'custom') {
				const hex = customColor.replace('#', '');
				bgColor = [
					parseInt(hex.substr(0, 2), 16),
					parseInt(hex.substr(2, 2), 16),
					parseInt(hex.substr(4, 2), 16),
				];
			}

			// Apply pixels with background (same logic as export)
			for (let y = 0; y < renderSize; y++) {
				for (let x = 0; x < renderSize; x++) {
					const flippedY = renderSize - 1 - y;
					const srcIdx = (flippedY * renderSize + x) * 4;
					const dstIdx = (y * renderSize + x) * 4;

					const alpha = pixels[srcIdx + 3] / 255;

					if (backgroundColor === 'transparent') {
						// Keep original pixel with alpha
						imageData.data[dstIdx] = pixels[srcIdx];
						imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
						imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
						imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
					} else {
						// Blend depth map with background using alpha
						imageData.data[dstIdx] = Math.round(
							pixels[srcIdx] * alpha + bgColor[0] * (1 - alpha)
						);
						imageData.data[dstIdx + 1] = Math.round(
							pixels[srcIdx + 1] * alpha + bgColor[1] * (1 - alpha)
						);
						imageData.data[dstIdx + 2] = Math.round(
							pixels[srcIdx + 2] * alpha + bgColor[2] * (1 - alpha)
						);
						// For non-transparent backgrounds, set alpha to fully opaque
						imageData.data[dstIdx + 3] = 255;
					}
				}
			}
			ctx.putImageData(imageData, 0, 0);

			if (largePreviewRef.current) {
				const previewCtx = largePreviewRef.current.getContext('2d');
				if (previewCtx) {
					largePreviewRef.current.width = renderSize;
					largePreviewRef.current.height = renderSize;
					previewCtx.drawImage(canvas, 0, 0);
				}
			}

			renderTarget.dispose();
		};

		generatePreview();
	}, [isOpen, scene, gl, backgroundColor, customColor]);

	const handleExport = useCallback(async () => {
		if (!scene || !gl) return;

		setIsExporting(true);

		try {
			const renderSize = resolution;
			const renderTarget = new THREE.WebGLRenderTarget(renderSize, renderSize);

			const box = new THREE.Box3();
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh && !object.userData?.isHelper) {
					box.expandByObject(object);
				}
			});

			if (box.isEmpty()) {
				setIsExporting(false);
				return;
			}

			const size = box.getSize(new THREE.Vector3());
			const center = box.getCenter(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y);

			const ortho = new THREE.OrthographicCamera(
				-maxDim / 2,
				maxDim / 2,
				maxDim / 2,
				-maxDim / 2,
				0.1,
				1000
			);
			ortho.position.set(center.x, center.y, box.max.z + 10);
			ortho.lookAt(center.x, center.y, center.z);
			ortho.updateProjectionMatrix();

			const hidden: THREE.Object3D[] = [];
			const originalBackground = scene.background;
			scene.background = null;
			scene.traverse((object) => {
				const isGizmo =
					object.name === 'GizmoHelper' ||
					object.parent?.name === 'GizmoHelper';
				const isHelper =
					!!object.userData?.isHelper || object.type === 'GridHelper';
				if (isGizmo || isHelper) {
					if (object.visible) {
						hidden.push(object);
						object.visible = false;
					}
				}
			});

			gl.setRenderTarget(renderTarget);
			gl.render(scene, ortho);
			gl.setRenderTarget(null);
			scene.background = originalBackground;

			hidden.forEach((obj) => (obj.visible = true));

			const pixels = new Uint8Array(renderSize * renderSize * 4);
			gl.readRenderTargetPixels(
				renderTarget,
				0,
				0,
				renderSize,
				renderSize,
				pixels
			);

			const canvas = document.createElement('canvas');
			canvas.width = renderSize;
			canvas.height = renderSize;
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				renderTarget.dispose();
				setIsExporting(false);
				return;
			}

			const imageData = ctx.createImageData(renderSize, renderSize);

			// Get background color
			let bgColor: [number, number, number] = [0, 0, 0]; // black default
			if (backgroundColor === 'white') {
				bgColor = [255, 255, 255];
			} else if (backgroundColor === 'black') {
				bgColor = [0, 0, 0];
			} else if (backgroundColor === 'custom') {
				const hex = customColor.replace('#', '');
				bgColor = [
					parseInt(hex.substr(0, 2), 16),
					parseInt(hex.substr(2, 2), 16),
					parseInt(hex.substr(4, 2), 16),
				];
			}

			// Apply pixels with background
			for (let y = 0; y < renderSize; y++) {
				for (let x = 0; x < renderSize; x++) {
					const flippedY = renderSize - 1 - y;
					const srcIdx = (flippedY * renderSize + x) * 4;
					const dstIdx = (y * renderSize + x) * 4;

					const alpha = pixels[srcIdx + 3] / 255;

					if (backgroundColor === 'transparent') {
						// Keep original pixel with alpha
						imageData.data[dstIdx] = pixels[srcIdx];
						imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
						imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
						imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
					} else {
						// Blend depth map (foreground) with background using alpha
						// Formula: out = fg * alpha + bg * (1 - alpha)
						imageData.data[dstIdx] = Math.round(
							pixels[srcIdx] * alpha + bgColor[0] * (1 - alpha)
						);
						imageData.data[dstIdx + 1] = Math.round(
							pixels[srcIdx + 1] * alpha + bgColor[1] * (1 - alpha)
						);
						imageData.data[dstIdx + 2] = Math.round(
							pixels[srcIdx + 2] * alpha + bgColor[2] * (1 - alpha)
						);
						// For non-transparent backgrounds, set alpha to fully opaque
						imageData.data[dstIdx + 3] = 255;
					}
				}
			}

			ctx.putImageData(imageData, 0, 0);

			// Convert to desired format with DPI metadata
			canvas.toBlob(
				async (blob) => {
					if (!blob) {
						renderTarget.dispose();
						setIsExporting(false);
						return;
					}

					let finalBlob = blob;

					// Add DPI metadata for PNG
					if (format === 'png') {
						finalBlob = await addPNGMetadata(blob, dpi);
					}

					const url = URL.createObjectURL(finalBlob);
					const link = document.createElement('a');
					link.download = `depth-map-${Date.now()}.${format}`;
					link.href = url;
					link.click();
					URL.revokeObjectURL(url);
					renderTarget.dispose();
					setIsExporting(false);
					onClose();
				},
				`image/${format}`,
				format === 'jpg' ? 0.95 : undefined
			);
		} catch (error) {
			console.error('Export failed:', error);
			setIsExporting(false);
		}
	}, [
		scene,
		gl,
		resolution,
		format,
		backgroundColor,
		customColor,
		dpi,
		onClose,
	]);

	const resolutionOptions = [
		{ value: 512 as const, label: '512px' },
		{ value: 1024 as const, label: '1024px (Recommended)' },
		{ value: 2048 as const, label: '2048px (High Quality)' },
	];

	const formatOptions = [
		{ value: 'png' as const, label: 'PNG (Lossless)' },
		{ value: 'jpg' as const, label: 'JPG (Compressed)' },
	];

	const dpiOptions = [
		{ value: 72 as const, label: '72 DPI (Screen)' },
		{ value: 150 as const, label: '150 DPI (Standard)' },
		{ value: 300 as const, label: '300 DPI (Print)' },
	];

	const colorOptions = [
		{ value: 'transparent' as const, label: 'Transparent' },
		{ value: 'white' as const, label: 'White' },
		{ value: 'black' as const, label: 'Black' },
		{ value: 'custom' as const, label: 'Custom' },
	];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Export Depth Map'>
			<div className='flex flex-col gap-0'>
				{/* Large Preview - Sticky at top */}
				<div className='flex flex-col gap-2 p-6'>
					<label className='text-sm font-semibold'>Preview</label>
					<div className='flex justify-center rounded-lg p-4'>
						<canvas
							ref={largePreviewRef}
							className='h-40 w-40 sm:h-48 sm:w-48 md:h-64 md:w-64'
							style={{ imageRendering: 'pixelated' }}
						/>
					</div>
				</div>

				{/* Scrollable Controls */}
				<div className='px-6 py-4'>
					<div className='flex flex-col gap-6'>
						{/* Resolution Selection */}
						<div className='flex flex-col gap-2'>
							<label className='text-sm font-semibold'>Resolution</label>
							<div className='flex flex-col gap-2'>
								{resolutionOptions.map((opt) => (
									<button
										key={opt.value}
										onClick={() => setResolution(opt.value)}
										className={clsx(
											'flex items-center gap-3 rounded-lg px-3 py-2 text-left font-medium transition-colors',
											resolution === opt.value
												? 'bg-accent dark:bg-accent-dark text-onaccent dark:text-onaccent-dark'
												: 'bg-secondary/10 dark:bg-secondary-dark/10 hover:bg-secondary/20 dark:hover:bg-secondary-dark/20'
										)}
									>
										<div
											className={clsx(
												'flex h-5 w-5 items-center justify-center rounded border-2',
												resolution === opt.value
													? 'border-current bg-current'
													: 'border-current'
											)}
										>
											{resolution === opt.value && (
												<HiCheck className='h-3 w-3 text-white' />
											)}
										</div>
										{opt.label}
									</button>
								))}
							</div>
						</div>

						{/* Format Selection */}
						<div className='flex flex-col gap-2'>
							<label className='text-sm font-semibold'>File Format</label>
							<div className='flex flex-col gap-2'>
								{formatOptions.map((opt) => (
									<button
										key={opt.value}
										onClick={() => setFormat(opt.value)}
										className={clsx(
											'flex items-center gap-3 rounded-lg px-3 py-2 text-left font-medium transition-colors',
											format === opt.value
												? 'bg-accent dark:bg-accent-dark text-onaccent dark:text-onaccent-dark'
												: 'bg-secondary/10 dark:bg-secondary-dark/10 hover:bg-secondary/20 dark:hover:bg-secondary-dark/20'
										)}
									>
										<div
											className={clsx(
												'flex h-5 w-5 items-center justify-center rounded border-2',
												format === opt.value
													? 'border-current bg-current'
													: 'border-current'
											)}
										>
											{format === opt.value && (
												<HiCheck className='h-3 w-3 text-white' />
											)}
										</div>
										{opt.label}
									</button>
								))}
							</div>
						</div>

						{/* DPI Selection */}
						<div className='flex flex-col gap-2'>
							<label className='text-sm font-semibold'>DPI</label>
							<div className='flex flex-col gap-2'>
								{dpiOptions.map((opt) => (
									<button
										key={opt.value}
										onClick={() => setDpi(opt.value)}
										className={clsx(
											'flex items-center gap-3 rounded-lg px-3 py-2 text-left font-medium transition-colors',
											dpi === opt.value
												? 'bg-accent dark:bg-accent-dark text-onaccent dark:text-onaccent-dark'
												: 'bg-secondary/10 dark:bg-secondary-dark/10 hover:bg-secondary/20 dark:hover:bg-secondary-dark/20'
										)}
									>
										<div
											className={clsx(
												'flex h-5 w-5 items-center justify-center rounded border-2',
												dpi === opt.value
													? 'border-current bg-current'
													: 'border-current'
											)}
										>
											{dpi === opt.value && (
												<HiCheck className='h-3 w-3 text-white' />
											)}
										</div>
										{opt.label}
									</button>
								))}
							</div>
						</div>

						{/* Background Color Selection */}
						<div className='flex flex-col gap-2'>
							<label className='text-sm font-semibold'>Background Color</label>
							<div className='flex flex-col gap-2'>
								{colorOptions.map((opt) => (
									<button
										key={opt.value}
										onClick={() => setBackgroundColor(opt.value)}
										className={clsx(
											'flex items-center gap-3 rounded-lg px-3 py-2 text-left font-medium transition-colors',
											backgroundColor === opt.value
												? 'bg-accent dark:bg-accent-dark text-onaccent dark:text-onaccent-dark'
												: 'bg-secondary/10 dark:bg-secondary-dark/10 hover:bg-secondary/20 dark:hover:bg-secondary-dark/20'
										)}
									>
										<div
											className={clsx(
												'flex h-5 w-5 items-center justify-center rounded border-2',
												backgroundColor === opt.value
													? 'border-current bg-current'
													: 'border-current'
											)}
										>
											{backgroundColor === opt.value && (
												<HiCheck className='h-3 w-3 text-white' />
											)}
										</div>
										{opt.label}
									</button>
								))}
							</div>

							{/* Custom Color Picker */}
							{backgroundColor === 'custom' && (
								<div className='flex gap-2 pl-8'>
									<input
										type='color'
										value={customColor}
										onChange={(e) => setCustomColor(e.target.value)}
										className='border-secondary/20 dark:border-secondary-dark/20 h-10 w-10 cursor-pointer rounded-lg border-2'
									/>
									<input
										type='text'
										value={customColor}
										onChange={(e) => setCustomColor(e.target.value)}
										placeholder='#ffffff'
										className='border-secondary/20 bg-secondary/10 dark:border-secondary-dark/20 dark:bg-secondary-dark/10 flex-1 rounded-lg border px-3 py-2 font-mono text-sm'
									/>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Export Button - at bottom */}
				<button
					onClick={handleExport}
					disabled={isExporting}
					className={clsx(
						'border-secondary/20 dark:border-secondary-dark/20 w-full rounded-lg border-t px-4 py-3 font-semibold transition-all',
						isExporting
							? 'bg-secondary/50 dark:bg-secondary-dark/50 text-secondary/75 dark:text-secondary-dark/75 cursor-not-allowed'
							: 'bg-accent dark:bg-accent-dark text-onaccent dark:text-onaccent-dark hover:shadow-lg active:scale-95'
					)}
				>
					{isExporting ? 'Exporting...' : 'Download'}
				</button>
			</div>
		</Modal>
	);
}
