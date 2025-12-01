import { StlToDepthMap } from './StlToDepthMap';

function App() {
  return (
    <>
    <header className="bg-gray-800 text-white p-4 mb-4">
      <h1 className="text-2xl font-bold text-center">ThreeDepth</h1>
    </header>
    <main className="max-w-5xl mx-auto p-4">
      <StlToDepthMap width={1024} height={1024} />
    </main>
    </>
  );
}

export default App;