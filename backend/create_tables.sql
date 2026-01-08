-- Script de criação das tabelas baseado nos modelos corrigidos

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    cpf_user VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    funcao VARCHAR(100) NOT NULL,
    id_time INTEGER
);

-- Tabela de times
CREATE TABLE IF NOT EXISTS times (
    id_time INTEGER PRIMARY KEY,
    nome_time VARCHAR(100) NOT NULL UNIQUE,
    responsabilidades VARCHAR(500),
    cpf_lider VARCHAR(11) NOT NULL UNIQUE
);

-- Adicionar foreign keys depois que ambas as tabelas existem
ALTER TABLE users 
    ADD CONSTRAINT fk_user_time 
    FOREIGN KEY (id_time) 
    REFERENCES times(id_time);

ALTER TABLE times 
    ADD CONSTRAINT fk_time_lider 
    FOREIGN KEY (cpf_lider) 
    REFERENCES users(cpf_user);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_users_id_time ON users(id_time);
CREATE INDEX IF NOT EXISTS idx_times_cpf_lider ON times(cpf_lider);
