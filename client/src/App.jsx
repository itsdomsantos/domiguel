import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import DesktopExperience from './desktop/DesktopExperience.jsx';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import Work from './pages/Work.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname === '/login';
  // Em ecrã grande, a página inicial é o portátil → desktop (ecrã inteiro, sem navbar nem footer).
  // No telemóvel mantém-se a home clássica.
  const isSmallScreen = useMediaQuery('(max-width: 760px)');
  const isDesktop = location.pathname === '/' && !isSmallScreen;
  const bare = isAdmin || isDesktop;

  return (
    // .site aplica o tema das páginas públicas (não se aplica à administração nem ao desktop)
    <div className={bare ? undefined : 'site'}>
      {!bare && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={isSmallScreen ? <Home /> : <DesktopExperience />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/trabalho" element={<Work />} />
          <Route path="/projeto/:slug" element={<ProjectDetail />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!bare && <Footer />}
    </div>
  );
}
