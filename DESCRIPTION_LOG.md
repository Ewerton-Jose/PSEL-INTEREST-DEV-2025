# DESCRIPTION_LOG

## Dia 1

Decidir começar com o planejamento e execução do banco de dados
vendo quais seriam os principais envolvidos nos relacionamento, definindo logos as chaves estrangeiras, aqui vai um exemplo do modelo ER

- Tabelas principais:
  - times: id_time (PK), nome_time (unique, not null), responsabilidades, cpf_lider (FK users.cpf_user, unique, not null).
  - users: cpf_user (PK), nome, funcao, id_time (FK times.id_time, opcional).
- Regras garantidas por constraints e validações de API:
  - Todo time precisa de um líder (cpf_lider not null + unique).
  - Um usuário só lidera um time por vez.
  - Um usuário só pertence a um time por vez; mudança de time remove do anterior.
  - Líder não pode ser removido nem sair do time sem antes transferir liderança.

AS dificuldades nessa arte, foram só para adptar o alembic em minha máquina, e livras as portas que já estavam ocupadas por outros app(Splunk), mas tirando isso foi tranquio

## Dia 2

Corrigi uns problemas de migração que estavam ocorrendo, as tabelas tinha nomes parcialmente errado, por isso que elas não upavam para o postgree

Criei um front para testar se estava tudo estava vinculado (Principalmente o postgree com o react)

## Dia 3


Endpoints Principais (base /api/v1)
- Times: POST /times, GET /times, GET /times/{id}, PUT /times/{id}, DELETE /times/{id}, GET /times/{id}/membros.
- Users: POST /users, GET /users, GET /users/{cpf}, PUT /users/{cpf}, DELETE /users/{cpf}, GET /users/lideres/lista.
- Status codes chave: 201 Created em criação; 400 para violações de regra; 404 para inexistentes; 422 validação.