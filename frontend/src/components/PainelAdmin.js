import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PainelAdmin() {
  const [token] = useState(localStorage.getItem('token'));
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Estados para o formulário de Matrícula Manual
  const [alunoId, setAlunoId] = useState('');
  const [cursoId, setCursoId] = useState('');

  const fazerLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/";
  };

  // Carrega as estatísticas mal a página abre
  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:5000/api/admin/estatisticas', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(dados => {
        if (!dados.erro) {
            setEstatisticas(dados);
        }
        setCarregando(false);
      })
      .catch(erro => {
          console.error(erro);
          setCarregando(false);
      });
  }, [token]);

  // Função para dar acesso a um aluno (Matrícula)
  const matricularAluno = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch('http://localhost:5000/api/admin/matricular', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ aluno_id: alunoId, curso_id: cursoId })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert("✅ Acesso concedido com sucesso!");
        setAlunoId('');
        setCursoId('');
        // Dá refresh na página para atualizar os números
        window.location.reload(); 
      } else {
        alert("Erro: " + dados.erro);
      }
    } catch (erro) {
      alert("Erro de ligação ao servidor.");
    }
  };

  if (!token) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Acesso Negado. Faça login primeiro.</h2></div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Cabeçalho do Master */}
      <header style={{ background: '#8e44ad', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ margin: 0 }}>👑 Painel Master</h2>
            <Link to="/admin" style={{ color: 'white', textDecoration: 'underline', fontSize: '14px' }}>Ir para Área de Produtor</Link>
        </div>
        <button onClick={fazerLogout} style={{ background: '#341f3e', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Sair</button>
      </header>

      <main style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Cartões de Estatísticas */}
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Estatísticas Globais</h3>
        {carregando || !estatisticas ? (
            <p>A carregar dados...</p>
        ) : (
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '5px solid #3498db' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Utilizadores</h4>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#3498db' }}>{estatisticas.usuarios}</p>
                </div>
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '5px solid #2ecc71' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Cursos Ativos</h4>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#2ecc71' }}>{estatisticas.cursos}</p>
                </div>
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '5px solid #f1c40f' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Matrículas</h4>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#f1c40f' }}>{estatisticas.matriculas}</p>
                </div>
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '5px solid #e74c3c' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Tickets Abertos</h4>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#e74c3c' }}>{estatisticas.chamadosPendentes}</p>
                </div>
            </div>
        )}

        {/* Gestão de Acessos (Matrícula Manual) */}
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Dar Acesso Manual (Matrícula)</h3>
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
            <p style={{ marginTop: 0, color: '#666', fontSize: '14px' }}>Use este formulário para dar acesso a um curso a um aluno específico (ex: em caso de pagamento externo).</p>
            <form onSubmit={matricularAluno} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ID do Aluno:</label>
                    <input type="number" required value={alunoId} onChange={e => setAlunoId(e.target.value)} placeholder="Ex: 2" style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ID do Curso:</label>
                    <input type="number" required value={cursoId} onChange={e => setCursoId(e.target.value)} placeholder="Ex: 1" style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', fontSize: '16px' }}>
                    Matricular Aluno
                </button>
            </form>
        </div>

      </main>
    </div>
  );
}