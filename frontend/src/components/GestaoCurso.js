import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import './GestaoCurso.css';

export default function GestaoCurso() {
  const { id } = useParams(); // Pega o ID do curso através do link (URL)
  const [token] = useState(localStorage.getItem('token'));
  const [curso, setCurso] = useState(null);

  // Estados dos formulários
  const [novoModuloTitulo, setNovoModuloTitulo] = useState('');
  const [novaAulaTitulo, setNovaAulaTitulo] = useState('');
  const [novaAulaTipo, setNovaAulaTipo] = useState('video');
  const [novaAulaConteudo, setNovaAulaConteudo] = useState('');
  const [novaAulaDrip, setNovaAulaDrip] = useState(0);
  const [moduloSelecionado, setModuloSelecionado] = useState(null);
  const [aulaParaQuiz, setAulaParaQuiz] = useState(null);
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState(['', '', '', '']);
  const [correta, setCorreta] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('construtor'); // 'construtor', 'alunos', 'cupons', 'branding', 'planos', 'ofertas', 'analytics'
  const [alunosMatriculados, setAlunosMatriculados] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [novoCupom, setNovoCupom] = useState({ codigo: '', desconto: 0, validade: '', limite: 0 });
  const [branding, setBranding] = useState({
    cor_primaria: '#00cc66',
    cor_secundaria: '#222222',
    logo_url: '',
    subdominio: '',
    checkout_video_url: ''
  });
  const [planos, setPlanos] = useState([]);
  const [novoPlano, setNovoPlano] = useState({ titulo: '', tipo: 'unico', preco: '', trial: 0 });
  const [ofertas, setOfertas] = useState([]);
  const [novaOferta, setNovaOferta] = useState({ curso_oferta_id: '', tipo: 'order_bump', titulo: '', descricao: '', preco: '' });
  const [todosCursos, setTodosCursos] = useState([]);
  const [analytics, setAnalytics] = useState({ geral: {}, mensal: [] });
  const [pedagogico, setPedagogico] = useState({ progresso_medio: 0, quiz_aprovacao: 0 });

  // Carrega os dados do curso
  const carregarCurso = () => {
    api.get(`/cursos/produtor/${id}`)
      .then(res => setCurso(res.data))
      .catch(erro => console.error(erro));
  };

  useEffect(() => {
    if (token) {
      carregarCurso();
      api.get(`/cursos/produtor/curso/${id}/alunos`)
        .then(res => setAlunosMatriculados(res.data))
        .catch(erro => console.error(erro));
      api.get(`/cursos/produtor/curso/${id}/cupons`)
        .then(res => setCupons(res.data))
        .catch(erro => console.error(erro));
      api.get(`/cursos/produtor/curso/${id}/planos`)
        .then(res => setPlanos(res.data))
        .catch(erro => console.error(erro));
      api.get(`/cursos/produtor/curso/${id}/ofertas`)
        .then(res => setOfertas(res.data))
        .catch(erro => console.error(erro));
      api.get('/cursos/produtor/meus-cursos')
        .then(res => setTodosCursos(res.data))
        .catch(erro => console.error(erro));
      api.get(`/cursos/produtor/curso/${id}/analytics-financeiro`)
        .then(res => setAnalytics(res.data))
        .catch(erro => console.error(erro));
      api.get(`/cursos/produtor/curso/${id}/analytics-pedagogico`)
        .then(res => setPedagogico(res.data))
        .catch(erro => console.error(erro));
    }
  }, [id, token]);

  const matricularManual = async (e) => {
    e.preventDefault();
    const email = prompt("Email do aluno:");
    const nome = prompt("Nome do aluno:");
    if (!email) return;
    try {
      await api.post(`/cursos/produtor/curso/${id}/matricular-manual`, { email, nome });
      alert("Aluno matriculado!");
      // Recarregar lista
      const res = await api.get(`/cursos/produtor/curso/${id}/alunos`);
      setAlunosMatriculados(res.data);
    } catch (e) { alert("Erro na matrícula."); }
  };

  const alterarStatusMatricula = async (matriculaId, statusAtual) => {
    try {
      await api.put(`/cursos/produtor/matricula/${matriculaId}/status`, { suspensa: !statusAtual });
      // Recarregar lista
      const res = await api.get(`/cursos/produtor/curso/${id}/alunos`);
      setAlunosMatriculados(res.data);
    } catch (e) { alert("Erro ao mudar status."); }
  };

  const criarOferta = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cursos/produtor/curso/${id}/ofertas`, novaOferta);
      alert("Oferta criada!");
      setNovaOferta({ curso_oferta_id: '', tipo: 'order_bump', titulo: '', descricao: '', preco: '' });
      const res = await api.get(`/cursos/produtor/curso/${id}/ofertas`);
      setOfertas(res.data);
    } catch (erro) { alert("Erro ao criar oferta."); }
  };

  const criarPlano = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cursos/produtor/curso/${id}/planos`, {
        titulo: novoPlano.titulo,
        tipo: novoPlano.tipo,
        preco: novoPlano.preco,
        trial_dias: novoPlano.trial
      });
      alert("Plano criado!");
      setNovoPlano({ titulo: '', tipo: 'unico', preco: '', trial: 0 });
      const res = await api.get(`/cursos/produtor/curso/${id}/planos`);
      setPlanos(res.data);
    } catch (erro) { alert("Erro ao criar plano."); }
  };

  useEffect(() => {
    if (curso) {
      setBranding({
        cor_primaria: curso.cor_primaria || '#00cc66',
        cor_secundaria: curso.cor_secundaria || '#222',
        logo_url: curso.logo_url || '',
        subdominio: curso.subdominio || '',
        checkout_video_url: curso.checkout_video_url || ''
      });
    }
  }, [curso]);

  const salvarBranding = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/cursos/produtor/curso/${id}/configuracoes`, branding);
      alert("Branding salvo!");
    } catch (erro) { alert("Erro ao salvar branding."); }
  };

  const criarCupom = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cursos/produtor/curso/${id}/cupons`, {
        codigo: novoCupom.codigo,
        desconto: novoCupom.desconto,
        validade: novoCupom.validade,
        limite_usos: novoCupom.limite
      });
      alert("Cupom criado!");
      setNovoCupom({ codigo: '', desconto: 0, validade: '', limite: 0 });
      const res = await api.get(`/cursos/produtor/curso/${id}/cupons`);
      setCupons(res.data);
    } catch (erro) { alert("Erro ao criar cupom."); }
  };

  const criarModulo = async (e) => {
    e.preventDefault();
    await api.post('/cursos/modulos', { curso_id: id, titulo: novoModuloTitulo, ordem: curso.modulos.length + 1 });
    setNovoModuloTitulo('');
    carregarCurso(); // Recarrega a página para mostrar o novo módulo
  };

  const criarAula = async (e) => {
    e.preventDefault();
    await api.post('/cursos/aulas', {
      modulo_id: moduloSelecionado,
      titulo: novaAulaTitulo,
      conteudo: novaAulaConteudo,
      tipo: novaAulaTipo,
      data_liberacao_drip: novaAulaDrip
    });
    setNovaAulaTitulo('');
    setNovaAulaConteudo('');
    setNovaAulaTipo('video');
    setNovaAulaDrip(0);
    setModuloSelecionado(null);
    carregarCurso(); // Recarrega para mostrar a nova aula
  };

  const adicionarPergunta = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cursos/aulas/${aulaParaQuiz.id}/quiz`, {
        pergunta,
        opcoes,
        resposta_correta: correta,
        nota_corte: 70
      });
      alert("Pergunta adicionada!");
      setPergunta('');
      setOpcoes(['', '', '', '']);
      setCorreta('');
    } catch (erro) { alert("Erro ao adicionar pergunta."); }
  };

  if (!curso) return <div style={{ padding: '50px', textAlign: 'center' }}>A carregar construtor...</div>;

  return (
    <div className="gestao-container">
      <Link to="/admin" className="link-voltar">← Voltar ao Painel</Link>

      <div className="construtor-card">
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
          <button onClick={() => setAbaAtiva('construtor')} style={{ padding: '10px 20px', background: abaAtiva === 'construtor' ? 'white' : '#eee', border: '1px solid #ddd', borderBottom: abaAtiva === 'construtor' ? 'none' : '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}>🔨 Construtor</button>
          <button onClick={() => setAbaAtiva('alunos')} style={{ padding: '10px 20px', background: abaAtiva === 'alunos' ? 'white' : '#eee', border: '1px solid #ddd', borderBottom: abaAtiva === 'alunos' ? 'none' : '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}>👥 Alunos ({alunosMatriculados.length})</button>
          <button onClick={() => setAbaAtiva('cupons')} style={{ padding: '10px 20px', background: abaAtiva === 'cupons' ? 'white' : '#eee', border: '1px solid #ddd', borderBottom: abaAtiva === 'cupons' ? 'none' : '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}>🎟️ Cupons ({cupons.length})</button>
          <button onClick={() => setAbaAtiva('planos')} style={{ padding: '10px 20px', background: abaAtiva === 'planos' ? 'white' : '#eee', border: '1px solid #ddd', borderBottom: abaAtiva === 'planos' ? 'none' : '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}>🏷️ Planos ({planos.length})</button>
          <button onClick={() => setAbaAtiva('ofertas')} style={{ padding: '10px 20px', background: abaAtiva === 'ofertas' ? 'white' : '#eee', border: '1px solid #ddd', borderBottom: abaAtiva === 'ofertas' ? 'none' : '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}>💰 Ofertas ({ofertas.length})</button>
          <button onClick={() => setAbaAtiva('analytics')} style={{ padding: '10px 20px', background: abaAtiva === 'analytics' ? 'white' : '#eee', border: '1px solid #ddd', borderBottom: abaAtiva === 'analytics' ? 'none' : '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}>📈 Analytics</button>
          <button onClick={() => setAbaAtiva('branding')} style={{ padding: '10px 20px', background: abaAtiva === 'branding' ? 'white' : '#eee', border: '1px solid #ddd', borderBottom: abaAtiva === 'branding' ? 'none' : '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}>🎨 Branding</button>
        </div>

        {abaAtiva === 'construtor' ? (
          <>
            <h2>Construtor do Curso: <span style={{ color: '#00cc66' }}>{curso.titulo}</span></h2>

            {/* Formulário para adicionar Módulo */}
            <form onSubmit={criarModulo} className="form-modulo">
              <input type="text" placeholder="Nome do Novo Módulo (Ex: Módulo 1 - Introdução)" required value={novoModuloTitulo} onChange={e => setNovoModuloTitulo(e.target.value)} className="input-modulo" />
              <button type="submit" className="btn-add-modulo">+ Adicionar Módulo</button>
            </form>

            <hr className="hr-separador" />

            {/* Lista de Módulos e Aulas */}
            {curso.modulos.length === 0 ? <p>Ainda não há módulos neste curso.</p> : curso.modulos.map(modulo => (
              <div key={modulo.id} className="modulo-item">
                <div className="modulo-header">
                  <h3>📦 {modulo.titulo}</h3>
                  <button onClick={() => setModuloSelecionado(modulo.id)} className="btn-add-aula">+ Adicionar Aula Aqui</button>
                </div>

                {moduloSelecionado === modulo.id && (
                  <form onSubmit={criarAula} className="form-aula" style={{ flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input type="text" placeholder="Título da Aula" required value={novaAulaTitulo} onChange={e => setNovaAulaTitulo(e.target.value)} className="input-aula" style={{ flex: 2 }} />
                      <select value={novaAulaTipo} onChange={e => setNovaAulaTipo(e.target.value)} className="input-aula" style={{ flex: 1 }}>
                        <option value="video">Vídeo (YouTube/Embed)</option>
                        <option value="texto">Texto / Artigo</option>
                        <option value="audio">Áudio (URL)</option>
                        <option value="quiz">Quiz</option>
                        <option value="anexo">Anexo para Download</option>
                      </select>
                      <input type="number" placeholder="Drip (Dias)" title="Liberar após X dias da compra" value={novaAulaDrip} onChange={e => setNovaAulaDrip(e.target.value)} className="input-aula" style={{ width: '80px' }} />
                    </div>

                    {novaAulaTipo === 'texto' ? (
                      <textarea placeholder="Escreva aqui o conteúdo do seu artigo (suporta HTML básico)..." required value={novaAulaConteudo} onChange={e => setNovaAulaConteudo(e.target.value)} className="input-aula" style={{ minHeight: '150px', marginBottom: '10px' }} />
                    ) : (
                      <input type={novaAulaTipo === 'video' || novaAulaTipo === 'audio' || novaAulaTipo === 'anexo' ? "url" : "text"} placeholder={novaAulaTipo === 'video' ? "Link do Vídeo (Ex: https://www.youtube.com/embed/...)" : "Conteúdo ou Link"} required value={novaAulaConteudo} onChange={e => setNovaAulaConteudo(e.target.value)} className="input-aula" style={{ marginBottom: '10px' }} />
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn-salvar-aula">Guardar Aula</button>
                      <button type="button" onClick={() => setModuloSelecionado(null)} className="btn-cancelar-aula">Cancelar</button>
                    </div>
                  </form>
                )}

                <ul className="lista-aulas-gestao">
                  {modulo.aulas.length === 0 ? <li style={{ color: '#888' }}>Sem aulas.</li> : modulo.aulas.map(aula => (
                    <li key={aula.id}>
                      {aula.tipo === 'video' && '▶'}
                      {aula.tipo === 'texto' && '📄'}
                      {aula.tipo === 'audio' && '🔊'}
                      {aula.tipo === 'quiz' && '❓'}
                      {aula.tipo === 'anexo' && '📎'}
                      <strong> {aula.titulo}</strong>
                      <span style={{ fontSize: '12px', color: '#666' }}> ({aula.tipo}{aula.data_liberacao_drip > 0 && ` - Drip: ${aula.data_liberacao_drip}d`})</span>
                      {aula.tipo === 'quiz' && (
                        <button onClick={() => setAulaParaQuiz(aula)} style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}>⚙️ Gerir Questões</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : abaAtiva === 'alunos' ? (
          <div className="lista-alunos-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Alunos Matriculados</h3>
              <button onClick={matricularManual} className="btn-add-aula" style={{ width: 'auto', padding: '10px 20px' }}>+ Matricular Aluno Manualmente</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f0f0f0' }}>
                  <th style={{ padding: '10px' }}>Nome</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Progresso</th>
                  <th style={{ padding: '10px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosMatriculados.map(aluno => (
                  <tr key={aluno.id} style={{ borderBottom: '1px solid #eee', opacity: aluno.suspensa ? 0.5 : 1 }}>
                    <td style={{ padding: '10px' }}>{aluno.nome}</td>
                    <td style={{ padding: '10px' }}>{aluno.email}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ width: '100px', height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden', display: 'inline-block', marginRight: '5px' }}>
                        <div style={{ height: '100%', width: `${aluno.progresso}%`, background: '#00cc66' }}></div>
                      </div>
                      <span style={{ fontSize: '12px' }}>{aluno.progresso}%</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => alterarStatusMatricula(aluno.matricula_id, aluno.suspensa)}
                        style={{ background: aluno.suspensa ? '#00cc66' : '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                        {aluno.suspensa ? 'Reativar' : 'Suspender'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : abaAtiva === 'cupons' ? (
          <div className="lista-cupons-dashboard">
            <h3>Gerenciar Cupons de Desconto</h3>
            <form onSubmit={criarCupom} style={{ display: 'flex', gap: '10px', margin: '20px 0', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <input type="text" placeholder="Código (Ex: SEGREDO30)" required value={novoCupom.codigo} onChange={e => setNovoCupom({ ...novoCupom, codigo: e.target.value })} className="input-aula" />
              <input type="number" placeholder="% Desconto" required value={novoCupom.desconto} onChange={e => setNovoCupom({ ...novoCupom, desconto: e.target.value })} className="input-aula" style={{ width: '100px' }} />
              <input type="date" required value={novoCupom.validade} onChange={e => setNovoCupom({ ...novoCupom, validade: e.target.value })} className="input-aula" />
              <input type="number" placeholder="Limite (0=∞)" value={novoCupom.limite} onChange={e => setNovoCupom({ ...novoCupom, limite: e.target.value })} className="input-aula" style={{ width: '100px' }} />
              <button type="submit" className="btn-add-aula">Criar Cupom</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f0f0f0' }}>
                  <th style={{ padding: '10px' }}>Código</th>
                  <th style={{ padding: '10px' }}>Desconto</th>
                  <th style={{ padding: '10px' }}>Validade</th>
                  <th style={{ padding: '10px' }}>Usos</th>
                  <th style={{ padding: '10px' }}>Limite</th>
                </tr>
              </thead>
              <tbody>
                {cupons.map(cupom => (
                  <tr key={cupom.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}><strong>{cupom.codigo}</strong></td>
                    <td style={{ padding: '10px' }}>{cupom.desconto_percentual}%</td>
                    <td style={{ padding: '10px' }}>{new Date(cupom.validade).toLocaleDateString()}</td>
                    <td style={{ padding: '10px' }}>{cupom.usos_atuais}</td>
                    <td style={{ padding: '10px' }}>{cupom.limite_usos === 0 ? 'Ilimitado' : cupom.limite_usos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : abaAtiva === 'planos' ? (
          <div className="lista-planos-dashboard">
            <h3>Gerenciar Ofertas e Planos de Venda</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Crie diferentes formas de vender o seu conteúdo (Acesso Único ou Assinatura).</p>

            <form onSubmit={criarPlano} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 150px', gap: '10px', margin: '20px 0', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <input type="text" placeholder="Nome do Plano (Ex: Plano Black)" required value={novoPlano.titulo} onChange={e => setNovoPlano({ ...novoPlano, titulo: e.target.value })} className="input-aula" />
              <select value={novoPlano.tipo} onChange={e => setNovoPlano({ ...novoPlano, tipo: e.target.value })} className="input-aula">
                <option value="unico">Acesso Vitalício/Único</option>
                <option value="mensal">Assinatura Mensal</option>
                <option value="anual">Assinatura Anual</option>
              </select>
              <input type="number" placeholder="Preço (R$)" required value={novoPlano.preco} onChange={e => setNovoPlano({ ...novoPlano, preco: e.target.value })} className="input-aula" />
              <input type="number" placeholder="Trial (dias)" value={novoPlano.trial} onChange={e => setNovoPlano({ ...novoPlano, trial: e.target.value })} className="input-aula" />
              <button type="submit" className="btn-add-aula">Criar Plano</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f0f0f0' }}>
                  <th style={{ padding: '10px' }}>Plano</th>
                  <th style={{ padding: '10px' }}>Tipo</th>
                  <th style={{ padding: '10px' }}>Preço</th>
                  <th style={{ padding: '10px' }}>Trial</th>
                </tr>
              </thead>
              <tbody>
                {planos.map(plano => (
                  <tr key={plano.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}><strong>{plano.titulo}</strong></td>
                    <td style={{ padding: '10px' }}>{plano.tipo === 'unico' ? 'Único' : (plano.tipo === 'mensal' ? 'Mensal' : 'Anual')}</td>
                    <td style={{ padding: '10px' }}>R$ {plano.preco}</td>
                    <td style={{ padding: '10px' }}>{plano.trial_dias} dias</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : abaAtiva === 'ofertas' ? (
          <div className="lista-ofertas-dashboard">
            <h3>Gerenciar Order Bumps e Upsells</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Configure ofertas complementares para aumentar o faturamento por cliente.</p>

            <form onSubmit={criarOferta} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '20px 0', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <select required value={novaOferta.curso_oferta_id} onChange={e => setNovaOferta({ ...novaOferta, curso_oferta_id: e.target.value })} className="input-aula">
                <option value="">Selecionar Curso...</option>
                {todosCursos.filter(c => c.id != id).map(c => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
              <select value={novaOferta.tipo} onChange={e => setNovaOferta({ ...novaOferta, tipo: e.target.value })} className="input-aula">
                <option value="order_bump">Order Bump (No Checkout)</option>
                <option value="upsell">Upsell (Pós-Pagamento)</option>
              </select>
              <input type="number" placeholder="Preço Especial (R$)" required value={novaOferta.preco} onChange={e => setNovaOferta({ ...novaOferta, preco: e.target.value })} className="input-aula" />
              <input type="text" placeholder="Chamada (Ex: Leve também o curso X por 50%!)" required value={novaOferta.titulo} onChange={e => setNovaOferta({ ...novaOferta, titulo: e.target.value })} className="input-aula" style={{ gridColumn: 'span 3' }} />
              <textarea placeholder="Descrição curta da oferta..." value={novaOferta.descricao} onChange={e => setNovaOferta({ ...novaOferta, descricao: e.target.value })} className="input-aula" style={{ gridColumn: 'span 3', minHeight: '60px' }} />
              <button type="submit" className="btn-add-aula" style={{ gridColumn: 'span 3' }}>Criar Oferta</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f0f0f0' }}>
                  <th style={{ padding: '10px' }}>Curso</th>
                  <th style={{ padding: '10px' }}>Tipo</th>
                  <th style={{ padding: '10px' }}>Preço Oferta</th>
                  <th style={{ padding: '10px' }}>Título</th>
                </tr>
              </thead>
              <tbody>
                {ofertas.map(of => (
                  <tr key={of.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{of.curso_nome}</td>
                    <td style={{ padding: '10px' }}>{of.tipo === 'order_bump' ? 'Order Bump' : 'Upsell'}</td>
                    <td style={{ padding: '10px' }}>R$ {of.preco_oferta}</td>
                    <td style={{ padding: '10px' }}>{of.titulo_oferta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : abaAtiva === 'analytics' ? (
          <div className="analytics-dashboard">
            <h3>📈 Performance Financeira</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px', marginTop: '20px' }}>
              <div style={{ background: '#e0fcf0', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Faturamento Total</span>
                <h2 style={{ color: '#00cc66', margin: '10px 0' }}>R$ {analytics.geral?.faturamento_total || '0.00'}</h2>
              </div>
              <div style={{ background: '#f0f4ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Total de Vendas</span>
                <h2 style={{ color: '#3b82f6', margin: '10px 0' }}>{analytics.geral?.total_vendas || 0}</h2>
              </div>
              <div style={{ background: '#fff9e6', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Ticket Médio</span>
                <h2 style={{ color: '#f59e0b', margin: '10px 0' }}>R$ {parseFloat(analytics.geral?.ticket_medio || 0).toFixed(2)}</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: '#f5f3ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Progresso Médio dos Alunos</span>
                <h2 style={{ color: '#8b5cf6', margin: '10px 0' }}>{parseFloat(pedagogico.progresso_medio).toFixed(1)}%</h2>
              </div>
              <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Taxa de Aprovação em Quizzes</span>
                <h2 style={{ color: '#f97316', margin: '10px 0' }}>{pedagogico.quiz_aprovacao}%</h2>
              </div>
            </div>

            <h4>Histórico de Vendas Mensais</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f0f0f0' }}>
                  <th style={{ padding: '10px' }}>Mês</th>
                  <th style={{ padding: '10px' }}>Quantidade</th>
                  <th style={{ padding: '10px' }}>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {analytics.mensal?.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Ainda não há dados de vendas.</td></tr>
                ) : analytics.mensal?.map(m => (
                  <tr key={m.mes} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{m.mes}</td>
                    <td style={{ padding: '10px' }}>{m.quantidade}</td>
                    <td style={{ padding: '10px' }}>R$ {m.faturamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="branding-dashboard" style={{ padding: '20px', background: '#f9f9f9', borderRadius: '12px' }}>
            <h3>Identidade Visual do Curso</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Personalize como os seus alunos verão o portal deste curso.</p>

            <form onSubmit={salvarBranding} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div>
                <label>Cor Primária (Botões, Barras de Progresso):</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                  <input type="color" value={branding.cor_primaria} onChange={e => setBranding({ ...branding, cor_primaria: e.target.value })} style={{ height: '40px', width: '60px', cursor: 'pointer' }} />
                  <input type="text" value={branding.cor_primaria} onChange={e => setBranding({ ...branding, cor_primaria: e.target.value })} className="input-aula" style={{ flex: 1 }} />
                </div>
              </div>

              <div>
                <label>Cor Secundária (Fundo Sidebar):</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                  <input type="color" value={branding.cor_secundaria} onChange={e => setBranding({ ...branding, cor_secundaria: e.target.value })} style={{ height: '40px', width: '60px', cursor: 'pointer' }} />
                  <input type="text" value={branding.cor_secundaria} onChange={e => setBranding({ ...branding, cor_secundaria: e.target.value })} className="input-aula" style={{ flex: 1 }} />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label>URL do Logotipo:</label>
                <input type="url" placeholder="https://exemplo.com/logo.png" value={branding.logo_url} onChange={e => setBranding({ ...branding, logo_url: e.target.value })} className="input-aula" style={{ marginTop: '5px' }} />
              </div>

              <div>
                <label>Subdomínio Customizado (Ex: meucurso):</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  <input type="text" placeholder="meucurso" value={branding.subdominio} onChange={e => setBranding({ ...branding, subdominio: e.target.value })} className="input-aula" />
                  <span>.academy.com</span>
                </div>
              </div>

              <div>
                <label>Vídeo de Vendas no Checkout (Embed URL):</label>
                <input type="url" placeholder="https://youtube.com/embed/..." value={branding.checkout_video_url} onChange={e => setBranding({ ...branding, checkout_video_url: e.target.value })} className="input-aula" style={{ marginTop: '5px' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="btn-add-modulo" style={{ padding: '15px' }}>Aplicar Nova Identidade Visual</button>
              </div>

            </form>

            <div style={{ marginTop: '30px', padding: '15px', border: '1px dashed #ccc', borderRadius: '8px' }}>
              <h4>Pré-visualização de Cores:</h4>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '100px', height: '100px', background: branding.cor_primaria, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>Primária</div>
                <div style={{ width: '100px', height: '100px', background: branding.cor_secundaria, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>Secundária</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Questões do Quiz */}
      {aulaParaQuiz && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Configurar Quiz: {aulaParaQuiz.titulo}</h3>
              <button onClick={() => setAulaParaQuiz(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={adicionarPergunta}>
              <p><strong>Nova Pergunta:</strong></p>
              <textarea value={pergunta} onChange={e => setPergunta(e.target.value)} required style={{ width: '100%', padding: '10px' }} />
              <p><strong>Opções (4):</strong></p>
              {opcoes.map((op, i) => (
                <input key={i} type="text" value={op} onChange={e => {
                  const n = [...opcoes]; n[i] = e.target.value; setOpcoes(n);
                }} required style={{ width: '100%', padding: '10px', marginBottom: '5px' }} placeholder={`Opção ${i + 1}`} />
              ))}
              <p><strong>Opção Correta:</strong></p>
              <select value={correta} onChange={e => setCorreta(e.target.value)} required style={{ width: '100%', padding: '10px' }}>
                <option value="">Selecione a correta...</option>
                {opcoes.map((op, i) => op && <option key={i} value={op}>{op}</option>)}
              </select>
              <button type="submit" className="btn-salvar-aula" style={{ marginTop: '20px', width: '100%' }}>Adicionar Pergunta à Base de Dados</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}