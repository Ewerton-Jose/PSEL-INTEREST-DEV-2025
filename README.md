# Desafio Técnico Full-Stack: Módulo de Gestão de Equipes

## Visão Geral
Deverá ser demonstrada a habilidade de projetar e integrar uma nova funcionalidade em uma base de código existente. Você terá **1 semana** para completar o desafio.

**Nota importante:** O candidato parte do zero no que diz respeito ao novo módulo — **não existe schema, rota ou página de frontend pré-criada** para o módulo de Equipes. Espera-se que o participante projete a arquitetura (back-end e front-end), os modelos de dados e as rotas necessárias, mas tem-se uma base para servir de guia na organização incial do projeto, que inclusive é a mesma página da demo que serve de base para guiar o desafio.

## 1. O Projeto Base
O stack tecnológico do projeto é:
- **Backend:** FastAPI com padrão de repositório e autenticação implementada.
- **Banco de Dados:** Postgres com migrações via Alembic.
- **Frontend:** React (Vite) com TypeScript.
- **Testes:** Estrutura de Pytest configurada para o backend.

## 2. O Desafio: "Módulo de Gestão de Equipes"
O objetivo é criar um sistema onde seja possível gerenciar **Equipes** e seus respectivos **Membros** (Usuários). Você deverá criar as tabelas, a API e as interfaces gráficas seguindo os padrões do projeto.

## 3. Requisitos Funcionais (O Quê)

### A. Modelagem de Dados (Postgres/Alembic)
A modelagem é parte crucial da avaliação.
- Projete os modelos para **Equipes** e a associação com **Usuários**.
- **Regras de Negócio (Constraints):**
    1.  Uma Equipe deve ter **obrigatoriamente um Líder** (que é um Usuário já existente).
    2.  **Unicidade de Membro:** Um Usuário só pode pertencer a **uma única equipe** por vez.
    3.  **Unicidade de Líder:** Um Usuário só pode liderar **uma única equipe** por vez.
- Garanta migrações que persistam o modelo no banco e assegurem integridade referencial (FKs e Constraints) para impedir estados inválidos (ex: usuário em duas equipes ao mesmo tempo).

### B. Backend (FastAPI)
- **API:**
    - Implemente endpoints para: Criar, Listar, Editar e Remover Usuários.
    - Implemente endpoints para: Criar, Listar, Editar e Remover Equipes.
    - Implemente endpoints para: Adicionar e Remover membros de uma equipe (respeitando a regra de que o usuário sai da equipe anterior se entrar em uma nova, ou o sistema bloqueia, conforme sua decisão de design).
- **Padrões:**
    - Utilize Padrão de Repositório e Schemas (Pydantic) legíveis.
    - Conecte o frontend aos serviços gerados (se houver script de `generate-client` ou similar, utilize-o para manter a tipagem forte entre Back e Front).

### C. Frontend (React)
O foco é uma UX coesa e funcional.
- **Navegação:** Adicione uma entrada no menu lateral para cada uma das páginas a seguir.
- **Página de Usuários:**
    - CRUD simples para cadastrar usuários no sistema (para que possam ser posteriormente alocados em equipes).
- **Página de Listagem de Equipes:**
    - Liste as equipes cadastradas exibindo cards ou tabela com: Nome da Equipe e Nome do Líder.
    - Botão para criar nova equipe.
- **Página de Detalhe da Equipe:**
    - Ao clicar em uma equipe, exiba os detalhes e a lista de membros atuais.
    - **Associação:** Permita adicionar um usuário a esta equipe.
        - *Atenção:* A interface deve lidar com a regra de negócio. Se o usuário já estiver em outra equipe, deixe claro o que está acontecendo (ex: aviso de transferência ou erro).

Ps: é recomendado o uso da ferramenta Lovable ou Figma AI para a criação da visualização base das telas (lembre-se que essas telas podem ser exportadas e integradas ao projeto).

### D. Testes (Pytest)
- **Backend (Obrigatório):**
    - Implemente testes de integração para as rotas principais (Criação de equipe, Movimentação de membros, CRUD de usuários).
    - Cubra cenários de sucesso e **cenários de erro** (ex: tentar violar a regra de um usuário em duas equipes).
    - Utilização de playwright para os testes.
