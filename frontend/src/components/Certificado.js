import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Certificado() {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const validar = async () => {
            try {
                const res = await api.get(`/certificados/validar/${codigo}`);
                if (res.data.valido) {
                    setDados({
                        aluno: res.data.dados.aluno_nome,
                        curso: res.data.dados.curso_nome,
                        data: new Date(res.data.dados.data_emissao).toLocaleDateString(),
                        instrutor: 'Equipe Data Frontier',
                        codigo: res.data.dados.codigo_validacao,
                        carga: res.data.dados.carga_horaria || 0
                    });
                }
                setCarregando(false);
            } catch (e) {
                console.error(e);
                setCarregando(false);
            }
        };
        validar();
    }, [codigo]);

    if (carregando) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] font-sans">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#3347FF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold">Validando conclusão e gerando certificado...</p>
            </div>
        </div>
    );

    if (!dados) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] font-sans">
            <p className="text-red-500 font-bold text-xl">Erro ao gerar certificado.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 font-sans">
            {/* Certificado Container */}
            <div
                id="certificado-imprimir"
                className="relative bg-white w-full max-w-[1000px] aspect-[1.414/1] shadow-2xl overflow-hidden border-[16px] border-[#2B2B2B] p-12 flex flex-col items-center justify-between text-center"
            >
                {/* Decorative border or pattern */}
                <div className="absolute inset-0 border-[2px] border-gold-500 m-2 pointer-events-none opacity-20"></div>

                {/* Header */}
                <div className="z-10 w-full flex flex-col items-center">
                    <div className="mb-6">
                        {/* Logo Simplified */}
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-2xl tracking-tight text-[#2B2B2B]">
                                data <span className="text-[#3347FF] font-medium">academy</span>
                            </span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-widest mb-2">CERTIFICADO</h1>
                    <p className="text-[#3347FF] font-bold tracking-[0.3em] text-sm uppercase">de conclusão de treinamento</p>
                </div>

                {/* Body */}
                <div className="z-10 flex flex-col items-center justify-center space-y-6">
                    <p className="text-lg text-gray-500 italic">Certificamos para os devidos fins que</p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#3347FF] py-2 border-b-2 border-gray-100 min-w-[300px]">
                        {dados.aluno}
                    </h2>
                    <p className="text-lg text-gray-500 italic">concluiu com êxito o treinamento de alto nível</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] leading-tight max-w-2xl">
                        {dados.curso}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium max-w-md">
                        Realizado na plataforma oficial da <span className="text-[#2B2B2B] font-bold">Frontier Academy by Data Frontier</span>, abrangendo todos os módulos pedagógicos e avaliações práticas.
                    </p>
                </div>

                {/* Footer */}
                <div className="z-10 w-full flex flex-col sm:flex-row items-end justify-between px-8">
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-48 h-0.5 bg-gray-300 mb-2"></div>
                        <span className="text-sm font-bold text-[#2B2B2B]">{dados.instrutor}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Diretor de Tecnologia e Ensino</span>
                    </div>

                    <div className="flex flex-col items-end gap-1 mt-6 sm:mt-0">
                        <span className="text-sm font-bold text-gray-600">Emitido em: {dados.data}</span>
                        <span className="text-[10px] text-gray-400 font-mono">ID VALIDAÇÃO: {dados.codigo}</span>
                        {dados.carga > 0 && <span className="text-[10px] text-gray-400 font-mono">CARGA HORÁRIA: {dados.carga}H</span>}
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#3347FF] opacity-[0.03] rounded-full"></div>
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#B2624F] opacity-[0.03] rounded-full"></div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex gap-4 no-print">
                <button
                    onClick={() => window.print()}
                    className="bg-[#2B2B2B] hover:bg-black text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all flex items-center gap-2"
                >
                    <span>🖨️</span> Imprimir ou Salvar PDF
                </button>
                <button
                    onClick={() => navigate('/painel')}
                    className="bg-white border-2 border-gray-200 text-gray-600 hover:text-[#3347FF] hover:border-[#3347FF] font-bold py-3 px-8 rounded-full transition-all"
                >
                    Voltar para Área do Aluno
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #certificado-imprimir {
                        box-shadow: none !important;
                        border-width: 10mm !important;
                        max-width: none !important;
                        width: 100% !important;
                        height: 210mm !important;
                        page-break-after: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
