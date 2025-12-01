import { Routes, Route } from 'react-router';
import { StlToDepthMap } from './StlToDepthMap';

function App() {
	return (
		<>
			<header className='mb-4 bg-gray-800 p-4 text-white'>
				<h1 className='text-center text-2xl font-bold'>ThreeDepth</h1>
			</header>
			<main className='mx-auto max-w-5xl p-4'>
				<Routes>
					<Route
						path='/'
						element={<StlToDepthMap width={1024} height={1024} />}
					/>
				</Routes>
			</main>
		</>
	);
}

export default App;
