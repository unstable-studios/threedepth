# ThreeDepth

A modern, browser-based utility for converting 3D models to depth maps, featuring real-time preview before export.

## What are Depth Maps?

Depth maps are grayscale images that encode distance information from a camera or viewpoint. Each pixel's brightness represents how far or close that part of a 3D scene is—white for nearest points, black for farthest. They're useful for:

- **Laser embossing & engraving**: Converting depth information to power/intensity levels for precise material removal or marking with varying depths
- **Game development**: Creating realistic lighting, shadows, and effects in real-time engines
- **Visual effects**: Parallax mapping, depth-based post-processing, and motion blur
- **3D-to-2D conversion**: Preserving 3D spatial information in 2D formats
- **Machine learning**: Training depth estimation models and 3D reconstruction algorithms
- **Stereoscopic content**: Generating stereo pairs and 3D displays
- **Photography effects**: Creating bokeh, focus effects, and depth-aware filters

ThreeDepth simplifies this process by letting you interactively preview, customize, and export depth maps from any 3D mesh model.

## Features

- **Multi-Format Model Import**: Support for GLTF, GLB, STL, and OBJ files
- **Interactive 3D Viewer**: Built with react-three-fiber for smooth, declarative 3D rendering
- **Smart Camera Controls**: Orbit, pan, and zoom with automatic camera reset and zoom-to-fit
- **Auto-Centering**: Imported models are automatically centered and fitted to viewport
- **Scalable depth-axis ranges**: Fine-tune the depth map by scaling the model or moving the min/max limits.
- **Configurable Output**: Choose resolution, DPI, and background color in preview window before export.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## Tech Stack

- **React 19** with TypeScript
- **react-three-fiber** for declarative 3D rendering using Three.js
- **@react-three/drei** for useful Three.js helpers
- **Tailwind CSS v4** for styling with dark mode support
- **React Router** for navigation
- **Vite** for fast builds and HMR
- **Cloudflare Workers** for deployment

## Architecture

- Modular model loaders for STL, GLTF, GLB, and OBJ formats
- Auto-centering utility calculates bounding boxes and applies transforms
- Custom z-scale and z-masking for fine-tuning depth map

## Roadmap

- [x] 3D interactive preview with orbit controls
- [x] Multi-format model import (GLTF, GLB, STL, OBJ)
- [x] Auto-centering and zoom-to-fit on import
- [x] Floating toolbar with portal-based architecture
- [x] Light/dark/system theme toggle
- [x] Default model for demo use
- [x] Export functionality (depth maps)
- [x] Export preview window
- [x] Custom background colors or transparency on depth map
- [ ] Custom masking (shape primitives, vectors)
