export type AxisChoice = 'Z' | 'Y' | 'X';

export interface ColorResult {
	r: number;
	g: number;
	b: number;
}

export interface DebugColorOptions {
	debugColors: boolean;
	invert: boolean;
}

export interface HeightmapOptions extends DebugColorOptions {
	zoom: number;
}
