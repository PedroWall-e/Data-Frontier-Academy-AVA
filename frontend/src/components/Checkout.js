import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Checkout() {
    const { cursoId } = useParams();
    const navigate = useNavigate();
    const [curso, setCurso] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    const [cupom, setCupom] = useState('');
    const [desconto, setDesconto] = useState(0);
    const [msgCupom, setMsgCupom] = useState('');
    const [orderBumps, setOrderBumps] = useState([]);
    const [bumpsSelecionados, setBumpsSelecionados] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const resCurso = await api.get(`/cursos/${cursoId}`);
                setCurso(resCurso.data);

                const resPlanos = await api.get(`/cursos/produtor/curso/${cursoId}/planos`);
                setPlanos(resPlanos.data);
                if (resPlanos.data.length > 0) setPlanoSelecionado(resPlanos.data[0]);

                const resOfertas = await api.get(`/cursos/produtor/curso/${cursoId}/ofertas`);
                setOrderBumps(resOfertas.data.filter(o => o.tipo === 'order_bump'));

                setCarregando(false);
            } catch (erro) {
                console.error(erro);
                setCarregando(false);
            }
        };
        carregarDados();
    }, [cursoId]);

    const aplicarCupom = async () => {
        try {
            const res = await api.post('/cursos/validar-cupom', { codigo: cupom, curso_id: cursoId });
            setDesconto(res.data.desconto);
            setMsgCupom(`✅ Desconto de ${res.data.desconto}% aplicado!`);
        } catch (erro) {
            setMsgCupom('❌ Cupom inválido ou expirado.');
            setDesconto(0);
        }
    };

    const toggleBump = (bump) => {
        if (bumpsSelecionados.find(b => b.id === bump.id)) {
            setBumpsSelecionados(bumpsSelecionados.filter(b => b.id !== bump.id));
        } else {
            setBumpsSelecionados([...bumpsSelecionados, bump]);
        }
    };

    const calcularTotal = () => {
        if (!planoSelecionado) return 0;
        let total = parseFloat(planoSelecionado.preco);

        // Aplicar cupom (apenas no produto principal?)
        total = total * (1 - desconto / 100);

        // Somar bumps
        bumpsSelecionados.forEach(b => {
            total += parseFloat(b.preco_oferta);
        });

        return total.toFixed(2);
    };

    const finalizarCompra = async () => {
        alert(`Compra de R$ ${calcularTotal()} simulada com sucesso! Bem-vindo ao curso.`);
        // Aqui simularia a criação da matrícula
        try {
            await api.post('/auth/matricular-teste', { curso_id: cursoId }); // MOCK endpoint
            // E matricular nos bumps também
            for (let b of bumpsSelecionados) {
                await api.post('/auth/matricular-teste', { curso_id: b.curso_oferta_id });
            }
            navigate('/dashboard');
        } catch (e) {
            navigate('/dashboard');
        }
    };

    if (carregando) return <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] font-sans text-[#2B2B2B]">Carregando checkout seguro...</div>;
    if (!curso) return <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] font-sans text-red-600 font-bold">Curso não encontrado.</div>;

    return (
        <div className="min-h-screen bg-[#F9F8F6] font-sans py-12 px-4 text-[#2B2B2B]">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Finalizar sua Inscrição</h2>
                    <p className="text-gray-600 mb-8">Você está adquirindo: <strong className="text-[#2B2B2B]">{curso.titulo}</strong></p>

                    {curso.checkout_video_url && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm mb-8 border border-gray-100">
                            <iframe
                                width="100%"
                                height="100%"
                                src={curso.checkout_video_url}
                                title="Vídeo de Vendas"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen>
                            </iframe>
                        </div>
                    )}

                    <div className="mb-8">
                        <h4 className="font-bold text-lg mb-4">Escolha o seu plano</h4>
                        <div className="space-y-3">
                            {planos.map(p => (
                                <label
                                    key={p.id}
                                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${planoSelecionado?.id === p.id ? 'border-[#3347FF] bg-blue-50/30' : 'border-gray-200 hover:border-blue-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="plano"
                                            className="w-5 h-5 text-[#3347FF] focus:ring-[#3347FF]"
                                            checked={planoSelecionado?.id === p.id}
                                            onChange={() => setPlanoSelecionado(p)}
                                        />
                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                                            <span className="font-bold text-lg">{p.titulo}</span>
                                            <div className="text-right mt-1 sm:mt-0">
                                                <span className="font-extrabold text-[#3347FF]">R$ {p.preco}</span>
                                                {p.tipo !== 'unico' && <span className="text-gray-500 text-sm"> /{p.tipo}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {p.trial_dias > 0 && <div className="mt-2 ml-8 inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md">{p.trial_dias} dias grátis</div>}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Tem um cupom de desconto?"
                                className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3347FF]/30 transition-all font-medium text-sm"
                                value={cupom}
                                onChange={e => setCupom(e.target.value)}
                            />
                            <button
                                className="bg-[#2B2B2B] text-white px-6 font-bold rounded-lg hover:bg-black transition-colors"
                                onClick={aplicarCupom}
                            >
                                Aplicar
                            </button>
                        </div>
                        {msgCupom && <p className={`mt-2 text-sm font-medium ${desconto > 0 ? 'text-green-600' : 'text-red-500'}`}>{msgCupom}</p>}
                    </div>

                    {orderBumps.length > 0 && (
                        <div className="mb-8">
                            <h4 className="font-bold text-lg mb-4 text-[#B2624F]">🔥 Ofertas Especiais para você</h4>
                            <div className="space-y-4">
                                {orderBumps.map(b => {
                                    const isSelected = bumpsSelecionados.find(bs => bs.id === b.id);
                                    return (
                                        <div
                                            key={b.id}
                                            className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex gap-4 ${isSelected ? 'border-[#3347FF] bg-blue-50/50' : 'border-gray-300 hover:border-blue-300 bg-gray-50'}`}
                                            onClick={() => toggleBump(b)}
                                        >
                                            <div className="pt-1">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 text-[#3347FF] rounded focus:ring-[#3347FF]"
                                                    checked={isSelected || false}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <strong className="block text-[#2B2B2B]">{b.titulo_oferta}</strong>
                                                <p className="text-sm text-gray-600 mt-1 mb-2">{b.descricao_oferta}</p>
                                                <span className="inline-block bg-[#FFE3D6] text-[#B2624F] text-xs font-bold px-2 py-1 rounded">Por apenas + R$ {b.preco_oferta}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="font-bold mb-4">Forma de Pagamento</h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 font-medium">💳 Cartão de Crédito (Simulação)</div>
                            <p className="text-xs text-gray-500 mt-2">Ambiente de teste criptografado. Nenhuma cobrança real será feita.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:w-[400px]">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-6">
                        <h3 className="text-xl font-extrabold mb-6">Resumo do Pedido</h3>

                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-600 line-clamp-2">{curso.titulo}</span>
                                <span className="whitespace-nowrap">R$ {planoSelecionado?.preco || '0.00'}</span>
                            </div>

                            {desconto > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Desconto ({desconto}%)</span>
                                    <span>- R$ {((planoSelecionado?.preco || 0) * desconto / 100).toFixed(2)}</span>
                                </div>
                            )}

                            {bumpsSelecionados.map(b => (
                                <div key={b.id} className="flex justify-between items-start gap-2 text-gray-600 border-t border-gray-50 pt-3">
                                    <span className="line-clamp-2">+ {b.curso_nome}</span>
                                    <span className="whitespace-nowrap">R$ {b.preco_oferta}</span>
                                </div>
                            ))}
                        </div>

                        <hr className="my-6 border-gray-100" />

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xl font-bold">Total</span>
                            <span className="text-3xl font-extrabold text-[#3347FF]">R$ {calcularTotal()}</span>
                        </div>

                        <button
                            className="w-full bg-[#3347FF] hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
                            onClick={finalizarCompra}
                        >
                            GARANTIR MINHA VAGA AGORA
                        </button>

                        <div className="mt-6 text-center text-xs font-semibold text-gray-500 flex items-center justify-center gap-1.5">
                            🛡️ Garantia de 7 dias ou seu dinheiro de volta.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
