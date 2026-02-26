import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Suporte() {
  const [token] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Decodifica o token de forma simples para sabermos quem está logado (para a UI)
  const utilizadorLogado = token ? JSON.parse(atob(token.split('.')[1])) : null;

  const [chamados, setChamados] = useState([]);
  const [chamadoAberto, setChamadoAberto] = useState(null); // Guarda o ticket que estamos a ver
  const [mensagens, setMensagens] = useState([]);

  // Campos de formulário
  const [novoAssunto, setNovoAssunto] = useState('');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);

  const carregarChamados = () => {
    fetch('http://localhost:5000/api/chamados', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(dados => setChamados(dados));
  };

  useEffect(() => {
    if (token) carregarChamados();
    // eslint-disable-next-line
  }, [token]);

  // Função para abrir um chat de um ticket
  const abrirChamado = (chamado) => {
    setChamadoAberto(chamado);
    setCarregando(true);
    fetch(`http://localhost:5000/api/chamados/${chamado.id}/mensagens`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(dados => {
        setMensagens(dados);
        setCarregando(false);
      });
  };

  // Criar novo Ticket
  const criarChamado = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/chamados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ assunto: novoAssunto, mensagem: novaMensagem })
    });
    setNovoAssunto('');
    setNovaMensagem('');
    alert("Ticket aberto com sucesso!");
    carregarChamados();
  };

  // Enviar uma resposta dentro do chat
  const enviarResposta = async (e) => {
    e.preventDefault();
    if (!resposta.trim()) return;

    await fetch(`http://localhost:5000/api/chamados/${chamadoAberto.id}/mensagens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ mensagem: resposta })
    });
    setResposta('');
    abrirChamado(chamadoAberto); // Recarrega o chat
    carregarChamados(); // Atualiza a lista por causa da data
  };

  if (!token) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6] font-sans text-[#2B2B2B]">
      <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
      <button onClick={() => navigate('/login')} className="bg-[#3347FF] text-white font-bold py-2 px-6 rounded-lg">Fazer Login</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2B2B2B] flex flex-col">
      {/* Header */}
      <header className="bg-[#1C1D1F] text-white px-6 h-16 flex justify-between items-center shadow-md sticky top-0 z-20">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <span className="text-[#3347FF] text-xl">🎧</span> Central de Suporte
        </h2>
        <Link to="/" className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-white/30">
          Voltar ao Início
        </Link>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col md:flex-row gap-6 overflow-hidden">

        {/* Lado Esquerdo: Lista de Tickets / Formulário */}
        <div className="w-full md:w-[400px] flex flex-col gap-6 flex-shrink-0">

          {/* Formulário Novo Ticket (Alunos e Produtores) */}
          {(utilizadorLogado?.papel === 'aluno' || utilizadorLogado?.papel === 'produtor') && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-extrabold text-[#2B2B2B] mb-4 text-lg">Abrir Novo Ticket</h3>
              <form onSubmit={criarChamado} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Assunto (Ex: Problema no Vídeo)"
                  value={novoAssunto}
                  onChange={e => setNovoAssunto(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium text-sm transition-all"
                />
                <textarea
                  required
                  placeholder="Descreva o seu problema detalhadamente..."
                  value={novaMensagem}
                  onChange={e => setNovaMensagem(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium text-sm min-h-[100px] resize-none"
                />
                <button type="submit" className="w-full bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                  Enviar Ticket
                </button>
              </form>
            </div>
          )}

          {/* Lista de Tickets Existentes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-[#2B2B2B]">Seus Atendimentos</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {chamados.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm italic">Nenhum ticket encontrado.</div>
              ) : chamados.map(c => (
                <div
                  key={c.id}
                  onClick={() => abrirChamado(c)}
                  className={`p-4 rounded-xl cursor-pointer transition-all mb-2 relative border ${chamadoAberto?.id === c.id ? 'bg-blue-50 border-[#3347FF]' : 'hover:bg-gray-50 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-gray-400 font-mono">#{c.id}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${c.status === 'fechado' ? 'bg-red-50 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-[#2B2B2B] truncate pr-4">{c.assunto}</div>
                  <div className="text-[10px] text-gray-500 mt-1 flex justify-between items-center">
                    <span>Por: {c.criador_nome}</span>
                    {utilizadorLogado.papel === 'suporte' && <span className="bg-gray-200 text-gray-600 px-1 rounded uppercase">{c.criador_papel}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito: Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
          {chamadoAberto ? (
            <>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="font-extrabold text-[#2B2B2B]">Ticket: {chamadoAberto.assunto}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-gray-400">Atendimento #{chamadoAberto.id}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-semibold text-[#3347FF] uppercase">{chamadoAberto.status}</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#F9F8F6]/50 flex flex-col gap-6 custom-scrollbar">
                {carregando ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Carregando mensagens...</div>
                ) : mensagens.map((m, idx) => {
                  const ehMeu = m.remetente_id === utilizadorLogado.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${ehMeu ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl shadow-sm text-sm font-medium ${ehMeu ? 'bg-[#3347FF] text-white rounded-tr-none' : 'bg-white text-[#2B2B2B] border border-gray-200 rounded-tl-none'}`}>
                        <div className={`text-[10px] font-bold uppercase mb-1 opacity-60 tracking-wider ${ehMeu ? 'text-white' : 'text-[#3347FF]'}`}>
                          {m.remetente_nome} • {m.remetente_papel}
                        </div>
                        <div className="whitespace-pre-wrap">{m.mensagem}</div>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 font-bold">{new Date(m.data || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={enviarResposta} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Escreva a sua resposta..."
                    value={resposta}
                    onChange={e => setResposta(e.target.value)}
                    className="flex-1 px-5 py-3 rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium text-sm transition-all"
                  />
                  <button
                    type="submit"
                    className="w-12 h-12 flex items-center justify-center bg-[#2B2B2B] hover:bg-black text-white rounded-full transition-all shadow-md active:scale-95"
                  >
                    🚀
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-[#F0F3FF] rounded-full flex items-center justify-center text-3xl mb-4">💬</div>
              <h3 className="text-xl font-extrabold text-[#2B2B2B] mb-2">Selecione um Atendimento</h3>
              <p className="text-gray-500 max-w-xs text-sm">Visualize o histórico de conversas ou abra um novo chamado para receber ajuda especializada da nossa equipe.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}