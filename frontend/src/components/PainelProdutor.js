import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function PainelProdutor() {
  const [token] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Estados para gerir a lista de cursos
  const [meusCursos, setMeusCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para o formulário de "Novo Curso"
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovoDescricao] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [novoEscopo, setNovoEscopo] = useState('LIVRE');
  const [novaCapa, setNovaCapa] = useState('');
  const [uploadandoCapa, setUploadandoCapa] = useState(false);

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
    e.preventDefault();

    try {
      const res = await api.post('/cursos', {
        titulo: novoTitulo,
        descricao: novaDescricao,
        preco: novoPreco || 0,
        escopo: novoEscopo,
        capa_url: novaCapa
      });

      const dados = res.data;

      if (res.status === 200 || res.status === 201) {
        alert("Curso criado com sucesso!");
        setNovoTitulo('');
        setNovoDescricao('');
        setNovoPreco('');
        setNovoEscopo('LIVRE');
        setNovaCapa('');
        setMostrarFormulario(false);

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
      window.location.reload();
    } catch (erro) { alert("Erro ao clonar curso."); }
  };

  // Upload de imagem da capa
  const uploadCapa = async (file) => {
    if (!file) return;
    setUploadandoCapa(true);
    try {
      const formData = new FormData();
      formData.append('arquivo', file);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNovaCapa(res.data.url);
    } catch (err) {
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploadandoCapa(false);
    }
  };

  const excluirCurso = async (id) => {
    if (!window.confirm('Tem certeza absoluta que deseja EXCLUIR este curso? Esta acção não pode ser desfeita e todos os dados relacionados serão perdidos.')) return;
    try {
      const res = await api.delete(`/cursos/${id}`);
      alert(res.data.mensagem || 'Curso excluído com sucesso!');
      setMeusCursos(meusCursos.filter(c => c.id !== id));
    } catch (erro) {
      alert('Erro ao excluir o curso.');
      console.error(erro);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6] font-sans text-[#2B2B2B]">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="mb-6 text-gray-500">Faça login para acessar esta página.</p>
        <button onClick={() => navigate('/login')} className="bg-[#3347FF] text-white font-bold py-2 px-6 rounded-lg">Fazer Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2B2B2B]">

      {/* HEADER */}
      <header className="bg-[#1C1D1F] text-white px-6 h-16 flex justify-between items-center shadow-md sticky top-0 z-20">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <span className="text-[#3347FF] text-xl">⚙</span> Dashboard do Produtor
        </h2>
        <div className="flex items-center gap-4">
          <Link to="/perfil" className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-white/30 hidden sm:block">
            Meu Perfil
          </Link>
          <button
            onClick={fazerLogout}
            className="text-sm font-bold bg-[#3347FF] hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="px-6 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-extrabold">Os Meus Cursos</h3>
            <p className="text-gray-500 mt-1">Gira o seu conteúdo, vendas e configurações.</p>
          </div>

          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`font-bold py-3 px-6 rounded-lg transition-colors border shadow-sm ${mostrarFormulario ? 'bg-white border-gray-300 text-[#2B2B2B] hover:bg-gray-50' : 'bg-[#3347FF] border-[#3347FF] text-white hover:bg-blue-700 hover:shadow-md'}`}
          >
            {mostrarFormulario ? 'Cancelar' : '+ Criar Novo Curso'}
          </button>
        </div>

        {/* Formulário de Criação (Só aparece se clicar no botão) */}
        {mostrarFormulario && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3347FF]"></div>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span>📝</span> Detalhes do Novo Curso
            </h4>

            <form onSubmit={criarCurso} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-1">Título do Curso</label>
                <input type="text" placeholder="Ex: Masterclass Frontend" required value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-1">Descrição</label>
                <textarea placeholder="O que os alunos vão aprender?..." required value={novaDescricao} onChange={e => setNovoDescricao(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium min-h-[120px] resize-y" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-1">Preço Base (R$)</label>
                <input type="number" step="0.01" placeholder="Ex: 49.99" value={novoPreco} onChange={e => setNovoPreco(e.target.value)} className="w-full sm:w-1/3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-1">Hub/Ecossistema</label>
                <select value={novoEscopo} onChange={e => setNovoEscopo(e.target.value)} id="escopo_select" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-bold text-[#3347FF]">
                  <option value="LIVRE">Cursos Livres (Padrão)</option>
                  <option value="TECNICO">Cursos Técnicos</option>
                  <option value="POS">Pós-Graduação</option>
                  <option value="UNIVERSIDADE">Universidade Coorporativa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-1">Capa do Curso (Imagem)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => uploadCapa(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-[#3347FF] hover:file:bg-blue-100 cursor-pointer"
                />
                {uploadandoCapa && <p className="text-xs text-blue-500 mt-1 font-medium">A fazer upload...</p>}
                {novaCapa && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={novaCapa} alt="Preview da capa" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                    <div>
                      <p className="text-xs font-bold text-green-600">✅ Upload concluído com sucesso!</p>
                      <button type="button" onClick={() => setNovaCapa('')} className="text-xs text-red-500 font-medium hover:underline mt-1">× Remover</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button type="submit" className="bg-[#1C1D1F] hover:bg-black text-white font-bold py-3.5 px-8 rounded-lg transition-colors">Guardar Curso</button>
              </div>
            </form>
          </div>
        )}

        {/* Cursos Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {carregando ? (
            <div className="p-12 text-center text-gray-500 font-medium">A carregar os seus cursos...</div>
          ) : meusCursos.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-bold mb-2">Sem cursos na plataforma</h3>
              <p className="text-gray-500">Crie o seu primeiro curso para começar a vender.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4 w-16">ID</th>
                    <th className="px-6 py-4">Título do Curso</th>
                    <th className="px-6 py-4 w-32">Preço</th>
                    <th className="px-6 py-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {meusCursos.map(curso => (
                    <tr key={curso.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">{curso.id}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#2B2B2B] group-hover:text-[#3347FF] transition-colors">{curso.titulo}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        € {curso.preco}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/curso/${curso.id}`}>
                            <button className="text-sm font-bold bg-[#F0F3FF] hover:bg-[#3347FF] text-[#3347FF] hover:text-white px-4 py-2 rounded-lg transition-colors">Gerir Conteúdo</button>
                          </Link>
                          <button
                            onClick={() => clonarCurso(curso.id)}
                            className="text-sm font-bold bg-white hover:bg-gray-100 text-[#2B2B2B] border border-gray-200 px-4 py-2 rounded-lg transition-colors"
                            title="Duplicar este curso"
                          >
                            📑 Clonar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}