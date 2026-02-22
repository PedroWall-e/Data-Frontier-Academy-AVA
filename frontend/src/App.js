import React, { useContext } from 'react';
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/checkout/:cursoId" element={<Checkout />} />
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
  );
}

export default App;