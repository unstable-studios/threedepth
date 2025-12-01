import type { ColorResult } from './types';

/**
 * Apply debug color tints to a normalized height value.
 * Adds subtle color hints for debugging depth issues:
 * - Blue tint for values near minimum
 * - Red tint for values near maximum
 * - Magenta for values above max (before clamping)
 * - Cyan for values below min (before clamping)
 * 
 * @param norm - Normalized value [0, 1] after clamping
 * @param rawNorm - Raw normalized value before clamping (may be outside [0,1])
 * @param eps - Epsilon threshold for near-equality checks
 * @param debugColors - Whether debug colors are enabled
 * @param invert - Whether the heightmap is inverted
 * @returns RGB color values [0, 1]
 */
export function applyDebugColors(
	norm: number,
	rawNorm: number,
	eps: number,
	debugColors: boolean,
	invert: boolean
): ColorResult {
	let r = norm,
		g = norm,
		b = norm;

	if (!debugColors) return { r, g, b };

	const below = rawNorm < 0 - eps;
	const above = rawNorm > 1 + eps;

	// Endpoint hints (near zMin/zMax)
	if (!invert) {
		if (Math.abs(norm - 0) < eps) b = Math.min(1, b + 0.15);
		else if (Math.abs(norm - 1) < eps) r = Math.min(1, r + 0.15);
	} else {
		if (Math.abs(norm - 0) < eps) r = Math.min(1, r + 0.15);
		else if (Math.abs(norm - 1) < eps) b = Math.min(1, b + 0.15);
	}

	// Out-of-range hints
	if (above) {
		r = Math.min(1, r + 0.2);
		b = Math.min(1, b + 0.2);
	} else if (below) {
		g = Math.min(1, g + 0.2);
		b = Math.min(1, b + 0.2);
	}

	return { r, g, b };
}
