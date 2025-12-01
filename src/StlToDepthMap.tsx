import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

type AxisChoice = 'Z' | 'Y' | 'X';

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
  const lastFileRef = useRef<{ name: string; buffer: ArrayBuffer } | null>(null);

  const [status, setStatus] = useState<string>('Drop an STL to begin');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [axis, setAxis] = useState<AxisChoice>('Z');
  const [invert, setInvert] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1); // 1 = zoom-to-fit baseline

  // Re-render when axis, invert, or zoom changes (after state updates complete)
  useEffect(() => {
    const last = lastFileRef.current;
    if (last && !isRendering) {
      renderFromBuffer(last.buffer, last.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis, invert, zoom]);

  // reorient geometry so that chosen axis becomes "height"
  const orientGeometry = (geometry: THREE.BufferGeometry, axis: AxisChoice) => {
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
    const count = pos.count;

    const newPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      let nx: number, ny: number, nz: number;

      switch (axis) {
        case 'Z':
          nx = x;
          ny = y;
          nz = z;
          break;
        case 'Y':
          // Y is height, project onto X–Z
          nx = x;
          ny = z;
          nz = y;
          break;
        case 'X':
          // X is height, project onto Y–Z
          nx = y;
          ny = z;
          nz = x;
          break;
        default:
          nx = x;
          ny = y;
          nz = z;
      }

      newPositions[i * 3 + 0] = nx;
      newPositions[i * 3 + 1] = ny;
      newPositions[i * 3 + 2] = nz;
    }

    const newGeom = new THREE.BufferGeometry();
    newGeom.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));

    if (geometry.getIndex()) {
      newGeom.setIndex(geometry.getIndex()!.clone());
    }

    return newGeom;
  };

  // core render function – re-used for axis/invert/zoom changes
  const renderFromBuffer = async (buffer: ArrayBuffer, fileName: string) => {
    try {
      setIsRendering(true);
      setStatus(
        `Processing ${fileName} (axis ${axis} as height, zoom ${zoom.toFixed(2)}×)…`,
      );
      setPreviewDataUrl(null);
      setCurrentFileName(fileName);

      const loader = new STLLoader();
      const rawGeometry = loader.parse(buffer as ArrayBuffer);

      const baseGeom = rawGeometry as THREE.BufferGeometry;
      const geom = orientGeometry(baseGeom, axis);

      geom.computeBoundingBox();
      const bbox = geom.boundingBox!;
      const zMin = bbox.min.z;
      const zMax = bbox.max.z;

      if (zMax - zMin === 0) {
        setStatus('Model is flat along that axis; heightmap will be uniform.');
      } else {
        setStatus('Computing vertex heights…');
      }

      const pos = geom.getAttribute('position') as THREE.BufferAttribute;
      const vertexCount = pos.count;
      const colors = new Float32Array(vertexCount * 3);

      const span = zMax - zMin || 1;

      for (let i = 0; i < vertexCount; i++) {
        const vz = pos.getZ(i);
        let norm = (vz - zMin) / span;
        norm = THREE.MathUtils.clamp(norm, 0, 1);
        if (invert) norm = 1 - norm;

        colors[i * 3 + 0] = norm;
        colors[i * 3 + 1] = norm;
        colors[i * 3 + 2] = norm;
      }

      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const scene = new THREE.Scene();
      const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geom, material);
      scene.add(mesh);

      // center mesh in XY
      const cx = (bbox.min.x + bbox.max.x) / 2;
      const cy = (bbox.min.y + bbox.max.y) / 2;
      mesh.position.set(-cx, -cy, 0);

      // orthographic camera: compute base size and apply zoom
      const sizeX = bbox.max.x - bbox.min.x;
      const sizeY = bbox.max.y - bbox.min.y;
      const baseSize = Math.max(sizeX, sizeY) || 1;

      // zoom > 1 means closer (smaller view window)
      const viewSize = baseSize / (zoom || 1);

      const camera = new THREE.OrthographicCamera(
        -viewSize / 2,
        viewSize / 2,
        viewSize / 2,
        -viewSize / 2,
        0.1,
        1000,
      );
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 1);

      setStatus('Rendering heightmap…');
      renderer.render(scene, camera);

      const canvas = renderer.domElement;
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewDataUrl(dataUrl);

      renderer.dispose();
      geom.dispose();
      material.dispose();

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
    <div
      className="stl-depth-tool"
      style={{ padding: '1rem' }}
    >
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        STL → Depth Map
      </h1>

      <p style={{ marginBottom: '0.75rem', minHeight: '1.5em' }}>{status}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
          alignItems: 'center',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Height axis:{' '}
          <select
            value={axis}
            onChange={handleAxisChange}
            disabled={isRendering}
            style={{ flex: 1 }}
          >
            <option value="Z">Z (up)</option>
            <option value="Y">Y (up)</option>
            <option value="X">X (up)</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={invert}
            onChange={handleInvertChange}
            disabled={isRendering}
          />{' '}
          Invert grayscale
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
            Zoom:
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={zoom}
              onChange={handleZoomChange}
              disabled={isRendering}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.85rem', minWidth: 45 }}>
              {zoom.toFixed(2)}×
            </span>
          </label>
        </div>

        <button type="button" onClick={handleZoomToFit} disabled={isRendering}>
          Reset Zoom
        </button>
      </div>

      <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>
        Output resolution: {width}×{height}px
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{
          border: '2px dashed #888',
          padding: '2rem',
          borderRadius: 8,
          textAlign: 'center',
          marginBottom: '1rem',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ marginBottom: '0.5rem' }}>Drop STL file here</div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRendering}
        >
          {isRendering ? 'Working…' : 'Choose STL file…'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {previewDataUrl && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Depth Map Preview
          </h2>
          <div
            style={{
              border: '1px solid #444',
              padding: '0.5rem',
              borderRadius: 4,
              marginBottom: '0.75rem',
              background: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <img
              src={previewDataUrl}
              alt="Depth map preview"
              style={{
                display: 'block',
                maxWidth: '100%',
                objectFit: 'contain',
                imageRendering: 'pixelated',
              }}
            />
          </div>
          <button type="button" onClick={triggerDownload}>
            Download PNG
          </button>
        </>
      )}
    </div>
  );
};