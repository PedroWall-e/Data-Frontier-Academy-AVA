const express = require('express');
const db = require('../config/db');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// ==========================================
// ROTA PÚBLICA DE CURSOS (Para a Página Inicial)
// ==========================================
router.get('/publicos', async (req, res) => {
    try {
        const escopo = req.query.escopo;
        let sql = 'SELECT id, titulo, descricao, preco, capa_url, produtor_id, escopo FROM cursos';
        let params = [];

        if (escopo) {
            sql += ' WHERE escopo = ?';
            params.push(escopo);
        }

        sql += ' ORDER BY criado_em DESC';
        const [cursos] = await db.execute(sql, params);

        // Populate author names
        for (let curso of cursos) {
            const [autor] = await db.execute('SELECT nome FROM usuarios WHERE id = ?', [curso.produtor_id]);
            if (autor.length > 0) curso.instrutor = autor[0].nome;
        }

        res.json(cursos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar cursos." });
    }
});

// ==========================================
// ROTA PÚBLICA DE DETALHES DO CURSO (Landing Page)
// ==========================================
router.get('/publico/:id', async (req, res) => {
    try {
        const [cursoInfo] = await db.execute('SELECT * FROM cursos WHERE id = ?', [req.params.id]);

        if (cursoInfo.length === 0) {
            return res.status(404).json({ erro: "Curso não encontrado." });
        }

        const curso = cursoInfo[0];

        // Fetch Author Details
        const [autor] = await db.execute(
            'SELECT id, nome, foto_url, biografia, titulo_profissional, redes_sociais FROM usuarios WHERE id = ?',
            [curso.produtor_id]
        );
        if (autor.length > 0) curso.autor = autor[0];

        // Fetch Modules (without full content, just titles and lesson types for the curriculum preview)
        const [modulos] = await db.execute('SELECT id, titulo, ordem FROM modulos WHERE curso_id = ? ORDER BY ordem ASC', [req.params.id]);
        for (let mod of modulos) {
            const [aulas] = await db.execute('SELECT id, titulo, tipo, ordem FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC', [mod.id]);
            mod.aulas = aulas;
        }
        curso.modulos = modulos;

        // Fetch Reviews
        const [avaliacoes] = await db.execute(`
            SELECT a.id, a.nota, a.comentario, a.data, u.nome as usuario_nome, u.foto_url as usuario_foto
            FROM avaliacoes a
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.curso_id = ?
            ORDER BY a.data DESC
            LIMIT 20
        `, [req.params.id]);
        curso.avaliacoes = avaliacoes;

        // Calculate average rating
        const [mediaRes] = await db.execute('SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes WHERE curso_id = ?', [req.params.id]);
        curso.nota_media = mediaRes[0].media ? parseFloat(mediaRes[0].media).toFixed(1) : null;
        curso.total_avaliacoes = mediaRes[0].total;

        res.json(curso);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar detalhes do curso." });
    }
});

// ==========================================
// AVALIAÇÕES E REVIEWS
// ==========================================

// Listar avaliações de um curso
router.get('/publico/:id/avaliacoes', async (req, res) => {
    try {
        const [avaliacoes] = await db.execute(`
            SELECT a.id, a.nota, a.comentario, a.data, u.nome as usuario_nome, u.foto_url as usuario_foto
            FROM avaliacoes a
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.curso_id = ?
            ORDER BY a.data DESC
        `, [req.params.id]);
        const [media] = await db.execute('SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes WHERE curso_id = ?', [req.params.id]);
        res.json({ avaliacoes, nota_media: media[0].media ? parseFloat(media[0].media).toFixed(1) : null, total: media[0].total });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar avaliações." });
    }
});

// Enviar avaliação (aluno autenticado)
router.post('/publico/:id/avaliar', verificarToken, async (req, res) => {
    const { nota, comentario } = req.body;
    if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ erro: "Nota deve ser entre 1 e 5." });
    }
    try {
        // Verify the user is enrolled
        const [matricula] = await db.execute('SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ?', [req.user.id, req.params.id]);
        if (matricula.length === 0) {
            return res.status(403).json({ erro: "Você precisa estar matriculado para avaliar este curso." });
        }

        await db.execute(
            'INSERT INTO avaliacoes (curso_id, usuario_id, nota, comentario) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nota = VALUES(nota), comentario = VALUES(comentario), data = NOW()',
            [req.params.id, req.user.id, nota, comentario || null]
        );
        res.json({ mensagem: "Avaliação enviada com sucesso!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao enviar avaliação." });
    }
});

