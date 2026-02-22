const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

// ==========================================
// ROTA DE REGISTO (Criar Conta de Aluno)
// ==========================================
router.post('/registrar', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verifica se o e-mail já existe
        const [existente] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existente.length > 0) {
            return res.status(400).json({ erro: "Este e-mail já está em uso." });
        }

        // Criptografa a senha com bcrypt
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // Insere o novo aluno
        await db.execute(
            'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, 'aluno']
        );

        res.json({ mensagem: "Conta criada com sucesso! Faça login para continuar." });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao criar conta." });
    }
});

// ==========================================
// ROTA DE LOGIN
// ==========================================
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [usuarios] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (usuarios.length === 0) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        const usuario = usuarios[0];

        // Comparar o hash com bcrypt
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        const token = jwt.sign(
            { id: usuario.id, papel: usuario.papel, nome: usuario.nome },
            process.env.CHAVE_SECRETA,
            { expiresIn: '2h' }
        );

        res.json({
            mensagem: "Login com sucesso!",
            token: token,
            nome: usuario.nome
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

module.exports = router;
