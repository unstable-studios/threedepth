import { useEffect, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import clsx from 'clsx';
import {
	Box3,
	Vector3,
	OrthographicCamera,
	WebGLRenderTarget,
	Mesh,
	Object3D,
} from 'three';

interface DepthPreviewProps {
	invertDepth: boolean;
	depthMin: number; // 0-1 normalized depth range
	depthMax: number;
	zScale: number;
	canvasRef?: React.RefObject<HTMLCanvasElement>;
}

// Component that runs inside Canvas and has access to Three.js context
function DepthPreviewCanvas({ canvasRef }: DepthPreviewProps) {
	const renderTargetRef = useRef<WebGLRenderTarget | null>(null);
	const orthoRef = useRef<OrthographicCamera | null>(null);
	const pixelsRef = useRef<Uint8Array | null>(null);
	const boxRef = useRef<Box3 | null>(null);
	const sizeRef = useRef<Vector3 | null>(null);
	const centerRef = useRef<Vector3 | null>(null);
	const hiddenRef = useRef<Object3D[]>([]);

	useEffect(() => {
		return () => {
			if (renderTargetRef.current) {
				renderTargetRef.current.dispose();
				renderTargetRef.current = null;
			}
			orthoRef.current = null;
			pixelsRef.current = null;
			boxRef.current = null;
			sizeRef.current = null;
			centerRef.current = null;
			hiddenRef.current = [];
		};
	}, []);
	useFrame(({ scene, gl }) => {
		if (!canvasRef?.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		const renderSize = 256;

		// Lazy create render target
		if (!renderTargetRef.current) {
			renderTargetRef.current = new WebGLRenderTarget(renderSize, renderSize);
		}

		const renderTarget = renderTargetRef.current;

		// Lazy create reusable objects
		if (!boxRef.current) boxRef.current = new Box3();
		if (!sizeRef.current) sizeRef.current = new Vector3();
		if (!centerRef.current) centerRef.current = new Vector3();
		if (!pixelsRef.current)
			pixelsRef.current = new Uint8Array(renderSize * renderSize * 4);
		if (!orthoRef.current) {
			orthoRef.current = new OrthographicCamera(
				-128,
				128,
				128,
				-128,
				0.1,
				1000
			);
		}

		const box = boxRef.current;
		const size = sizeRef.current;
		const center = centerRef.current;
		const pixels = pixelsRef.current;
		const ortho = orthoRef.current;
		const hidden = hiddenRef.current;

		// Reset box but reuse object
		box.makeEmpty();
		scene.traverse((object) => {
			if (object instanceof Mesh && !object.userData?.isHelper) {
				box.expandByObject(object);
			}
		});

		if (box.isEmpty()) {
			// Clear canvas if no model
			ctx.fillStyle = '#000000';
			ctx.fillRect(0, 0, renderSize, renderSize);
			return;
		}

		box.getSize(size);
		box.getCenter(center);
		const maxDim = Math.max(size.x, size.y);

		// Update camera parameters instead of creating new one
		ortho.left = -maxDim / 2;
		ortho.right = maxDim / 2;
		ortho.top = maxDim / 2;
		ortho.bottom = -maxDim / 2;
		ortho.position.set(center.x, center.y, box.max.z + 10);
		ortho.lookAt(center.x, center.y, center.z);
		ortho.updateProjectionMatrix();

		// Clear hidden array and reuse
		hidden.length = 0;
		const originalBackground = scene.background;
		scene.background = null;
		scene.traverse((object) => {
			const isGizmo =
				object.name === 'GizmoHelper' || object.parent?.name === 'GizmoHelper';
			const isHelper =
				!!object.userData?.isHelper || object.type === 'GridHelper';
			if (isGizmo || isHelper) {
				if (object.visible) {
					hidden.push(object);
					object.visible = false;
				}
			}
		});

		// Render to offscreen target
		gl.setRenderTarget(renderTarget);
		gl.clear();
		gl.render(scene, ortho);
		gl.setRenderTarget(null);
		scene.background = originalBackground;

		// Restore helpers
		hidden.forEach((obj) => (obj.visible = true));

		// Read pixels
		gl.readRenderTargetPixels(
			renderTarget,
			0,
			0,
			renderSize,
			renderSize,
			pixels
		);

		// Reuse imageData context instead of creating new every frame
		// Get existing imageData from canvas context if available
		let imageData: ImageData;
		try {
			imageData = ctx.getImageData(0, 0, renderSize, renderSize);
		} catch {
			// Fallback if getImageData fails
			imageData = ctx.createImageData(renderSize, renderSize);
		}

		// Copy pixels
		for (let y = 0; y < renderSize; y++) {
			for (let x = 0; x < renderSize; x++) {
				const flippedY = renderSize - 1 - y;
				const srcIdx = (flippedY * renderSize + x) * 4;
				const dstIdx = (y * renderSize + x) * 4;
				imageData.data[dstIdx] = pixels[srcIdx];
				imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
				imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
				imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
			}
		}
		ctx.putImageData(imageData, 0, 0);
	});

	return null;
}

// UI component that renders outside Canvas
export function DepthPreviewUI({
	canvasRef,
}: {
	canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
	const setupCanvas = useCallback(
		(container: HTMLDivElement | null) => {
			if (!container) return;

			let canvas = canvasRef.current;
			if (!canvas) {
				canvas = document.createElement('canvas');
				canvas.width = 256;
				canvas.height = 256;
				canvas.className = 'h-full w-full';
				canvas.style.imageRendering = 'pixelated';
				canvas.style.display = 'block';
				(canvasRef as React.MutableRefObject<HTMLCanvasElement>).current =
					canvas;
				console.log('Created canvas for DepthPreviewUI');
			}

			if (canvas.parentElement !== container) {
				container.appendChild(canvas);
			}
		},
		[canvasRef]
	);

	return (
		<div
			className={clsx(
				'bg-glass text-primary dark:text-primary-dark dark:bg-glass-dark shadow-2xl backdrop-blur-xs',
				'pointer-events-none fixed top-4 right-4 z-50 overflow-hidden rounded-xl p-2 md:top-auto md:right-4 md:bottom-4 md:p-4',
				'text-sm font-semibold',
				'flex flex-col items-start justify-center gap-2 md:gap-4'
			)}
		>
			Preview
			<div className={clsx('rounded-lg')}>
				<div ref={setupCanvas} className='h-44 w-44 md:h-64 md:w-64' />
			</div>
		</div>
	);
}

// Component to be used inside Canvas
export function DepthPreviewRenderer({
	invertDepth,
	depthMin,
	depthMax,
	zScale,
	canvasRef,
}: DepthPreviewProps) {
	return (
		<DepthPreviewCanvas
			invertDepth={invertDepth}
			depthMin={depthMin}
			depthMax={depthMax}
			zScale={zScale}
			canvasRef={canvasRef}
		/>
	);
}
