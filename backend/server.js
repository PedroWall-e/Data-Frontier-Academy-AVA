const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken'); // NOVO: Biblioteca de Tokens

const app = express();
app.use(express.json());
app.use(cors());

// NOVO: A chave secreta que assina os tokens (Em produção, deve ficar num ficheiro .env escondido)
const CHAVE_SECRETA = "minha_chave_super_secreta_123";

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'plataforma_cursos'
});

// ==========================================
// 1. ROTA DE LOGIN
// ==========================================
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Procura o utilizador pelo e-mail
        const [usuarios] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (usuarios.length === 0) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        const usuario = usuarios[0];

        // 2. Compara a senha (No futuro usaremos o bcrypt para encriptar, por agora verificamos diretamente)
        if (usuario.senha_hash !== senha) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        // 3. Se estiver tudo OK, gera o Token JWT (O "Crachá")
        const token = jwt.sign(
            { id: usuario.id, papel: usuario.papel, nome: usuario.nome }, 
            CHAVE_SECRETA, 
            { expiresIn: '2h' } // O token expira em 2 horas
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

// ==========================================
// MIDDLEWARE DE PROTEÇÃO (O Segurança da Porta)
// ==========================================
function verificarToken(req, res, next) {
    // O Frontend envia o token no Header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ erro: "Acesso negado. Faça login." });
    }

    const token = authHeader.split(' ')[1]; // Extrai só o token separando pelo espaço

    try {
        // Verifica se o token é válido e não foi falsificado
        const dadosDecodificados = jwt.verify(token, CHAVE_SECRETA);
        req.usuarioLogado = dadosDecodificados; // Guarda os dados do aluno na requisição
        next(); // Deixa passar para a rota do curso!
    } catch (erro) {
        return res.status(403).json({ erro: "Token inválido ou expirado. Faça login novamente." });
    }
}

// ==========================================
// 2. ROTA DE CURSO (AGORA PROTEGIDA COM O SEGURANÇA)
// ==========================================
// Reparou no "verificarToken" ali no meio? Ele intercepta a chamada!
app.get('/api/curso/:id', verificarToken, async (req, res) => {
    const cursoId = req.params.id;
    const alunoId = req.usuarioLogado.id; // AGORA VEM DE FORMA SEGURA DO TOKEN!

    try {
        const [matriculas] = await db.execute(
            "SELECT * FROM matriculas WHERE aluno_id = ? AND curso_id = ? AND status = 'ativa'",
            [alunoId, cursoId]
        );

        if (matriculas.length === 0) {
            return res.status(403).json({ erro: "Acesso negado. Você não comprou este curso." });
        }

        const [cursoInfo] = await db.execute('SELECT * FROM cursos WHERE id = ?', [cursoId]);
        
        if (cursoInfo.length === 0) {
            return res.status(404).json({ erro: "Curso não encontrado." });
        }

        const [modulos] = await db.execute('SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC', [cursoId]);

        // Substitua o 'for' existente por este:
        for (let mod of modulos) {
            // NOVO: Agora vamos buscar as aulas e juntar com a tabela de progresso para saber se o aluno já a concluiu!
            const [aulas] = await db.execute(`
                SELECT a.*, IFNULL(p.concluida, 0) AS concluida 
                FROM aulas a 
                LEFT JOIN progresso_aulas p ON a.id = p.aula_id AND p.aluno_id = ?
                WHERE a.modulo_id = ? 
                ORDER BY a.ordem ASC
            `, [alunoId, mod.id]);
            
            // Converte o 0 e 1 do MySQL para false e true no JavaScript
            mod.aulas = aulas.map(aula => ({
                ...aula,
                concluida: aula.concluida === 1
            }));
        }

    } 
    catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar curso" });
    }
});

// ==========================================
// 3. ROTA PARA ATUALIZAR PROGRESSO
// ==========================================
app.post('/api/progresso', verificarToken, async (req, res) => {
    const alunoId = req.usuarioLogado.id;
    const { aula_id, concluida } = req.body;

    try {
        // O "ON DUPLICATE KEY UPDATE" é mágico: se não existir, ele cria. Se já existir, ele apenas atualiza!
        await db.execute(`
            INSERT INTO progresso_aulas (aluno_id, aula_id, concluida) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE concluida = VALUES(concluida)
        `, [alunoId, aula_id, concluida]);

        res.json({ mensagem: "Progresso salvo com sucesso!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao salvar progresso." });
    }
});

// ==========================================
// 5. ROTAS DE CONSTRUÇÃO DE CURSOS (Produtor)
// ==========================================

// Rota para o produtor ver os detalhes do seu próprio curso para o editar
app.get('/api/produtor/curso/:id', verificarToken, async (req, res) => {
    const cursoId = req.params.id;
    const produtorId = req.usuarioLogado.id;

    try {
        // Verifica se o curso pertence mesmo a este produtor (Segurança)
        const [cursoInfo] = await db.execute('SELECT * FROM cursos WHERE id = ? AND produtor_id = ?', [cursoId, produtorId]);
        
        if (cursoInfo.length === 0) {
            return res.status(403).json({ erro: "Acesso negado. Curso não encontrado ou não lhe pertence." });
        }

        // Busca módulos e aulas
        const [modulos] = await db.execute('SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC', [cursoId]);
        for (let mod of modulos) {
            const [aulas] = await db.execute('SELECT * FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC', [mod.id]);
            mod.aulas = aulas; 
        }

        res.json({ id: cursoInfo[0].id, titulo: cursoInfo[0].titulo, modulos: modulos });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao carregar estrutura do curso." });
    }
});

// Rota para criar um Módulo
app.post('/api/modulos', verificarToken, async (req, res) => {
    const { curso_id, titulo, ordem } = req.body;
    try {
        const [resultado] = await db.execute(
            'INSERT INTO modulos (curso_id, titulo, ordem) VALUES (?, ?, ?)',
            [curso_id, titulo, ordem || 1]
        );
        res.json({ mensagem: "Módulo criado!", moduloId: resultado.insertId });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar módulo." });
    }
});

// Rota para criar uma Aula
app.post('/api/aulas', verificarToken, async (req, res) => {
    const { modulo_id, titulo, tipo, conteudo, ordem } = req.body;
    try {
        const [resultado] = await db.execute(
            'INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, ordem) VALUES (?, ?, ?, ?, ?)',
            [modulo_id, titulo, tipo || 'video', conteudo, ordem || 1]
        );
        res.json({ mensagem: "Aula criada!", aulaId: resultado.insertId });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar aula." });
    }
});

// Rota para criar um novo curso
app.post('/api/cursos', verificarToken, async (req, res) => {
    const produtorId = req.usuarioLogado.id;
    const { titulo, descricao, preco } = req.body;

    // Apenas uma validação de segurança básica
    if (req.usuarioLogado.papel !== 'produtor' && req.usuarioLogado.papel !== 'admin') {
        return res.status(403).json({ erro: "Apenas produtores podem criar cursos." });
    }

    try {
        const [resultado] = await db.execute(
            'INSERT INTO cursos (produtor_id, titulo, descricao, preco) VALUES (?, ?, ?, ?)',
            [produtorId, titulo, descricao, preco || 0.00]
        );

        res.json({ 
            mensagem: "Curso criado com sucesso!", 
            cursoId: resultado.insertId 
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao criar curso." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});