- **Frontend (Opcional/Diferencial):**
    - Testes E2E ou unitários de componentes são bem-vindos, mas não eliminatórios.

## 4. Entregáveis

1.  **Link do Repositório (Fork):** O projeto deve ser entregue através de um Fork do repositório original. Certifique-se de que o repositório esteja público ou acessível para correção.
2.  **Código Fonte Completo:** A implementação funcional de todas as camadas (Banco, Backend, Frontend e Testes).
3. **Documentação de Processo (Itens Diferenciais / Bônus):** Embora o foco da avaliação seja a solução técnica, os arquivos abaixo contam como pontuação extra para avaliar seu pensamento crítico e organização:
    - **Arquivo ``IA_LOG.md``:** Registre brevemente os prompts utilizados. **Obrigatório para o bônus:** Cite um exemplo onde a IA sugeriu código incorreto, inseguro ou ruim, e descreva como você identificou e corrigiu o problema.
    - **Arquivo ``DESCRIPTION_LOG.md``:** Um "diário de bordo" objetivo narrando seu processo criativo: por onde começou, qual ordem seguiu e a justificativa para grandes decisões arquiteturais. Isso ajuda o avaliador a entender seu raciocínio.

## 5. Critérios de Avaliação

Estas perguntas guiam a correção do desafio e ajudam a garantir que todos os requisitos foram atendidos:

**1. Modelagem de Dados & Integridade**

Neste tópico, avaliaremos se a sua solução de banco de dados é robusta e se comporta como uma camada confiável de persistência.

- **Estrutura e Relacionamentos:**
    - A modelagem das tabelas representa corretamente as entidades do sistema e estabelece os vínculos necessários entre membros e suas equipes?
- **Garantia das Regras de Negócio:**
     - A estrutura do banco de dados foi desenhada para impedir nativamente inconsistências?
     - A modelagem garante, por si só, que regras críticas (como exclusividade de liderança e unicidade de participação) sejam respeitadas, impossibilitando estados inválidos mesmo sem a validação da aplicação?
- **Gestão de Schema (Migrações):**
    - O projeto utiliza um sistema de migrações confiável?
    - As alterações no banco são rastreáveis e reversíveis, permitindo que o ambiente seja atualizado ou revertido (downgrade) sem corromper a integridade dos dados ou da estrutura?

**2. API REST, Regras de Negócio & Arquitetura**

Neste tópico, validaremos a conformidade dos endpoints, o tratamento de cenários de borda e a organização estrutural do código.

- **Contratos e Operações (CRUD):**
    - A documentação automática está acessível e reflete os endpoints disponíveis?
    - As operações de criação, leitura, atualização e exclusão respeitam a semântica HTTP e tratam corretamente identificadores inexistentes?
- **Comportamento e Regras de Negócio:**
    - O sistema trata conflitos de integridade ao tentar duplicar atribuições exclusivas, como a liderança?
    - A lógica de gerenciamento de membros valida vínculos pré-existentes e impede a remoção inconsistente de líderes ativos?
- **Qualidade de Código e Segurança:**
    - Existe uma camada de abstração clara (ex: Repository) isolando as rotas da manipulação direta do banco?
    - A aplicação utiliza recursos do ORM e Schemas de validação para garantir segurança contra injeção e consistência na tipagem de dados?

**3. Frontend & Experiência do Usuário**

Neste tópico, validaremos a implementação da interface, a fluidez da navegação e a organização arquitetural do código cliente.

- **Funcionalidades e Fluxos de Tela:**
    - A interface permite o ciclo completo de gerenciamento (CRUD) de Usuários e Equipes?
    - As telas de detalhes permitem manipular a composição dos times e visualizam dados relacionados (ex: nomes de líderes) de forma intuitiva?
- **UX e Feedback Visual:**
    - A navegação entre módulos ocorre de forma fluida (SPA), sem recarregamentos totais da página?
    - O sistema fornece feedback visual imediato para estados de carregamento, erros de negócio e sucesso nas operações?
- **Arquitetura e Qualidade de Código:**
    - A comunicação com a API está centralizada e desacoplada dos componentes visuais?
    - O projeto prioriza a reutilização de componentes, a tipagem estática dos dados e a ausência de configurações rígidas (hardcoded)?