// ==========================================
// ROTA PÚBLICA DO AUTOR
// ==========================================
router.get('/autor/:usuarioId', async (req, res) => {
    try {
        const [autorInfo] = await db.execute(
            'SELECT id, nome, foto_url, biografia, titulo_profissional, redes_sociais FROM usuarios WHERE id = ? AND (papel = "produtor" OR papel = "admin")',
            [req.params.usuarioId]
        );

        if (autorInfo.length === 0) {
            return res.status(404).json({ erro: "Autor não encontrado." });
        }

        const autor = autorInfo[0];

        // Fetch Author's Courses
        const [cursos] = await db.execute(
            'SELECT id, titulo, descricao, preco, capa_url FROM cursos WHERE produtor_id = ? ORDER BY criado_em DESC',
            [req.params.usuarioId]
        );
        autor.cursos = cursos;

        res.json(autor);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar detalhes do autor." });
    }
});

// A) Rota para o Aluno ver APENAS os cursos que comprou (Vitrine)
router.get('/aluno/meus-cursos', verificarToken, async (req, res) => {
    try {
        const [cursos] = await db.execute(`
            SELECT c.*, m.suspensa FROM cursos c
            JOIN matriculas m ON c.id = m.curso_id
            WHERE m.aluno_id = ? AND m.status = 'ativa'
        `, [req.usuarioLogado.id]);
        res.json(cursos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar a sua vitrine de cursos." });
    }
});

// ==========================================
// ROTA DE CURSO PROTEGIDA
// ==========================================
router.get('/:id', verificarToken, async (req, res) => {
    const cursoId = req.params.id;
    const alunoId = req.usuarioLogado.id;

    try {
        const [matriculas] = await db.execute(
            "SELECT * FROM matriculas WHERE aluno_id = ? AND curso_id = ? AND status = 'ativa'",
            [alunoId, cursoId]
        );

        if (matriculas.length === 0) {
            return res.status(403).json({ erro: "Acesso negado. Você não comprou este curso." });
        }

        if (matriculas[0].suspensa) {
            return res.status(403).json({ erro: "Seu acesso a este curso foi suspenso. Entre em contato com o suporte." });
        }

        const [cursoInfo] = await db.execute('SELECT * FROM cursos WHERE id = ?', [cursoId]);

        if (cursoInfo.length === 0) {
            return res.status(404).json({ erro: "Curso não encontrado." });
        }

        const [modulos] = await db.execute('SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem ASC', [cursoId]);

        for (let mod of modulos) {
            const [aulas] = await db.execute(`
                SELECT a.*, IFNULL(p.concluida, 0) AS concluida 
                FROM aulas a 
                LEFT JOIN progresso_aulas p ON a.id = p.aula_id AND p.aluno_id = ?
                WHERE a.modulo_id = ? 
                ORDER BY a.ordem ASC
            `, [alunoId, mod.id]);

            mod.aulas = aulas.map(aula => ({
                ...aula,
                concluida: aula.concluida === 1
            }));
        }
        res.json({ ...cursoInfo[0], modulos, matricula: matriculas[0] });
    }
    catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar curso" });
    }
});

