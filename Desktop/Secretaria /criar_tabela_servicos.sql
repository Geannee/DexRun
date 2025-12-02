-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    duracao_minutos INT DEFAULT 30,
    valor DECIMAL(10, 2),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir os serviços básicos
INSERT INTO servicos (nome, descricao, duracao_minutos) VALUES
('Limpeza', 'Limpeza dentária completa', 60),
('Obturação', 'Obturação de dente', 45),
('Canal', 'Tratamento de canal', 90)
ON DUPLICATE KEY UPDATE nome = nome;
