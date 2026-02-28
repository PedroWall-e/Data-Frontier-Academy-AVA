const express = require('express');
const db = require('../config/db');

const router = express.Router();

// ==========================================
// ROTA LOCAL DE SIMULAÇÃO DE CHECKOUT
// (Fase 1: Mock de Webhooks do MercadoPago/Stripe)
// ==========================================

router.post('/simular-pagamento', async (req, res) => {
    const { curso_id, usuario_id, valor_pago } = req.body;

    if (!curso_id || !usuario_id) {
        return res.status(400).json({ erro: "Faltam parâmetros (curso_id ou usuario_id)" });
    }

    try {
        console.log(`[Webhook Mock] Simulando pagamento aprovado para o curso ${curso_id} (Usuário: ${usuario_id})`);

        // Verifica se o curso existe
        const [cursos] = await db.execute('SELECT preco FROM cursos WHERE id = ?', [curso_id]);
        if (cursos.length === 0) {
            return res.status(404).json({ erro: "Curso não encontrado" });
        }

        // Simula a inserção na tabela de matrículas como se fosse uma aprovação do Stripe/MercadoPago
        const valorFinal = valor_pago !== undefined ? valor_pago : cursos[0].preco;

        await db.execute(
            'INSERT INTO matriculas (aluno_id, curso_id, valor_pago, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = "ativa", valor_pago = ?',
            [usuario_id, curso_id, valorFinal, 'ativa', valorFinal]
        );

        console.log(`[Webhook Mock] Matrícula ativada com sucesso!`);
        res.json({ success: true, mensagem: "Pagamento simulado. Aluno matriculado e acesso liberado!" });
    } catch (erro) {
        console.error("[Webhook Mock] Erro ao simular pagamento:", erro);
        res.status(500).json({ erro: "Erro interno ao simular pagamento", detalhe: erro.message });
    }
});

module.exports = router;
