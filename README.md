# ThreeDepth

A modern 3D model viewer with depth map exporting built with React and Three.js, featuring real-time model import.

## Features

- **Multi-Format Model Import**: Support for GLTF, GLB, STL, and OBJ files
- **Interactive 3D Viewer**: Built with react-three-fiber for smooth, declarative 3D rendering
- **Smart Camera Controls**: Orbit, pan, and zoom with automatic camera reset and zoom-to-fit
- **Auto-Centering**: Imported models are automatically centered and fitted to viewport
- **Floating Toolbar**: Glass-morphic toolbar with model import, camera reset, and export controls
- **Adaptive Theme System**: Tri-state theme toggle (light/dark/system) with instant switching
- **Axes Gizmo**: Visual orientation helper in bottom-right corner

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
- **Cloudflare Pages** for deployment

## Architecture

### Theme System

- `useDarkMode` hook manages theme state with localStorage persistence
- Early inline script in `index.html` prevents flash of unstyled content
- Custom event broadcasting syncs theme across components without context
- Supports light, dark, and system preference modes

### UI Components

- Portal-based toolbar injection via `Toolbar` component
- Floating glass-morphic header with backdrop blur

### 3D Rendering

- Modular model loaders for STL, GLTF, GLB, and OBJ formats
- Auto-centering utility calculates bounding boxes and applies transforms
- Camera controller exposes reset function for zoom-to-fit from orthogonal angle

## Roadmap

- [x] 3D interactive preview with orbit controls
- [x] Multi-format model import (GLTF, GLB, STL, OBJ)
- [x] Auto-centering and zoom-to-fit on import
- [x] Floating toolbar with portal-based architecture
- [x] Light/dark/system theme toggle
- [ ] Default model for demo use
- [ ] Export functionality (depth maps)
- [ ] Camera presets (top, front, side views)
- [ ] Export preview window
- [ ] Custom background colors or transparency on depth map
- [ ] Custom masking (shape primitives, vectors)
- [ ] Material/textures as part of theme

## License

MIT
