# ThreeDepth

A web-based tool for converting 3D models (STL files) into depth maps and heightmaps.

## Features

- **STL to Depth Map Conversion**: Upload STL files and generate grayscale heightmaps
- **Adjustable View Axis**: Choose which axis (X, Y, or Z) to use as the height dimension
- **Zoom Control**: Fine-tune the framing of your depth map with adjustable zoom
- **Invert Option**: Flip the grayscale values for different export needs
- **High-Resolution Output**: Generate 1024×1024px PNG depth maps

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Tech Stack

- **React 19** with TypeScript
- **Three.js** for 3D rendering
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite** for build tooling
- **Cloudflare Pages** for deployment

## Roadmap

- [ ] 3D interactive preview
- [ ] Optional bounding box in viewer
- [ ] Hide/show background (maybe custom color/transparent?)
- [ ] Spruce up colors and UI overall
- [ ] Separate header component with simple nav

## License

MIT
