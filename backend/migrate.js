const db = require('./config/db');

async function migrate() {
    try {
        console.log("Iniciando migrações...");

        // Phase 2 leftovers if any
        await db.execute("CREATE TABLE IF NOT EXISTS planos_venda (id INT AUTO_INCREMENT PRIMARY KEY, curso_id INT NOT NULL, titulo VARCHAR(100) NOT NULL, tipo ENUM('unico', 'mensal', 'anual') DEFAULT 'unico', preco DECIMAL(10,2) NOT NULL, trial_dias INT DEFAULT 0, FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE)");
        await db.execute("CREATE TABLE IF NOT EXISTS ofertas_complementares (id INT AUTO_INCREMENT PRIMARY KEY, curso_id INT NOT NULL, curso_oferta_id INT NOT NULL, tipo ENUM('order_bump', 'upsell') NOT NULL, titulo_oferta VARCHAR(100), descricao_oferta TEXT, preco_oferta DECIMAL(10,2), FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE, FOREIGN KEY (curso_oferta_id) REFERENCES cursos(id) ON DELETE CASCADE)");

        // Phase 3: Analytics
        await db.execute("ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10,2) DEFAULT 0.00");
        await db.execute("ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS cupom_utilizado VARCHAR(50)");
        await db.execute("ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS suspensa TINYINT(1) DEFAULT 0");

        // Phase 5: White-Label advanced
        await db.execute("ALTER TABLE cursos ADD COLUMN IF NOT EXISTS subdominio VARCHAR(50) UNIQUE");
        await db.execute("ALTER TABLE cursos ADD COLUMN IF NOT EXISTS checkout_video_url VARCHAR(255)");
        await db.execute("ALTER TABLE cursos ADD COLUMN IF NOT EXISTS checkout_depoimentos JSON");

        // NPS and Certificates
        await db.execute("CREATE TABLE IF NOT EXISTS nps_avaliacoes (id INT AUTO_INCREMENT PRIMARY KEY, curso_id INT NOT NULL, aluno_id INT NOT NULL, nota INT NOT NULL, comentario TEXT, data DATETIME DEFAULT CURRENT_TIMESTAMP)");

        console.log("Migrações concluídas com sucesso!");
        process.exit(0);
    } catch (err) {
        console.error("Erro na migração:", err);
        process.exit(1);
    }
}

migrate();
