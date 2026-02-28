import React, { useState, useEffect } from 'react';
import api from '../api';

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

  // Estados para Entrega de Tarefa
  const [tarefaArquivo, setTarefaArquivo] = useState(null);
  const [tarefaLink, setTarefaLink] = useState('');
  const [tarefaObs, setTarefaObs] = useState('');
  const [enviandoTarefa, setEnviandoTarefa] = useState(false);
  const [tarefaEnviada, setTarefaEnviada] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [carregandoAula, setCarregandoAula] = useState(false);

  // Open/Close state for accordions (modules)
  const [expandedModules, setExpandedModules] = useState({});

  const fazerLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  useEffect(() => {
    api.get('/cursos/aluno/meus-cursos')
      .then(res => {
        setMeusCursos(res.data);
        setCarregandoVitrine(false);
      });
  }, [token]);

  const entrarNaSala = (cursoId) => {
    setCarregandoAula(true);
    api.get(`/cursos/${cursoId}`)
      .then(res => {
        setCursoAtivo(res.data);
        setAulaAtual(null); // Reseta o vídeo ao trocar de curso

        // Expand first module by default
        const initialExpanded = {};
        if (res.data.modulos && res.data.modulos.length > 0) {
          initialExpanded[res.data.modulos[0].id] = true;
        }
        setExpandedModules(initialExpanded);

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
            const listaPerguntas = res.data.perguntas.map(p => ({
              ...p,
              opcoes: typeof p.opcoes === 'string' ? JSON.parse(p.opcoes) : p.opcoes
            }));
            setQuizPerguntas(listaPerguntas);

            // Mapear respostas já dadas
            const mapaRespostas = {};
            res.data.respostas.forEach(r => {
              mapaRespostas[r.questao_id] = r.acertou;
            });
            // Opcional: Podemos guardar a escolha real se tivéssemos salvo, 
            // mas aqui sabemos apenas se acertou. Por simplicidade local:
            setQuizResultado(null);
          });
      }
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
      const res = await api.get(`/cursos/aulas/${aulaAtual.id}/comentarios`);
      setComentarios(res.data);
    } catch (erro) { alert("Erro ao enviar comentário."); }
  };

  const responderQuestao = async (questaoId, indexOpcao) => {
    setRespostasQuiz({ ...respostasQuiz, [questaoId]: indexOpcao });
    try {
      await api.post('/cursos/aulas/quiz/responder', {
        questao_id: questaoId,
        resposta_escolhida: indexOpcao
      });
    } catch (erro) { console.error(erro); }
  };

  const submeterQuiz = () => {
    alert("Respostas enviadas com sucesso!");
    if (!aulaAtual.concluida) alternarConclusaoAula();
  };

  const emitirCertificado = async () => {
    try {
      const res = await api.post('/certificados/emitir', { curso_id: cursoAtivo.id });
      window.open(`/certificado/${res.data.codigo}`, '_blank');
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao emitir certificado.");
    }
  };

  const enviarTarefa = async (e) => {
    e.preventDefault();
    setEnviandoTarefa(true);
    const formData = new FormData();
    formData.append('aula_id', aulaAtual.id);
    if (tarefaArquivo) formData.append('arquivo', tarefaArquivo);
    formData.append('link_externo', tarefaLink);
    formData.append('observacoes', tarefaObs);

    try {
      await api.post('/tarefas/entregar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTarefaEnviada(true);
      alert("Tarefa enviada com sucesso!");
      if (!aulaAtual.concluida) alternarConclusaoAula();
    } catch (erro) {
      alert("Erro ao enviar tarefa.");
    } finally {
      setEnviandoTarefa(false);
    }
  };

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  if (carregandoVitrine) return <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] font-sans text-[#2B2B2B]">Carregando área de estudos...</div>;

  // TELA 1: A VITRINE DE CURSOS
  if (!cursoAtivo) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] font-sans">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#2B2B2B]">Meus Cursos</h2>
            <div className="flex items-center gap-6">
              <a href="/" className="text-sm font-bold text-[#3347FF] hover:underline hidden sm:block">+ Descobrir novos cursos</a>
              <button onClick={fazerLogout} className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">Sair</button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          {meusCursos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-[#2B2B2B] mb-2">Você ainda não possui cursos.</h3>
              <p className="text-gray-500 max-w-md mx-auto">Navegue pelo nosso catálogo e adquira um novo curso para começar sua jornada de aprendizado.</p>
              <a href="/" className="inline-block mt-6 bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">Explorar Cursos</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {meusCursos.map(c => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group" onClick={() => entrarNaSala(c.id)}>
                  <div className="h-40 bg-[#F0F3FF] flex items-center justify-center relative overflow-hidden">
                    {c.logo_url ? (
                      <img src={c.logo_url} alt="Capa" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <span className="text-5xl font-extrabold text-[#3347FF] opacity-30 group-hover:scale-110 transition-transform">{c.titulo.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#2B2B2B] text-lg leading-tight mb-2 line-clamp-2">{c.titulo}</h3>
                    <div className="mt-auto pt-4">
                      <button className="w-full bg-[#2B2B2B] hover:bg-black text-white font-bold py-2.5 rounded-lg text-sm transition-colors">Assistir Agora</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // TELA 2: A SALA DE AULA
  if (carregandoAula) return <div className="min-h-screen flex items-center justify-center bg-[#1C1D1F] text-white font-sans">Carregando sala de aula...</div>;

  let totalAulas = 0; let aulasConcluidas = 0;
  cursoAtivo.modulos.forEach(mod => {
    totalAulas += mod.aulas.length;
    aulasConcluidas += mod.aulas.filter(aula => aula.concluida).length;
  });
  const percentagem = totalAulas === 0 ? 0 : Math.round((aulasConcluidas / totalAulas) * 100);

  return (
    <div className="flex h-screen bg-[#F9F8F6] font-sans overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-80 bg-[#1C1D1F] text-white flex flex-col flex-shrink-0 border-r border-gray-800 shadow-xl z-10">

        {/* Top Controls */}
        <div className="p-4 bg-black/20 flex justify-between items-center text-xs font-semibold">
          <button onClick={() => setCursoAtivo(null)} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
            &larr; Voltar
          </button>
          <div className="flex items-center gap-4">
            <a href="/suporte" className="text-gray-400 hover:text-[#3347FF] transition-colors">Suporte</a>
            <button onClick={fazerLogout} className="text-red-400 hover:text-red-300 transition-colors">Sair</button>
          </div>
        </div>

        {/* Course Header & Progress */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold leading-tight mb-4">{cursoAtivo.titulo}</h2>

          <div className="flex justify-between text-xs mb-2 font-bold text-gray-400">
            <span>Progresso</span>
            <span className={percentagem === 100 ? 'text-green-400' : 'text-[#3347FF]'}>{percentagem}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${percentagem === 100 ? 'bg-green-500' : 'bg-[#3347FF]'}`}
              style={{ width: `${percentagem}%` }}
            ></div>
          </div>

          {percentagem === 100 && (
            <button
              onClick={emitirCertificado}
              className="mt-4 w-full bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              🏆 Emitir Certificado
            </button>
          )}
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar custom-scrollbar-dark">
          {cursoAtivo.modulos.map((modulo) => {
            const isOpen = expandedModules[modulo.id];
            return (
              <div key={modulo.id} className="border-b border-gray-800">
                <button
                  onClick={() => toggleModule(modulo.id)}
                  className="w-full text-left bg-[#1C1D1F] hover:bg-white/5 p-4 flex justify-between items-center transition-colors focus:outline-none"
                >
                  <span className="font-bold text-sm text-gray-200 pr-4">{modulo.titulo}</span>
                  <span className="text-gray-500 text-xs font-mono">{isOpen ? '▼' : '▶'}</span>
                </button>

                {isOpen && (
                  <div className="bg-[#151618]">
                    <ul className="py-2">
                      {modulo.aulas.map((aula) => {
                        const dataCompra = new Date(cursoAtivo.matricula.data_compra);
                        const hoje = new Date();
                        const diffTime = Math.abs(hoje - dataCompra);
                        const diasPassados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        const bloqueadaPorDrip = aula.data_liberacao_drip > diasPassados;

                        const isAtiva = aulaAtual?.id === aula.id;

                        // Icon logic
                        let icon = "📄";
                        if (aula.tipo === 'video') icon = "▶";
                        if (aula.tipo === 'audio') icon = "🔊";
                        if (aula.tipo === 'quiz') icon = "❓";
                        if (aula.tipo === 'anexo') icon = "📎";

                        if (bloqueadaPorDrip) icon = "🔒";
                        if (aula.concluida && !bloqueadaPorDrip) icon = "✅";

                        return (
                          <li
                            key={aula.id}
                            className={`
                                    flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2 text-sm
                                    ${bloqueadaPorDrip ? 'opacity-40 cursor-not-allowed border-transparent' : 'hover:bg-white/10'}
                                    ${isAtiva ? 'bg-[#3347FF]/20 border-[#3347FF] text-white' : 'border-transparent text-gray-400'}
                                `}
                            onClick={() => !bloqueadaPorDrip && setAulaAtual(aula)}
                          >
                            <span className={`flex-shrink-0 mt-0.5 ${isAtiva || aula.concluida ? 'text-[#3347FF]' : 'text-gray-500'}`}>{icon}</span>
                            <div className="flex flex-col">
                              <span className={`font-medium leading-tight ${isAtiva ? 'text-white' : ''}`}>{aula.titulo}</span>
                              {bloqueadaPorDrip && <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-500 mt-1">Disponível em {aula.data_liberacao_drip - diasPassados} dias</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {aulaAtual ? (
          <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              {/* Header Classroom */}
              <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl font-extrabold text-[#2B2B2B]">{aulaAtual.titulo}</h1>
                <button
                  onClick={alternarConclusaoAula}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-bold rounded-full transition-colors ${aulaAtual.concluida ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-[#3347FF] hover:bg-blue-700 text-white'}`}
                >
                  {aulaAtual.concluida ? '✅ Concluída' : 'Marcar como Concluída'}
                </button>
              </div>

              {/* Content Player Area */}
              <div className="bg-[#F9F8F6]">
                {aulaAtual.tipo === 'video' && (
                  <div className="w-full aspect-video bg-black">
                    <iframe className="w-full h-full" src={aulaAtual.conteudo} title={aulaAtual.titulo} frameBorder="0" allowFullScreen></iframe>
                  </div>
                )}

                {aulaAtual.tipo === 'texto' && (
                  <div className="p-8 prose max-w-none text-[#2B2B2B] font-medium" dangerouslySetInnerHTML={{ __html: aulaAtual.conteudo }}></div>
                )}

                {aulaAtual.tipo === 'audio' && (
                  <div className="p-12 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full max-w-md text-center">
                      <div className="w-16 h-16 bg-[#F0F3FF] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🎧</span>
                      </div>
                      <h4 className="font-bold text-[#2B2B2B] mb-2">Podcast da Aula</h4>
                      <audio controls src={aulaAtual.conteudo} className="w-full custom-audio-player">Seu navegador não suporta áudio.</audio>
                    </div>
                  </div>
                )}

                {aulaAtual.tipo === 'anexo' && (
                  <div className="p-12 text-center">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 inline-block">
                      <span className="text-4xl mb-4 block">📎</span>
                      <h4 className="font-bold text-[#2B2B2B] mb-2">Material Complementar</h4>
                      <p className="text-sm text-gray-500 mb-6">Faça o download do arquivo de suporte desta aula.</p>
                      <a href={aulaAtual.conteudo} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#2B2B2B] hover:bg-black text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                        Baixar Arquivo
                      </a>
                    </div>
                  </div>
                )}

                {aulaAtual.tipo === 'quiz' && (
                  <div className="p-8 bg-white">
                    <h3 className="text-lg font-bold text-[#2B2B2B] mb-6 flex items-center gap-2">
                      <span>🧠</span> Avaliação de Conhecimento
                    </h3>
                    {quizPerguntas.length === 0 ? <p className="text-gray-500">Este quiz não possui perguntas.</p> : (
                      <div className="space-y-8">
                        {quizPerguntas.map((p, idx) => (
                          <div key={p.id} className="bg-[#F9F8F6] p-6 rounded-xl border border-gray-100">
                            <p className="font-bold text-[#2B2B2B] mb-4 text-lg">{idx + 1}. {p.pergunta}</p>
                            <div className="space-y-2">
                              {p.opcoes.map((op, i) => (
                                <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${respostasQuiz[p.id] === i ? 'bg-blue-50 border-[#3347FF]' : 'bg-white border-gray-200 hover:border-blue-200'}`}>
                                  <input
                                    type="radio"
                                    name={`pergunta-${p.id}`}
                                    value={i}
                                    checked={respostasQuiz[p.id] === i}
                                    onChange={() => responderQuestao(p.id, i)}
                                    className="mt-1 w-4 h-4 text-[#3347FF] focus:ring-[#3347FF]"
                                  />
                                  <span className="text-[#2B2B2B] font-medium">{op}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                          <button onClick={submeterQuiz} className="bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                            Submeter Respostas
                          </button>

                          {quizResultado && (
                            <div className={`px-4 py-3 rounded-lg flex-1 flex items-center gap-3 font-bold border ${quizResultado.percentagem >= (quizPerguntas[0]?.nota_corte || 70) ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                              <span className="text-2xl">{quizResultado.percentagem >= (quizPerguntas[0]?.nota_corte || 70) ? '🏆' : '⚠️'}</span>
                              <div>
                                <div className="text-sm opacity-80 font-semibold mb-0.5">Nota: {quizResultado.acertos}/{quizResultado.total} ({quizResultado.percentagem}%)</div>
                                <div>{quizResultado.percentagem >= (quizPerguntas[0]?.nota_corte || 70) ? 'Parabéns! Foste aprovado.' : 'Não atingiste a nota mínima. Tenta novamente.'}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAREFA / ENTREGA DE TRABALHO */}
                {aulaAtual.tipo === 'tarefa' && (
                  <div className="p-8 bg-white max-w-2xl mx-auto border border-gray-100 rounded-2xl shadow-sm my-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📤</div>
                      <div>
                        <h3 className="text-xl font-black text-[#2B2B2B]">Entrega de Trabalho</h3>
                        <p className="text-gray-500 text-sm font-medium">Submeta o seu trabalho (ficheiro ou link).</p>
                      </div>
                    </div>

                    {tarefaEnviada ? (
                      <div className="bg-green-50 border-2 border-green-100 p-8 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
                        <h4 className="font-bold text-green-900">Trabalho Enviado!</h4>
                        <p className="text-green-700 text-sm mt-1">Aguarde a correção do seu professor.</p>
                        <button onClick={() => setTarefaEnviada(false)} className="mt-6 text-xs font-bold text-green-800 bg-green-200/50 px-4 py-2 rounded-lg">Reenviar Trabalho</button>
                      </div>
                    ) : (
                      <form onSubmit={enviarTarefa} className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <label className="block text-xs font-black text-gray-400 uppercase mb-3">Ficheiro (Entrega)</label>
                          <input type="file" onChange={e => setTarefaArquivo(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#1C1D1F] file:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase mb-2">Link de Entrega (Opcional)</label>
                          <input type="url" placeholder="G-Drive, GitHub..." value={tarefaLink} onChange={e => setTarefaLink(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase mb-2">Comentários</label>
                          <textarea rows="3" placeholder="Informações extras..." value={tarefaObs} onChange={e => setTarefaObs(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200" />
                        </div>
                        <button type="submit" disabled={enviandoTarefa} className="w-full bg-[#3347FF] hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg disabled:opacity-50 transition-all">
                          {enviandoTarefa ? 'A enviar...' : '📤 Submeter Trabalho'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comentários Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-[#2B2B2B] mb-6 flex items-center gap-2">
                <span>💬</span> Dúvidas e Discussões
              </h3>

              <form onSubmit={postarComentario} className="mb-8">
                <textarea
                  value={novoComentario}
                  onChange={e => setNovoComentario(e.target.value)}
                  placeholder="Em que podemos ajudar? Partilhe a sua dúvida com a comunidade..."
                  required
                  className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/40 focus:border-[#3347FF] resize-y min-h-[100px] mb-3 text-sm font-medium"
                />
                <div className="flex justify-end">
                  <button type="submit" className="bg-[#2B2B2B] hover:bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
                    Publicar Comentário
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                {comentarios.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">Seja o primeiro a enviar uma dúvida ou contribuição!</p>
                  </div>
                ) : comentarios.map(c => (
                  <div key={c.id} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-[#3347FF] text-sm">{c.autor ? c.autor.charAt(0).toUpperCase() : 'A'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#2B2B2B] text-sm">{c.autor}</span>
                        <span className="text-xs text-gray-400 font-medium">• {new Date(c.data).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-4xl">🎓</div>
            <h3 className="text-2xl font-extrabold text-[#2B2B2B] mb-2">Bem-vindo à Sala de Aula</h3>
            <p className="text-gray-500 max-w-sm">Selecione um dos módulos e aulas no painel lateral esquerdo para dar início aos seus estudos.</p>
          </div>
        )}
      </main>

    </div>
  );
}