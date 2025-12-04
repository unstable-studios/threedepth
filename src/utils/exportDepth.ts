import * as THREE from 'three';

export function exportDepthPNG(
  scene: THREE.Scene,
  gl: THREE.WebGLRenderer,
  depthMin: number = 0,
  depthMax: number = 1
) {
  // Calculate model bounds (exclude helpers)
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
  const renderSize = 1024; // Fixed square output size

  // Configure a temporary orthographic camera
  const ortho = new THREE.OrthographicCamera(-maxDim / 2, maxDim / 2, maxDim / 2, -maxDim / 2, 0.1, 1000);
  ortho.position.set(center.x, center.y, box.max.z + 10);
  ortho.lookAt(center.x, center.y, center.z);
  ortho.updateProjectionMatrix();

  // Create offscreen render target
  const renderTarget = new THREE.WebGLRenderTarget(renderSize, renderSize);

  // Hide helpers and set transparent background
  const hidden: THREE.Object3D[] = [];
  const originalBackground = scene.background;
  scene.background = null;
  scene.traverse((object) => {
    const isGizmo = object.name === 'GizmoHelper' || object.parent?.name === 'GizmoHelper';
    const isHelper = !!object.userData?.isHelper || object.type === 'GridHelper';
    if (isGizmo || isHelper) {
      if (object.visible) {
        hidden.push(object);
        object.visible = false;
      }
    }
  });

  // Render to offscreen
  gl.setRenderTarget(renderTarget);
  gl.render(scene, ortho);
  gl.setRenderTarget(null);
  scene.background = originalBackground;

  // Restore hidden helpers
  hidden.forEach((obj) => (obj.visible = true));

  // Read pixels
  const pixels = new Uint8Array(renderSize * renderSize * 4);
  gl.readRenderTargetPixels(renderTarget, 0, 0, renderSize, renderSize, pixels);

  // Build PNG via canvas
  const canvas = document.createElement('canvas');
  canvas.width = renderSize;
  canvas.height = renderSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    renderTarget.dispose();
    return;
  }
  const imageData = ctx.createImageData(renderSize, renderSize);
  for (let y = 0; y < renderSize; y++) {
    for (let x = 0; x < renderSize; x++) {
      const flippedY = renderSize - 1 - y;
      const srcIdx = (flippedY * renderSize + x) * 4;
      const dstIdx = (y * renderSize + x) * 4;
      
      // Get original depth value (assuming grayscale)
      const depthValue = pixels[srcIdx] / 255; // Normalize to 0-1
      
      // Remap depth based on custom range
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

  canvas.toBlob((blob) => {
    if (!blob) {
      renderTarget.dispose();
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `depth-map-${Date.now()}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    renderTarget.dispose();
  });
}
