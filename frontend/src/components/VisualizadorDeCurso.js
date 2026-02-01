import React, { useState, useEffect } from 'react'; // Adicionamos useEffect
import './CursoStyles.css';

export default function VisualizadorDeCurso() {
  // Estado para guardar o curso que vem do Banco de Dados
  const [curso, setCurso] = useState(null);
  
  // Estado para guardar qual aula está sendo assistida
  const [aulaAtual, setAulaAtual] = useState(null);

  // Estado para saber se está carregando
  const [carregando, setCarregando] = useState(true);

  // USE EFFECT: Executa isso assim que a tela abre
  useEffect(() => {
    // Busca o curso de ID 1 (pode mudar o ID depois)
    fetch('http://localhost:5000/api/curso/1')
      .then((resposta) => resposta.json()) // Transforma a resposta em JSON
      .then((dados) => {
        setCurso(dados); // Salva os dados no Estado
        setCarregando(false); // Avisa que terminou de carregar
      })
      .catch((erro) => {
        console.error("Erro ao buscar curso:", erro);
        setCarregando(false);
      });
  }, []); // O [] vazio garante que só rode uma vez

  // Se ainda estiver buscando os dados, mostra isso:
  if (carregando) {
    return <div className="area-video"><h2>Carregando curso...</h2></div>;
  }

  // Se deu erro ou não achou curso:
  if (!curso) {
    return <div className="area-video"><h2>Curso não encontrado.</h2></div>;
  }

  return (
    <div className="plataforma-container">
      {/* Barra Lateral Dinâmica */}
      <aside className="sidebar-modulos">
        <h2 className="titulo-curso">{curso.titulo}</h2>
        
        {/* Mapeia os módulos vindos do Banco de Dados */}
        {curso.modulos.map((modulo, index) => (
          <div key={modulo.id} className="modulo-group">
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

      {/* Área do Player */}
      <main className="area-video">
        {aulaAtual ? (
          <div className="video-wrapper">
            <h1>{aulaAtual.titulo}</h1>
            <iframe 
              width="100%" 
              height="500px" 
              // Atenção: O banco retorna 'video_url', não 'url'
              src={aulaAtual.video_url} 
              title={aulaAtual.titulo}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="bem-vindo">
            <h3>Selecione uma aula para começar</h3>
            <p>Curso: {curso.titulo}</p>
          </div>
        )}
      </main>
    </div>
  );
}