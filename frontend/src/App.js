import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VisualizadorDeCurso from './components/VisualizadorDeCurso';
import PainelProdutor from './components/PainelProdutor';
import GestaoCurso from './components/GestaoCurso'; // NOVO IMPORT
import PainelAdmin from './components/PainelAdmin'; // NOVO IMPORT
import Suporte from './components/Suporte'; // NOVO IMPORT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualizadorDeCurso />} />
        <Route path="/admin" element={<PainelProdutor />} />
        <Route path="/admin/curso/:id" element={<GestaoCurso />} />
        <Route path="/master" element={<PainelAdmin />} /> {/* AQUI! */}
        <Route path="/suporte" element={<Suporte />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;