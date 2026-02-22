import React, { useState, useEffect } from 'react';
import api from '../api';
import './CursoStyles.css';
import './VisualizadorDeCurso.css';

export default function VisualizadorDeCurso() {
  const [token] = useState(localStorage.getItem('token'));

  // Vitrine (Quais cursos o aluno comprou?)
  const [meusCursos, setMeusCursos] = useState([]);
  const [carregandoVitrine, setCarregandoVitrine] = useState(true);

  // Sala de Aula (O curso que ele clicou para assistir)
  const [cursoAtivo, setCursoAtivo] = useState(null);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [quizPerguntas, setQuizPerguntas] = useState([]);
  const [respostasQuiz, setRespostasQuiz] = useState({});
  const [quizResultado, setQuizResultado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [carregandoAula, setCarregandoAula] = useState(false);

  const fazerLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  // 1. Assim que a tela abre, busca os cursos comprados
  useEffect(() => {
    api.get('/cursos/aluno/meus-cursos')
      .then(res => {
        setMeusCursos(res.data);
        setCarregandoVitrine(false);
      });
  }, [token]);

  // 2. Função quando o aluno clica na vitrine para entrar na Sala de Aula
  const entrarNaSala = (cursoId) => {
    setCarregandoAula(true);
    api.get(`/cursos/${cursoId}`)
      .then(res => {
        setCursoAtivo(res.data);
        setAulaAtual(null); // Reseta o vídeo ao trocar de curso
        setCarregandoAula(false);
      });
  };

  const alternarConclusaoAula = async () => {
    if (!aulaAtual) return;
    const novoStatus = !aulaAtual.concluida;
    try {
      await api.post('/cursos/progresso', { aula_id: aulaAtual.id, concluida: novoStatus });
      setAulaAtual({ ...aulaAtual, concluida: novoStatus });

      const cursoAtualizado = { ...cursoAtivo };
      cursoAtualizado.modulos.forEach(mod => {
        mod.aulas.forEach(aula => { if (aula.id === aulaAtual.id) aula.concluida = novoStatus; });
      });
      setCursoAtivo(cursoAtualizado);
    } catch (erro) { alert("Erro ao salvar progresso."); }
  };

  useEffect(() => {
    if (aulaAtual) {
      if (aulaAtual.tipo === 'quiz') {
        api.get(`/cursos/aulas/${aulaAtual.id}/quiz`)
          .then(res => {
            setQuizPerguntas(res.data.map(p => ({ ...p, opcoes: JSON.parse(p.opcoes) })));
            setQuizResultado(null);
            setRespostasQuiz({});
          });
      }
      // Buscar comentários
      api.get(`/cursos/aulas/${aulaAtual.id}/comentarios`)
        .then(res => setComentarios(res.data))
        .catch(() => setComentarios([]));
    }
  }, [aulaAtual]);

  const postarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;
    try {
      await api.post(`/cursos/aulas/${aulaAtual.id}/comentarios`, { texto: novoComentario });
      setNovoComentario('');
      // Recarregar comentários
      const res = await api.get(`/cursos/aulas/${aulaAtual.id}/comentarios`);
      setComentarios(res.data);
    } catch (erro) { alert("Erro ao enviar comentário."); }
  };

  const submeterQuiz = () => {
    let acertos = 0;
    quizPerguntas.forEach(p => {
      if (respostasQuiz[p.id] === p.resposta_correta) acertos++;
    });
    const perc = Math.round((acertos / quizPerguntas.length) * 100);
    setQuizResultado({ acertos, total: quizPerguntas.length, percentagem: perc });

    if (perc >= (quizPerguntas[0]?.nota_corte || 70)) {
      // Se aprovado, pode marcar como concluída
      if (!aulaAtual.concluida) alternarConclusaoAula();
    }
  };

  if (carregandoVitrine) return <div className="vitrine-empty"><h2>A carregar a sua área de estudos...</h2></div>;

  // TELA 1: A VITRINE DE CURSOS
  if (!cursoAtivo) {
    return (
      <div className="vitrine-container">
        <div className="vitrine-header">
          <h2>Meus Cursos Adquiridos</h2>
          <div>
            <a href="/" style={{ marginRight: '15px', color: '#00cc66', fontWeight: 'bold', textDecoration: 'none' }}>+ Descobrir novos cursos</a>
            <button onClick={fazerLogout} className="btn-sair">Sair</button>
          </div>
        </div>

        {meusCursos.length === 0 ? (
          <div className="vitrine-empty">
            <h3>Você ainda não possui cursos.</h3>
            <p>Adquira um curso ou peça à administração para lhe dar acesso.</p>
          </div>
        ) : (
          <div className="vitrine-grid">
            {meusCursos.map(c => (
              <div key={c.id} className="curso-card" onClick={() => entrarNaSala(c.id)}>
                <div className="curso-capa">
                  {c.titulo.charAt(0)}
                </div>
                <div className="curso-info">
                  <h3>{c.titulo}</h3>
                  <button className="btn-assistir">Assistir Agora</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // TELA 2: A SALA DE AULA
  if (carregandoAula) return <div className="area-video"><h2>A carregar sala de aula...</h2></div>;

  let totalAulas = 0; let aulasConcluidas = 0;
  cursoAtivo.modulos.forEach(mod => {
    totalAulas += mod.aulas.length;
    aulasConcluidas += mod.aulas.filter(aula => aula.concluida).length;
  });
  const percentagem = totalAulas === 0 ? 0 : Math.round((aulasConcluidas / totalAulas) * 100);

  return (
    <div className="plataforma-container" style={{
      '--cor-primaria': cursoAtivo.cor_primaria || '#00cc66',
      '--cor-secundaria': cursoAtivo.cor_secundaria || '#222222'
    }}>
      <aside className="sidebar-modulos" style={{ background: 'var(--cor-secundaria)' }}>
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCursoAtivo(null)} style={{ background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer', fontSize: '10px', padding: '5px' }}>← Voltar à Vitrine</button>
          <div>
            <a href="/suporte" style={{ color: 'var(--cor-primaria)', textDecoration: 'none', marginRight: '10px', fontSize: '12px' }}>Suporte</a>
            <button onClick={fazerLogout} style={{ background: 'red', border: 'none', color: 'white', cursor: 'pointer', fontSize: '10px', padding: '5px' }}>Sair</button>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '15px' }}>
          {cursoAtivo.logo_url ? (
            <img src={cursoAtivo.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '50px' }} />
          ) : (
            <h2 className="titulo-curso" style={{ margin: 0 }}>{cursoAtivo.titulo}</h2>
          )}
        </div>

        <div style={{ padding: '0 20px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>O seu progresso:</span><span>{percentagem}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${percentagem}%`, background: percentagem === 100 ? '#ffd700' : 'var(--cor-primaria)', transition: 'width 0.5s ease' }}></div>
          </div>
          {percentagem === 100 && (
            <button
              onClick={() => window.open(`/certificado/${cursoAtivo.id}`, '_blank')}
              style={{ width: '100%', marginTop: '15px', padding: '10px', background: '#ffd700', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              🏆 Emitir Certificado
            </button>
          )}
        </div>

        {cursoAtivo.modulos.map((modulo, index) => (
          <div key={modulo.id} className="modulo-group">
            <details open={index === 0}>
              <summary className="modulo-titulo">{modulo.titulo}</summary>
              <ul className="lista-aulas">
                {modulo.aulas.map((aula) => {
                  const dataCompra = new Date(cursoAtivo.matricula.data_compra);
                  const hoje = new Date();
                  const diffTime = Math.abs(hoje - dataCompra);
                  const diasPassados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  const bloqueadaPorDrip = aula.data_liberacao_drip > diasPassados;

                  return (
                    <li
                      key={aula.id}
                      className={`${aulaAtual?.id === aula.id ? "ativa" : ""} ${bloqueadaPorDrip ? "bloqueada" : ""}`}
                      onClick={() => !bloqueadaPorDrip && setAulaAtual(aula)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: bloqueadaPorDrip ? 0.5 : 1, cursor: bloqueadaPorDrip ? 'not-allowed' : 'pointer' }}
                    >
                      <span>{bloqueadaPorDrip ? '🔒' : (aula.concluida ? '✅' : (
                        aula.tipo === 'video' ? '▶' :
                          aula.tipo === 'texto' ? '📄' :
                            aula.tipo === 'audio' ? '🔊' :
                              aula.tipo === 'quiz' ? '❓' : '📎'
                      ))}</span>
                      <span style={{ fontSize: '13px' }}>
                        {aula.titulo}
                        {bloqueadaPorDrip && <span style={{ fontSize: '10px', display: 'block' }}>Disponível em {aula.data_liberacao_drip - diasPassados} dias</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        ))}
      </aside>

      <main className="area-video">
        {aulaAtual ? (
          <div className="video-wrapper">
            <h1>{aulaAtual.titulo}</h1>
            {aulaAtual.tipo === 'video' && (
              <iframe width="100%" height="500px" src={aulaAtual.conteudo} title={aulaAtual.titulo} frameBorder="0" allowFullScreen></iframe>
            )}

            {aulaAtual.tipo === 'texto' && (
              <div className="artigo-conteudo" style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', lineHeight: '1.6', fontSize: '18px', color: '#333' }} dangerouslySetInnerHTML={{ __html: aulaAtual.conteudo }}></div>
            )}

            {aulaAtual.tipo === 'audio' && (
              <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
                <audio controls src={aulaAtual.conteudo} style={{ width: '100%' }}>O seu navegador não suporta o elemento de áudio.</audio>
              </div>
            )}

            {aulaAtual.tipo === 'anexo' && (
              <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
                <p>Esta aula possui um arquivo para download.</p>
                <a href={aulaAtual.conteudo} target="_blank" rel="noopener noreferrer" className="btn-assistir" style={{ display: 'inline-block', width: 'auto', padding: '10px 30px' }}>Baixar Material</a>
              </div>
            )}

            {aulaAtual.tipo === 'quiz' && (
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>Avaliação de Conhecimento</h3>
                {quizPerguntas.length === 0 ? <p>Este quiz ainda não possui perguntas.</p> : (
                  <>
                    {quizPerguntas.map((p, idx) => (
                      <div key={p.id} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                        <p><strong>{idx + 1}. {p.pergunta}</strong></p>
                        {p.opcoes.map((op, i) => (
                          <label key={i} style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
                            <input type="radio" name={`pergunta-${p.id}`} value={op} checked={respostasQuiz[p.id] === op} onChange={() => setRespostasQuiz({ ...respostasQuiz, [p.id]: op })} /> {op}
                          </label>
                        ))}
                      </div>
                    ))}
                    <button onClick={submeterQuiz} className="btn-assistir" style={{ width: '200px' }}>Submeter Respostas</button>

                    {quizResultado && (
                      <div style={{ marginTop: '20px', padding: '15px', background: quizResultado.percentagem >= (quizPerguntas[0]?.nota_corte || 70) ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
                        <strong>Resultado: {quizResultado.acertos} / {quizResultado.total} ({quizResultado.percentagem}%)</strong>
                        <p>{quizResultado.percentagem >= (quizPerguntas[0]?.nota_corte || 70) ? '✅ Parabéns! Foste aprovado.' : '❌ Não atingiste a nota mínima. Tenta novamente.'}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="video-section-header">
              <p style={{ margin: 0, fontWeight: 'bold' }}>Gostou da aula?</p>
              <button onClick={alternarConclusaoAula} style={{ padding: '10px 20px', backgroundColor: aulaAtual.concluida ? '#fff' : 'var(--cor-primaria)', color: aulaAtual.concluida ? 'var(--cor-primaria)' : '#fff', border: `2px solid var(--cor-primaria)`, borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                {aulaAtual.concluida ? '✅ Aula Concluída (Desmarcar)' : 'Marcar como Concluída'}
              </button>
            </div>

            <div className="comentarios-section" style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
              <h3>💬 Dúvidas e Comentários</h3>
              <form onSubmit={postarComentario} style={{ marginBottom: '20px' }}>
                <textarea value={novoComentario} onChange={e => setNovoComentario(e.target.value)} placeholder="Tire sua dúvida ou deixe um comentário..." required style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', marginBottom: '10px' }} />
                <button type="submit" className="btn-assistir" style={{ width: '150px', backgroundColor: 'var(--cor-primaria)' }}>Enviar</button>
              </form>

              <div className="lista-comentarios">
                {comentarios.length === 0 ? <p style={{ color: '#666' }}>Seja o primeiro a comentar!</p> : comentarios.map(c => (
                  <div key={c.id} className="comentario-item">
                    <div className="comentario-header">
                      <span className="comentario-autor">{c.autor}</span>
                      <span className="comentario-data">{new Date(c.data).toLocaleString()}</span>
                    </div>
                    <p className="comentario-texto">{c.texto}</p>
                  </div>
                ))}
              </div>
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