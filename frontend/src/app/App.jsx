import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Auth pages and protected routes will be added in Steps 5-6 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