**4. Testes Automatizados & Qualidade**

Neste tópico, verificaremos a cobertura de testes de integração e a confiabilidade dos mecanismos de validação do sistema.

- **Cobertura de Fluxos Críticos:** Os testes validam corretamente o ciclo de vida dos usuários, equipes e a movimentação de membros?
- **Cenários de Exceção:** A suíte garante que as violações de regras de negócio sejam bloqueadas conforme esperado?
- **Infraestrutura e Isolamento:** O ambiente de testes gerencia corretamente o estado do banco, garantindo independência e limpeza entre as execuções?

**5. Versionamento & Documentação**

Neste tópico, avaliaremos a organização do histórico de mudanças e a transparência do processo de desenvolvimento assistido.

- **Histórico de Versões (Git):** Os commits são atômicos e descrevem com clareza o propósito de cada alteração?
- **Registro de Desenvolvimento (IA Log):**
    - A documentação narra o processo criativo e as decisões arquiteturais tomadas?
    - O registro demonstra pensamento crítico na análise de erros e na validação das sugestões geradas por IA?

## Development & License
Consulte `development.md` para instruções de setup local.
License: MIT.

---

## 📊 Banco de Dados - Times e Usuários

### Tabelas Criadas

Foi implementado um sistema completo de gerenciamento de times e usuários com regras de negócio robustas:

#### Tabela `times`
- `id_time` (INTEGER, PK) - Identificador único do time
- `nome_time` (VARCHAR(100), UNIQUE) - Nome do time
- `responsabilidades` (VARCHAR(500)) - Descrição das responsabilidades
- `cpf_lider` (VARCHAR(11), FK, UNIQUE, NOT NULL) - CPF do líder

#### Tabela `users`
- `cpf_user` (VARCHAR(11), PK) - CPF do usuário
- `nome` (VARCHAR(100)) - Nome do usuário
- `funcao` (VARCHAR(100)) - Função/cargo do usuário
- `id_time` (INTEGER, FK) - Referência para o time (opcional)

### 🔒 Regras de Negócio Implementadas

1. **Todo time DEVE ter um líder** (campo obrigatório)
2. **Um usuário só pode ser líder de UM time** (constraint UNIQUE)
3. **Usuários só podem pertencer a UM time por vez**
4. **Não é possível deletar um líder** (validado pela API)
5. **Líderes não podem sair do time** (validado pela API)

### APIs Disponíveis

**Times:**
- `POST /api/v1/times/` - Criar time (requer cpf_lider)
- `GET /api/v1/times/` - Listar times (com líder e total de membros)
- `GET /api/v1/times/{id}` - Obter time específico
- `PUT /api/v1/times/{id}` - Atualizar time (pode trocar líder)
- `DELETE /api/v1/times/{id}` - Deletar time
- `GET /api/v1/times/{id}/membros` - Listar membros (indica líder)

**Usuários:**
- `POST /api/v1/users/` - Criar usuário
- `GET /api/v1/users/` - Listar usuários (com time e se é líder)
- `GET /api/v1/users/{cpf}` - Obter usuário específico
- `PUT /api/v1/users/{cpf}` - Atualizar usuário
- `DELETE /api/v1/users/{cpf}` - Deletar usuário
- `GET /api/v1/users/lideres/lista` - Listar apenas líderes

### Documentação Completa

- **[TABELAS.md](TABELAS.md)** - Guia completo com estrutura, regras e comandos
- **[EXEMPLOS_API.md](EXEMPLOS_API.md)** - Exemplos práticos com curl, Python e HTTPie

### Quick Start

```bash
# 1. Iniciar ambiente
make dev-up

# 2. Criar migração
make db-new-migration MESSAGE="Criar tabelas times e users com líder"

# 3. Aplicar migração
make db-upgrade

# 4. Popular com dados de teste
make backend-shell
python scripts/seed_data.py

# 5. Testar API
curl http://localhost:8000/docs
```

### 📝 Ordem Correta de Criação

1. **Criar USUÁRIOS primeiro** (pois times precisam de líderes existentes)
2. **Criar TIMES** (informando o CPF de um líder existente)
3. **Atribuir MEMBROS aos times** (atualizando usuários com id_time)
