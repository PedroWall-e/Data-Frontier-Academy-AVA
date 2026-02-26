import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';

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
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2B2B2B]">
      {/* HEADER */}
      <header className="bg-[#1C1D1F] text-white px-6 h-16 flex justify-between items-center shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="text-[#3347FF] text-xl">👑</span> Painel Master
          </h2>
          <Link to="/admin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors ml-4 hidden sm:block">
            Ir para Área de Produtor
          </Link>
        </div>
        <button
          onClick={logout}
          className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-white/30"
        >
          Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-extrabold text-[#2B2B2B]">Estatísticas Globais</h3>
          <p className="text-gray-500 mt-1">Visão geral do sistema e utilizadores.</p>
        </div>

        {carregando || !estatisticas ? (
          <div className="p-12 text-center text-gray-500 font-medium bg-white rounded-2xl shadow-sm border border-gray-200">A carregar dados do servidor...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-[#3347FF] hover:-translate-y-1 transition-transform">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Utilizadores</h4>
              <p className="text-3xl font-extrabold text-[#2B2B2B]">{estatisticas.usuarios}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-green-500 hover:-translate-y-1 transition-transform">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Cursos Ativos</h4>
              <p className="text-3xl font-extrabold text-[#2B2B2B]">{estatisticas.cursos}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-yellow-500 hover:-translate-y-1 transition-transform">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Matrículas Totais</h4>
              <p className="text-3xl font-extrabold text-[#2B2B2B]">{estatisticas.matriculas}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-red-500 hover:-translate-y-1 transition-transform">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Tickets Suporte</h4>
              <p className="text-3xl font-extrabold text-[#2B2B2B]">{estatisticas.chamadosPendentes}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl">
          <h3 className="text-xl font-extrabold text-[#2B2B2B] mb-2">Dar Acesso Manual (Matrícula)</h3>
          <p className="text-gray-500 text-sm mb-6">Use este formulário para conceder acesso a um curso a um aluno específico (ex: casos de fallback para pagamentos não processados no gateway).</p>

          <form onSubmit={matricularAluno} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-[#2B2B2B] mb-1">ID do Aluno (Utilizador)</label>
                <input type="number" required value={alunoId} onChange={e => setAlunoId(e.target.value)} placeholder="Ex: 2" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-[#2B2B2B] mb-1">ID do Curso</label>
                <input type="number" required value={cursoId} onChange={e => setCursoId(e.target.value)} placeholder="Ex: 1" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 font-medium" />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="bg-[#2B2B2B] hover:bg-black text-white font-bold py-3.5 px-8 rounded-lg transition-colors w-full sm:w-auto">
                Efetivar Matrícula do Aluno
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}