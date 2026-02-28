const express = require('express');
const db = require('../config/db');
const { verificarToken } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configuração do Multer para entrega de tarefas
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/entregas/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `entrega-${uuidv4()}${ext}`);
    }
});
const upload = multer({ storage });

// Garantir que a pasta existe (Simples)
const fs = require('fs');
if (!fs.existsSync('uploads/entregas/')) {
    fs.mkdirSync('uploads/entregas/', { recursive: true });
}

// Submeter tarefa (Aluno)
router.post('/entregar', verificarToken, upload.single('arquivo'), async (req, res) => {
    const { aula_id, link_externo, observacoes } = req.body;
    const usuario_id = req.usuarioLogado.id;
    const arquivo_url = req.file ? `/uploads/entregas/${req.file.filename}` : null;

    try {
        const [resultado] = await db.execute(
            'INSERT INTO entregas_tarefa (aula_id, usuario_id, arquivo_url, link_externo, observacoes) VALUES (?, ?, ?, ?, ?)',
            [aula_id, usuario_id, arquivo_url, link_externo || null, observacoes || null]
        );
        res.json({ mensagem: "Tarefa entregue com sucesso!", id: resultado.insertId });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao entregar tarefa." });
    }
});

// Listar entregas de uma aula (Produtor)
router.get('/aula/:aulaId/entregas', verificarToken, async (req, res) => {
    try {
        const [entregas] = await db.execute(`
            SELECT et.*, u.nome as aluno_nome, u.email as aluno_email
            FROM entregas_tarefa et
            JOIN usuarios u ON et.usuario_id = u.id
            WHERE et.aula_id = ?
            ORDER BY et.data_entrega DESC
        `, [req.params.aulaId]);
        res.json(entregas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar entregas." });
    }
});

// Dar nota/feedback à tarefa (Produtor)
router.put('/feedback/:id', verificarToken, async (req, res) => {
    const { nota, feedback } = req.body;
    try {
        await db.execute(
            'UPDATE entregas_tarefa SET nota = ?, feedback = ? WHERE id = ?',
            [nota, feedback, req.params.id]
        );
        res.json({ mensagem: "Feedback enviado!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao enviar feedback." });
    }
});

module.exports = router;
