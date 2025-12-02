-- 1. CADASTRO COMPLETO DE PACIENTE
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(120) NOT NULL,
    data_nascimento DATE NOT NULL,

    sexo ENUM('masculino','feminino','outro') NOT NULL,

    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20),

    telefone VARCHAR(20),
    telefone_secundario VARCHAR(20),
    email VARCHAR(120),

    estado_civil ENUM('solteiro','casado','divorciado','viuvo','uniao_estavel') NOT NULL,

    profissao VARCHAR(120),

    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enderecos_paciente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    cep VARCHAR(10),
    rua VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS contatos_emergencia (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    nome VARCHAR(120),
    parentesco VARCHAR(50),
    telefone VARCHAR(20) NOT NULL,

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS convenios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20)
);
CREATE TABLE IF NOT EXISTS paciente_convenio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    convenio_id INT NOT NULL,
    numero_carteirinha VARCHAR(50),
    validade DATE,

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (convenio_id) REFERENCES convenios(id)
);
CREATE TABLE IF NOT EXISTS anamnese (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,

    fuma ENUM('Sim','Não'),
    alcool ENUM('Sim','Não'),
    gestante ENUM('Sim','Não'),
    hipertenso ENUM('Sim','Não'),
    diabetico ENUM('Sim','Não'),
    cardiaco ENUM('Sim','Não'),
    epilepsia ENUM('Sim','Não'),
    
    alergias TEXT,
    medicamentos_uso TEXT,
    cirurgias_anteriores TEXT,
    doencas_cronicas TEXT,

    ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);
CREATE TABLE IF NOT EXISTS historico_odonto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,

    escova_quantidade ENUM('1 vez ao dia','2 vezes ao dia','3 vezes ao dia','Mais de 3 vezes'),
    fio_dental ENUM('Nunca','Às vezes','Diariamente'),
    ultimo_dentista DATE,
    motivo_ultima_visita VARCHAR(255),

    dor_atual ENUM('Sim','Não'),
    sensibilidade ENUM('Sim','Não'),
    sangramento_gengiva ENUM('Sim','Não'),
    halitose ENUM('Sim','Não'),

    observacoes TEXT,

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);
CREATE TABLE IF NOT EXISTS alergias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    tipo VARCHAR(100),
    descricao TEXT,

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);
CREATE TABLE IF NOT EXISTS medicamentos_em_uso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    nome_medicamento VARCHAR(120),
    dosagem VARCHAR(50),
    frequencia VARCHAR(100),

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);
CREATE TABLE IF NOT EXISTS risco_clinico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    nivel ENUM('Baixo','Moderado','Alto'),
    motivo TEXT,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);



-- 2. Tabela de Serviços/Procedimentos
CREATE TABLE IF NOT EXISTS servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao INT NOT NULL COMMENT 'Duração em minutos',
    preco DECIMAL(10, 2),
    ativo BOOLEAN DEFAULT TRUE
);

-- 3. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    servico_id INT NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    data_agendamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'confirmado', 'cancelado', 'concluido') DEFAULT 'pendente',
    observacoes TEXT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE,
    UNIQUE KEY uk_data_horario (data, horario)
);

-- 4. Tabela de Horários Disponíveis
CREATE TABLE IF NOT EXISTS horarios_disponiveis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana INT NOT NULL COMMENT '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado',
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    intervalo INT DEFAULT 30 COMMENT 'Intervalo entre consultas em minutos'
);

-- 5. Índices para performance (usando sintaxe compatível)
CREATE INDEX idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
