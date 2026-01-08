# Exemplos de API - Times e Usuários

Este documento contém exemplos de como usar as APIs REST para gerenciar times e usuários.

## 🔒 Regras de Negócio

Antes de usar as APIs, entenda as regras implementadas:

1. **Todo time DEVE ter um líder** - É obrigatório informar o CPF do líder ao criar um time
2. **Um usuário só pode ser líder de UM time** - Se tentar atribuir o mesmo líder a outro time, receberá erro
3. **Usuários só podem pertencer a UM time por vez** - Ao mudar de time, sai automaticamente do anterior
4. **Não é possível deletar um líder** - Primeiro é necessário atribuir outro líder ao time
5. **Não é possível remover um líder do time** - Ao atualizar, se o usuário for líder, deve continuar no time

## 🌐 Endpoints Disponíveis

Base URL (desenvolvimento): `http://localhost:8000/api/v1`

### Times
- `POST /times` - Criar time (requer cpf_lider)
- `GET /times` - Listar todos os times (com nome do líder e total de membros)
- `GET /times/{id_time}` - Obter time específico
- `PUT /times/{id_time}` - Atualizar time (pode trocar líder)
- `DELETE /times/{id_time}` - Deletar time (remove id_time dos membros)
- `GET /times/{id_time}/membros` - Listar membros (indica quem é líder)

### Usuários
- `POST /users` - Criar usuário
- `GET /users` - Listar todos os usuários (com nome do time e se é líder)
- `GET /users/{cpf_user}` - Obter usuário específico
- `PUT /users/{cpf_user}` - Atualizar usuário (líderes não podem sair do time)
- `DELETE /users/{cpf_user}` - Deletar usuário (líderes não podem ser deletados)
- `GET /users/lideres/lista` - Listar apenas os líderes

## 📝 Exemplos de Requisições

### 1. Criar Usuários PRIMEIRO (pois times precisam de líderes)

```bash
# Criar usuário que será líder
curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf_user": "12345678901",
    "nome": "João Silva",
    "funcao": "Tech Lead"
  }'

# Criar outros usuários
curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf_user": "12345678902",
    "nome": "Ana Costa",
    "funcao": "Desenvolvedora"
  }'
```

### 2. Criar Time (com líder obrigatório)

```bash
# Criar time - NOTA: cpf_lider é obrigatório!
curl -X POST "http://localhost:8000/api/v1/times/" \
  -H "Content-Type: application/json" \
  -d '{
    "id_time": 1,
    "nome_time": "Desenvolvimento",
    "responsabilidades": "Criar e manter aplicações",
    "cpf_lider": "12345678901"
  }'
```

**Resposta:**
```json
{
  "id_time": 1,
  "nome_time": "Desenvolvimento",
  "responsabilidades": "Criar e manter aplicações",
  "cpf_lider": "12345678901",
  "lider_nome": "João Silva",
  "total_membros": 0
}
```

### 3. ❌ Tentar criar time sem líder (ERRO)

```bash
curl -X POST "http://localhost:8000/api/v1/times/" \
  -H "Content-Type: application/json" \
  -d '{
    "id_time": 2,
    "nome_time": "Marketing",
    "responsabilidades": "Promover produtos"
  }'
```

**Resposta:** `422 Unprocessable Entity` - Campo cpf_lider é obrigatório

### 4. ❌ Tentar criar time com mesmo líder (ERRO)

```bash
curl -X POST "http://localhost:8000/api/v1/times/" \
  -H "Content-Type: application/json" \
  -d '{
    "id_time": 2,
    "nome_time": "Marketing",
    "responsabilidades": "Promover produtos",
    "cpf_lider": "12345678901"
  }'
```

**Resposta:** `400 Bad Request` - "Este usuário já é líder do time 'Desenvolvimento'"

### 5. Adicionar Membro ao Time

```bash
# Adicionar Ana ao time Desenvolvimento
curl -X PUT "http://localhost:8000/api/v1/users/12345678902" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ana Costa",
    "funcao": "Desenvolvedora",
    "id_time": 1
  }'
```

### 6. Listar Membros do Time (com indicação de líder)

```bash
curl -X GET "http://localhost:8000/api/v1/times/1/membros"
```

**Resposta:**
```json
[
  {
    "cpf_user": "12345678901",
    "nome": "João Silva",
    "funcao": "Tech Lead",
    "is_lider": true
  },
  {
    "cpf_user": "12345678902",
    "nome": "Ana Costa",
    "funcao": "Desenvolvedora",
    "is_lider": false
  }
]
```

### 7. Listar Apenas os Líderes

```bash
curl -X GET "http://localhost:8000/api/v1/users/lideres/lista"
```

### 8. ❌ Tentar deletar um líder (ERRO)

```bash
curl -X DELETE "http://localhost:8000/api/v1/users/12345678901"
```

**Resposta:** `400 Bad Request` - "Este usuário é líder do time 'Desenvolvimento'. Não é possível deletar um líder."

### 9. Trocar Líder de um Time

```bash
# Primeiro, criar novo usuário para ser líder
curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf_user": "98765432100",
    "nome": "Maria Santos",
    "funcao": "Gerente"
  }'

# Atualizar o time com novo líder
curl -X PUT "http://localhost:8000/api/v1/times/1" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_time": "Desenvolvimento",
    "responsabilidades": "Criar e manter aplicações",
    "cpf_lider": "98765432100"
  }'
```

### 10. ❌ Tentar remover líder do time (ERRO)

```bash
# Tentar fazer o líder sair do time
curl -X PUT "http://localhost:8000/api/v1/users/12345678901" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "funcao": "Tech Lead",
    "id_time": null
  }'
```

