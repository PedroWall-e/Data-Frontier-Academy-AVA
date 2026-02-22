import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Suporte() {
  const [token] = useState(localStorage.getItem('token'));

  // Decodifica o token de forma simples para sabermos quem está logado (para a UI)
  const utilizadorLogado = token ? JSON.parse(atob(token.split('.')[1])) : null;

  const [chamados, setChamados] = useState([]);
  const [chamadoAberto, setChamadoAberto] = useState(null); // Guarda o ticket que estamos a ver
  const [mensagens, setMensagens] = useState([]);

  // Campos de formulário
  const [novoAssunto, setNovoAssunto] = useState('');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [resposta, setResposta] = useState('');

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
    fetch(`http://localhost:5000/api/chamados/${chamado.id}/mensagens`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(dados => setMensagens(dados));
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
    await fetch(`http://localhost:5000/api/chamados/${chamadoAberto.id}/mensagens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ mensagem: resposta })
    });
    setResposta('');
    abrirChamado(chamadoAberto); // Recarrega o chat
    carregarChamados(); // Atualiza a lista por causa da data
  };

  if (!token) return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Faça login primeiro.</h2></div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🎧 Central de Suporte</h2>
        <Link to="/" style={{ textDecoration: 'none', color: '#0055ff', fontWeight: 'bold' }}>Voltar ao Início</Link>
      </header>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* LISTA DE TICKETS */}
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Os Seus Tickets</h3>

          {/* Se não for Suporte/Admin, pode criar tickets novos */}
          {(utilizadorLogado?.papel === 'aluno' || utilizadorLogado?.papel === 'produtor') && (
            <form onSubmit={criarChamado} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px', border: '1px solid #eee' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Abrir novo ticket</h4>
              <input type="text" required placeholder="Assunto (Ex: Problema no Vídeo da Aula 2)" value={novoAssunto} onChange={e => setNovoAssunto(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
              <textarea required placeholder="Descreva o seu problema detalhadamente..." value={novaMensagem} onChange={e => setNovaMensagem(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '60px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ background: '#00cc66', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Enviar Pedido de Ajuda</button>
            </form>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {chamados.length === 0 ? <p>Nenhum ticket aberto.</p> : chamados.map(c => (
              <li key={c.id} onClick={() => abrirChamado(c)} style={{ padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', background: chamadoAberto?.id === c.id ? '#e6f0ff' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>#{c.id} - {c.assunto}</strong>
                  <span style={{ fontSize: '12px', color: c.status === 'fechado' ? 'red' : 'green' }}>{c.status.toUpperCase()}</span>
                </div>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#444' }}>Aberto por: {c.criador_nome}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ÁREA DE CHAT (Aparece se clicar num Ticket) */}
        {chamadoAberto && (
          <div style={{ flex: 2, background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div style={{ padding: '20px', background: '#222', color: 'white', borderRadius: '8px 8px 0 0' }}>
              <h3 style={{ margin: 0 }}>A conversar no Ticket #{chamadoAberto.id}</h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Assunto: {chamadoAberto.assunto}</p>
            </div>

            {/* Histórico de Mensagens */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {mensagens.map(m => {
                const ehMeu = m.remetente_id === utilizadorLogado.id;
                return (
                  <div key={m.id} style={{ alignSelf: ehMeu ? 'flex-end' : 'flex-start', maxWidth: '70%', background: ehMeu ? '#0055ff' : '#e0e0e0', color: ehMeu ? 'white' : 'black', padding: '10px 15px', borderRadius: '15px' }}>
                    <div style={{ fontSize: '10px', marginBottom: '5px', opacity: 0.8 }}>
                      {m.remetente_nome} ({m.remetente_papel})
                    </div>
                    <div>{m.mensagem}</div>
                  </div>
                );
              })}
            </div>

            {/* Formulário de Resposta */}
            <form onSubmit={enviarResposta} style={{ padding: '20px', borderTop: '1px solid #ddd', display: 'flex', gap: '10px' }}>
              <input type="text" required placeholder="Escreva a sua resposta..." value={resposta} onChange={e => setResposta(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ background: '#00cc66', color: 'white', border: 'none', padding: '0 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Enviar</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}