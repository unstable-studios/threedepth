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
	canvasRef?: React.RefObject<HTMLCanvasElement>;
}

// Component that runs inside Canvas and has access to Three.js context
function DepthPreviewCanvas({
	invertDepth,
	depthMin,
	depthMax,
	canvasRef,
}: DepthPreviewProps) {
	const renderTargetRef = useRef<WebGLRenderTarget | null>(null);

	useEffect(() => {
		return () => {
			if (renderTargetRef.current) {
				renderTargetRef.current.dispose();
				renderTargetRef.current = null;
			}
		};
	}, []);
	useFrame(({ scene, gl }) => {
		if (!canvasRef?.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const renderSize = 256;

		// Lazy create render target
		if (!renderTargetRef.current) {
			renderTargetRef.current = new WebGLRenderTarget(renderSize, renderSize);
		}

		const renderTarget = renderTargetRef.current;

		// Calculate model bounds
		const box = new Box3();
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

		const size = box.getSize(new Vector3());
		const center = box.getCenter(new Vector3());
		const maxDim = Math.max(size.x, size.y);

		// Configure orthographic camera for depth view
		const ortho = new OrthographicCamera(
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

		// Hide helpers
		const hidden: Object3D[] = [];
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
		const pixels = new Uint8Array(renderSize * renderSize * 4);
		gl.readRenderTargetPixels(
			renderTarget,
			0,
			0,
			renderSize,
			renderSize,
			pixels
		);

		// Update canvas with depth range remapping
		const imageData = ctx.createImageData(renderSize, renderSize);
		for (let y = 0; y < renderSize; y++) {
			for (let x = 0; x < renderSize; x++) {
				const flippedY = renderSize - 1 - y;
				const srcIdx = (flippedY * renderSize + x) * 4;
				const dstIdx = (y * renderSize + x) * 4;

				// Get original depth value (assuming grayscale, all RGB channels are same)
				const depthValue = pixels[srcIdx] / 255; // Normalize to 0-1

				// Remap depth based on custom range
				// depthMin = 0, depthMax = 1 means full range (no change)
				// If depth is outside range, clamp to black/white
				let remappedDepth: number;
				if (depthValue < depthMin) {
					remappedDepth = 0; // Below min = black
				} else if (depthValue > depthMax) {
					remappedDepth = 1; // Above max = white
				} else {
					// Remap to 0-1 range
					remappedDepth = (depthValue - depthMin) / (depthMax - depthMin);
				}

				const finalValue = Math.round(remappedDepth * 255);
				imageData.data[dstIdx] = finalValue;
				imageData.data[dstIdx + 1] = finalValue;
				imageData.data[dstIdx + 2] = finalValue;
				imageData.data[dstIdx + 3] = pixels[srcIdx + 3]; // Preserve alpha
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
	useEffect(() => {
		if (!canvasRef.current) {
			const canvas = document.createElement('canvas');
			canvas.width = 256;
			canvas.height = 256;
			canvas.className = 'h-full w-full';
			canvas.style.imageRendering = 'pixelated';
			canvas.style.display = 'block';
			(canvasRef as React.MutableRefObject<HTMLCanvasElement>).current = canvas;
		}
	}, [canvasRef]);

	const setupCanvas = useCallback(
		(container: HTMLDivElement | null) => {
			if (!container || !canvasRef.current) return;

			const canvas = canvasRef.current;
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
			<div className={clsx('rounded-lg bg-black')}>
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
	canvasRef,
}: DepthPreviewProps) {
	return (
		<DepthPreviewCanvas
			invertDepth={invertDepth}
			depthMin={depthMin}
			depthMax={depthMax}
			canvasRef={canvasRef}
		/>
	);
}
