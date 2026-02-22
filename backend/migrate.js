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
                if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_ENTRY') {
                    // Ignora se a coluna/tabela/índice já existir
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
