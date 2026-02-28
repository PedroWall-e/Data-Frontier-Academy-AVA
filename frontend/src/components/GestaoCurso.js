import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function GestaoCurso() {
  const { id } = useParams();
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
  const [perguntasQuiz, setPerguntasQuiz] = useState([]);
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState(['', '', '', '']);
  const [correta, setCorreta] = useState(0); // Agora guarda o índice (0, 1, 2, 3)
  const [abaAtiva, setAbaAtiva] = useState('construtor');
  const [alunosMatriculados, setAlunosMatriculados] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [novoCupom, setNovoCupom] = useState({ codigo: '', desconto: 0, validade: '', limite: 0 });
  const [branding, setBranding] = useState({
    cor_primaria: '#00cc66',
    cor_secundaria: '#222222',
    logo_url: '',
    subdominio: '',
    checkout_video_url: '',
    descricao: '',
    requisitos: '',
    publico_alvo: ''
  });
  const [planos, setPlanos] = useState([]);
  const [novoPlano, setNovoPlano] = useState({ titulo: '', tipo: 'unico', preco: '', trial: 0 });
  const [ofertas, setOfertas] = useState([]);
  const [novaOferta, setNovaOferta] = useState({ curso_oferta_id: '', tipo: 'order_bump', titulo: '', descricao: '', preco: '' });
  const [todosCursos, setTodosCursos] = useState([]);
  const [analytics, setAnalytics] = useState({ geral: {}, mensal: [] });
  const [pedagogico, setPedagogico] = useState({ progresso_medio: 0, quiz_aprovacao: 0 });
  const [turmas, setTurmas] = useState([]);
  const [novaTurma, setNovaTurma] = useState({ nome: '', data_inicio: '', data_fim: '' });

  // Estados para Correção de Tarefas
  const [aulaParaCorrecao, setAulaParaCorrecao] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [feedbackNota, setFeedbackNota] = useState({ id: null, nota: '', feedback: '' });

  const [gradebook, setGradebook] = useState([]);

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
      api.get(`/turmas/curso/${id}`)
        .then(res => setTurmas(res.data))
        .catch(erro => console.error(erro));
      api.get(`/cursos/produtor/curso/${id}/gradebook`)
        .then(res => setGradebook(res.data))
        .catch(erro => console.error(erro));
    }
  }, [id, token]);

  useEffect(() => {
    if (curso) {
      setBranding({
        cor_primaria: curso.cor_primaria || '#3347FF',
        cor_secundaria: curso.cor_secundaria || '#2B2B2B',
        logo_url: curso.logo_url || '',
        subdominio: curso.subdominio || '',
        checkout_video_url: curso.checkout_video_url || '',
        descricao: curso.descricao || '',
        requisitos: curso.requisitos || '',
        publico_alvo: curso.publico_alvo || ''
      });
    }
  }, [curso]);

  const carregarPerguntasQuiz = (aulaId) => {
    api.get(`/cursos/aulas/${aulaId}/quiz-admin`)
      .then(res => setPerguntasQuiz(res.data))
      .catch(erro => console.error(erro));
  };

  useEffect(() => {
    if (aulaParaQuiz) {
      carregarPerguntasQuiz(aulaParaQuiz.id);
    }
  }, [aulaParaQuiz]);

  const matricularManual = async (e) => {
    e.preventDefault();
    const email = prompt("Email do aluno:");
    const nome = prompt("Nome do aluno:");
    if (!email) return;
    try {
      await api.post(`/cursos/produtor/curso/${id}/matricular-manual`, { email, nome });
      alert("Aluno matriculado!");
      const res = await api.get(`/cursos/produtor/curso/${id}/alunos`);
      setAlunosMatriculados(res.data);
    } catch (e) { alert("Erro na matrícula."); }
  };

  const alterarStatusMatricula = async (matriculaId, statusAtual) => {
    try {
      await api.put(`/cursos/produtor/matricula/${matriculaId}/status`, { suspensa: !statusAtual });
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

  const criarTurma = async (e) => {
    e.preventDefault();
    try {
      await api.post('/turmas', { ...novaTurma, curso_id: id });
      setNovaTurma({ nome: '', data_inicio: '', data_fim: '' });
      const res = await api.get(`/turmas/curso/${id}`);
      setTurmas(res.data);
    } catch (erro) { alert("Erro ao criar turma."); }
  };

  const vincularTurma = async (matriculaId, turmaId) => {
    try {
      await api.put('/turmas/vincular-aluno', { matricula_id: matriculaId, turma_id: turmaId || null });
      const res = await api.get(`/cursos/produtor/curso/${id}/alunos`);
      setAlunosMatriculados(res.data);
    } catch (erro) { alert("Erro ao vincular turma."); }
  };

  const excluirTurma = async (turmaId) => {
    if (!window.confirm("Remover turma?")) return;
    try {
      await api.delete(`/turmas/${turmaId}`);
      const res = await api.get(`/turmas/curso/${id}`);
      setTurmas(res.data);
    } catch (erro) { alert("Erro ao remover turma."); }
  };

  const abrirCorrecao = async (aula) => {
    setAulaParaCorrecao(aula);
    try {
      const res = await api.get(`/tarefas/aula/${aula.id}/entregas`);
      setEntregas(res.data);
    } catch (erro) { alert("Erro ao buscar entregas."); }
  };

  const enviarFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tarefas/feedback/${feedbackNota.id}`, {
        nota: feedbackNota.nota,
        feedback: feedbackNota.feedback
      });
      alert("Feedback enviado!");
      setFeedbackNota({ id: null, nota: '', feedback: '' });
      abrirCorrecao(aulaParaCorrecao);
    } catch (erro) { alert("Erro ao enviar feedback."); }
  };

  const criarModulo = async (e) => {
    e.preventDefault();
    if (!novoModuloTitulo.trim()) return;
    await api.post('/cursos/modulos', { curso_id: id, titulo: novoModuloTitulo, ordem: curso.modulos.length + 1 });
    setNovoModuloTitulo('');
    carregarCurso();
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
    carregarCurso();
  };

  const adicionarPergunta = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cursos/aulas/${aulaParaQuiz.id}/quiz`, {
        pergunta,
        opcoes,
        resposta_correta: parseInt(correta),
        explicacao: ""
      });
      setPergunta('');
      setOpcoes(['', '', '', '']);
      setCorreta(0);
      carregarPerguntasQuiz(aulaParaQuiz.id);
    } catch (erro) { alert("Erro ao adicionar pergunta."); }
  };

  const excluirPergunta = async (questaoId) => {
    if (!window.confirm("Remover esta questão?")) return;
    try {
      await api.delete(`/cursos/aulas/quiz/${questaoId}`);
      carregarPerguntasQuiz(aulaParaQuiz.id);
    } catch (erro) { alert("Erro ao excluir pergunta."); }
  };

  if (!curso) return <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] font-sans text-gray-500 font-bold">A carregar construtor...</div>;

  const tabs = [
    { id: 'construtor', label: '🔨 Construtor' },
    { id: 'alunos', label: `👥 Alunos (${alunosMatriculados.length})` },
    { id: 'turmas', label: `📅 Turmas (${turmas.length})` },
    { id: 'gradebook', label: '📊 Diário Acadêmico' },
    { id: 'cupons', label: `🎟️ Cupons (${cupons.length})` },
    { id: 'planos', label: `🏷️ Planos (${planos.length})` },
    { id: 'ofertas', label: `💰 Ofertas (${ofertas.length})` },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'branding', label: '🎨 Branding' }
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2B2B2B]">

      {/* HEADER */}
      <header className="bg-[#1C1D1F] text-white px-6 h-16 flex justify-between items-center shadow-md sticky top-0 z-20">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <span className="text-[#3347FF] text-xl">⚙</span> Gestão: {curso.titulo}
        </h2>
        <Link to="/admin" className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-white/30">
          ← Voltar ao Painel
        </Link>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 flex flex-wrap border-b-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)}
              className={`flex-1 py-4 px-2 text-sm font-bold text-center border-b-2 transition-colors whitespace-nowrap ${abaAtiva === tab.id ? 'border-[#3347FF] text-[#3347FF] bg-blue-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl md:p-8 p-6 shadow-sm border border-gray-200 min-h-[500px]">
          {/* Aba CONSTRUTOR */}
          {abaAtiva === 'construtor' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2B2B2B]">Estrutura Curricular</h2>
                  <p className="text-gray-500 mt-1">Gira os módulos e a hierarquia das aulas do curso.</p>
                </div>
              </div>

              <form onSubmit={criarModulo} className="flex flex-col sm:flex-row gap-3 mb-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <input type="text" placeholder="Nome do Novo Módulo (Ex: Módulo 1 - Introdução)" required value={novoModuloTitulo} onChange={e => setNovoModuloTitulo(e.target.value)} className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium" />
                <button type="submit" className="bg-[#2B2B2B] hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap">
                  + Adicionar Módulo
                </button>
              </form>

              <div className="space-y-6">
                {curso.modulos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-medium border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    Ainda não há módulos neste curso. Crie o primeiro módulo acima.
                  </div>
                ) : curso.modulos.map((modulo, index) => (
                  <div key={modulo.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#F9F8F6] p-4 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200">
                      <h3 className="text-lg flex items-center gap-2">
                        <span className="text-[#3347FF]">Módulo {index + 1} •</span>
                        <span className="text-[#2B2B2B]">{modulo.titulo}</span>
                      </h3>
                      <button
                        onClick={() => setModuloSelecionado(moduloSelecionado === modulo.id ? null : modulo.id)}
                        className="text-sm border border-gray-300 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        {moduloSelecionado === modulo.id ? 'Cancelar Edição' : '+ Nova Aula'}
                      </button>
                    </div>

                    {moduloSelecionado === modulo.id && (
                      <div className="p-5 bg-blue-50/50 border-b border-gray-200">
                        <form onSubmit={criarAula} className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" placeholder="Título da Aula" required value={novaAulaTitulo} onChange={e => setNovaAulaTitulo(e.target.value)} className="flex-[2] px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium" />
                            <select value={novaAulaTipo} onChange={e => setNovaAulaTipo(e.target.value)} className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium">
                              <option value="video">Vídeo (YouTube/Embed)</option>
                              <option value="texto">Texto / Artigo</option>
                              <option value="audio">Áudio (URL)</option>
                              <option value="quiz">Quiz</option>
                              <option value="anexo">Anexo para Download</option>
                              <option value="tarefa">Tarefa / Entrega de Trabalho</option>
                            </select>
                            <input type="number" placeholder="Drip (Dias)" title="Liberar após X dias da compra" value={novaAulaDrip} onChange={e => setNovaAulaDrip(e.target.value)} className="w-24 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium text-center" />
                          </div>

                          {novaAulaTipo === 'texto' ? (
                            <textarea placeholder="Escreva aqui o conteúdo do seu artigo (suporta HTML básico)..." required value={novaAulaConteudo} onChange={e => setNovaAulaConteudo(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium min-h-[150px] resize-y" />
                          ) : (
                            <input type={novaAulaTipo === 'video' || novaAulaTipo === 'audio' || novaAulaTipo === 'anexo' ? "url" : "text"} placeholder={novaAulaTipo === 'video' ? "Link do Vídeo (Ex: https://www.youtube.com/embed/...)" : "Conteúdo ou Link"} required value={novaAulaConteudo} onChange={e => setNovaAulaConteudo(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium" />
                          )}

                          <div className="flex gap-3">
                            <button type="submit" className="bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">Guardar Aula</button>
                            <button type="button" onClick={() => setModuloSelecionado(null)} className="bg-white border border-gray-300 hover:bg-gray-100 text-[#2B2B2B] font-bold py-2.5 px-6 rounded-lg transition-colors">Cancelar</button>
                          </div>
                        </form>
                      </div>
                    )}

                    <ul className="divide-y divide-gray-100">
                      {modulo.aulas.length === 0 ? <li className="p-4 text-gray-500 text-sm text-center">Nenhuma aula cadastrada.</li> : modulo.aulas.map(aula => (
                        <li key={aula.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#F0F3FF] text-[#3347FF] flex items-center justify-center text-sm">
                              {aula.tipo === 'video' && '▶'}
                              {aula.tipo === 'texto' && '📄'}
                              {aula.tipo === 'audio' && '🔊'}
                              {aula.tipo === 'quiz' && '❓'}
                              {aula.tipo === 'anexo' && '📎'}
                              {aula.tipo === 'tarefa' && '📤'}
                            </div>
                            <div>
                              <strong className="text-[#2B2B2B] font-medium block">{aula.titulo}</strong>
                              <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">{aula.tipo}{aula.data_liberacao_drip > 0 && ` • Drip: ${aula.data_liberacao_drip} dias`}</span>
                            </div>
                          </div>
                          {aula.tipo === 'quiz' && (
                            <button onClick={() => setAulaParaQuiz(aula)} className="opacity-0 group-hover:opacity-100 text-xs font-bold bg-[#3347FF] text-white px-3 py-1.5 rounded transition-all">⚙️ Questões</button>
                          )}
                          {aula.tipo === 'tarefa' && (
                            <button onClick={() => abrirCorrecao(aula)} className="opacity-0 group-hover:opacity-100 text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded transition-all">📋 Corrigir</button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aba ALUNOS */}
          {abaAtiva === 'alunos' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2B2B2B]">Base de Alunos</h2>
                  <p className="text-gray-500 mt-1">Gira o acesso de quem comprou o seu curso.</p>
                </div>
                <button onClick={matricularManual} className="bg-[#2B2B2B] hover:bg-black text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                  + Matrícula Manual
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left bg-white whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="px-6 py-4">Nome do Aluno</th>
                      <th className="px-6 py-4">Email de Acesso</th>
                      <th className="px-6 py-4">Progresso de Estudo</th>
                      <th className="px-6 py-4 text-right">Ações Acesso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alunosMatriculados.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">Nenhum aluno matriculado.</td></tr>
                    ) : alunosMatriculados.map(aluno => (
                      <tr key={aluno.id} className={`transition-colors ${aluno.suspensa ? 'bg-red-50/30 opacity-70' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-6 py-4 font-bold text-[#2B2B2B]">{aluno.nome}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{aluno.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                              <div className={`h-full ${aluno.progresso === 100 ? 'bg-green-500' : 'bg-[#3347FF]'}`} style={{ width: `${aluno.progresso}%` }}></div>
                            </div>
                            <span className={`text-xs font-bold ${aluno.progresso === 100 ? 'text-green-600' : 'text-gray-600'}`}>{aluno.progresso}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={aluno.turma_id || ''}
                            onChange={(e) => vincularTurma(aluno.matricula_id, e.target.value)}
                            className="mr-2 px-2 py-1 text-xs border rounded bg-white"
                          >
                            <option value="">Sem Turma</option>
                            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                          </select>
                          <button
                            onClick={() => alterarStatusMatricula(aluno.matricula_id, aluno.suspensa)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${aluno.suspensa ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}>
                            {aluno.suspensa ? 'Reativar Acesso' : 'Suspender Aluno'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba TURMAS */}
          {abaAtiva === 'turmas' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-[#2B2B2B]">Gestão de Turmas (Cohorts)</h2>
              <p className="text-gray-500 mb-6">Agrupe alunos em turmas com datas específicas de início e fim.</p>

              <form onSubmit={criarTurma} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border border-gray-200 rounded-xl items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nome da Turma</label>
                  <input type="text" required value={novaTurma.nome} onChange={e => setNovaTurma({ ...novaTurma, nome: e.target.value })} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20" placeholder="Ex: Turma A - 2024" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Data Início</label>
                  <input type="date" required value={novaTurma.data_inicio} onChange={e => setNovaTurma({ ...novaTurma, data_inicio: e.target.value })} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Data Fim (Opcional)</label>
                  <input type="date" value={novaTurma.data_fim} onChange={e => setNovaTurma({ ...novaTurma, data_fim: e.target.value })} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <button type="submit" className="bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-md">Criar Turma</button>
              </form>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">Início</th>
                      <th className="px-6 py-4">Fim</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {turmas.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">Nenhuma turma criada ainda.</td></tr>
                    ) : turmas.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold">{t.nome}</td>
                        <td className="px-6 py-4">{new Date(t.data_inicio).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{t.data_fim ? new Date(t.data_fim).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => excluirTurma(t.id)} className="text-red-500 hover:underline text-xs font-bold">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba DIÁRIO ACADÊMICO */}
          {abaAtiva === 'gradebook' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#2B2B2B]">Diário Acadêmico</h2>
                  <p className="text-gray-500 text-sm">Acompanhamento consolidado de notas e progresso.</p>
                </div>
                <button onClick={() => window.print()} className="bg-white border border-gray-300 text-[10px] font-black px-4 py-2 rounded-lg hover:bg-gray-50 transition-all uppercase tracking-widest">Gerar Relatório PDF</button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full text-left bg-white whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-400 font-black">
                      <th className="px-6 py-5">Aluno / Turma</th>
                      <th className="px-6 py-5">Status / Progresso</th>
                      <th className="px-6 py-5">Média Quiz</th>
                      <th className="px-6 py-5">Média Tarefas</th>
                      <th className="px-6 py-5 text-right">Média Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {gradebook.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-20 text-gray-400 italic">Nenhum dado acadêmico disponível ainda.</td></tr>
                    ) : gradebook.map(row => {
                      const mQuiz = parseFloat(row.media_quiz || 0);
                      const mTarefa = parseFloat(row.media_tarefas || 0);
                      const final = (mQuiz + mTarefa) / (row.media_quiz && row.media_tarefas ? 2 : 1);

                      return (
                        <tr key={row.aluno_id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-[#2B2B2B] text-sm">{row.aluno_nome}</div>
                            <div className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{row.turma_nome || 'Sem Turma'}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-gray-700">{row.progresso}%</span>
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full ${row.progresso === 100 ? 'bg-green-500' : 'bg-[#3347FF]'}`} style={{ width: `${row.progresso}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-sm font-black ${mQuiz >= 7 ? 'text-green-600' : 'text-gray-400'}`}>
                              {mQuiz > 0 ? mQuiz.toFixed(1) : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-sm font-black ${mTarefa >= 7 ? 'text-orange-600' : 'text-gray-400'}`}>
                              {mTarefa > 0 ? mTarefa.toFixed(1) : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black shadow-sm ${final >= 7 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                              {final > 0 ? final.toFixed(1) : 'S/N'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba CUPONS */}


          {abaAtiva === 'cupons' && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#2B2B2B] mb-2">Cupons de Desconto</h2>
              <p className="text-gray-500 mb-8">Crie promoções exclusivas limitadas por tempo ou quantidade.</p>

              <form onSubmit={criarCupom} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-6 bg-gray-50 border border-gray-200 rounded-xl mb-8">
                <input type="text" placeholder="Código (Ex: VIP50)" required value={novoCupom.codigo} onChange={e => setNovoCupom({ ...novoCupom, codigo: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium" />
                <input type="number" placeholder="% Desconto" required value={novoCupom.desconto} onChange={e => setNovoCupom({ ...novoCupom, desconto: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium" />
                <input type="date" required value={novoCupom.validade} onChange={e => setNovoCupom({ ...novoCupom, validade: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium text-sm text-gray-500" />
                <input type="number" placeholder="Limite Usos (0=∞)" value={novoCupom.limite} onChange={e => setNovoCupom({ ...novoCupom, limite: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium" />
                <button type="submit" className="bg-[#3347FF] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors py-2.5">Criar Cupom</button>
              </form>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left bg-white whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="px-6 py-4">Código (Voucher)</th>
                      <th className="px-6 py-4">Percentual Desconto</th>
                      <th className="px-6 py-4">Data Limite Validade</th>
                      <th className="px-6 py-4">Usos Registrados</th>
                      <th className="px-6 py-4">Limite Disponível</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cupons.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">Nenhum cupom ativo.</td></tr>
                    ) : cupons.map(cupom => (
                      <tr key={cupom.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4"><span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-bold uppercase">{cupom.codigo}</span></td>
                        <td className="px-6 py-4 font-bold text-[#2B2B2B]">{cupom.desconto_percentual}%</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(cupom.validade).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium">{cupom.usos_atuais} un</td>
                        <td className="px-6 py-4 text-sm text-gray-500 border-l border-gray-100">{cupom.limite_usos === 0 ? 'ILIMITADOS' : cupom.limite_usos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba PLANOS */}
          {abaAtiva === 'planos' && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#2B2B2B] mb-2">Checkout e Planos</h2>
              <p className="text-gray-500 mb-8">Defina formas de pagamento, seja acesso vitalício ou modalidade assinatura.</p>

              <form onSubmit={criarPlano} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-6 bg-gray-50 border border-gray-200 rounded-xl mb-8 items-end">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Título da Oferta</label>
                  <input type="text" placeholder="Ex: Acesso Vitalício VIP" required value={novoPlano.titulo} onChange={e => setNovoPlano({ ...novoPlano, titulo: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Faturamento</label>
                  <select value={novoPlano.tipo} onChange={e => setNovoPlano({ ...novoPlano, tipo: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium">
                    <option value="unico">Venda Única</option>
                    <option value="mensal">Assinatura Mensal</option>
                    <option value="anual">Assinatura Anual</option>
                  </select>
                </div>
                <div className="flex gap-2 col-span-1 md:col-span-1">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" placeholder="99.99" required value={novoPlano.preco} onChange={e => setNovoPlano({ ...novoPlano, preco: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Trial</label>
                    <input type="number" placeholder="dias" value={novoPlano.trial} onChange={e => setNovoPlano({ ...novoPlano, trial: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium text-center" />
                  </div>
                </div>
                <button type="submit" className="bg-[#2B2B2B] hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors col-span-1">Criar Plano</button>
              </form>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left bg-white whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="px-6 py-4">Nome do Plano Título</th>
                      <th className="px-6 py-4">Recorrência Modelo</th>
                      <th className="px-6 py-4">Preço Definido</th>
                      <th className="px-6 py-4">Trial Gratuito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {planos.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">Nenhum plano. Crie um para poder vender.</td></tr>
                    ) : planos.map(plano => (
                      <tr key={plano.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-[#2B2B2B]">{plano.titulo}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">{plano.tipo === 'unico' ? 'Único' : (plano.tipo === 'mensal' ? 'Mensal' : 'Anual')}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#3347FF]">R$ {plano.preco}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{plano.trial_dias > 0 ? `${plano.trial_dias} dias oferecidos` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba OFERTAS */}
          {abaAtiva === 'ofertas' && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#2B2B2B] mb-2">Order Bumps & Upsells</h2>
              <p className="text-gray-500 mb-8">Ofereça cursos extra no momento exato de finalização ou pré-venda.</p>

              <form onSubmit={criarOferta} className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Qual Produto complementar?</label>
                    <select required value={novaOferta.curso_oferta_id} onChange={e => setNovaOferta({ ...novaOferta, curso_oferta_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium">
                      <option value="">Selecionar Curso...</option>
                      {todosCursos.filter(c => c.id != id).map(c => (
                        <option key={c.id} value={c.id}>{c.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Mecânica</label>
                    <select value={novaOferta.tipo} onChange={e => setNovaOferta({ ...novaOferta, tipo: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium">
                      <option value="order_bump">Order Bump (Na página checkout)</option>
                      <option value="upsell">Upsell (Página Pós-Confirmação)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Preço com desconto (R$)</label>
                    <input type="number" step="0.01" placeholder="Ex: 19.90" required value={novaOferta.preco} onChange={e => setNovaOferta({ ...novaOferta, preco: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Chamada do Bump/Upsell</label>
                  <input type="text" placeholder="Ex: Leve também o curso X por mais 50% off!" required value={novaOferta.titulo} onChange={e => setNovaOferta({ ...novaOferta, titulo: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Micro Copy de Apoio (Descrição)</label>
                  <textarea placeholder="Explique os benefícios de adicionar isto ao carrinho agora." value={novaOferta.descricao} onChange={e => setNovaOferta({ ...novaOferta, descricao: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium min-h-[80px]" />
                </div>
                <button type="submit" className="w-full bg-[#1C1D1F] hover:bg-black text-white font-bold py-3.5 rounded-lg transition-colors mt-2">Ativar Estratégia de Offerta Adicional</button>
              </form>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left bg-white whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="px-6 py-4">Produto Oferta Combo</th>
                      <th className="px-6 py-4">Estratégia Exibição</th>
                      <th className="px-6 py-4">Preço Promocional</th>
                      <th className="px-6 py-4 w-96">Copy / Promessa Listada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ofertas.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-500">Sem ofertas. Multiplique vendas criando uma!</td></tr>
                    ) : ofertas.map(of => (
                      <tr key={of.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-[#2B2B2B]">{of.curso_nome}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 flex items-center gap-1 rounded text-xs font-bold ${of.tipo === 'order_bump' ? 'bg-[#FFE3D6] text-[#B2624F]' : 'bg-purple-100 text-purple-800'}`}>
                            {of.tipo === 'order_bump' ? '⚡ Order Bump' : '🚀 Upsell'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-[#3347FF]">R$ {of.preco_oferta}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" title={of.titulo_oferta}>{of.titulo_oferta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba ANALYTICS */}
          {abaAtiva === 'analytics' && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#2B2B2B] mb-6 flex items-center gap-2"><span>📈</span> Analytics do Curso</h2>

              <h4 className="font-bold text-gray-500 mb-4 px-1 tracking-wider uppercase text-xs">Desempenho Financeiro</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#F0F3FF] p-6 rounded-2xl border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20 text-4xl">💰</div>
                  <span className="text-sm font-bold text-[#3347FF] mb-1 block">Faturamento Total</span>
                  <h2 className="text-3xl font-extrabold text-[#2B2B2B]">R$ {analytics.geral?.faturamento_total || '0.00'}</h2>
                </div>
                <div className="bg-[#F9F8F6] p-6 rounded-2xl border border-gray-200">
                  <span className="text-sm font-bold text-gray-500 mb-1 block">Total de Alunos Matriculados (Vendas)</span>
                  <h2 className="text-3xl font-extrabold text-[#2B2B2B]">{analytics.geral?.total_vendas || 0} matriculados</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-sm font-bold text-[#B2624F] mb-1 block">Ticket Médio (LTV base)</span>
                  <h2 className="text-3xl font-extrabold text-[#2B2B2B]">R$ {parseFloat(analytics.geral?.ticket_medio || 0).toFixed(2)} / aluno</h2>
                </div>
              </div>

              <h4 className="font-bold text-gray-500 mb-4 px-1 tracking-wider uppercase text-xs">Métricas da Sala de Aula Virtual</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-[#3347FF]/20 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-500 mb-1 block">Progresso Médio Constatado</span>
                    <h2 className="text-3xl font-extrabold text-[#3347FF]">{parseFloat(pedagogico.progresso_medio).toFixed(1)}%</h2>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-[#3347FF] flex items-center justify-center text-xl font-bold text-[#3347FF]">
                    🚀
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-green-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-500 mb-1 block">Taxa Aprovação Avaliações</span>
                    <h2 className="text-3xl font-extrabold text-green-600">{pedagogico.quiz_aprovacao}%</h2>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-500 flex items-center justify-center text-xl font-bold text-green-600">
                    A+
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-gray-500 mb-4 px-1 tracking-wider uppercase text-xs">Vendas Pelo Tempo Base Analytics</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left bg-white whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                      <th className="px-6 py-4">Mês/Período Ref.</th>
                      <th className="px-6 py-4">Quantidade Vendas Fechadas</th>
                      <th className="px-6 py-4">Apuramento Liquidez</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {analytics.mensal?.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400 font-medium">Cronograma de vendas limpo.</td></tr>
                    ) : analytics.mensal?.map(m => (
                      <tr key={m.mes} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-[#2B2B2B]">{m.mes}</td>
                        <td className="px-6 py-4 text-gray-600"><span className="inline-block bg-gray-100 rounded px-2 py-1 font-mono text-sm">{m.quantidade}</span> packs</td>
                        <td className="px-6 py-4 font-extrabold text-green-700">R$ {m.faturamento}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba BRANDING */}
          {abaAtiva === 'branding' && (
            <div>
              <h2 className="text-2xl font-extrabold text-[#2B2B2B] mb-2">Interface Experience Setup (Branding UI)</h2>
              <p className="text-gray-500 mb-8">Personalize CSS em runtime com que os seus alunos experimentarão o visualizador deste curso.</p>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <form onSubmit={salvarBranding} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Cor Primária (Theme Buttons, Barras de Progresso Loading, Accents)</label>
                      <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                        <input type="color" value={branding.cor_primaria} onChange={e => setBranding({ ...branding, cor_primaria: e.target.value })} className="w-16 h-[50px] p-0 border-0 outline-none cursor-pointer" />
                        <input type="text" value={branding.cor_primaria} onChange={e => setBranding({ ...branding, cor_primaria: e.target.value })} className="flex-1 px-4 border-l border-gray-200 font-mono text-sm focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Cor Secundária (Fundo Menu Sidebar Lateral Dark)</label>
                      <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                        <input type="color" value={branding.cor_secundaria} onChange={e => setBranding({ ...branding, cor_secundaria: e.target.value })} className="w-16 h-[50px] p-0 border-0 outline-none cursor-pointer" />
                        <input type="text" value={branding.cor_secundaria} onChange={e => setBranding({ ...branding, cor_secundaria: e.target.value })} className="flex-1 px-4 border-l border-gray-200 font-mono text-sm focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <label className="block text-sm font-bold text-[#2B2B2B] mb-2">URL Logotipo Personalizado Sidebar Oficial (PNG transparência recomendada)</label>
                    <input type="url" placeholder="https://seudominio.com/logo-white.png" value={branding.logo_url} onChange={e => setBranding({ ...branding, logo_url: e.target.value })} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium" />
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-bold text-[#2B2B2B] mb-4">Informações da Página de Vendas</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Descrição Completa do Curso (O que os alunos vão aprender)</label>
                        <textarea placeholder="Detalhe os módulos, metodologias e benefícios do seu curso..." value={branding.descricao} onChange={e => setBranding({ ...branding, descricao: e.target.value })} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium min-h-[120px] resize-y" />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Público-Alvo (Para quem é este curso?)</label>
                        <textarea placeholder="Ex: Iniciantes em programação, designers que querem aprender a codar..." value={branding.publico_alvo} onChange={e => setBranding({ ...branding, publico_alvo: e.target.value })} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium min-h-[80px] resize-y" />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Pré-requisitos (O que o aluno precisa saber antes?)</label>
                        <textarea placeholder="Ex: Nenhum conhecimento prévio necessário, ou: Conhecimento básico em HTML/CSS..." value={branding.requisitos} onChange={e => setBranding({ ...branding, requisitos: e.target.value })} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium min-h-[80px] resize-y" />
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Hub de Distribuição (Em qual ecossistema este curso será exibido?)</label>
                        <select value={branding.escopo || 'LIVRE'} onChange={e => setBranding({ ...branding, escopo: e.target.value })} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium font-bold text-[#3347FF]">
                          <option value="LIVRE">Hub: Cursos Livres e Profissionalizantes</option>
                          <option value="TECNICO">Hub: Cursos Técnicos (MEC)</option>
                          <option value="POS">Hub: Pós-Graduação (Lato Sensu)</option>
                          <option value="UNIVERSIDADE">Hub: Universidade Integrada (In-Company)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-bold text-[#2B2B2B] mb-4">Vídeo de Vendas (VSL) e Customizações Técnicas</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Sub-domínio App Branca Personalizado CNAME Front</label>
                    <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                      <span className="flex items-center justify-center px-4 bg-gray-100 text-gray-500 border-r border-gray-200 font-bold font-mono text-sm">https://</span>
                      <input type="text" placeholder="meucurso" value={branding.subdominio} onChange={e => setBranding({ ...branding, subdominio: e.target.value })} className="flex-1 px-4 py-3 focus:outline-none font-medium" />
                      <span className="flex items-center justify-center px-4 bg-gray-100 text-gray-500 border-l border-gray-200 font-bold font-mono text-sm">.datafrontier.academy</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Vídeo Hero VSL Global Checkout Pitch Sales (Embedded iFrame Code/Ref URl)</label>
                    <input type="url" placeholder="https://youtube.com/embed/XXXXXX" value={branding.checkout_video_url} onChange={e => setBranding({ ...branding, checkout_video_url: e.target.value })} className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium" />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                      <button type="submit" className="bg-[#1C1D1F] hover:bg-black text-white font-bold py-3.5 px-8 rounded-lg transition-colors shadow-lg w-full sm:w-auto text-lg">
                        Aplicar Template Identidade Visual Global
                      </button>

                      {/* Preview Badge Mini UI */}
                      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Live UI Preview</span>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded shadow-sm border border-white" style={{ background: branding.cor_primaria }} title="Cor Principal Primária Base"></div>
                          <div className="w-8 h-8 rounded shadow-sm border border-white" style={{ background: branding.cor_secundaria }} title="Cor Background Secundária Estrutura"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL PARA QUESTÕES DO QUIZ */}
      {aulaParaQuiz && (
        <div className="fixed inset-0 bg-[#1C1D1F]/90 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#2B2B2B] flex items-center gap-2"><span>❓</span> Setup Questionário: <span className="text-[#3347FF]">{aulaParaQuiz.titulo}</span></h3>
              <button onClick={() => setAulaParaQuiz(null)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors focus:outline-none focus:ring-2">✕</button>
            </div>

            <form onSubmit={adicionarPergunta} className="p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Pergunta</label>
                <textarea value={pergunta} onChange={e => setPergunta(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium min-h-[100px] resize-y" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-3">Opções:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opcoes.map((op, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="flex-shrink-0 w-8 h-12 flex items-center justify-center font-bold text-gray-400 bg-gray-50 rounded-lg border border-gray-200">{String.fromCharCode(65 + i)}</span>
                      <input type="text" value={op} onChange={e => { const n = [...opcoes]; n[i] = e.target.value; setOpcoes(n); }} required className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-[#2B2B2B] mb-2">Opção Correta:</label>
                <select value={correta} onChange={e => setCorreta(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200">
                  {opcoes.map((op, i) => <option key={i} value={i}>{String.fromCharCode(65 + i)} - {op || `Opção ${i + 1}`}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all">Adicionar Questão</button>
            </form>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50 max-h-[300px] overflow-y-auto">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Questões Salvas ({perguntasQuiz.length})</h4>
              <div className="space-y-4">
                {perguntasQuiz.length === 0 ? <p className="text-gray-400 text-sm italic">Nenhuma questão.</p> : perguntasQuiz.map((p, idx) => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 relative">
                    <button onClick={() => excluirPergunta(p.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">✕</button>
                    <p className="font-bold text-[#2B2B2B] text-sm">{idx + 1}. {p.pergunta}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Resposta correta: {String.fromCharCode(65 + p.resposta_correta)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL PARA CORREÇÃO DE TAREFAS */}
      {aulaParaCorrecao && (
        <div className="fixed inset-0 bg-[#1C1D1F]/90 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative animate-in fade-in zoom-in duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-extrabold text-[#2B2B2B] flex items-center gap-2"><span>📂</span> Entregas: <span className="text-orange-500">{aulaParaCorrecao.titulo}</span></h3>
              <button onClick={() => setAulaParaCorrecao(null)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {entregas.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-4xl block mb-4">📭</span>
                  <p className="text-gray-400 font-medium font-italic">Nenhum aluno enviou esta tarefa ainda.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {entregas.map(entrega => (
                    <div key={entrega.id} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50">
                        <div>
                          <div className="font-black text-[#2B2B2B]">{entrega.aluno_nome}</div>
                          <div className="text-xs text-gray-500 font-medium">{entrega.aluno_email} • Enviado em {new Date(entrega.data_entrega).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {entrega.arquivo_url && (
                            <a href={`http://localhost:5000${entrega.arquivo_url}`} target="_blank" rel="noopener noreferrer" className="bg-[#1C1D1F] text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-black transition-all">VER FICHEIRO</a>
                          )}
                          {entrega.link_externo && (
                            <a href={entrega.link_externo} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all">LINK EXTERNO</a>
                          )}
                        </div>
                      </div>

                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comentário do Aluno:</label>
                          <div className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 min-h-[80px] italic">
                            {entrega.observacoes || "Sem observações."}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {feedbackNota.id === entrega.id ? (
                            <form onSubmit={enviarFeedback} className="space-y-3 animate-in fade-in slide-in-from-right-4">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="block text-[10px] font-black text-gray-400 mb-1">NOTA (0-10)</label>
                                  <input type="number" step="0.1" min="0" max="10" required value={feedbackNota.nota} onChange={e => setFeedbackNota({ ...feedbackNota, nota: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500/20 font-bold" />
                                </div>
                                <div className="flex-[3]">
                                  <label className="block text-[10px] font-black text-gray-400 mb-1">FEEDBACK / CORREÇÃO</label>
                                  <textarea required value={feedbackNota.feedback} onChange={e => setFeedbackNota({ ...feedbackNota, feedback: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500/20 text-sm h-[42px] resize-none" />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-2 rounded-lg transition-all">SALVAR NOTA</button>
                                <button type="button" onClick={() => setFeedbackNota({ id: null, nota: '', feedback: '' })} className="bg-white border border-gray-300 text-[10px] font-black py-2 px-3 rounded-lg">CANCELAR</button>
                              </div>
                            </form>
                          ) : (
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status da Avaliação:</label>
                              {entrega.nota !== null ? (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex justify-between items-center">
                                  <div>
                                    <div className="text-xs font-black text-green-800">NOTA: {entrega.nota} / 10</div>
                                    <div className="text-[10px] text-green-600 font-medium line-clamp-2">{entrega.feedback}</div>
                                  </div>
                                  <button onClick={() => setFeedbackNota({ id: entrega.id, nota: entrega.nota, feedback: entrega.feedback })} className="text-[10px] font-black text-blue-600 hover:underline">EDITAR</button>
                                </div>
                              ) : (
                                <button onClick={() => setFeedbackNota({ id: entrega.id, nota: '', feedback: '' })} className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-black py-4 rounded-xl transition-all border border-orange-200/50 flex items-center justify-center gap-2">
                                  <span>✍️</span> AVALIAR TAREFA
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}