const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Usamos a versão 'promise' para facilitar

const app = express();

// Configurações básicas
app.use(express.json()); // Permite ler JSON enviado pelo frontend
app.use(cors()); // Permite que o React (porta 3000) acesse este servidor (porta 5000)

// CONEXÃO COM O BANCO DE DADOS (XAMPP)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Usuário padrão do XAMPP
    password: '',      // Senha padrão do XAMPP é vazia
    database: 'plataforma_cursos' // Nome que criamos no phpMyAdmin
});

// --- ROTAS (Onde o Frontend vai bater) ---

// 1. Rota de Teste (para ver se o banco está conectado)
app.get('/teste-banco', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM cursos');
        res.json(rows); // Devolve os cursos encontrados
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao conectar no banco" });
    }
});

// 2. Rota que Pega os Módulos e Aulas de um Curso
// Exemplo de uso: /api/curso/1
app.get('/api/curso/:id', async (req, res) => {
    const cursoId = req.params.id;
    try {
        // Busca os módulos
        const [modulos] = await db.execute(
            'SELECT * FROM modulos WHERE curso_id = ? ORDER BY id ASC', 
            [cursoId]
        );

        // Para cada módulo, busca as aulas
        // (Nota: Em produção, faríamos isso com JOIN para ser mais rápido, mas assim é mais fácil de entender agora)
        for (let mod of modulos) {
            const [aulas] = await db.execute(
                'SELECT * FROM aulas WHERE modulo_id = ? ORDER BY id ASC',
                [mod.id]
            );
            mod.aulas = aulas; // Coloca as aulas dentro do módulo
        }

        // Busca infos do curso
        const [cursoInfo] = await db.execute('SELECT * FROM cursos WHERE id = ?', [cursoId]);

        res.json({
            titulo: cursoInfo[0].titulo,
            modulos: modulos
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar dados do curso" });
    }
});

// Iniciar o Servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor Backend rodando na porta ${PORT}`);
});