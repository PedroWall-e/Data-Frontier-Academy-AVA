import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function PainelProdutor() {
  const [token] = useState(localStorage.getItem('token'));

  // Estados para gerir a lista de cursos
  const [meusCursos, setMeusCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para o formulário de "Novo Curso"
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovoDescricao] = useState('');
  const [novoPreco, setNovoPreco] = useState('');

  const fazerLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/";
  };

  // Carrega os cursos mal a página abre
  useEffect(() => {
    if (!token) return;

    setCarregando(true);
    api.get('/cursos/produtor/meus-cursos')
      .then(res => {
        setMeusCursos(res.data);
        setCarregando(false);
      })
      .catch(erro => {
        console.error(erro);
        setCarregando(false);
      });
  }, [token]);

  // Função para gravar o novo curso
  const criarCurso = async (e) => {
    e.preventDefault(); // Evita que a página recarregue

    try {
      const res = await api.post('/cursos', {
        titulo: novoTitulo,
        descricao: novaDescricao,
        preco: novoPreco || 0
      });

      const dados = res.data;

      if (res.status === 200 || res.status === 201) {
        alert("Curso criado com sucesso!");
        // Limpa o formulário e esconde-o
        setNovoTitulo('');
        setNovoDescricao('');
        setNovoPreco('');
        setMostrarFormulario(false);

        // Dá um "refresh" local adicionando o novo curso à lista visual
        setMeusCursos([{
          id: dados.cursoId,
          titulo: novoTitulo,
          preco: novoPreco || 0
        }, ...meusCursos]);
      } else {
        alert(dados.erro);
      }
    } catch (erro) {
      alert("Erro de ligação ao servidor.");
    }
  };

  const clonarCurso = async (id) => {
    if (!window.confirm("Deseja realmente duplicar este curso?")) return;
    try {
      const res = await api.post(`/cursos/${id}/clonar`);
      alert(res.data.mensagem);
      // Recarregar a lista (simplesmente forçando o useEffect ou recarregando a página)
      window.location.reload();
    } catch (erro) { alert("Erro ao clonar curso."); }
  };

  if (!token) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Acesso Negado. Faça login primeiro.</h2></div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', color: '#1a1a1a' }}>
      <header style={{ background: '#1a1a1a', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard do Produtor</h2>
        <button onClick={fazerLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Sair da Conta</button>
      </header>

      <main style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#1a1a1a' }}>Os Meus Cursos</h3>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={{ background: mostrarFormulario ? '#666' : '#0055ff', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
          >
            {mostrarFormulario ? 'Cancelar' : '+ Criar Novo Curso'}
          </button>
        </div>

        {/* Formulário de Criação (Só aparece se clicar no botão) */}
        {mostrarFormulario && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4 style={{ color: '#1a1a1a' }}>Detalhes do Novo Curso</h4>
            <form onSubmit={criarCurso} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Título do Curso" required value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} style={{ padding: '10px' }} />
              <textarea placeholder="Descrição (o que os alunos vão aprender?)" required value={novaDescricao} onChange={e => setNovoDescricao(e.target.value)} style={{ padding: '10px', minHeight: '80px' }} />
              <input type="number" step="0.01" placeholder="Preço (Ex: 49.99)" value={novoPreco} onChange={e => setNovoPreco(e.target.value)} style={{ padding: '10px' }} />
              <button type="submit" style={{ background: '#00cc66', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Curso</button>
            </form>
          </div>
        )}

        {/* Tabela Dinâmica com dados reais da Base de Dados */}
        {carregando ? (
          <p>A carregar cursos...</p>
        ) : meusCursos.length === 0 ? (
          <p>Ainda não criou nenhum curso.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#e0e0e0', textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Título do Curso</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Preço</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {meusCursos.map(curso => (
                <tr key={curso.id}>
                  <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{curso.id}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}><strong style={{ color: '#1a1a1a' }}>{curso.titulo}</strong></td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>€ {curso.preco}</td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                    <Link to={`/admin/curso/${curso.id}`}>
                      <button style={{ marginRight: '10px', cursor: 'pointer', padding: '5px 10px', background: '#0055ff', color: 'white', border: 'none', borderRadius: '3px' }}>Gerir Conteúdo</button>
                    </Link>
                    <button onClick={() => clonarCurso(curso.id)} style={{ cursor: 'pointer', padding: '5px 10px', background: '#222', color: 'white', border: 'none', borderRadius: '3px' }}>📑 Clonar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}