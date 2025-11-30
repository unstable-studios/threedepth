// src/StlToDepthMap.tsx
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

type Props = {
  width?: number;
  height?: number;
  invert?: boolean;
};

export const StlToDepthMap: React.FC<Props> = ({
  width = 1024,
  height = 1024,
  invert = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>('Drop an STL to begin');

  const handleFile = async (file: File) => {
    setStatus('Reading file…');

    const buffer = await file.arrayBuffer();

    const loader = new STLLoader();
    const geometry = loader.parse(buffer as ArrayBuffer);

    // Ensure it’s BufferGeometry
    const geom = geometry as THREE.BufferGeometry;
    geom.computeBoundingBox();
    const bbox = geom.boundingBox!;
    const zMin = bbox.min.z;
    const zMax = bbox.max.z;

    if (zMax - zMin === 0) {
      setStatus('Model is flat in Z; heightmap will be blank.');
    }

    // Build vertex colors = normalized height
    const pos = geom.getAttribute('position') as THREE.BufferAttribute;
    const vertexCount = pos.count;
    const colors = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      const z = pos.getZ(i);
      let norm = (z - zMin) / (zMax - zMin || 1);
      norm = THREE.MathUtils.clamp(norm, 0, 1);
      if (invert) norm = 1 - norm;

      colors[i * 3 + 0] = norm;
      colors[i * 3 + 1] = norm;
      colors[i * 3 + 2] = norm;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Set up scene
    const scene = new THREE.Scene();
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);

    // Center the mesh in XY
    const cx = (bbox.min.x + bbox.max.x) / 2;
    const cy = (bbox.min.y + bbox.max.y) / 2;
    mesh.position.set(-cx, -cy, 0);

    // Use a square-ish top-down ortho camera
    const sizeX = bbox.max.x - bbox.min.x;
    const sizeY = bbox.max.y - bbox.min.y;
    const size = Math.max(sizeX, sizeY) || 1;

    const camera = new THREE.OrthographicCamera(
      -size / 2,
      size / 2,
      size / 2,
      -size / 2,
      0.1,
      1000,
    );

    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true, // required to call toDataURL
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);

    renderer.render(scene, camera);

    // Get PNG from canvas
    const canvas = renderer.domElement;
    const dataUrl = canvas.toDataURL('image/png');

    // Trigger download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${file.name.replace(/\.[^.]+$/, '')}-heightmap.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    renderer.dispose();
    geom.dispose();
    material.dispose();

    setStatus('Done – PNG downloaded.');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file).catch((err) => {
        console.error(err);
        setStatus('Error: ' + (err as Error).message);
      });
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      handleFile(file).catch((err) => {
        console.error(err);
        setStatus('Error: ' + (err as Error).message);
      });
    } else {
      setStatus('Please drop a single .stl file');
    }
  };

  return (
    <div className="stl-depth-tool" style={{ padding: '1rem', maxWidth: 600 }}>
      <p>{status}</p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{
          border: '2px dashed #888',
          padding: '2rem',
          borderRadius: 8,
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Drop STL file here
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: '0.5rem' }}
      >
        Choose STL file…
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        Output resolution: {width}×{height} (8-bit grayscale via WebGL).
      </p>
    </div>
  );
};