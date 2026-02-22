import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import '../styles/PainelAdmin.css';

export default function PainelAdmin() {
  const { logout } = useContext(AuthContext);
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [alunoId, setAlunoId] = useState('');
  const [cursoId, setCursoId] = useState('');

  useEffect(() => {
    api.get('/admin/estatisticas')
      .then(res => {
        setEstatisticas(res.data);
        setCarregando(false);
      })
      .catch(erro => {
        console.error(erro);
        // Redirecionamento não é estritamente necessário se RotaProtegida barrar.
        setCarregando(false);
      });
  }, []);

  const matricularAluno = async (e) => {
    e.preventDefault();
    try {
      const resposta = await api.post('/admin/matricular', { aluno_id: alunoId, curso_id: cursoId });

      alert("✅ " + resposta.data.mensagem);
      setAlunoId('');
      setCursoId('');
      window.location.reload();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.erro) {
        alert("Erro: " + err.response.data.erro);
      } else {
        alert("Erro de ligação ao servidor.");
      }
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-title">
          <h2>👑 Painel Master</h2>
          <Link to="/admin" className="admin-link">Ir para Área de Produtor</Link>
        </div>
        <button onClick={logout} className="admin-btn-sair">Sair</button>
      </header>

      <main className="admin-main">
        <h3>Estatísticas Globais</h3>
        {carregando || !estatisticas ? (
          <p>A carregar dados...</p>
        ) : (
          <div className="admin-card-container">
            <div className="admin-card admin-card-blue">
              <h4>Utilizadores</h4>
              <p>{estatisticas.usuarios}</p>
            </div>
            <div className="admin-card admin-card-green">
              <h4>Cursos Ativos</h4>
              <p>{estatisticas.cursos}</p>
            </div>
            <div className="admin-card admin-card-yellow">
              <h4>Matrículas</h4>
              <p>{estatisticas.matriculas}</p>
            </div>
            <div className="admin-card admin-card-red">
              <h4>Tickets Abertos</h4>
              <p>{estatisticas.chamadosPendentes}</p>
            </div>
          </div>
        )}

        <h3>Dar Acesso Manual (Matrícula)</h3>
        <div className="admin-form-container">
          <p>Use este formulário para dar acesso a um curso a um aluno específico (ex: em caso de pagamento externo).</p>
          <form onSubmit={matricularAluno} className="admin-form">
            <div>
              <label>ID do Aluno:</label>
              <input type="number" required value={alunoId} onChange={e => setAlunoId(e.target.value)} placeholder="Ex: 2" />
            </div>
            <div>
              <label>ID do Curso:</label>
              <input type="number" required value={cursoId} onChange={e => setCursoId(e.target.value)} placeholder="Ex: 1" />
            </div>
            <button type="submit" className="admin-btn-matricular">
              Matricular Aluno
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}