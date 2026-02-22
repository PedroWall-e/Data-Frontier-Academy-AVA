import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './Checkout.css';

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

    if (carregando) return <div className="checkout-loading">Carregando checkout seguro...</div>;
    if (!curso) return <div className="checkout-error">Curso não encontrado.</div>;

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-main">
                    <h2>Finalizar sua Inscrição</h2>
                    <p>Você está adquirindo: <strong>{curso.titulo}</strong></p>

                    {curso.checkout_video_url && (
                        <div className="checkout-video" style={{ margin: '20px 0', aspectRatio: '16/9' }}>
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

                    <div className="planos-selection">
                        <h4>Escolha o seu plano:</h4>
                        {planos.map(p => (
                            <label key={p.id} className={`plano-option ${planoSelecionado?.id === p.id ? 'active' : ''}`}>
                                <input type="radio" name="plano" checked={planoSelecionado?.id === p.id} onChange={() => setPlanoSelecionado(p)} />
                                <div className="plano-info">
                                    <span className="plano-titulo">{p.titulo}</span>
                                    <span className="plano-preco">R$ {p.preco} {p.tipo !== 'unico' && `/${p.tipo}`}</span>
                                    {p.trial_dias > 0 && <span className="plano-trial">{p.trial_dias} dias grátis</span>}
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="coupon-section">
                        <input type="text" placeholder="Tem um cupom de desconto?" value={cupom} onChange={e => setCupom(e.target.value)} />
                        <button onClick={aplicarCupom}>Aplicar</button>
                        {msgCupom && <p className="msg-cupom">{msgCupom}</p>}
                    </div>

                    {orderBumps.length > 0 && (
                        <div className="order-bumps">
                            <h4>Ofertas Especiais para você:</h4>
                            {orderBumps.map(b => (
                                <div key={b.id} className={`bump-card ${bumpsSelecionados.find(bs => bs.id === b.id) ? 'selected' : ''}`} onClick={() => toggleBump(b)}>
                                    <div className="bump-checkbox">
                                        <input type="checkbox" checked={bumpsSelecionados.find(bs => bs.id === b.id)} readOnly />
                                    </div>
                                    <div className="bump-content">
                                        <strong>{b.titulo_oferta}</strong>
                                        <p>{b.descricao_oferta}</p>
                                        <span className="bump-price">Por apenas + R$ {b.preco_oferta}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="payment-simulation">
                        <h4>Forma de Pagamento</h4>
                        <div className="payment-mock">
                            <div className="card-mock">💳 Cartão de Crédito (Simulação)</div>
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>Ambiente de teste criptografado.</p>
                        </div>
                    </div>
                </div>

                <div className="checkout-sidebar">
                    <div className="summary-card">
                        <h3>Resumo do Pedido</h3>
                        <div className="summary-item">
                            <span>{curso.titulo}</span>
                            <span>R$ {planoSelecionado?.preco}</span>
                        </div>
                        {desconto > 0 && (
                            <div className="summary-item discount">
                                <span>Desconto ({desconto}%)</span>
                                <span>- R$ {(planoSelecionado?.preco * desconto / 100).toFixed(2)}</span>
                            </div>
                        )}
                        {bumpsSelecionados.map(b => (
                            <div key={b.id} className="summary-item bump">
                                <span>{b.curso_nome}</span>
                                <span>R$ {b.preco_oferta}</span>
                            </div>
                        ))}
                        <hr />
                        <div className="summary-total">
                            <span>Total</span>
                            <span>R$ {calcularTotal()}</span>
                        </div>
                        <button className="btn-finalizar" onClick={finalizarCompra}>GARANTIR MINHA VAGA AGORA</button>
                        <p className="garantia-msg">🛡️ Garantia de 7 dias ou seu dinheiro de volta.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
