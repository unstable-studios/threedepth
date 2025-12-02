import * as THREE from 'three';

// Custom shader material that renders depth based on Z position
// regardless of camera position/orientation
export class OrthographicDepthMaterial extends THREE.ShaderMaterial {
	constructor() {
		super({
			vertexShader: `
				varying float vDepth;
				
				void main() {
					vec4 worldPosition = modelMatrix * vec4(position, 1.0);
					vDepth = worldPosition.z;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				varying float vDepth;
				uniform float minZ;
				uniform float maxZ;
				
				void main() {
					// Normalize depth from minZ to maxZ to 0-1 range
					float normalizedDepth = (vDepth - minZ) / (maxZ - minZ);
					// Clamp to 0-1
					normalizedDepth = clamp(normalizedDepth, 0.0, 1.0);
					// Output as grayscale (0 = black/bottom, 1 = white/top)
					gl_FragColor = vec4(vec3(normalizedDepth), 1.0);
				}
			`,
			uniforms: {
				minZ: { value: 0.0 },
				maxZ: { value: 20.0 },
			},
		});
	}

	setDepthRange(minZ: number, maxZ: number) {
		this.uniforms.minZ.value = minZ;
		this.uniforms.maxZ.value = maxZ;
	}
}
