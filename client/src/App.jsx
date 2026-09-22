import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Welcome from './pages/Welcome';
import SoilPage from './pages/SoilPage';
import PlantDetail from './pages/PlantDetail';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/soil/:slug" element={<SoilPage />} />
          <Route path="/plant/:slug" element={<PlantDetail />} />
        </Routes>
      </main>
      <LoginModal />
    </AuthProvider>
  );
}
