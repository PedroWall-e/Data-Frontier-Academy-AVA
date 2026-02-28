require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function migrate() {
    try {
        console.log("Iniciando migrações...");

        // Função auxiliar para rodar SQL ignorando erros de "já existe"
        const runQuery = async (sql, params = []) => {
            try {
                await db.execute(sql, params);
            } catch (e) {
                // Ignore if column/table/index already exists
                if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_ENTRY' || e.message.includes("Duplicate column name")) {
                    // console.log(`Ignorando erro esperado na query: ${sql}`)
                } else {
                    console.error(`Erro na query: ${sql}`, e.message);
                }
            }
        };

        // Phase 2
        await runQuery("CREATE TABLE IF NOT EXISTS planos_venda (id INT AUTO_INCREMENT PRIMARY KEY, curso_id INT NOT NULL, titulo VARCHAR(100) NOT NULL, tipo ENUM('unico', 'mensal', 'anual') DEFAULT 'unico', preco DECIMAL(10,2) NOT NULL, trial_dias INT DEFAULT 0, FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE)");
        await runQuery("CREATE TABLE IF NOT EXISTS ofertas_complementares (id INT AUTO_INCREMENT PRIMARY KEY, curso_id INT NOT NULL, curso_oferta_id INT NOT NULL, tipo ENUM('order_bump', 'upsell') NOT NULL, titulo_oferta VARCHAR(100), descricao_oferta TEXT, preco_oferta DECIMAL(10,2), FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE, FOREIGN KEY (curso_oferta_id) REFERENCES cursos(id) ON DELETE CASCADE)");
        await runQuery("CREATE TABLE IF NOT EXISTS cupons (id INT AUTO_INCREMENT PRIMARY KEY, codigo VARCHAR(50) NOT NULL UNIQUE, desconto_percentual INT NOT NULL, validade DATETIME NOT NULL, limite_usos INT DEFAULT 0, usos_atuais INT DEFAULT 0, curso_id INT, FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE)");

        // Phase 3: Analytics
        await runQuery("ALTER TABLE matriculas ADD COLUMN valor_pago DECIMAL(10,2) DEFAULT 0.00");
        await runQuery("ALTER TABLE matriculas ADD COLUMN cupom_utilizado VARCHAR(50)");
        await runQuery("ALTER TABLE matriculas ADD COLUMN suspensa TINYINT(1) DEFAULT 0");

        // Phase 5: White-Label advanced
        await runQuery("ALTER TABLE cursos ADD COLUMN subdominio VARCHAR(50) UNIQUE");
        await runQuery("ALTER TABLE cursos ADD COLUMN checkout_video_url VARCHAR(255)");
        await runQuery("ALTER TABLE cursos ADD COLUMN checkout_depoimentos JSON");

        // NPS and Certificates
        await runQuery("CREATE TABLE IF NOT EXISTS nps_avaliacoes (id INT AUTO_INCREMENT PRIMARY KEY, curso_id INT NOT NULL, aluno_id INT NOT NULL, nota INT NOT NULL, comentario TEXT, data DATETIME DEFAULT CURRENT_TIMESTAMP)");

        // Phase 6: Author Profiles and Course Landing Pages
        await runQuery("ALTER TABLE usuarios ADD COLUMN foto_url VARCHAR(255)");
        await runQuery("ALTER TABLE usuarios ADD COLUMN biografia TEXT");
        await runQuery("ALTER TABLE usuarios ADD COLUMN titulo_profissional VARCHAR(150)");
        await runQuery("ALTER TABLE usuarios ADD COLUMN redes_sociais JSON");

        await runQuery("ALTER TABLE cursos ADD COLUMN requisitos TEXT");
        await runQuery("ALTER TABLE cursos ADD COLUMN publico_alvo TEXT");

        // Phase 7: Multi-Hub
        await runQuery("ALTER TABLE cursos ADD COLUMN escopo ENUM('LIVRE', 'TECNICO', 'POS', 'UNIVERSIDADE') DEFAULT 'LIVRE'");

        // Phase 8: Reviews e Avaliações
        await runQuery(`
            CREATE TABLE IF NOT EXISTS avaliacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                curso_id INT NOT NULL,
                usuario_id INT NOT NULL,
                nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
                comentario TEXT,
                data DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE KEY unico_avaliacao (curso_id, usuario_id)
            )
        `);

        // Phase 9: Quizzes e Testes Básicos (Fase 2)
        await runQuery(`
            CREATE TABLE IF NOT EXISTS questoes_quiz (
                id INT AUTO_INCREMENT PRIMARY KEY,
                aula_id INT NOT NULL,
                pergunta TEXT NOT NULL,
                opcoes JSON NOT NULL,
                resposta_correta INT NOT NULL,
                explicacao TEXT,
                FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
            )
        `);
        await runQuery(`
            CREATE TABLE IF NOT EXISTS respostas_quiz (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                questao_id INT NOT NULL,
                acertou BOOLEAN NOT NULL,
                data DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (questao_id) REFERENCES questoes_quiz(id) ON DELETE CASCADE,
                UNIQUE KEY unica_resposta (usuario_id, questao_id)
            )
        `);

        // Phase 10: Certificados Dinâmicos (Fase 2)
        await runQuery(`
            CREATE TABLE IF NOT EXISTS certificados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo_validacao VARCHAR(50) NOT NULL UNIQUE,
                curso_id INT NOT NULL,
                usuario_id INT NOT NULL,
                data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `);

        // Phase 11: Operação Acadêmica e Ensino Formal (Fase 3 inicial)
        await runQuery(`
            CREATE TABLE IF NOT EXISTS turmas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                curso_id INT NOT NULL,
                nome VARCHAR(100) NOT NULL,
                data_inicio DATE,
                data_fim DATE,
                capacidade INT,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
            )
        `);
        // Adiciona turma_id em matriculas
        await runQuery("ALTER TABLE matriculas ADD COLUMN turma_id INT NULL");
        await runQuery("ALTER TABLE matriculas ADD FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL");

        // Tabela de tarefas enviadas pelos alunos
        await runQuery(`
            CREATE TABLE IF NOT EXISTS entregas_tarefa (
                id INT AUTO_INCREMENT PRIMARY KEY,
                aula_id INT NOT NULL,
                usuario_id INT NOT NULL,
                arquivo_url VARCHAR(255) NOT NULL,
                nota DECIMAL(4,2),
                feedback TEXT,
                data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `);

        // Admin User (Force reset/create)
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await runQuery(`
            INSERT INTO usuarios (id, nome, email, senha_hash, papel) 
            VALUES (1, 'Administrador', 'admin@admin.com', ?, 'admin')
            ON DUPLICATE KEY UPDATE senha_hash = VALUES(senha_hash), papel = 'admin'
        `, [hash]);

        console.log("Migrações concluídas! Admin: admin@admin.com / admin123");
        process.exit(0);
    } catch (err) {
        console.error("Erro crítico na migração:", err);
        process.exit(1);
    }
}

migrate();
