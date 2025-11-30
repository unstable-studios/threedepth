import { StlToDepthMap } from './StlToDepthMap';

function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1>STL → Depth Map</h1>
      <StlToDepthMap width={1024} height={1024} />
    </main>
  );
}

export default App;