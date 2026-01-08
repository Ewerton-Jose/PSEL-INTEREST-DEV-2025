# Criação das Tabelas no Banco de Dados

Este documento explica como criar e gerenciar as tabelas **Times** e **Users** no PostgreSQL usando Docker e Alembic.

## 📋 Estrutura das Tabelas

### Tabela: `times`
| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `id_time` | INTEGER | Chave primária | PRIMARY KEY |
| `nome_time` | VARCHAR(100) | Nome do time | NOT NULL, UNIQUE |
| `responsabilidades` | VARCHAR(500) | Descrição das responsabilidades | |
| `cpf_lider` | VARCHAR(11) | CPF do líder do time | NOT NULL, UNIQUE, FK → users.cpf_user |

### Tabela: `users`
| Campo | Tipo | Descrição | Constraints |
|-------|------|-----------|-------------|
| `cpf_user` | VARCHAR(11) | CPF do usuário | PRIMARY KEY |
| `nome` | VARCHAR(100) | Nome do usuário | NOT NULL |
| `funcao` | VARCHAR(100) | Função do usuário | NOT NULL |
| `id_time` | INTEGER | Time do usuário | FK → times.id_time |

### Relacionamentos e Regras de Negócio

#### 🔒 Regras Implementadas:

1. **Todo time DEVE ter um líder** 
   - Campo `cpf_lider` é obrigatório (NOT NULL)
   - Não é possível criar ou manter um time sem líder

2. **Um usuário só pode ser líder de UM time**
   - Campo `cpf_lider` é UNIQUE na tabela times
   - Ao tentar atribuir o mesmo líder a outro time, a operação é bloqueada

3. **Usuários só podem pertencer a UM time por vez**
   - Campo `id_time` é opcional (pode ser NULL)
   - Ao mudar de time, o usuário sai automaticamente do anterior

4. **Não é possível deletar um usuário que é líder**
   - A API bloqueia a deleção de líderes
   - É necessário primeiro atribuir outro líder ao time

5. **Não é possível remover um líder do time**
   - Ao atualizar um usuário, se ele for líder, não pode sair do time
   - É necessário primeiro atribuir outro líder ao time

### Diagrama de Relacionamento

```
┌─────────────────────┐         ┌─────────────────────┐
│      users          │         │       times         │
├─────────────────────┤         ├─────────────────────┤
│ cpf_user (PK)       │◄────────┤ cpf_lider (FK) ───┐ │
│ nome                │         │ id_time (PK)      │ │
│ funcao              │         │ nome_time         │ │
│ id_time (FK) ───────┼────────►│ responsabilidades │ │
└─────────────────────┘         └───────────────────┘─┘
                                         │
                                         │ Um líder
                                         │ Um time

## 🚀 Como Criar as Tabelas

### 1. Iniciar o ambiente Docker

```bash
# Subir os containers (backend, PostgreSQL, etc)
make dev-up
```

### 2. Criar a migração do Alembic

```bash
# Gerar automaticamente a migração baseada nos modelos
make db-new-migration MESSAGE="Criar tabelas times e users"
```

Este comando irá:
- Analisar os modelos em [backend/app/models.py](backend/app/models.py)
- Detectar as novas tabelas `times` e `users`
- Criar um arquivo de migração em `backend/app/alembic/versions/`

### 3. Aplicar a migração ao banco de dados

```bash
# Executar todas as migrações pendentes
make db-upgrade
```

## ✅ Verificar as Tabelas Criadas

### Opção 1: Via Adminer (Interface Web)
1. Acesse: http://localhost:8080
2. Faça login com as credenciais do `.env`
3. Navegue pelas tabelas criadas

### Opção 2: Via linha de comando
```bash
# Abrir shell do PostgreSQL
make db-shell

