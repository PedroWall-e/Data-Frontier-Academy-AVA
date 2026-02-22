CREATE DATABASE IF NOT EXISTS plataforma_cursos;
USE plataforma_cursos;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    papel ENUM('aluno', 'produtor', 'admin') DEFAULT 'aluno',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produtor_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) DEFAULT 0.00,
    capa_url VARCHAR(255),
    -- Branding & White-Label
    cor_primaria VARCHAR(7) DEFAULT '#00cc66',
    cor_secundaria VARCHAR(7) DEFAULT '#222222',
    logo_url VARCHAR(255),
    subdominio VARCHAR(50) UNIQUE,
    -- Checkout Persuasivo
    checkout_video_url VARCHAR(255),
    checkout_depoimentos JSON,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produtor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    ordem INT DEFAULT 1,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modulo_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    tipo ENUM('video', 'texto', 'audio', 'quiz', 'anexo') DEFAULT 'video',
    conteudo TEXT,
    ordem INT DEFAULT 1,
    data_liberacao_drip INT DEFAULT 0,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT NOT NULL,
    pergunta TEXT NOT NULL,
    opcoes JSON NOT NULL,
    resposta_correta VARCHAR(255) NOT NULL,
    nota_corte INT DEFAULT 0,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes_resultados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    aula_id INT NOT NULL,
    nota DECIMAL(5,2) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aulas_anexos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT NOT NULL,
    url_arquivo VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    curso_id INT NOT NULL,
    status ENUM('ativa', 'inativa', 'cancelada') DEFAULT 'ativa',
    -- Controle de Acesso
    suspensa TINYINT(1) DEFAULT 0,
    -- Analytics
    valor_pago DECIMAL(10,2) DEFAULT 0.00,
    cupom_utilizado VARCHAR(50),
    progresso INT DEFAULT 0,
    data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    UNIQUE KEY (aluno_id, curso_id)
);

CREATE TABLE IF NOT EXISTS progresso_aulas (
    aluno_id INT NOT NULL,
    aula_id INT NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (aluno_id, aula_id),
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    desconto_percentual INT NOT NULL,
    validade DATETIME NOT NULL,
    limite_usos INT DEFAULT 0,
    usos_atuais INT DEFAULT 0,
    curso_id INT,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planos_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    tipo ENUM('unico', 'mensal', 'anual') DEFAULT 'unico',
    preco DECIMAL(10,2) NOT NULL,
    trial_dias INT DEFAULT 0,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ofertas_complementares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    curso_oferta_id INT NOT NULL,
    tipo ENUM('order_bump', 'upsell') NOT NULL,
    titulo_oferta VARCHAR(100),
    descricao_oferta TEXT,
    preco_oferta DECIMAL(10,2),
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_oferta_id) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comentarios_aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT NOT NULL,
    usuario_id INT NOT NULL,
    texto TEXT NOT NULL,
    resposta_id INT DEFAULT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (resposta_id) REFERENCES comentarios_aulas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS nps_avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    aluno_id INT NOT NULL,
    nota INT NOT NULL,
    comentario TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    assunto VARCHAR(150) NOT NULL,
    status ENUM('aberto', 'em anandamento', 'fechado') DEFAULT 'aberto',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mensagens_chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id INT NOT NULL,
    remetente_id INT NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inserir um administrador padrão
INSERT IGNORE INTO usuarios (id, nome, email, senha_hash, papel) VALUES 
(1, 'Administrador', 'admin@admin.com', '$2b$10$EPbFz4Uv5E2G8D8J5Z.F/eiWnY.m5A5Fj97s1nQ0r4jYvB09/yqy6', 'admin');
