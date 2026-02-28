import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

const StarRating = ({ nota, onChange, size = 24 }) => {
    const [hover, setHover] = useState(null);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange && onChange(star)}
                    onMouseEnter={() => onChange && setHover(star)}
                    onMouseLeave={() => onChange && setHover(null)}
                    className={`transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    style={{ fontSize: size }}
                >
                    <span style={{ color: star <= (hover || nota) ? '#B2624F' : '#e5e7eb' }}>★</span>
                </button>
            ))}
        </div>
    );
};

export default function PaginaCurso() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [curso, setCurso] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Review state
    const [notaAvaliacao, setNotaAvaliacao] = useState(0);
    const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
    const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
    const [msgAvaliacao, setMsgAvaliacao] = useState('');

    const token = localStorage.getItem('token');
    const usuarioLogado = token ? (() => { try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; } })() : null;

    useEffect(() => {
        carregarCurso();
    }, [id]);

    const carregarCurso = async () => {
        try {
            const res = await api.get(`/cursos/publico/${id}`);
            setCurso(res.data);
            setCarregando(false);
        } catch (error) {
            console.error(error);
            setErro('Erro ao carregar os detalhes do curso.');
            setCarregando(false);
        }
    };

    const enviarAvaliacao = async (e) => {
        e.preventDefault();
        if (!notaAvaliacao) return setMsgAvaliacao('Por favor selecione uma nota.');
        setEnviandoAvaliacao(true);
        try {
            await api.post(`/cursos/publico/${id}/avaliar`, { nota: notaAvaliacao, comentario: comentarioAvaliacao });
            setMsgAvaliacao('✅ Avaliação enviada com sucesso! Obrigado.');
            carregarCurso(); // Refresh reviews
            setNotaAvaliacao(0);
            setComentarioAvaliacao('');
        } catch (err) {
            setMsgAvaliacao(`❌ ${err.response?.data?.erro || 'Erro ao enviar avaliação.'}`);
        } finally {
            setEnviandoAvaliacao(false);
        }
    };

    if (carregando) return <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center font-bold text-gray-500 text-xl">A carregar curso...</div>;
    if (erro || !curso) return <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center text-red-500 font-bold p-6 text-center"><span className="text-4xl mb-4">😕</span><p>{erro || "Curso não encontrado."}</p><Link to="/" className="mt-6 text-[#3347FF] underline">Voltar à Página Inicial</Link></div>;

    const embedUrl = curso.checkout_video_url && curso.checkout_video_url.includes('youtube.com/watch?v=')
        ? curso.checkout_video_url.replace('watch?v=', 'embed/')
        : curso.checkout_video_url;

    return (
        <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2B2B2B]">
            {/* HERO SECTION */}
            <header className="bg-[#1C1D1F] text-white py-16 md:py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #3347FF 0%, transparent 70%)' }}></div>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">

                    {/* INFO COL */}
                    <div className="flex-1 space-y-6">
                        <Link to="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">← Explorar outros cursos</Link>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">{curso.titulo}</h1>
                        <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl">
                            {curso.descricao ? curso.descricao.substring(0, 150) + "..." : "Aprenda as habilidades necessárias para dominar este tema com o nosso treinamento completo."}
                        </p>

                        {/* Rating Summary in Hero */}
                        {curso.nota_media && (
                            <div className="flex items-center gap-3">
                                <span className="font-extrabold text-[#FFE3D6] text-xl">{curso.nota_media}</span>
                                <StarRating nota={parseFloat(curso.nota_media)} size={22} />
                                <span className="text-gray-400 text-sm">({curso.total_avaliacoes} avaliações)</span>
                            </div>
                        )}

                        <div className="flex items-center gap-4 py-4">
                            {curso.autor && (
                                <Link to={`/autor/${curso.autor.id}`} className="flex items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-[#3347FF] transition-colors">
                                        {curso.autor.foto_url ? (
                                            <img src={curso.autor.foto_url} alt={curso.autor.nome} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center font-bold text-white">{curso.autor.nome.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">Criado por</div>
                                        <div className="font-bold text-white group-hover:text-[#3347FF] transition-colors">{curso.autor.nome}</div>
                                    </div>
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button onClick={() => navigate(`/checkout/${curso.id}`)} className="bg-[#3347FF] hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                                Comprar Agora por R$ {curso.preco}
                            </button>
                        </div>
                    </div>

                    {/* MEDIA COL */}
                    <div className="w-full md:w-5/12 max-w-md shrink-0">
                        <div className="bg-white p-2 rounded-2xl shadow-2xl relative">
                            {embedUrl ? (
                                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                    <iframe src={embedUrl} title="Vídeo de Apresentação" className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                </div>
                            ) : (
                                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {curso.capa_url ? (
                                        <img src={curso.capa_url} alt={curso.titulo} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl">🎓</span>
                                    )}
                                </div>
                            )}
                            <div className="pt-6 pb-4 px-4 text-center">
                                <h3 className="text-3xl font-extrabold text-[#2B2B2B] mb-4">R$ {curso.preco}</h3>
                                <button onClick={() => navigate(`/checkout/${curso.id}`)} className="w-full bg-[#1C1D1F] hover:bg-black text-white px-6 py-4 rounded-xl font-bold text-lg transition-colors">
                                    Inscrever-me Agora
                                </button>
                                <p className="text-xs text-gray-500 font-bold mt-4">Acesso imediato • Pagamento seguro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* BODY */}
            <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* LEFT COL: Content */}
                <div className="lg:col-span-2 space-y-16">

                    {/* Descrição */}
                    {curso.descricao && (
                        <section>
                            <h2 className="text-2xl font-extrabold mb-6 text-[#2B2B2B]">Sobre este curso</h2>
                            <div className="prose prose-lg text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                                {curso.descricao}
                            </div>
                        </section>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {curso.publico_alvo && (
                            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#2B2B2B]"><span>🎯</span> Para quem é este curso?</h3>
                                <p className="text-gray-600 font-medium whitespace-pre-wrap text-sm leading-relaxed">{curso.publico_alvo}</p>
                            </section>
                        )}
                        {curso.requisitos && (
                            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#2B2B2B]"><span>⚙️</span> Pré-requisitos</h3>
                                <p className="text-gray-600 font-medium whitespace-pre-wrap text-sm leading-relaxed">{curso.requisitos}</p>
                            </section>
                        )}
                    </div>

                    {/* Currículo */}
                    <section>
                        <h2 className="text-2xl font-extrabold mb-6 text-[#2B2B2B]">Conteúdo do Curso</h2>
                        {curso.modulos && curso.modulos.length > 0 ? (
                            <div className="space-y-4">
                                {curso.modulos.map((modulo, index) => (
                                    <div key={modulo.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                            <h4 className="font-bold text-[#2B2B2B]">Módulo {index + 1}: {modulo.titulo}</h4>
                                            <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">{modulo.aulas?.length || 0} aulas</span>
                                        </div>
                                        <ul className="divide-y divide-gray-100">
                                            {modulo.aulas && modulo.aulas.map((aula, idx) => (
                                                <li key={aula.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                                    <span className="text-gray-300 text-lg">{aula.tipo === 'video' ? '📺' : aula.tipo === 'quiz' ? '📝' : '📄'}</span>
                                                    <span className="font-medium text-gray-700 text-sm">Aula {idx + 1}: {aula.titulo}</span>
                                                </li>
                                            ))}
                                            {(!modulo.aulas || modulo.aulas.length === 0) && (
                                                <li className="px-6 py-4 text-sm text-gray-400 italic">Módulo em construção.</li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 font-medium italic">O conteúdo programático ainda não foi disponibilizado pelo autor.</p>
                        )}
                    </section>

                    {/* ================================================ */}
                    {/* AVALIAÇÕES E REVIEWS */}
                    {/* ================================================ */}
                    <section>
                        <h2 className="text-2xl font-extrabold mb-2 text-[#2B2B2B]">Avaliações dos Alunos</h2>

                        {/* Rating Summary */}
                        {curso.nota_media ? (
                            <div className="flex items-center gap-6 mb-8 p-6 bg-[#F9F8F6] rounded-2xl border border-gray-200">
                                <div className="text-center">
                                    <div className="text-6xl font-extrabold text-[#B2624F]">{curso.nota_media}</div>
                                    <StarRating nota={parseFloat(curso.nota_media)} size={20} />
                                    <div className="text-xs text-gray-500 mt-1 font-medium">Média do curso</div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 font-medium">{curso.total_avaliacoes} aluno(s) avaliaram este curso.</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic mb-8 text-sm">Ainda não há avaliações. Seja o primeiro!</p>
                        )}

                        {/* Reviews List */}
                        {curso.avaliacoes && curso.avaliacoes.length > 0 && (
                            <div className="space-y-5 mb-10">
                                {curso.avaliacoes.map(av => (
                                    <div key={av.id} className="flex gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-[#3347FF]">
                                            {av.usuario_foto ? <img src={av.usuario_foto} alt={av.usuario_nome} className="w-full h-full object-cover rounded-full" /> : av.usuario_nome?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-[#2B2B2B]">{av.usuario_nome}</span>
                                                <StarRating nota={av.nota} size={16} />
                                            </div>
                                            {av.comentario && <p className="text-gray-600 text-sm leading-relaxed">{av.comentario}</p>}
                                            <p className="text-xs text-gray-400 mt-2">{new Date(av.data).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit Review Form */}
                        {usuarioLogado ? (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-[#2B2B2B]">Deixe a sua avaliação</h3>
                                <form onSubmit={enviarAvaliacao} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">A sua nota</label>
                                        <StarRating nota={notaAvaliacao} onChange={setNotaAvaliacao} size={32} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Comentário (opcional)</label>
                                        <textarea
                                            placeholder="O que achou do curso? Ajude outros alunos!"
                                            value={comentarioAvaliacao}
                                            onChange={e => setComentarioAvaliacao(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium text-sm resize-none min-h-[100px]"
                                        />
                                    </div>
                                    {msgAvaliacao && <p className={`text-sm font-medium ${msgAvaliacao.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{msgAvaliacao}</p>}
                                    <button type="submit" disabled={enviandoAvaliacao} className="bg-[#3347FF] hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50">
                                        {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
                                <p className="text-gray-600 font-medium mb-3">Faça login para deixar a sua avaliação.</p>
                                <button onClick={() => navigate('/login')} className="bg-[#3347FF] text-white font-bold px-6 py-2 rounded-lg">Fazer Login</button>
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COL: Author Bio */}
                <div className="lg:col-span-1">
                    {curso.autor && (
                        <div className="sticky top-24 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-xl font-extrabold text-[#2B2B2B] mb-6">Conheça o Instrutor</h3>

                            <div className="flex flex-col items-center text-center">
                                <Link to={`/autor/${curso.autor.id}`} className="block w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-50 shadow-inner group relative">
                                    {curso.autor.foto_url ? (
                                        <img src={curso.autor.foto_url} alt={curso.autor.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <span className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-4xl font-bold">{curso.autor.nome.charAt(0)}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">Ver Perfil</span>
                                    </div>
                                </Link>

                                <Link to={`/autor/${curso.autor.id}`}>
                                    <h4 className="text-xl font-bold text-[#3347FF] hover:underline mb-1">{curso.autor.nome}</h4>
                                </Link>

                                {curso.autor.titulo_profissional && (
                                    <p className="text-sm font-bold text-gray-500 mb-6 px-4">{curso.autor.titulo_profissional}</p>
                                )}

                                {curso.autor.biografia ? (
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">
                                        {curso.autor.biografia.length > 200 ? curso.autor.biografia.substring(0, 200) + "..." : curso.autor.biografia}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic mb-6">Instrutor na Data Frontier Academy.</p>
                                )}

                                <Link to={`/autor/${curso.autor.id}`} className="w-full block bg-gray-50 hover:bg-gray-100 text-[#2B2B2B] text-center px-4 py-3 rounded-xl font-bold transition-colors border border-gray-200">
                                    Ver Perfil Completo
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
