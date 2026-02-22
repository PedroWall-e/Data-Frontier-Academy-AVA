USE plataforma_cursos;
ALTER TABLE aulas MODIFY COLUMN tipo ENUM('video', 'texto', 'audio', 'quiz', 'anexo') DEFAULT 'video';
ALTER TABLE aulas ADD COLUMN data_liberacao_drip INT DEFAULT 0 AFTER ordem;

CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT NOT NULL,
    pergunta TEXT NOT NULL,
    opcoes JSON NOT NULL,
    resposta_correta VARCHAR(255) NOT NULL,
    nota_corte INT DEFAULT 0,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aulas_anexos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT NOT NULL,
    url_arquivo VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);
