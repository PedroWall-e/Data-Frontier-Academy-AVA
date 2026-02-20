import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VisualizadorDeCurso from './components/VisualizadorDeCurso';
import PainelProdutor from './components/PainelProdutor';
import GestaoCurso from './components/GestaoCurso'; // NOVO IMPORT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualizadorDeCurso />} />
        <Route path="/admin" element={<PainelProdutor />} />
        
        {/* NOVA ROTA DINÂMICA: Aceita IDs diferentes (ex: /admin/curso/1, /admin/curso/5) */}
        <Route path="/admin/curso/:id" element={<GestaoCurso />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;