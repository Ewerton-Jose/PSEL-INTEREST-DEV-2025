# 📋 Histórico de Desenvolvimento

## 🗓️ Dia 1: Planejamento do Banco de Dados

Início do projeto com foco no planejamento e implementação do banco de dados. Definição dos principais relacionamentos e chaves estrangeiras. Abaixo, um exemplo do modelo ER (Entidade-Relacionamento):

### Tabelas Principais

- **times**
  - `id_time` (PK)
  - `nome_time` (UNIQUE, NOT NULL)
  - `responsabilidades` (NULLABLE)
  - `cpf_lider` (FK para users.cpf_user, UNIQUE, NOT NULL)

- **users**
  - `cpf_user` (PK)
  - `nome` (NOT NULL)
  - `funcao` (NOT NULL)
  - `id_time` (FK para times.id_time, NULLABLE)

### Regras Garantidas

- ✅ Todo time precisa de um líder (`cpf_lider` NOT NULL + UNIQUE)
- ✅ Um usuário só pode liderar um time por vez
- ✅ Um usuário só pode pertencer a um time por vez (mudança remove do anterior)
- ✅ Líder não pode ser removido ou sair do time sem transferir liderança

### Desafios Encontrados

As principais dificuldades foram:
- Adaptar Alembic à máquina local
- Liberar portas ocupadas por outros serviços (Splunk)
- Resolver conflitos de configuração do Docker

---

## 🗓️ Dia 2: Correção de Migrações

Correção de problemas nas migrações que estavam ocorrendo:
- Nomes das tabelas estavam parcialmente incorretos
- Tabelas não estavam sendo criadas corretamente no PostgreSQL

Criação de componentes frontend para validar a integração entre PostgreSQL e React.

---

## 🗓️ Dia 3: Revisão de Endpoints

### Endpoints Principais (Base: `/api/v1`)

#### Times
- `POST /times` - Criar novo time
- `GET /times` - Listar todos os times
- `GET /times/{id}` - Obter detalhes de um time
- `PUT /times/{id}` - Atualizar time
- `DELETE /times/{id}` - Deletar time
- `GET /times/{id}/membros` - Listar membros de um time

#### Usuários
- `POST /users` - Criar novo usuário
- `GET /users` - Listar todos os usuários
- `GET /users/{cpf}` - Obter detalhes de um usuário
- `PUT /users/{cpf}` - Atualizar usuário
- `DELETE /users/{cpf}` - Deletar usuário
- `GET /users/lideres/lista` - Listar líderes de times

### Códigos de Status Principais

- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Violação de regra de negócio
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Erro de validação

---

## 🗓️ Dia 4: Tratamento de Erros e Casos de Uso

Implementação de tratamentos robustos de erros e validação de casos de uso específicos(CPF > 11 DÍGITOS, MASCARA NO CPF, SLIDE NO SIDEBAR e outros micro polimentos). 

