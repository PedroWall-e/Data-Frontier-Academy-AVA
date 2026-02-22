const express = require('express');
const db = require('../config/db');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rota de Estatísticas Globais
router.get('/estatisticas', verificarToken, async (req, res) => {
    if (req.usuarioLogado.papel !== 'admin') {
        return res.status(403).json({ erro: "Acesso restrito a Administradores." });
    }

    try {
        const [totalUsuarios] = await db.execute('SELECT COUNT(*) as total FROM usuarios');
        const [totalCursos] = await db.execute('SELECT COUNT(*) as total FROM cursos');
        const [totalMatriculas] = await db.execute('SELECT COUNT(*) as total FROM matriculas WHERE status = "ativa"');
        const [chamadosAbertos] = await db.execute('SELECT COUNT(*) as total FROM chamados WHERE status != "fechado"');

        res.json({
            usuarios: totalUsuarios[0].total,
            cursos: totalCursos[0].total,
            matriculas: totalMatriculas[0].total,
            chamadosPendentes: chamadosAbertos[0].total
        });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao carregar estatísticas." });
    }
});

// Matricular aluno manualmente
router.post('/matricular', verificarToken, async (req, res) => {
    if (req.usuarioLogado.papel !== 'admin' && req.usuarioLogado.papel !== 'produtor') {
        return res.status(403).json({ erro: "Sem permissão." });
    }

    const { aluno_id, curso_id } = req.body;

    try {
        await db.execute(
            'INSERT INTO matriculas (aluno_id, curso_id, status) VALUES (?, ?, "ativa") ON DUPLICATE KEY UPDATE status = "ativa"',
            [aluno_id, curso_id]
        );
        res.json({ mensagem: "Aluno matriculado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao matricular aluno." });
    }
});

// Relatório Completo
router.get('/relatorio-completo', verificarToken, async (req, res) => {
    if (req.usuarioLogado.papel !== 'admin') return res.status(403).json({ erro: "Acesso Negado." });
    try {
        const [usuarios] = await db.execute('SELECT id, nome, email, papel FROM usuarios ORDER BY id DESC');
        const [cursos] = await db.execute('SELECT id, titulo, preco FROM cursos ORDER BY id DESC');

        const [matriculas] = await db.execute(`
            SELECT m.id, u.nome as aluno_nome, c.titulo as curso_titulo, c.preco, m.status, m.data_compra
            FROM matriculas m
            JOIN usuarios u ON m.aluno_id = u.id
            JOIN cursos c ON m.curso_id = c.id
            ORDER BY m.data_compra DESC
        `);

        const [vendas] = await db.execute(`
            SELECT SUM(c.preco) as receita_total 
            FROM matriculas m 
            JOIN cursos c ON m.curso_id = c.id 
            WHERE m.status = 'ativa'
        `);

        res.json({
            usuarios,
            cursos,
            matriculas,
            receitaTotal: vendas[0].receita_total || 0
        });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao gerar relatório." });
    }
});

module.exports = router;
