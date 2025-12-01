import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { InteractiveViewer } from './components/InteractiveViewer';
import { Button } from './components/Button';
import { HiUpload, HiCube } from 'react-icons/hi';
import type { AxisChoice } from './lib/types';
import { orientGeometry } from './lib/geometryUtils';
import { computeVertexColors } from './lib/vertexColors';
import { renderFastHeightmap } from './lib/fastRenderer';
import { renderAccurateHeightmap } from './lib/accurateRenderer';

type Props = {
	width?: number;
	height?: number;
};

export const StlToDepthMap: React.FC<Props> = ({
	width = 1024,
	height = 1024,
}) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// keep last loaded file buffer so we can re-render on axis/invert/zoom changes
	const lastFileRef = useRef<{ name: string; buffer: ArrayBuffer } | null>(
		null
	);

	const [status, setStatus] = useState<string>('Drop an STL to begin');
	const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
	const [currentFileName, setCurrentFileName] = useState<string | null>(null);
	const [isRendering, setIsRendering] = useState<boolean>(false);
	const [axis, setAxis] = useState<AxisChoice>('Z');
	const [invert, setInvert] = useState<boolean>(false);
	const [zoom, setZoom] = useState<number>(1); // 1 = zoom-to-fit baseline
	const [debugColors, setDebugColors] = useState<boolean>(false);
	const [accurateMode, setAccurateMode] = useState<boolean>(false);

	// Re-render when axis, invert, zoom, debugColors, or accurateMode changes
	useEffect(() => {
		const last = lastFileRef.current;
		if (last && !isRendering) {
			renderFromBuffer(last.buffer, last.name);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [axis, invert, zoom, debugColors, accurateMode]);

	// core render function – re-used for axis/invert/zoom changes
	const renderFromBuffer = async (buffer: ArrayBuffer, fileName: string) => {
		try {
			setIsRendering(true);
			setStatus(
				`Processing ${fileName} (axis ${axis} as height, zoom ${zoom.toFixed(2)}×)…`
			);
			setPreviewDataUrl(null);
			setCurrentFileName(fileName);

			// Load and orient geometry
			const loader = new STLLoader();
			const rawGeometry = loader.parse(buffer as ArrayBuffer);
			const baseGeom = rawGeometry as THREE.BufferGeometry;
			const geom = orientGeometry(baseGeom, axis);

			// Compute bounding box and Z range
			geom.computeBoundingBox();
			const bbox = geom.boundingBox!;
			const zMin = bbox.min.z;
			const zMax = bbox.max.z;

			if (zMax - zMin === 0) {
				setStatus('Model is flat along that axis; heightmap will be uniform.');
			} else {
				setStatus('Computing vertex heights…');
			}

			// Compute vertex colors (used by fast mode)
			const colors = computeVertexColors(geom, zMin, zMax, debugColors, invert);
			geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

			// Render heightmap using selected method
			let dataUrl: string;
			if (accurateMode) {
				setStatus('Raycast sampling (accurate mode)…');
				dataUrl = renderAccurateHeightmap(
					geom,
					bbox,
					zoom,
					width,
					height,
					zMin,
					zMax,
					invert
				);
			} else {
				setStatus('Rendering heightmap…');
				dataUrl = renderFastHeightmap(geom, bbox, zoom, width, height);
			}

			setPreviewDataUrl(dataUrl);
			geom.dispose();

			setStatus('Preview ready. Adjust axis/invert/zoom, then download.');
		} catch (err) {
			console.error(err);
			setStatus('Error: ' + (err as Error).message);
		} finally {
			setIsRendering(false);
		}
	};

	const handleFile = async (file: File) => {
		const buffer = await file.arrayBuffer();
		lastFileRef.current = { name: file.name, buffer };
		await renderFromBuffer(buffer, file.name);
	};

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFile(file);
		}
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0];
		if (file && file.name.toLowerCase().endsWith('.stl')) {
			handleFile(file);
		} else {
			setStatus('Please drop a single .stl file');
		}
	};

	const triggerDownload = () => {
		if (!previewDataUrl || !currentFileName) return;

		const link = document.createElement('a');
		link.href = previewDataUrl;
		link.download = `${currentFileName.replace(/\.[^.]+$/, '')}-heightmap.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleAxisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setAxis(e.target.value as AxisChoice);
	};

	const handleInvertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInvert(e.target.checked);
	};

	const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newZoom = parseFloat(e.target.value);
		setZoom(newZoom);
	};

	const handleZoomToFit = () => {
		setZoom(1);
	};

	return (
		<div className='p-4'>
			<h1 className='mb-2 text-2xl'>STL → Depth Map</h1>

			<p className='mb-3 min-h-[1.5em]'>{status}</p>

			<div className='mb-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-center gap-4'>
				<label className='flex items-center gap-2'>
					Height axis:{' '}
					<select
						value={axis}
						onChange={handleAxisChange}
						disabled={isRendering}
						className='flex-1'
					>
						<option value='Z'>Z (up)</option>
						<option value='Y'>Y (up)</option>
						<option value='X'>X (up)</option>
					</select>
				</label>

				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={invert}
						onChange={handleInvertChange}
						disabled={isRendering}
					/>{' '}
					Invert grayscale
				</label>

				<div className='flex items-center gap-2'>
					<label className='flex flex-1 items-center gap-1.5'>
						Zoom:
						<input
							type='range'
							min={0.5}
							max={4}
							step={0.1}
							value={zoom}
							onChange={handleZoomChange}
							disabled={isRendering}
							className='flex-1'
						/>
						<span className='min-w-[45px] text-sm'>{zoom.toFixed(2)}×</span>
					</label>
				</div>

				<Button
					onClick={handleZoomToFit}
					variant='outline'
					disabled={isRendering}
					size='md'
				>
					Reset Zoom
				</Button>
			</div>

			<div className='mb-4 text-sm opacity-70'>
				<div className='mb-4 text-sm opacity-70'>
					Output resolution: {width}×{height}px
				</div>
				<label className='mb-4 flex items-center gap-2 text-sm'>
					<input
						type='checkbox'
						checked={debugColors}
						onChange={(e) => setDebugColors(e.target.checked)}
						disabled={isRendering}
					/>
					Debug colors
				</label>
				<label className='mb-4 flex items-center gap-2 text-sm'>
					<input
						type='checkbox'
						checked={accurateMode}
						onChange={(e) => setAccurateMode(e.target.checked)}
						disabled={isRendering}
					/>
					Accurate mode (raycast top surface)
				</label>
				Output resolution: {width}×{height}px
			</div>

			{!previewDataUrl ? (
				<div
					onDragOver={(e) => e.preventDefault()}
					onDrop={onDrop}
					className='mb-4 rounded-lg border-2 border-dashed border-gray-500 bg-white/2 p-8 text-center transition-colors hover:border-gray-400 hover:bg-white/5'
				>
					<HiCube className='mx-auto mb-3 h-12 w-12 text-gray-400' />
					<div className='mb-3 text-base font-medium'>Drop STL file here</div>
					<div className='mb-4 text-sm text-gray-500'>or</div>
					<Button
						onClick={() => fileInputRef.current?.click()}
						disabled={isRendering}
						variant='outline'
						icon={<HiUpload className='h-3 w-3' />}
						size='md'
					>
						{isRendering ? 'Working…' : 'Choose File'}
					</Button>
					<input
						ref={fileInputRef}
						type='file'
						accept='.stl'
						onChange={onFileChange}
						className='hidden'
					/>
				</div>
			) : (
				<>
					<div className='mb-4 flex items-center justify-between gap-4'>
						<h2 className='text-lg font-semibold'>Depth Map Preview</h2>
						<div className='flex items-center gap-3'>
							<div
								onDragOver={(e) => e.preventDefault()}
								onDrop={onDrop}
								className='flex items-center gap-2'
							>
								<Button
									onClick={() => fileInputRef.current?.click()}
									disabled={isRendering}
									variant='outline'
									size='md'
									icon={<HiUpload className='h-3 w-3' />}
								>
									Change File
								</Button>
								<input
									ref={fileInputRef}
									type='file'
									accept='.stl'
									onChange={onFileChange}
									className='hidden'
								/>
							</div>
							<Button variant='outline' onClick={triggerDownload} size='md'>
								Download PNG
							</Button>
						</div>
					</div>
					{lastFileRef.current && (
						<InteractiveViewer
							buffer={lastFileRef.current.buffer}
							axis={axis}
							className='mb-3 w-full rounded border border-gray-700'
						/>
					)}
					<div className='mb-3 flex max-w-full items-center justify-center overflow-hidden rounded border border-gray-600 bg-black p-2'>
						<img
							src={previewDataUrl}
							alt='Depth map preview'
							className='block max-h-[70vh] max-w-full object-contain'
							style={{ imageRendering: 'pixelated' }}
						/>
					</div>
				</>
			)}
		</div>
	);
};
