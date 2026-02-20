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

// ==========================================
// 6. ROTAS MASTER (ADMINISTRAÇÃO)
// ==========================================

// Rota de Estatísticas Globais
app.get('/api/admin/estatisticas', verificarToken, async (req, res) => {
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

// Rota para Matricular um aluno num Curso (A nossa "Compra" manual)
app.post('/api/admin/matricular', verificarToken, async (req, res) => {
    // Apenas admins e produtores podem dar acesso a cursos
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

// ==========================================
// 7. ROTAS DO SISTEMA DE SUPORTE
// ==========================================

// Listar chamados (Se for admin/suporte vê todos, se for aluno/produtor vê só os seus)
app.get('/api/chamados', verificarToken, async (req, res) => {
    const { id, papel } = req.usuarioLogado;
    let query = `
        SELECT c.*, u.nome as criador_nome 
        FROM chamados c 
        JOIN usuarios u ON c.usuario_id = u.id 
        ORDER BY c.atualizado_em DESC
    `;
    let params = [];

    // Filtro de segurança
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

// Abrir um novo chamado
app.post('/api/chamados', verificarToken, async (req, res) => {
    const { assunto, mensagem } = req.body;
    const usuarioId = req.usuarioLogado.id;

    try {
        // 1. Cria o ticket
        const [resultado] = await db.execute('INSERT INTO chamados (usuario_id, assunto) VALUES (?, ?)', [usuarioId, assunto]);
        const chamadoId = resultado.insertId;

        // 2. Insere a primeira mensagem lá dentro
        await db.execute('INSERT INTO mensagens_chamados (chamado_id, remetente_id, mensagem) VALUES (?, ?, ?)', [chamadoId, usuarioId, mensagem]);

        res.json({ mensagem: "Chamado aberto com sucesso!", chamadoId });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar chamado." });
    }
});

// Rota para ler todas as mensagens de um chamado específico (O Chat)
app.get('/api/chamados/:id/mensagens', verificarToken, async (req, res) => {
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

// Rota para adicionar uma nova mensagem (Responder ao Ticket)
app.post('/api/chamados/:id/mensagens', verificarToken, async (req, res) => {
    const chamadoId = req.params.id;
    const { mensagem } = req.body;
    const remetenteId = req.usuarioLogado.id;

    try {
        await db.execute(
            'INSERT INTO mensagens_chamados (chamado_id, remetente_id, mensagem) VALUES (?, ?, ?)', 
            [chamadoId, remetenteId, mensagem]
        );
        
        // Atualiza a data do chamado para que ele suba na lista de recentes
        await db.execute('UPDATE chamados SET atualizado_em = CURRENT_TIMESTAMP WHERE id = ?', [chamadoId]);

        res.json({ mensagem: "Resposta enviada!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao enviar resposta." });
    }
});

// ==========================================
// 8. NOVAS ROTAS (VITRINE, EDIÇÃO E RELATÓRIOS)
// ==========================================

// A) Rota para o Aluno ver APENAS os cursos que comprou (Vitrine)
app.get('/api/aluno/meus-cursos', verificarToken, async (req, res) => {
    try {
        const [cursos] = await db.execute(`
            SELECT c.* FROM cursos c
            JOIN matriculas m ON c.id = m.curso_id
            WHERE m.aluno_id = ? AND m.status = 'ativa'
        `, [req.usuarioLogado.id]);
        res.json(cursos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar a sua vitrine de cursos." });
    }
});

// B) Rotas para o Produtor poder APAGAR módulos e aulas
app.delete('/api/modulos/:id', verificarToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM modulos WHERE id = ?', [req.params.id]);
        res.json({ mensagem: "Módulo apagado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao apagar módulo." });
    }
});

app.delete('/api/aulas/:id', verificarToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM aulas WHERE id = ?', [req.params.id]);
        res.json({ mensagem: "Aula apagada com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao apagar aula." });
    }
});

// C) Rota de Relatório Completo para o Admin (Tabelas e Dinheiro)
app.get('/api/admin/relatorio-completo', verificarToken, async (req, res) => {
    if (req.usuarioLogado.papel !== 'admin') return res.status(403).json({ erro: "Acesso Negado." });
    try {
        const [usuarios] = await db.execute('SELECT id, nome, email, papel FROM usuarios ORDER BY id DESC');
        const [cursos] = await db.execute('SELECT id, titulo, preco FROM cursos ORDER BY id DESC');
        
        // Junta matrículas com o preço do curso para sabermos as vendas
        const [matriculas] = await db.execute(`
            SELECT m.id, u.nome as aluno_nome, c.titulo as curso_titulo, c.preco, m.status, m.data_compra
            FROM matriculas m
            JOIN usuarios u ON m.aluno_id = u.id
            JOIN cursos c ON m.curso_id = c.id
            ORDER BY m.data_compra DESC
        `);
        
        // Calcula o total de dinheiro ganho (Métricas de Vendas)
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

// ==========================================
// ROTA DE REGISTO (Criar Conta de Aluno)
// ==========================================
app.post('/api/registrar', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verifica se o e-mail já existe
        const [existente] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existente.length > 0) {
            return res.status(400).json({ erro: "Este e-mail já está em uso." });
        }

        // Insere o novo aluno
        await db.execute(
            'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
            [nome, email, senha, 'aluno']
        );

        res.json({ mensagem: "Conta criada com sucesso! Faça login para continuar." });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao criar conta." });
    }
});

// ==========================================
// ROTA PÚBLICA DE CURSOS (Para a Página Inicial)
// ==========================================
app.get('/api/cursos/publicos', async (req, res) => {
    try {
        // Traz todos os cursos ordenados pelos mais recentes
        const [cursos] = await db.execute('SELECT id, titulo, descricao, preco, capa_url FROM cursos ORDER BY criado_em DESC');
        res.json(cursos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar cursos." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});