# Dentro do psql, execute:
\dt                    # Listar todas as tabelas
\d times               # Ver estrutura da tabela times
\d users               # Ver estrutura da tabela users
```

## 🌱 Popular o Banco com Dados de Exemplo

Após criar as tabelas, você pode popular o banco com dados de teste:

```bash
# Abrir shell do backend
make backend-shell

# Executar script de seed
python scripts/seed_data.py
```

O script irá criar:
- **5 times**: Desenvolvimento, Marketing, RH, Financeiro e Operações
- **12 usuários**: Distribuídos entre os times e alguns sem time

Você pode editar o arquivo [backend/scripts/seed_data.py](backend/scripts/seed_data.py) para adicionar seus próprios dados de teste.

## 📝 Comandos Úteis

### Gerenciamento de Migrações

```bash
# Criar nova migração
make db-new-migration MESSAGE="Sua mensagem aqui"

# Aplicar migrações
make db-upgrade                    # Aplicar todas pendentes
make db-upgrade REVISION=abc123    # Aplicar até uma revisão específica

# Reverter migrações
make db-downgrade STEP=1           # Reverter 1 migração
make db-downgrade REVISION=abc123  # Reverter até uma revisão específica
```

### Gerenciamento do Banco de Dados

```bash
# Backup do banco
make db-backup

# Restaurar backup
make db-restore FILE=./backups/backup_20240107_120000.dump

# Acessar shell do PostgreSQL
make db-shell
```

### Logs e Debugging

```bash
# Ver logs do backend
make backend-logs

# Abrir shell no container do backend
make backend-shell
```

## 🔧 Modelos SQLModel

Os modelos estão definidos em [backend/app/models.py](backend/app/models.py):

```python
class Time(SQLModel, table=True):
    __tablename__ = "times"
    
    id_time: int = Field(primary_key=True)
    nome_time: str = Field(max_length=100, nullable=False)
    responsabilidades: str = Field(max_length=500, nullable=True)
    
    usuarios: list["User"] = Relationship(back_populates="time")

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    cpf_user: str = Field(primary_key=True, max_length=11)
    nome: str = Field(max_length=100, nullable=False)
    funcao: str = Field(max_length=100, nullable=False)
    id_time: Optional[int] = Field(default=None, foreign_key="times.id_time")
    
    time: Optional[Time] = Relationship(back_populates="usuarios")
```

## 📊 Exemplos de Uso

### Inserir dados via SQL

```sql
-- Inserir times
INSERT INTO times (id_time, nome_time, responsabilidades) 
VALUES (1, 'Desenvolvimento', 'Criar e manter aplicações');

INSERT INTO times (id_time, nome_time, responsabilidades) 
VALUES (2, 'Marketing', 'Promover produtos e serviços');

-- Inserir usuários
INSERT INTO users (cpf_user, nome, funcao, id_time) 
VALUES ('12345678901', 'João Silva', 'Desenvolvedor Full Stack', 1);

INSERT INTO users (cpf_user, nome, funcao, id_time) 
VALUES ('98765432100', 'Maria Santos', 'Gerente de Marketing', 2);
```

### Consultas de exemplo

```sql
-- Listar todos os times com seus usuários
SELECT t.nome_time, u.nome, u.funcao 
FROM times t 
LEFT JOIN users u ON t.id_time = u.id_time;

-- Contar usuários por time
SELECT t.nome_time, COUNT(u.cpf_user) as total_usuarios
FROM times t 
LEFT JOIN users u ON t.id_time = u.id_time
GROUP BY t.nome_time;
```

## ⚠️ Solução de Problemas

### Erro: "relation already exists"
Se as tabelas já existem, você pode:
1. Reverter a migração: `make db-downgrade STEP=1`
2. Ou apagar e recriar o banco: `make clean` (⚠️ apaga todos os dados!)

### Erro: "No such revision"
Verifique se a migração foi criada corretamente:
```bash
make backend-shell
ls app/alembic/versions/
```

### Container não inicia
Verifique os logs:
```bash
make dev-logs
```

## 📚 Referências

- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
