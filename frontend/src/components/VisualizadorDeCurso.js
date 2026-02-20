import React, { useState, useEffect } from 'react';
import './CursoStyles.css';

export default function VisualizadorDeCurso() {
  const [curso, setCurso] = useState(null);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [erroAcesso, setErroAcesso] = useState(null); 
  const [carregando, setCarregando] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  // Login states...
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  useEffect(() => {
    if (!token) return;
    setCarregando(true);
    setErroAcesso(null);

    fetch(`http://localhost:5000/api/curso/1`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async (resposta) => {
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || "Erro de acesso");
        return dados;
      })
      .then((dados) => {
        setCurso(dados);
        setCarregando(false);
      })
      .catch((erro) => {
        setErroAcesso(erro.message);
        setCarregando(false);
        if (erro.message.includes("Token")) fazerLogout();
      });
  }, [token]); 

  // ==========================================
  // NOVA FUNÇÃO: MARCAR AULA COMO CONCLUÍDA
  // ==========================================
  const alternarConclusaoAula = async () => {
    if (!aulaAtual) return;
    
    // Inverte o estado atual (Se estava true, vira false e vice-versa)
    const novoStatusConcluida = !aulaAtual.concluida;

    try {
      // 1. Avisa o Backend para guardar na Base de Dados
      await fetch('http://localhost:5000/api/progresso', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ aula_id: aulaAtual.id, concluida: novoStatusConcluida })
      });

      // 2. Atualiza a interface (Front-end) instantaneamente
      setAulaAtual({ ...aulaAtual, concluida: novoStatusConcluida });
      
      const cursoAtualizado = { ...curso };
      cursoAtualizado.modulos.forEach(mod => {
        mod.aulas.forEach(aula => {
          if(aula.id === aulaAtual.id) aula.concluida = novoStatusConcluida;
        });
      });
      setCurso(cursoAtualizado);

    } catch (erro) {
      alert("Erro ao salvar progresso. Verifique a sua ligação.");
    }
  };

  const efetuarLogin = async (e) => {
    e.preventDefault();
    setErroLogin('');
    try {
      const resposta = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);
      localStorage.setItem('token', dados.token);
      setToken(dados.token);
    } catch (erro) {
      setErroLogin(erro.message);
    }
  };

  const fazerLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurso(null);
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4' }}>
        <form onSubmit={efetuarLogin} style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2>Acesso ao Aluno</h2>
          {erroLogin && <p style={{ color: 'red', fontSize: '14px' }}>{erroLogin}</p>}
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px' }} />
          <input type="password" placeholder="Palavra-passe" value={senha} onChange={e => setSenha(e.target.value)} required style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', background: '#00cc66', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
        </form>
      </div>
    );
  }

  if (carregando) return <div className="area-video"><h2>A carregar...</h2></div>;

  if (erroAcesso) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: '#e50914' }}>🔒 Acesso Restrito</h2>
        <p>{erroAcesso}</p>
        <button onClick={fazerLogout} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>Sair da conta</button>
      </div>
    );
  }

  if (!curso) return null;

  // ==========================================
  // CÁLCULO DE PROGRESSO
  // ==========================================
  let totalAulas = 0;
  let aulasConcluidas = 0;

  curso.modulos.forEach(mod => {
    totalAulas += mod.aulas.length;
    aulasConcluidas += mod.aulas.filter(aula => aula.concluida).length;
  });

  const percentagem = totalAulas === 0 ? 0 : Math.round((aulasConcluidas / totalAulas) * 100);

  return (
    <div className="plataforma-container">
      <aside className="sidebar-modulos">
        <div style={{ padding: '10px', background: '#222', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px' }}>Os Meus Cursos</span>
            <div>
              {/* O Link para ir pedir ajuda */}
              <a href="/suporte" style={{ color: '#00cc66', textDecoration: 'none', marginRight: '10px', fontSize: '12px' }}>Suporte</a>
              <button onClick={fazerLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer', fontSize: '10px', padding: '5px' }}>Sair</button>
            </div>
        </div>
        <h2 className="titulo-curso">{curso.titulo}</h2>
        
        {/* NOVO: BARRA DE PROGRESSO */}
        <div style={{ padding: '0 20px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>O seu progresso:</span>
            <span>{percentagem}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${percentagem}%`, 
              background: percentagem === 100 ? '#ffd700' : '#00cc66', /* Fica dourado se chegar aos 100%! */
              transition: 'width 0.5s ease-in-out' 
            }}></div>
          </div>
        </div>
        
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
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {/* NOVO: Ícone que muda se estiver concluída */}
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
            <iframe 
              width="100%" height="500px" src={aulaAtual.conteudo} title={aulaAtual.titulo} frameBorder="0" allowFullScreen
            ></iframe>
            
            {/* NOVO: Barra de Ações abaixo do Vídeo */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Gostou da aula?</p>
              </div>
              <button 
                onClick={alternarConclusaoAula}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: aulaAtual.concluida ? '#fff' : '#00cc66', 
                  color: aulaAtual.concluida ? '#00cc66' : '#fff', 
                  border: `2px solid #00cc66`,
                  borderRadius: '25px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
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