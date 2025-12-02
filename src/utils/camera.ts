import * as THREE from 'three';

export function computeSceneBoundingBox(scene: THREE.Scene): THREE.Box3 {
  const box = new THREE.Box3();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Group) {
      box.expandByObject(object);
    }
  });
  return box;
}

export function computeCameraReset(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  fitPadding = 1.1
): { position: THREE.Vector3; target: THREE.Vector3 } {
  // Zoom-to-fit from +Z, looking straight at the object
  if (box.isEmpty()) {
    const distance = 5;
    return {
      position: new THREE.Vector3(0, 0, distance),
      target: new THREE.Vector3(0, 0, 0),
    };
  }

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Vertical FOV and horizontal FOV using aspect
  const vFov = camera.fov * (Math.PI / 180);
  const aspect = camera.aspect || 1;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

  // Required distance to fit width and height
  const distX = (size.x * fitPadding) / (2 * Math.tan(hFov / 2));
  const distY = (size.y * fitPadding) / (2 * Math.tan(vFov / 2));
  const distance = Math.max(distX, distY);

  const position = new THREE.Vector3(center.x, center.y, center.z + distance);
  const target = center.clone();
  return { position, target };
}