// ==========================================
// ROTA PARA ATUALIZAR PROGRESSO
// ==========================================
router.post('/progresso', verificarToken, async (req, res) => {
    const alunoId = req.usuarioLogado.id;
    const { aula_id, concluida } = req.body;

    try {
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

// Rota para o produtor ver apenas os cursos que ELE criou
router.get('/produtor/meus-cursos', verificarToken, async (req, res) => {
    try {
        const [cursos] = await db.execute(
            'SELECT id, titulo, descricao, preco, capa_url FROM cursos WHERE produtor_id = ? ORDER BY criado_em DESC',
            [req.usuarioLogado.id]
        );
        res.json(cursos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar seus cursos." });
    }
});

// ==========================================
// ROTAS DE CONSTRUÇÃO DE CURSOS (Produtor)
// ==========================================

// Rota para o produtor ver os detalhes do seu próprio curso para o editar
router.get('/produtor/:id', verificarToken, async (req, res) => {
    const cursoId = req.params.id;
    const produtorId = req.usuarioLogado.id;

    try {
        const [cursoInfo] = await db.execute('SELECT * FROM cursos WHERE id = ? AND produtor_id = ?', [cursoId, produtorId]);

        if (cursoInfo.length === 0) {
            return res.status(403).json({ erro: "Acesso negado. Curso não encontrado ou não lhe pertence." });
        }

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

router.post('/modulos', verificarToken, async (req, res) => {
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

router.post('/aulas', verificarToken, async (req, res) => {
    const { modulo_id, titulo, tipo, conteudo, ordem, data_liberacao_drip } = req.body;
    try {
        const [resultado] = await db.execute(
            'INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, ordem, data_liberacao_drip) VALUES (?, ?, ?, ?, ?, ?)',
            [modulo_id, titulo, tipo || 'video', conteudo, ordem || 1, data_liberacao_drip || 0]
        );
        res.json({ mensagem: "Aula criada!", aulaId: resultado.insertId });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar aula." });
    }
});

router.post('/', verificarToken, async (req, res) => {
    const produtorId = req.usuarioLogado.id;
    const { titulo, descricao, preco, requisitos, publico_alvo } = req.body;

    if (req.usuarioLogado.papel !== 'produtor' && req.usuarioLogado.papel !== 'admin') {
        return res.status(403).json({ erro: "Apenas produtores podem criar cursos." });
    }

    try {
        const [resultado] = await db.execute(
            'INSERT INTO cursos (produtor_id, titulo, descricao, preco, requisitos, publico_alvo, escopo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [produtorId, titulo, descricao, preco || 0.00, requisitos || null, publico_alvo || null, req.body.escopo || 'LIVRE']
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

router.delete('/modulos/:id', verificarToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM modulos WHERE id = ?', [req.params.id]);
        res.json({ mensagem: "Módulo apagado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao apagar módulo." });
    }
});

router.delete('/aulas/:id', verificarToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM aulas WHERE id = ?', [req.params.id]);
        res.json({ mensagem: "Aula apagada com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao apagar aula." });
    }
});

// ==========================================
// ROTAS DE QUIZZES (Fase 2)
// ==========================================

// Buscar perguntas de um quiz para o aluno (sem a resposta correta exposta se possível, ou apenas oculta no front)
router.get('/aulas/:id/quiz', verificarToken, async (req, res) => {
    try {
        const [perguntas] = await db.execute('SELECT id, pergunta, opcoes, explicacao FROM questoes_quiz WHERE aula_id = ?', [req.params.id]);

        // Buscar progresso do aluno neste quiz
        const [respostas] = await db.execute('SELECT questao_id, acertou FROM respostas_quiz WHERE usuario_id = ? AND questao_id IN (SELECT id FROM questoes_quiz WHERE aula_id = ?)', [req.usuarioLogado.id, req.params.id]);

        res.json({ perguntas, respostas });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar perguntas do quiz." });
    }
});

// Buscar perguntas com resposta (Para o Produtor editar)
router.get('/aulas/:id/quiz-admin', verificarToken, async (req, res) => {
    try {
        const [perguntas] = await db.execute('SELECT * FROM questoes_quiz WHERE aula_id = ?', [req.params.id]);
        res.json(perguntas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar perguntas (admin)." });
    }
});

// Adicionar/Atualizar pergunta ao quiz (Produtor)
router.post('/aulas/:id/quiz', verificarToken, async (req, res) => {
    const { pergunta, opcoes, resposta_correta, explicacao } = req.body;
    try {
        const [resultado] = await db.execute(
            'INSERT INTO questoes_quiz (aula_id, pergunta, opcoes, resposta_correta, explicacao) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, pergunta, JSON.stringify(opcoes), resposta_correta, explicacao || null]
        );
        res.json({ mensagem: "Pergunta adicionada!", questaoId: resultado.insertId });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao adicionar pergunta." });
    }
});

// Responder a uma pergunta do quiz (Aluno)
router.post('/aulas/quiz/responder', verificarToken, async (req, res) => {
    const { questao_id, resposta_escolhida } = req.body;
    const usuarioId = req.usuarioLogado.id;

    try {
        // 1. Buscar a resposta correta
        const [questoes] = await db.execute('SELECT resposta_correta, aula_id FROM questoes_quiz WHERE id = ?', [questao_id]);
        if (questoes.length === 0) return res.status(404).json({ erro: "Questão não encontrada." });

        const acertou = questoes[0].resposta_correta === parseInt(resposta_escolhida);

        // 2. Gravar resposta
        await db.execute(`
            INSERT INTO respostas_quiz (usuario_id, questao_id, acertou) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE acertou = VALUES(acertou), data = CURRENT_TIMESTAMP
        `, [usuarioId, questao_id, acertou]);

        // 3. Opcional: Se acertou todas do quiz, marcar a aula como concluída automaticamente?
        // Por agora, deixamos o aluno marcar manualmente ou o front faz isso.

        res.json({ acertou, resposta_correta: questoes[0].resposta_correta });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao processar resposta." });
    }
});

// Excluir pergunta
router.delete('/aulas/quiz/:id', verificarToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM questoes_quiz WHERE id = ?', [req.params.id]);
        res.json({ mensagem: "Pergunta removida!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao remover pergunta." });
    }
});

// Clonar Curso (Deep Copy)
router.post('/:id/clonar', verificarToken, async (req, res) => {
    const cursoId = req.params.id;
    const produtorId = req.usuarioLogado.id;

    try {
        // 1. Buscar curso original
        const [cursos] = await db.execute('SELECT * FROM cursos WHERE id = ? AND produtor_id = ?', [cursoId, produtorId]);
        if (cursos.length === 0) return res.status(404).json({ erro: "Curso não encontrado." });

        const cursoOriginal = cursos[0];

        // 2. Criar novo curso
        const [novoCursoRes] = await db.execute(
            'INSERT INTO cursos (produtor_id, titulo, descricao, preco, capa_url) VALUES (?, ?, ?, ?, ?)',
            [produtorId, `CÓPIA: ${cursoOriginal.titulo}`, cursoOriginal.descricao, cursoOriginal.preco, cursoOriginal.capa_url]
        );
        const novoCursoId = novoCursoRes.insertId;

        // 3. Buscar módulos e clonar
        const [modulos] = await db.execute('SELECT * FROM modulos WHERE curso_id = ?', [cursoId]);
        for (let mod of modulos) {
            const [novoModRes] = await db.execute(
                'INSERT INTO modulos (curso_id, titulo, ordem) VALUES (?, ?, ?)',
                [novoCursoId, mod.titulo, mod.ordem]
            );
            const novoModId = novoModRes.insertId;

            // 4. Buscar aulas e clonar
            const [aulas] = await db.execute('SELECT * FROM aulas WHERE modulo_id = ?', [mod.id]);
            for (let aula of aulas) {
                const [novaAulaRes] = await db.execute(
                    'INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, ordem, data_liberacao_drip) VALUES (?, ?, ?, ?, ?, ?)',
                    [novoModId, aula.titulo, aula.tipo, aula.conteudo, aula.ordem, aula.data_liberacao_drip]
                );
                const novaAulaId = novaAulaRes.insertId;

                // 5. Clonar Quizzes se existirem
                if (aula.tipo === 'quiz') {
                    const [quizzes] = await db.execute('SELECT * FROM quizzes WHERE aula_id = ?', [aula.id]);
                    for (let q of quizzes) {
                        await db.execute(
                            'INSERT INTO quizzes (aula_id, pergunta, opcoes, resposta_correta, nota_corte) VALUES (?, ?, ?, ?, ?)',
                            [novaAulaId, q.pergunta, q.opcoes, q.resposta_correta, q.nota_corte]
                        );
                    }
                }
            }
        }

        res.json({ mensagem: "Curso clonado com sucesso!", novoCursoId });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao clonar curso." });
    }
});

// Listar alunos matriculados e o seu progresso
router.get('/produtor/curso/:id/alunos', verificarToken, async (req, res) => {
    const cursoId = req.params.id;
    const produtorId = req.usuarioLogado.id;

    try {
        // Verificar se o curso pertence ao produtor
        const [cursos] = await db.execute('SELECT id FROM cursos WHERE id = ? AND produtor_id = ?', [cursoId, produtorId]);
        if (cursos.length === 0) return res.status(403).json({ erro: "Acesso negado." });

        // Buscar alunos e calcular progresso
        const [alunos] = await db.execute(`
            SELECT 
                u.id, u.nome, u.email, m.data_compra,
                (SELECT COUNT(*) FROM aulas a JOIN modulos mo ON a.modulo_id = mo.id WHERE mo.curso_id = ?) as total_aulas,
                (SELECT COUNT(*) FROM progresso_aulas pa JOIN aulas a ON pa.aula_id = a.id JOIN modulos mo ON a.modulo_id = mo.id WHERE mo.curso_id = ? AND pa.aluno_id = u.id AND pa.concluida = 1) as aulas_concluidas
            FROM usuarios u
            JOIN matriculas m ON u.id = m.aluno_id
            WHERE m.curso_id = ?
        `, [cursoId, cursoId, cursoId]);

        const resultado = alunos.map(a => ({
            ...a,
            progresso: a.total_aulas === 0 ? 0 : Math.round((a.aulas_concluidas / a.total_aulas) * 100)
        }));

        res.json(resultado);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar progresso dos alunos." });
    }
});

// ==========================================
// ROTAS DE COMUNIDADE (Q&A / COMENTÁRIOS)
// ==========================================

// Buscar comentários de uma aula
router.get('/aulas/:id/comentarios', verificarToken, async (req, res) => {
    try {
        const [comentarios] = await db.execute(`
            SELECT c.*, u.nome as autor 
            FROM comentarios_aulas c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.aula_id = ?
            ORDER BY c.data ASC
        `, [req.params.id]);
        res.json(comentarios);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar comentários." });
    }
});

// Postar comentário ou dúvida
router.post('/aulas/:id/comentarios', verificarToken, async (req, res) => {
    const { texto, resposta_id } = req.body;
    const usuarioId = req.usuarioLogado.id;
    try {
        await db.execute(
            'INSERT INTO comentarios_aulas (aula_id, usuario_id, texto, resposta_id) VALUES (?, ?, ?, ?)',
            [req.params.id, usuarioId, texto, resposta_id || null]
        );
        res.json({ mensagem: "Comentário enviado!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao enviar comentário." });
    }
});

// ==========================================
// ROTAS DE VENDAS E CUPONS
// ==========================================

// Validar cupom
router.post('/validar-cupom', verificarToken, async (req, res) => {
    const { codigo, curso_id } = req.body;
    try {
        const [cupons] = await db.execute(
            'SELECT * FROM cupons WHERE codigo = ? AND (curso_id = ? OR curso_id IS NULL) AND validade > NOW() AND (limite_usos = 0 OR usos_atuais < limite_usos)',
            [codigo, curso_id]
        );

        if (cupons.length === 0) {
            return res.status(404).json({ erro: "Cupom inválido, expirado ou esgotado." });
        }

        res.json({ mensagem: "Cupom aplicado!", desconto: cupons[0].desconto_percentual });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao validar cupom." });
    }
});

// Listar cupons de um curso (Produtor)
router.get('/produtor/curso/:id/cupons', verificarToken, async (req, res) => {
    try {
        const [cupons] = await db.execute('SELECT * FROM cupons WHERE curso_id = ?', [req.params.id]);
        res.json(cupons);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar cupons." });
    }
});

// Criar cupom (Produtor)
router.post('/produtor/curso/:id/cupons', verificarToken, async (req, res) => {
    const { codigo, desconto, validade, limite_usos } = req.body;
    try {
        await db.execute(
            'INSERT INTO cupons (codigo, desconto_percentual, validade, limite_usos, curso_id) VALUES (?, ?, ?, ?, ?)',
            [codigo, desconto, validade, limite_usos || 0, req.params.id]
        );
        res.json({ mensagem: "Cupom criado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar cupom. Verifique se o código já existe." });
    }
});

// ==========================================
// ROTAS DE PLANOS DE ASSINATURA
// ==========================================

// Listar planos de um curso
router.get('/produtor/curso/:id/planos', verificarToken, async (req, res) => {
    try {
        const [planos] = await db.execute('SELECT * FROM planos_venda WHERE curso_id = ?', [req.params.id]);
        res.json(planos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar planos." });
    }
});

// Criar plano de venda
router.post('/produtor/curso/:id/planos', verificarToken, async (req, res) => {
    const { titulo, tipo, preco, trial_dias } = req.body;
    try {
        await db.execute(
            'INSERT INTO planos_venda (curso_id, titulo, tipo, preco, trial_dias) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, titulo, tipo, preco, trial_dias || 0]
        );
        res.json({ mensagem: "Plano criado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar plano." });
    }
});

// ==========================================
// ROTAS DE ORDER BUMPS E UPSELLS
// ==========================================

// Listar ofertas de um curso
router.get('/produtor/curso/:id/ofertas', verificarToken, async (req, res) => {
    try {
        const [ofertas] = await db.execute(`
            SELECT o.*, c.titulo as curso_nome 
            FROM ofertas_complementares o
            JOIN cursos c ON o.curso_oferta_id = c.id
            WHERE o.curso_id = ?
        `, [req.params.id]);
        res.json(ofertas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar ofertas." });
    }
});

// Criar oferta complementar
router.post('/produtor/curso/:id/ofertas', verificarToken, async (req, res) => {
    const { curso_oferta_id, tipo, titulo, descricao, preco } = req.body;
    try {
        await db.execute(
            'INSERT INTO ofertas_complementares (curso_id, curso_oferta_id, tipo, titulo_oferta, descricao_oferta, preco_oferta) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.id, curso_oferta_id, tipo, titulo, descricao, preco]
        );
        res.json({ mensagem: "Oferta criada com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar oferta." });
    }
});

// ==========================================
// ROTAS DE ANALYTICS E RELATÓRIOS
// ==========================================

// Analytics Financeiro do Curso
router.get('/produtor/curso/:id/analytics-financeiro', verificarToken, async (req, res) => {
    try {
        const [vendas] = await db.execute(`
            SELECT 
                COUNT(*) as total_vendas,
                SUM(valor_pago) as faturamento_total,
                AVG(valor_pago) as ticket_medio
            FROM matriculas 
            WHERE curso_id = ?
        `, [req.params.id]);

        const [vendasMensais] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_compra, '%Y-%m') as mes,
                SUM(valor_pago) as faturamento,
                COUNT(*) as quantidade
            FROM matriculas 
            WHERE curso_id = ?
            GROUP BY mes
            ORDER BY mes DESC
            LIMIT 12
        `, [req.params.id]);

        res.json({
            geral: vendas[0],
            mensal: vendasMensais
        });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao gerar analytics." });
    }
});

// Analytics Pedagógico do Curso
router.get('/produtor/curso/:id/analytics-pedagogico', verificarToken, async (req, res) => {
    try {
        const [progressoMedio] = await db.execute(`
            SELECT AVG(progresso) as media FROM matriculas WHERE curso_id = ?
        `, [req.params.id]);

        const [quizStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_tentativas,
                SUM(CASE WHEN acertou = 1 THEN 1 ELSE 0 END) as acertos
            FROM respostas_quiz rq
            JOIN questoes_quiz qq ON rq.questao_id = qq.id
            JOIN aulas a ON qq.aula_id = a.id
            JOIN modulos m ON a.modulo_id = m.id
            WHERE m.curso_id = ?
        `, [req.params.id]);

        res.json({
            progresso_medio: progressoMedio[0].media || 0,
            quiz_aprovacao: quizStats[0].total_tentativas > 0
                ? (quizStats[0].acertos / quizStats[0].total_tentativas * 10).toFixed(1)
                : 0
        });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao gerar analytics pedagógico." });
    }
});

// Diário Acadêmico (Gradebook)
router.get('/produtor/curso/:id/gradebook', verificarToken, async (req, res) => {
    try {
        const [alunos] = await db.execute(`
            SELECT 
                u.id as aluno_id,
                u.nome as aluno_nome,
                u.email as aluno_email,
                m.progresso,
                t.nome as turma_nome,
                (SELECT AVG(CASE WHEN acertou = 1 THEN 10 ELSE 0 END) 
                 FROM respostas_quiz rq 
                 JOIN questoes_quiz qq ON rq.questao_id = qq.id 
                 JOIN aulas a ON qq.aula_id = a.id 
                 JOIN modulos md ON a.modulo_id = md.id 
                 WHERE rq.usuario_id = u.id AND md.curso_id = ?) as media_quiz,
                (SELECT AVG(et.nota) 
                 FROM entregas_tarefa et 
                 JOIN aulas a ON et.aula_id = a.id 
                 JOIN modulos md ON a.modulo_id = md.id 
                 WHERE et.usuario_id = u.id AND md.curso_id = ?) as media_tarefas
            FROM matriculas m
            JOIN usuarios u ON m.aluno_id = u.id
            LEFT JOIN turmas t ON m.turma_id = t.id
            WHERE m.curso_id = ?
        `, [req.params.id, req.params.id, req.params.id]);

        res.json(alunos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao gerar diário acadêmico." });
    }
});

// ==========================================
// GESTÃO DE ALUNOS E MATRÍCULAS
// ==========================================

// Matrícula manual por email
router.post('/produtor/curso/:id/matricular-manual', verificarToken, async (req, res) => {
    const { email, nome } = req.body;
    try {
        // 1. Verificar se user existe
        let [user] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        let userId;

        if (user.length === 0) {
            // Criar user dummy/temporário
            const [newUser] = await db.execute(
                'INSERT INTO usuarios (nome, email, senha, papel) VALUES (?, ?, ?, ?)',
                [nome || 'Novo Aluno', email, '123456', 'aluno'] // Em sistema real, enviaria email para resetar senha
            );
            userId = newUser.insertId;
        } else {
            userId = user[0].id;
        }

        // 2. Matricular
        await db.execute(
            'INSERT INTO matriculas (usuario_id, curso_id, valor_pago) VALUES (?, ?, ?)',
            [userId, req.params.id, 0.00]
        );

        res.json({ mensagem: "Aluno matriculado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao realizar matrícula manual. Verifique se o aluno já está matriculado." });
    }
});

// Suspender/Reativar matrícula
router.put('/produtor/matricula/:id/status', verificarToken, async (req, res) => {
    const { suspensa } = req.body; // boolean
    try {
        await db.execute('UPDATE matriculas SET suspensa = ? WHERE id = ?', [suspensa ? 1 : 0, req.params.id]);
        res.json({ mensagem: suspensa ? "Acesso suspenso!" : "Acesso reativado!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao atualizar status da matrícula." });
    }
});

// Atualizar configurações White-Label (Branding)
router.put('/produtor/curso/:id/configuracoes', verificarToken, async (req, res) => {
    const {
        cor_primaria, cor_secundaria, logo_url, subdominio,
        checkout_video_url, checkout_depoimentos,
        descricao, requisitos, publico_alvo, escopo
    } = req.body;
    try {
        await db.execute(
            `UPDATE cursos SET 
                cor_primaria = ?, cor_secundaria = ?, logo_url = ?, subdominio = ?, 
                checkout_video_url = ?, checkout_depoimentos = ?,
                descricao = ?, requisitos = ?, publico_alvo = ?, escopo = ?
             WHERE id = ?`,
            [
                cor_primaria, cor_secundaria, logo_url, subdominio,
                checkout_video_url, checkout_depoimentos ? JSON.stringify(checkout_depoimentos) : null,
                descricao || null, requisitos || null, publico_alvo || null, escopo || 'LIVRE',
                req.params.id
            ]
        );
        res.json({ mensagem: "Configurações de branding salvas!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao salvar branding." });
    }
});

// Excluir curso
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        // Verificar se é o dono ou admin
        const [curso] = await db.execute('SELECT produtor_id FROM cursos WHERE id = ?', [req.params.id]);
        if (curso.length === 0) return res.status(404).json({ erro: "Curso não encontrado." });

        if (req.user.role !== 'admin' && curso[0].produtor_id !== req.user.id) {
            return res.status(403).json({ erro: "Não autorizado." });
        }

        await db.execute('DELETE FROM cursos WHERE id = ?', [req.params.id]);
        res.json({ mensagem: "Curso excluído com sucesso." });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao excluir curso." });
    }
});

module.exports = router;
