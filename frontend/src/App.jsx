// src/App.jsx

import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Spinner,
} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import api from './api';
import WelcomePage from './pages/WelcomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UkmList from './pages/UkmList';
import UkmEdit from './pages/UkmEdit';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ====================================================================
// FUNGSI NOTIFIKASI KUSTOM (TERPUSAT)
// ====================================================================

const showSuccessToast = (message) => {
  toast.success(
    <div>
      <strong>🎉 Sukses!</strong>
      <div>{message}</div>
    </div>,
    { theme: 'colored' }
  );
};

const showErrorToast = (message) => {
  toast.error(
    <div>
      <strong>❌ Gagal!</strong>
      <div>{message}</div>
    </div>,
    { theme: 'colored' }
  );
};

const showInfoToast = (message) => {
  toast.info(
    <div>
      <strong>ℹ️ Info</strong>
      <div>{message}</div>
    </div>,
    { theme: 'colored' }
  );
};

// ====================================================================
// KOMPONEN UTAMA APLIKASI
// ====================================================================

function App() {
  // ▼▼▼ KODE DIAGNOSTIK DITAMBAHKAN DI SINI ▼▼▼
  // Baris ini akan mencetak nilai VITE_API_URL ke konsol browser
  // untuk memastikan variabelnya terbaca dengan benar di Vercel.
  console.log("HASIL TES VARIABEL API_URL:", import.meta.env.VITE_API_URL);
  // ▲▲▲ AKHIR DARI KODE DIAGNOSTIK ▲▲▲

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/api/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Token tidak valid, harap login ulang.', error);
        }
      }
      setLoading(false);
    };
    checkLoggedInUser();
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    showInfoToast('Anda telah logout. Sampai jumpa lagi!');
    navigate('/login');
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <Container className="d-flex vh-100 align-items-center justify-content-center">
          <Spinner animation="border" />
        </Container>
      );
    }
    return user ? children : <Navigate to="/login" replace />;
  };

  const AdminRoute = ({ children }) => {
    if (loading) {
      return (
        <Container className="d-flex vh-100 align-items-center justify-content-center">
          <Spinner animation="border" />
        </Container>
      );
    }
    return user && user.role === 'admin' ? children : <Navigate to="/profile" replace />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />

      <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
        <Container fluid>
          <Navbar.Brand
            as={Link}
            to={user ? (user.role === 'admin' ? '/dashboard' : '/profile') : '/'}
          >
            SI-IMKM RIAU
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : user ? (
                <NavDropdown title={`Halo, ${user.name}`} id="basic-nav-dropdown">
                  {user.role === 'admin' && (
                    <NavDropdown.Item as={Link} to="/dashboard">
                      Dashboard Admin
                    </NavDropdown.Item>
                  )}
                  {user.role !== 'admin' && (
                    <NavDropdown.Item as={Link} to="/profile">
                      Profil Saya
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register">
                    Daftar
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/register" element={<RegisterPage showSuccessToast={showSuccessToast} showErrorToast={showErrorToast} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} showSuccessToast={showSuccessToast} showErrorToast={showErrorToast} />} />
          
          {/* --- Rute Lupa & Reset Password --- */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Rute Terproteksi */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><UkmEdit /></ProtectedRoute>} />
          <Route path="/dashboard" element={<AdminRoute><UkmList /></AdminRoute>} />
        </Routes>
      </main>

      <footer className="bg-dark text-white text-center p-3 mt-auto">
        <p className="mb-0">&copy; {new Date().getFullYear()} Dinas Terkait</p>
      </footer>
    </div>
  );
}

// Bungkus dengan BrowserRouter agar useNavigate bisa digunakan
function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
