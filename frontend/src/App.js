import React, { useContext } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';

import LandingPage from './components/LandingPage';
import Registro from './components/Registro';
import Login from './components/Login';
import VisualizadorDeCurso from './components/VisualizadorDeCurso';
import Checkout from './components/Checkout';
import Certificado from './components/Certificado';
import PainelProdutor from './components/PainelProdutor';
import GestaoCurso from './components/GestaoCurso';
import PainelAdmin from './components/PainelAdmin';
import Suporte from './components/Suporte';
import PerfilProdutor from './components/PerfilProdutor';
import PaginaCurso from './components/PaginaCurso';
import PaginaAutor from './components/PaginaAutor';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3347FF', // frontier-blue
      light: '#6675FF',
    },
    secondary: {
      main: '#2B2B2B', // frontier-dark
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9F8F6', // frontier-lightbg
      paper: '#ffffff',
    },
    text: {
      primary: '#2B2B2B', // frontier-dark
      secondary: '#6b7280',
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px' },
    h2: { fontWeight: 700, letterSpacing: '-0.5px' },
    h3: { fontWeight: 800, letterSpacing: '-0.5px' },
    h5: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.3px' }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '50px', padding: '12px 28px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }
      }
    }
  },
});

const RotaProtegida = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.papel)) {
    const roteamentos = {
      'admin': '/master',
      'produtor': '/admin',
      'suporte': '/suporte',
      'aluno': '/painel'
    };
    return <Navigate to={roteamentos[user.papel] || '/painel'} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme} >
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/checkout/:cursoId" element={<Checkout />} />
            <Route path="/curso/:id" element={<PaginaCurso />} />
            <Route path="/autor/:id" element={<PaginaAutor />} />
            <Route path="/certificado/:cursoId" element={<Certificado />} />

            <Route path="/painel" element={
              <RotaProtegida roles={['aluno', 'produtor', 'admin']}>
                <VisualizadorDeCurso />
              </RotaProtegida>
            } />

            <Route path="/admin" element={
              <RotaProtegida roles={['produtor', 'admin']}>
                <PainelProdutor />
              </RotaProtegida>
            } />
            <Route path="/perfil" element={
              <RotaProtegida roles={['produtor', 'admin']}>
                <PerfilProdutor />
              </RotaProtegida>
            } />
            <Route path="/admin/curso/:id" element={
              <RotaProtegida roles={['produtor', 'admin']}>
                <GestaoCurso />
              </RotaProtegida>
            } />

            <Route path="/master" element={
              <RotaProtegida roles={['admin']}>
                <PainelAdmin />
              </RotaProtegida>
            } />

            <Route path="/suporte" element={
              <RotaProtegida roles={['aluno', 'produtor', 'admin', 'suporte']}>
                <Suporte />
              </RotaProtegida>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider >
  );
}

export default App;