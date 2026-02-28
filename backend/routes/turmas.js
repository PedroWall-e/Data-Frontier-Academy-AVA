const express = require('express');
const db = require('../config/db');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Listar turmas de um curso (Produtor ou Aluno matriculado)
router.get('/curso/:cursoId', verificarToken, async (req, res) => {
    try {
        const [turmas] = await db.execute('SELECT * FROM turmas WHERE curso_id = ? ORDER BY data_inicio DESC', [req.params.cursoId]);
        res.json(turmas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar turmas." });
    }
});

// Criar nova turma (Produtor)
router.post('/', verificarToken, async (req, res) => {
    const { curso_id, nome, data_inicio, data_fim } = req.body;
    try {
        const [resultado] = await db.execute(
            'INSERT INTO turmas (curso_id, nome, data_inicio, data_fim) VALUES (?, ?, ?, ?)',
            [curso_id, nome, data_inicio, data_fim]
        );
        res.json({ mensagem: "Turma criada com sucesso!", id: resultado.insertId });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar turma." });
    }
});

// Vincular aluno a uma turma (Produtor)
router.put('/vincular-aluno', verificarToken, async (req, res) => {
    const { matricula_id, turma_id } = req.body;
    try {
        await db.execute('UPDATE matriculas SET turma_id = ? WHERE id = ?', [turma_id, matricula_id]);
        res.json({ mensagem: "Aluno vinculado à turma com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao vincular aluno." });
    }
});

// Excluir turma
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM turmas WHERE id = ?', [req.params.id]);
        res.json({ mensagem: "Turma removida!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao remover turma." });
    }
});

module.exports = router;
