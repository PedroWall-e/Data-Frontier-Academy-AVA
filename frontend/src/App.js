import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './components/LandingPage'; // NOVO
import Registro from './components/Registro';       // NOVO
import Login from './components/Login'; 
import VisualizadorDeCurso from './components/VisualizadorDeCurso';
import PainelProdutor from './components/PainelProdutor';
import GestaoCurso from './components/GestaoCurso';
import PainelAdmin from './components/PainelAdmin';
import Suporte from './components/Suporte';

const RotaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTAS PÚBLICAS */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        
        {/* ROTAS PROTEGIDAS (Exigem Login) */}
        <Route path="/painel" element={<RotaProtegida><VisualizadorDeCurso /></RotaProtegida>} />
        <Route path="/admin" element={<RotaProtegida><PainelProdutor /></RotaProtegida>} />
        <Route path="/admin/curso/:id" element={<RotaProtegida><GestaoCurso /></RotaProtegida>} />
        <Route path="/master" element={<RotaProtegida><PainelAdmin /></RotaProtegida>} />
        <Route path="/suporte" element={<RotaProtegida><Suporte /></RotaProtegida>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;