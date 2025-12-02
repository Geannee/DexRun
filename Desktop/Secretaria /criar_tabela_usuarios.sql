-- Criar tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nivel ENUM('admin', 'dentista', 'recepcionista') DEFAULT 'admin',
    codigo_verificacao VARCHAR(6),
    codigo_expira_em DATETIME,
    ultimo_acesso DATETIME,
    ativo BOOLEAN DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão
INSERT INTO usuarios (nome, email, usuario, senha, nivel) 
VALUES ('Administrador', 'geanne1976@gmail.com', 'admin', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Verificar usuários cadastrados
SELECT id, nome, email, usuario, nivel, ativo FROM usuarios;
