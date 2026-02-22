const express = require('express');
const db = require('../config/db');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Listar chamados
router.get('/', verificarToken, async (req, res) => {
    const { id, papel } = req.usuarioLogado;
    let query = `
        SELECT c.*, u.nome as criador_nome 
        FROM chamados c 
        JOIN usuarios u ON c.usuario_id = u.id 
        ORDER BY c.atualizado_em DESC
    `;
    let params = [];

    if (papel === 'aluno' || papel === 'produtor') {
        query = `
            SELECT c.*, u.nome as criador_nome 
            FROM chamados c 
            JOIN usuarios u ON c.usuario_id = u.id 
            WHERE c.usuario_id = ? 
            ORDER BY c.atualizado_em DESC
        `;
        params = [id];
    }

    try {
        const [chamados] = await db.execute(query, params);
        res.json(chamados);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar chamados." });
    }
});

// Abrir chamado
router.post('/', verificarToken, async (req, res) => {
    const { assunto, mensagem } = req.body;
    const usuarioId = req.usuarioLogado.id;

    try {
        const [resultado] = await db.execute('INSERT INTO chamados (usuario_id, assunto) VALUES (?, ?)', [usuarioId, assunto]);
        const chamadoId = resultado.insertId;

        await db.execute('INSERT INTO mensagens_chamados (chamado_id, remetente_id, mensagem) VALUES (?, ?, ?)', [chamadoId, usuarioId, mensagem]);

        res.json({ mensagem: "Chamado aberto com sucesso!", chamadoId });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar chamado." });
    }
});

// Ler mensagens de um chamado
router.get('/:id/mensagens', verificarToken, async (req, res) => {
    const chamadoId = req.params.id;

    try {
        const [mensagens] = await db.execute(`
            SELECT m.*, u.nome as remetente_nome, u.papel as remetente_papel 
            FROM mensagens_chamados m
            JOIN usuarios u ON m.remetente_id = u.id
            WHERE m.chamado_id = ?
            ORDER BY m.criado_em ASC
        `, [chamadoId]);

        res.json(mensagens);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao carregar mensagens." });
    }
});

// Responder
router.post('/:id/mensagens', verificarToken, async (req, res) => {
    const chamadoId = req.params.id;
    const { mensagem } = req.body;
    const remetenteId = req.usuarioLogado.id;

    try {
        await db.execute(
            'INSERT INTO mensagens_chamados (chamado_id, remetente_id, mensagem) VALUES (?, ?, ?)',
            [chamadoId, remetenteId, mensagem]
        );

        await db.execute('UPDATE chamados SET atualizado_em = CURRENT_TIMESTAMP WHERE id = ?', [chamadoId]);

        res.json({ mensagem: "Resposta enviada!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao enviar resposta." });
    }
});

module.exports = router;
