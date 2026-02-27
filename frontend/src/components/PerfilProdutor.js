import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function PerfilProdutor() {
    const [perfil, setPerfil] = useState({
        nome: '',
        email: '',
        foto_url: '',
        titulo_profissional: '',
        biografia: '',
        redes_sociais: {
            linkedin: '',
            instagram: '',
            youtube: '',
            website: ''
        }
    });
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarPerfil();
    }, []);

    const carregarPerfil = async () => {
        try {
            const res = await api.get('/auth/perfil');
            const data = res.data;
            setPerfil({
                nome: data.nome || '',
                email: data.email || '',
                foto_url: data.foto_url || '',
                titulo_profissional: data.titulo_profissional || '',
                biografia: data.biografia || '',
                redes_sociais: typeof data.redes_sociais === 'string'
                    ? JSON.parse(data.redes_sociais)
                    : (data.redes_sociais || { linkedin: '', instagram: '', youtube: '', website: '' })
            });
            setCarregando(false);
        } catch (erro) {
            console.error(erro);
            setMensagem('Erro ao carregar o perfil.');
            setCarregando(false);
        }
    };

    const handleSalvar = async (e) => {
        e.preventDefault();
        setMensagem('');
        try {
            await api.put('/auth/perfil', {
                foto_url: perfil.foto_url,
                titulo_profissional: perfil.titulo_profissional,
                biografia: perfil.biografia,
                redes_sociais: perfil.redes_sociais
            });
            setMensagem('Perfil salvo com sucesso!');
        } catch (erro) {
            console.error(erro);
            setMensagem('Erro ao salvar as informações do perfil.');
        }
    };

    const handleChangeSocial = (rede, valor) => {
        setPerfil({
            ...perfil,
            redes_sociais: {
                ...perfil.redes_sociais,
                [rede]: valor
            }
        });
    };

    if (carregando) return <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center font-bold text-gray-500">A carregar perfil...</div>;

    return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#2B2B2B] font-sans">
            <header className="bg-[#1C1D1F] text-white px-6 h-16 flex justify-between items-center shadow-md sticky top-0 z-20">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-[#3347FF] text-xl">👤</span> Meu Perfil de Instrutor
                </h2>
                <Link to="/admin" className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-white/30">
                    ← Voltar ao Painel
                </Link>
            </header>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-8 border-b border-gray-100 pb-6">
                        <h1 className="text-2xl font-extrabold text-[#2B2B2B]">Informações Públicas</h1>
                        <p className="text-gray-500 mt-1">
                            Estes dados aparecerão na sua página pública de autor e nas páginas de vendas dos seus cursos.
                        </p>
                    </div>

                    {mensagem && (
                        <div className={`mb-6 p-4 rounded-lg font-bold text-sm ${mensagem.includes('sucesso') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            {mensagem}
                        </div>
                    )}

                    <form onSubmit={handleSalvar} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Coluna da Foto */}
                            <div className="flex flex-col items-center space-y-4 md:w-1/3">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100 flex items-center justify-center shadow-inner">
                                    {perfil.foto_url ? (
                                        <img src={perfil.foto_url} alt="Sua Foto" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-4xl font-bold">{perfil.nome?.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="w-full">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">URL da Foto de Perfil</label>
                                    <input
                                        type="url"
                                        placeholder="https://exemplo.com/minhafoto.jpg"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium"
                                        value={perfil.foto_url}
                                        onChange={(e) => setPerfil({ ...perfil, foto_url: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 text-center">Cole o link direto da sua imagem (Recomendado 500x500px suportando transparência PNG ou JPG).</p>
                                </div>
                            </div>

                            {/* Coluna dos Dados */}
                            <div className="flex-1 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Nome Completo</label>
                                        <input type="text" disabled value={perfil.nome} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 font-medium text-gray-500 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">E-mail de Cadastro</label>
                                        <input type="email" disabled value={perfil.email} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 font-medium text-gray-500 cursor-not-allowed" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Título Profissional ou Especialidade</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Engenheiro de Software Sênior & Professor"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-bold text-[#2B2B2B]"
                                        value={perfil.titulo_profissional}
                                        onChange={(e) => setPerfil({ ...perfil, titulo_profissional: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Sua Biografia e Formação</label>
                                    <textarea
                                        placeholder="Conte sua história acadêmica, experiência profissional e o que lhe motiva a ensinar..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-[#3347FF]/30 font-medium min-h-[160px] resize-y"
                                        value={perfil.biografia}
                                        onChange={(e) => setPerfil({ ...perfil, biografia: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                                    <h4 className="font-bold text-sm mb-4">Links Profissionais e Redes Sociais</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-500">LinkedIn URL</span>
                                            </div>
                                            <input type="url" placeholder="https://linkedin.com/in/seu_perfil" className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-[#3347FF]/30" value={perfil.redes_sociais?.linkedin || ''} onChange={(e) => handleChangeSocial('linkedin', e.target.value)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-500">Instagram URL</span>
                                            </div>
                                            <input type="url" placeholder="https://instagram.com/seu_perfil" className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-[#3347FF]/30" value={perfil.redes_sociais?.instagram || ''} onChange={(e) => handleChangeSocial('instagram', e.target.value)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-500">YouTube URL</span>
                                            </div>
                                            <input type="url" placeholder="https://youtube.com/c/seu_canal" className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-[#3347FF]/30" value={perfil.redes_sociais?.youtube || ''} onChange={(e) => handleChangeSocial('youtube', e.target.value)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-500">Website / Portfólio</span>
                                            </div>
                                            <input type="url" placeholder="https://seu_site.com" className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-[#3347FF]/30" value={perfil.redes_sociais?.website || ''} onChange={(e) => handleChangeSocial('website', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#3347FF] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/30 transition-all text-lg"
                            >
                                Salvar Perfil Público
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
