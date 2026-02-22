import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './Certificado.css';

export default function Certificado() {
    const { cursoId } = useParams();
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregar = async () => {
            try {
                // Verificar se o aluno realmente concluiu antes de mostrar
                const res = await api.get(`/cursos/${cursoId}`);
                const curso = res.data;

                const totalAulas = curso.modulos.reduce((acc, mod) => acc + mod.aulas.length, 0);
                const aulasConcluidas = curso.modulos.reduce((acc, mod) => acc + mod.aulas.filter(a => a.concluida).length, 0);

                if (aulasConcluidas < totalAulas && totalAulas > 0) {
                    alert("Você ainda não concluiu todas as aulas deste curso!");
                    window.close();
                    return;
                }

                setDados({
                    aluno: localStorage.getItem('usuarioNome') || 'Estudante',
                    curso: curso.titulo,
                    data: new Date().toLocaleDateString(),
                    instrutor: 'Equipe Data Frontier'
                });
                setCarregando(false);
            } catch (e) {
                console.error(e);
                setCarregando(false);
            }
        };
        carregar();
    }, [cursoId]);

    if (carregando) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Validando conclusão e gerando certificado...</div>;
    if (!dados) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Erro ao gerar certificado.</div>;

    return (
        <div className="certificado-page">
            <div className="certificado-border">
                <div className="certificado-content">
                    <img src="/logo-black.png" alt="Data Frontier" style={{ width: '150px', marginBottom: '40px' }} />
                    <h1>CERTIFICADO DE CONCLUSÃO</h1>
                    <p className="cert-intro">Certificamos para os devidos fins que</p>
                    <h2 className="cert-nome">{dados.aluno}</h2>
                    <p className="cert-intro">concluiu com êxito o treinamento</p>
                    <h3 className="cert-curso">{dados.curso}</h3>
                    <p className="cert-meta">Realizado na plataforma <strong>Data Frontier Academy</strong></p>

                    <div className="cert-footer">
                        <div className="cert-sign">
                            <hr />
                            <span>{dados.instrutor}</span>
                            <small>Diretor Pedagógico</small>
                        </div>
                        <div className="cert-date">
                            <span>Emitido em: {dados.data}</span>
                            <small>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</small>
                        </div>
                    </div>
                </div>
            </div>
            <button className="no-print btn-imprimir" onClick={() => window.print()}>🖨️ Imprimir / Salvar PDF</button>
        </div>
    );
}
