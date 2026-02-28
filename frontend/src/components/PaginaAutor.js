import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function PaginaAutor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [autor, setAutor] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarAutor();
    }, [id]);

    const carregarAutor = async () => {
        try {
            const res = await api.get(`/cursos/autor/${id}`);
            const data = res.data;
            if (typeof data.redes_sociais === 'string') {
                data.redes_sociais = JSON.parse(data.redes_sociais);
            }
            setAutor(data);
            setCarregando(false);
        } catch (error) {
            console.error(error);
            setErro('Erro ao carregar o perfil do autor.');
            setCarregando(false);
        }
    };

    if (carregando) return <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center font-bold text-gray-500 text-xl">A carregar perfil...</div>;
    if (erro || !autor) return <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center text-red-500 font-bold p-6 text-center"><span className="text-4xl mb-4">😕</span><p>{erro || "Autor não encontrado."}</p><Link to="/" className="mt-6 text-[#3347FF] underline">Voltar à Página Inicial</Link></div>;

    const IconeLink = ({ href, rel, children }) => {
        if (!href) return null;
        return (
            <a href={href} target="_blank" rel={rel || "noopener noreferrer"} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#3347FF] hover:text-white transition-colors duration-300">
                {children}
            </a>
        );
    };

    return (
        <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2B2B2B]">
            {/* Header Simples */}
            <header className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center sticky top-0 z-20">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-[#3347FF] flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform">
                        DF
                    </div>
                    <span className="font-extrabold text-lg tracking-tight hidden sm:block">Data Frontier <span className="text-gray-400">Academy</span></span>
                </Link>
                <Link to="/" className="text-sm font-bold text-gray-500 hover:text-[#3347FF] transition-colors">Voltar ao Início</Link>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">

                {/* Perfil Header */}
                <section className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#3347FF] to-blue-400"></div>

                    <div className="w-40 h-40 shrink-0 rounded-full overflow-hidden border-8 border-gray-50 shadow-lg bg-gray-100">
                        {autor.foto_url ? (
                            <img src={autor.foto_url} alt={autor.nome} className="w-full h-full object-cover" />
                        ) : (
                            <span className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-300">{autor.nome.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2B2B2B] tracking-tight">{autor.nome}</h1>
                            {autor.titulo_profissional && (
                                <p className="text-[#3347FF] font-bold text-lg mt-1">{autor.titulo_profissional}</p>
                            )}
                        </div>

                        <div className="flex justify-center md:justify-start gap-3 pt-2">
                            {autor.redes_sociais && (
                                <>
                                    {autor.redes_sociais.website && <IconeLink href={autor.redes_sociais.website}>🌐</IconeLink>}
                                    {autor.redes_sociais.linkedin && <IconeLink href={autor.redes_sociais.linkedin}>in</IconeLink>}
                                    {autor.redes_sociais.instagram && <IconeLink href={autor.redes_sociais.instagram}>ig</IconeLink>}
                                    {autor.redes_sociais.youtube && <IconeLink href={autor.redes_sociais.youtube}>yt</IconeLink>}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Biografia */}
                {autor.biografia && (
                    <section className="px-4">
                        <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                            <span className="text-[#3347FF]">📝</span> Sobre {autor.nome.split(' ')[0]}
                        </h2>
                        <div className="prose prose-lg text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                            {autor.biografia}
                        </div>
                    </section>
                )}

                {/* Cursos do Autor */}
                <section>
                    <div className="flex items-center justify-between mb-8 px-4">
                        <h2 className="text-2xl font-extrabold flex items-center gap-3">
                            <span className="text-[#3347FF]">🎓</span> Cursos Publicados ({autor.cursos?.length || 0})
                        </h2>
                    </div>

                    {autor.cursos && autor.cursos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {autor.cursos.map((curso) => (
                                <div key={curso.id} onClick={() => navigate(`/curso/${curso.id}`)} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                        {curso.capa_url ? (
                                            <img src={curso.capa_url} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">🎓</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="font-extrabold text-lg mb-2 text-[#2B2B2B] group-hover:text-[#3347FF] transition-colors line-clamp-2 leading-tight flex-1">
                                            {curso.titulo}
                                        </h3>
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                            <span className="font-black text-[#2B2B2B] text-lg">R$ {curso.preco}</span>
                                            <span className="text-sm font-bold text-[#3347FF] bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-[#3347FF] group-hover:text-white transition-colors">
                                                Ver Detalhes →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                            <span className="text-4xl mb-4 block">📚</span>
                            <p className="text-gray-500 font-bold text-lg">Nenhum curso publicado ainda.</p>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
