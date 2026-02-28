const express = require('express');
const db = require('../config/db');
const { verificarToken } = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Emitir certificado (Aluno)
router.post('/emitir', verificarToken, async (req, res) => {
    const { curso_id } = req.body;
    const usuario_id = req.usuarioLogado.id;

    try {
        // 1. Verificar se já existe um certificado para este par (evitar duplicados)
        const [existente] = await db.execute('SELECT * FROM certificados WHERE curso_id = ? AND usuario_id = ?', [curso_id, usuario_id]);
        if (existente.length > 0) {
            return res.json({ mensagem: "Certificado já emitido!", codigo: existente[0].codigo_validacao });
        }

        // 2. Verificar progresso (100% obrigatório)
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM aulas a JOIN modulos mo ON a.modulo_id = mo.id WHERE mo.curso_id = ?) as total,
                (SELECT COUNT(*) FROM progresso_aulas pa JOIN aulas a ON pa.aula_id = a.id JOIN modulos mo ON a.modulo_id = mo.id WHERE mo.curso_id = ? AND pa.aluno_id = ? AND pa.concluida = 1) as concluidas
        `, [curso_id, curso_id, usuario_id]);

        const total = stats[0].total;
        const concluidas = stats[0].concluidas;

        if (total === 0 || concluidas < total) {
            return res.status(400).json({ erro: `Progresso insuficiente (${concluidas}/${total}). Termine todas as aulas para emitir o certificado.` });
        }

        // 3. Gerar código único e salvar
        const codigo = `DF-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

        await db.execute(
            'INSERT INTO certificados (codigo_validacao, curso_id, usuario_id) VALUES (?, ?, ?)',
            [codigo, curso_id, usuario_id]
        );

        res.json({ mensagem: "Certificado gerado com sucesso!", codigo });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao emitir certificado." });
    }
});

// Validar certificado (Público)
router.get('/validar/:codigo', async (req, res) => {
    try {
        const [resultado] = await db.execute(`
            SELECT c.*, u.nome as aluno_nome, cur.titulo as curso_nome, cur.carga_horaria
            FROM certificados c
            JOIN usuarios u ON c.usuario_id = u.id
            JOIN cursos cur ON c.curso_id = cur.id
            WHERE c.codigo_validacao = ?
        `, [req.params.codigo]);

        if (resultado.length === 0) {
            return res.status(404).json({ valido: false, erro: "Certificado não encontrado ou inválido." });
        }

        res.json({ valido: true, dados: resultado[0] });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao validar certificado." });
    }
});

// Meus certificados (Aluno)
router.get('/meus', verificarToken, async (req, res) => {
    try {
        const [certificados] = await db.execute(`
            SELECT c.*, cur.titulo as curso_nome, cur.capa_url
            FROM certificados c
            JOIN cursos cur ON c.curso_id = cur.id
            WHERE c.usuario_id = ?
        `, [req.usuarioLogado.id]);
        res.json(certificados);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar seus certificados." });
    }
});

module.exports = router;
