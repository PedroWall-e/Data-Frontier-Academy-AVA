import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function GestaoCurso() {
  const { id } = useParams(); // Pega o ID do curso através do link (URL)
  const [token] = useState(localStorage.getItem('token'));
  const [curso, setCurso] = useState(null);

  // Estados dos formulários
  const [novoModuloTitulo, setNovoModuloTitulo] = useState('');
  const [novaAulaTitulo, setNovaAulaTitulo] = useState('');
  const [novaAulaLink, setNovaAulaLink] = useState('');
  const [moduloSelecionado, setModuloSelecionado] = useState(null);

  // Carrega os dados do curso
  const carregarCurso = () => {
    fetch(`http://localhost:5000/api/produtor/curso/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(dados => setCurso(dados))
      .catch(erro => console.error(erro));
  };

  useEffect(() => {
    if (token) carregarCurso();
    // eslint-disable-next-line
  }, [id, token]);

  const criarModulo = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/modulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ curso_id: id, titulo: novoModuloTitulo, ordem: curso.modulos.length + 1 })
    });
    setNovoModuloTitulo('');
    carregarCurso(); // Recarrega a página para mostrar o novo módulo
  };

  const criarAula = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/aulas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        modulo_id: moduloSelecionado, 
        titulo: novaAulaTitulo, 
        conteudo: novaAulaLink, 
        tipo: 'video' 
      })
    });
    setNovaAulaTitulo('');
    setNovaAulaLink('');
    setModuloSelecionado(null);
    carregarCurso(); // Recarrega para mostrar a nova aula
  };

  if (!curso) return <div style={{ padding: '50px', textAlign: 'center' }}>A carregar construtor...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <Link to="/admin" style={{ textDecoration: 'none', color: '#0055ff', fontWeight: 'bold' }}>← Voltar ao Painel</Link>
      
      <div style={{ background: 'white', padding: '30px', marginTop: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Construtor do Curso: <span style={{ color: '#00cc66' }}>{curso.titulo}</span></h2>
        
        {/* Formulário para adicionar Módulo */}
        <form onSubmit={criarModulo} style={{ display: 'flex', gap: '10px', marginBottom: '30px', marginTop: '20px' }}>
            <input type="text" placeholder="Nome do Novo Módulo (Ex: Módulo 1 - Introdução)" required value={novoModuloTitulo} onChange={e => setNovoModuloTitulo(e.target.value)} style={{ flex: 1, padding: '10px' }} />
            <button type="submit" style={{ background: '#222', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>+ Adicionar Módulo</button>
        </form>

        <hr style={{ border: '1px solid #eee', marginBottom: '20px' }}/>

        {/* Lista de Módulos e Aulas */}
        {curso.modulos.length === 0 ? <p>Ainda não há módulos neste curso.</p> : curso.modulos.map(modulo => (
          <div key={modulo.id} style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>📦 {modulo.titulo}</h3>
                <button onClick={() => setModuloSelecionado(modulo.id)} style={{ background: '#0055ff', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>+ Adicionar Aula Aqui</button>
            </div>

            {/* Formulário de Aula (Aparece apenas no módulo selecionado) */}
            {moduloSelecionado === modulo.id && (
                <form onSubmit={criarAula} style={{ background: '#e6f0ff', padding: '15px', marginTop: '15px', borderRadius: '5px', display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Título da Aula" required value={novaAulaTitulo} onChange={e => setNovaAulaTitulo(e.target.value)} style={{ padding: '8px', flex: 1 }} />
                    <input type="url" placeholder="Link do Vídeo (Ex: https://www.youtube.com/embed/...)" required value={novaAulaLink} onChange={e => setNovaAulaLink(e.target.value)} style={{ padding: '8px', flex: 2 }} />
                    <button type="submit" style={{ background: '#00cc66', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Guardar Aula</button>
                    <button type="button" onClick={() => setModuloSelecionado(null)} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Cancelar</button>
                </form>
            )}

            {/* Lista das aulas deste módulo */}
            <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                {modulo.aulas.length === 0 ? <li style={{ color: '#888' }}>Sem aulas.</li> : modulo.aulas.map(aula => (
                    <li key={aula.id} style={{ padding: '8px 0', borderBottom: '1px dashed #ccc' }}>
                        ▶ <strong>{aula.titulo}</strong> <span style={{ fontSize: '12px', color: '#666' }}>({aula.conteudo})</span>
                    </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}