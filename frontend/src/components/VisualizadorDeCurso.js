import React, { useState, useEffect } from 'react';
import './CursoStyles.css';

export default function VisualizadorDeCurso() {
  const [token] = useState(localStorage.getItem('token'));
  
  // Vitrine (Quais cursos o aluno comprou?)
  const [meusCursos, setMeusCursos] = useState([]);
  const [carregandoVitrine, setCarregandoVitrine] = useState(true);

  // Sala de Aula (O curso que ele clicou para assistir)
  const [cursoAtivo, setCursoAtivo] = useState(null);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [carregandoAula, setCarregandoAula] = useState(false);

  const fazerLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  // 1. Assim que a tela abre, busca os cursos comprados
  useEffect(() => {
    fetch('http://localhost:5000/api/aluno/meus-cursos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(dados => {
        setMeusCursos(dados);
        setCarregandoVitrine(false);
      });
  }, [token]);

  // 2. Função quando o aluno clica na vitrine para entrar na Sala de Aula
  const entrarNaSala = (cursoId) => {
    setCarregandoAula(true);
    fetch(`http://localhost:5000/api/curso/${cursoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(dados => {
        setCursoAtivo(dados);
        setAulaAtual(null); // Reseta o vídeo ao trocar de curso
        setCarregandoAula(false);
      });
  };

  const alternarConclusaoAula = async () => {
    if (!aulaAtual) return;
    const novoStatus = !aulaAtual.concluida;
    try {
      await fetch('http://localhost:5000/api/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ aula_id: aulaAtual.id, concluida: novoStatus })
      });
      setAulaAtual({ ...aulaAtual, concluida: novoStatus });
      
      const cursoAtualizado = { ...cursoAtivo };
      cursoAtualizado.modulos.forEach(mod => {
        mod.aulas.forEach(aula => { if(aula.id === aulaAtual.id) aula.concluida = novoStatus; });
      });
      setCursoAtivo(cursoAtualizado);
    } catch (erro) { alert("Erro ao salvar progresso."); }
  };

  if (carregandoVitrine) return <div style={{textAlign: 'center', marginTop: '50px'}}><h2>A carregar a sua área de estudos...</h2></div>;

  // TELA 1: A VITRINE DE CURSOS
  if (!cursoAtivo) {
      return (
          <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', background: '#f4f4f4', minHeight: '100vh' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                  <h2>Meus Cursos Adquiridos</h2>
                  <button onClick={fazerLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
              </div>
              
              {meusCursos.length === 0 ? (
                  <div style={{ background: 'white', padding: '30px', textAlign: 'center', borderRadius: '8px' }}>
                      <h3>Você ainda não possui cursos.</h3>
                      <p>Adquira um curso ou peça à administração para lhe dar acesso.</p>
                  </div>
              ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                      {meusCursos.map(c => (
                          <div key={c.id} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => entrarNaSala(c.id)}>
                              <div style={{ height: '150px', background: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                                  {c.titulo.charAt(0)}
                              </div>
                              <div style={{ padding: '20px' }}>
                                  <h3 style={{ margin: '0 0 10px 0' }}>{c.titulo}</h3>
                                  <button style={{ width: '100%', background: '#2ecc71', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Assistir Agora</button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  // TELA 2: A SALA DE AULA (Vídeos)
  if (carregandoAula) return <div className="area-video"><h2>A carregar sala de aula...</h2></div>;

  let totalAulas = 0; let aulasConcluidas = 0;
  cursoAtivo.modulos.forEach(mod => {
    totalAulas += mod.aulas.length;
    aulasConcluidas += mod.aulas.filter(aula => aula.concluida).length;
  });
  const percentagem = totalAulas === 0 ? 0 : Math.round((aulasConcluidas / totalAulas) * 100);

  return (
    <div className="plataforma-container">
      <aside className="sidebar-modulos">
        <div style={{ padding: '10px', background: '#222', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setCursoAtivo(null)} style={{ background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer', fontSize: '10px', padding: '5px' }}>← Voltar à Vitrine</button>
            <div>
              <a href="/suporte" style={{ color: '#00cc66', textDecoration: 'none', marginRight: '10px', fontSize: '12px' }}>Suporte</a>
              <button onClick={fazerLogout} style={{ background: 'red', border: 'none', color: 'white', cursor: 'pointer', fontSize: '10px', padding: '5px' }}>Sair</button>
            </div>
        </div>
        
        <h2 className="titulo-curso">{cursoAtivo.titulo}</h2>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>O seu progresso:</span><span>{percentagem}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${percentagem}%`, background: percentagem === 100 ? '#ffd700' : '#00cc66', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        {cursoAtivo.modulos.map((modulo, index) => (
          <div key={modulo.id} className="modulo-group">
            <details open={index === 0}>
              <summary className="modulo-titulo">{modulo.titulo}</summary>
              <ul className="lista-aulas">
                {modulo.aulas.map((aula) => (
                  <li key={aula.id} className={aulaAtual?.id === aula.id ? "ativa" : ""} onClick={() => setAulaAtual(aula)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{aula.concluida ? '✅' : '▶'}</span>
                    <span>{aula.titulo}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ))}
      </aside>

      <main className="area-video">
        {aulaAtual ? (
          <div className="video-wrapper">
            <h1>{aulaAtual.titulo}</h1>
            <iframe width="100%" height="500px" src={aulaAtual.conteudo} title={aulaAtual.titulo} frameBorder="0" allowFullScreen></iframe>
            <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Gostou da aula?</p>
              <button onClick={alternarConclusaoAula} style={{ padding: '10px 20px', backgroundColor: aulaAtual.concluida ? '#fff' : '#00cc66', color: aulaAtual.concluida ? '#00cc66' : '#fff', border: `2px solid #00cc66`, borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                {aulaAtual.concluida ? '✅ Aula Concluída (Desmarcar)' : 'Marcar como Concluída'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bem-vindo">
            <h3>Selecione uma aula no menu lateral para começar</h3>
          </div>
        )}
      </main>
    </div>
  );
}