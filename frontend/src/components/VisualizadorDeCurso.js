import React, { useState } from 'react';
import './CursoStyles.css';

// Dados "fake" apenas para testar o visual agora
const dadosDoCurso = {
  titulo: "Curso de Python para Iniciantes",
  modulos: [
    {
      titulo: "Módulo 1: Fundamentos",
      aulas: [
        { id: 1, titulo: "Instalando o Python", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
        { id: 2, titulo: "Variáveis e Tipos", url: "https://www.youtube.com/embed/M576WGiDBdQ" }
      ]
    },
    {
      titulo: "Módulo 2: Estruturas de Decisão",
      aulas: [
        { id: 3, titulo: "Condicionais If/Else", url: "https://www.youtube.com/embed/awV49WkG2o0" }
      ]
    }
  ]
};

export default function VisualizadorDeCurso() {
  const [aulaAtual, setAulaAtual] = useState(null);

  return (
    <div className="plataforma-container">
      {/* Barra Lateral */}
      <aside className="sidebar-modulos">
        <h2 className="titulo-curso">{dadosDoCurso.titulo}</h2>
        {dadosDoCurso.modulos.map((modulo, index) => (
          <div key={index} className="modulo-group">
            <details open={index === 0}>
              <summary className="modulo-titulo">{modulo.titulo}</summary>
              <ul className="lista-aulas">
                {modulo.aulas.map((aula) => (
                  <li 
                    key={aula.id} 
                    className={aulaAtual?.id === aula.id ? "ativa" : ""}
                    onClick={() => setAulaAtual(aula)}
                  >
                    ▶ {aula.titulo}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ))}
      </aside>

      {/* Área do Vídeo */}
      <main className="area-video">
        {aulaAtual ? (
          <div className="video-wrapper">
            <h1>{aulaAtual.titulo}</h1>
            <iframe 
              width="100%" 
              height="500px" 
              src={aulaAtual.url} 
              title={aulaAtual.titulo}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="bem-vindo">
            <h3>Selecione uma aula no menu ao lado para começar</h3>
          </div>
        )}
      </main>
    </div>
  );
}