**Resposta:** `400 Bad Request` - "Este usuário é líder do time 'Desenvolvimento'. Primeiro, atribua outro líder ao time."

### 11. Deletar Time (membros perdem referência)

```bash
curl -X DELETE "http://localhost:8000/api/v1/times/1"
```

**Efeito:** Todos os membros do time terão `id_time` definido como `null`

## 🧪 Usando o Swagger UI

Acesse a documentação interativa em: **http://localhost:8000/docs**

O Swagger UI permite:
- Visualizar todos os endpoints
- Testar as APIs diretamente no navegador
- Ver os schemas de request/response
- Executar requisições sem precisar do curl

## 🐍 Exemplo em Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. Criar usuário que será líder
lider_data = {
    "cpf_user": "55566677788",
    "nome": "Ana Costa",
    "funcao": "Gerente Financeiro"
}
response = requests.post(f"{BASE_URL}/users/", json=lider_data)
print(f"Líder criado: {response.json()}")

# 2. Criar time com o líder
time_data = {
    "id_time": 4,
    "nome_time": "Financeiro",
    "responsabilidades": "Gestão financeira e contábil",
    "cpf_lider": "55566677788"
}
response = requests.post(f"{BASE_URL}/times/", json=time_data)
time_result = response.json()
print(f"Time criado: {time_result}")
print(f"  Líder: {time_result['lider_nome']}")
print(f"  Total membros: {time_result['total_membros']}")

# 3. Adicionar membro ao time
membro_data = {
    "cpf_user": "55566677789",
    "nome": "Carlos Lima",
    "funcao": "Analista Financeiro",
    "id_time": 4
}
response = requests.post(f"{BASE_URL}/users/", json=membro_data)
print(f"Membro criado: {response.json()}")

# 4. Listar membros do time
response = requests.get(f"{BASE_URL}/times/4/membros")
membros = response.json()
print(f"\nMembros do time Financeiro:")
for membro in membros:
    tipo = "👑 LÍDER" if membro['is_lider'] else "   Membro"
    print(f"  {tipo}: {membro['nome']} ({membro['funcao']})")

# 5. Listar todos os líderes
response = requests.get(f"{BASE_URL}/users/lideres/lista")
lideres = response.json()
print(f"\nTotal de líderes: {len(lideres)}")
for lider in lideres:
    print(f"  • {lider['nome']} - {lider['nome_time']}")
```

## 📊 Testando com HTTPie

Se você tem o [HTTPie](https://httpie.io/) instalado:

```bash
# 1. Criar líder
http POST localhost:8000/api/v1/users/ \
  cpf_user="99988877766" \
  nome="Carlos Lima" \
  funcao="Coordenador"

# 2. Criar time com líder
http POST localhost:8000/api/v1/times/ \
  id_time=5 \
  nome_time="Operações" \
  responsabilidades="Gestão operacional" \
  cpf_lider="99988877766"

# 3. Listar times (mostra líderes)
http GET localhost:8000/api/v1/times/

# 4. Listar apenas líderes
http GET localhost:8000/api/v1/users/lideres/lista
```

## ⚠️ Códigos de Status

- `200 OK` - Sucesso na consulta ou atualização
- `201 Created` - Recurso criado com sucesso
- `204 No Content` - Recurso deletado com sucesso
- `400 Bad Request` - Violação de regra de negócio (ex: usuário já é líder de outro time)
- `404 Not Found` - Recurso não encontrado (ex: líder não existe)
- `422 Unprocessable Entity` - Erro de validação de campos

## 🔍 Validações e Regras

### CPF
- Deve ter exatamente 11 caracteres
- Deve ser único no sistema
- Ao criar time, o CPF do líder deve existir

### Líder
- **Obrigatório**: Todo time DEVE ter um líder
- **Único**: Um usuário só pode ser líder de UM time
- **Protegido**: Não pode ser deletado enquanto for líder
- **Vinculado**: Não pode sair do time enquanto for líder

### Time
- Nome do time deve ser único
- Ao deletar, todos os membros perdem a referência (id_time = NULL)

### Usuário
- Pode pertencer a apenas UM time por vez
- Ao mudar de time, sai automaticamente do anterior
- Se for líder, não pode sair do time ou ser deletado

## 💡 Dicas

1. **Ordem de criação**: Sempre crie USUÁRIOS antes de TIMES (pois times precisam de líderes)
2. **Swagger UI**: Use http://localhost:8000/docs para testes interativos
3. **Líderes**: Para trocar um líder, atualize o time com outro CPF de líder
4. **Membros**: Use `/times/{id}/membros` para ver quem é líder e quem são os membros
5. **Validação**: A API impede estados inválidos automaticamente

## 🎯 Fluxo Completo de Exemplo

```bash
# 1. Criar usuários
curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{"cpf_user": "111", "nome": "Líder A", "funcao": "Gerente"}'

curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{"cpf_user": "222", "nome": "Membro B", "funcao": "Analista"}'

# 2. Criar time com líder
curl -X POST "http://localhost:8000/api/v1/times/" \
  -H "Content-Type: application/json" \
  -d '{"id_time": 1, "nome_time": "TI", "responsabilidades": "Tecnologia", "cpf_lider": "111"}'

# 3. Adicionar membro ao time
curl -X PUT "http://localhost:8000/api/v1/users/222" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Membro B", "funcao": "Analista", "id_time": 1}'

# 4. Ver membros do time
curl -X GET "http://localhost:8000/api/v1/times/1/membros"
```
