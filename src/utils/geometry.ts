import * as THREE from 'three';

export function normalizeObject(
  original: THREE.Object3D,
  targetSize = 20
): THREE.Object3D {
  const object = original.clone(true);
  return normalizeObjectInPlace(object, targetSize);
}

export function normalizeObjectInPlace(
  object: THREE.Object3D,
  targetSize = 20
): THREE.Object3D {
  // Compute initial bounding box
  const initialBox = new THREE.Box3().setFromObject(object);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const initialMaxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);

  // Normalize scale to fit target cube (uniform scale)
  if (initialMaxDim > 0 && isFinite(initialMaxDim)) {
    const scaleFactor = targetSize / initialMaxDim;
    object.scale.multiplyScalar(scaleFactor);
  }

  // Recompute bounding box after scaling
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const min = box.min.clone();

  // Center X and Y to origin, place Z-min at z=0
  const translation = new THREE.Vector3(center.x, center.y, min.z);
  object.position.sub(translation);

  return object;
}
