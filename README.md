# Concurso API

API em NestJS para uma plataforma de estudos para concursos, construída com foco em Clean Architecture, DDD e testes automatizados.

O projeto ainda está em evolução. Atualmente o módulo mais completo é `provas`, que já serve como base arquitetural para os próximos módulos, principalmente `questoes` e `importacoes`.

## Tecnologias

- Node.js
- TypeScript
- NestJS
- TypeORM
- PostgreSQL
- class-validator
- class-transformer
- Jest
- ESLint
- Prettier

## Arquitetura

O projeto segue uma organização modular inspirada em Clean Architecture e DDD.

Cada módulo tende a ser dividido em:

```txt
domain
application
infra
presentation
tests
```

Responsabilidades:

- `domain`: entidades, value objects, exceções e contratos de repositório.
- `application`: casos de uso, inputs e DTOs de aplicação/entrada.
- `infra`: persistência, entidades ORM, mappers, query builders e implementações de repositórios.
- `presentation`: controllers, presenters, pipes e filtros HTTP.
- `tests`: testes unitários organizados por camada dentro do módulo.

Fluxo padrão:

```txt
Controller -> Use Case -> Repository Interface -> Repository TypeORM -> Banco
```

O domínio não depende de NestJS, TypeORM ou HTTP. A infraestrutura conhece detalhes externos, e a apresentação adapta HTTP para os casos de uso.

## Shared

A pasta `src/shared` contém itens transversais reutilizáveis:

```txt
src/shared
├── application
│   ├── pagination
│   └── result
├── domain
│   ├── entities
│   ├── events
│   └── exceptions
└── presentation
    ├── filters
    └── pipes
```

Principais itens:

- `BaseEntity`: base para entidades com identidade.
- `AggregateRoot`: base para agregados com suporte a eventos de domínio.
- `BusinessException`: exceção base para erros de negócio.
- `NotFoundException`: exceção compartilhada para recursos não encontrados.
- `BusinessExceptionFilter`: transforma exceções de negócio em respostas HTTP.
- `UuidValidationPipe`: valida parâmetros UUID em rotas HTTP.
- `PaginatedResult`: formato compartilhado para respostas paginadas.

## Módulo Provas

O módulo `provas` já possui CRUD, filtros, paginação e testes.

### Entidade principal

`Prova` possui:

- `id`
- `titulo`
- `cargo`
- `banca`
- `ano`
- `status`
- `categoria`
- `createdAt`
- `updatedAt`

### Value Objects

- `Banca`
  - remove espaços
  - normaliza para maiúsculas
  - impede valor vazio

- `AnoProva`
  - exige ano inteiro
  - impede ano menor que 1900
  - impede ano maior que o próximo ano

- `StatusProva`
  - valores aceitos:
    - `RASCUNHO`
    - `PUBLICADA`
    - `REVISAO`

- `CategoriaProvaVO`
  - remove espaços
  - normaliza para maiúsculas
  - impede valor vazio

### Casos de uso

Implementados:

- `CriarProvaUseCase`
- `ListarProvasUseCase`
- `BuscarProvaPorIdUseCase`
- `AtualizarProvaUseCase`
- `RemoverProvaUseCase`

### Rotas

Base:

```txt
/provas
```

Rotas atuais:

```txt
POST   /provas
GET    /provas
GET    /provas/:id
PUT    /provas/:id
DELETE /provas/:id
```

### Listagem

`GET /provas` suporta:

```txt
search
banca
cargo
ano
categoria
status
page
limit
```

Exemplo:

```txt
GET /provas?search=agente&banca=CEBRASPE&ano=2024&page=1&limit=12
```

Formato da resposta:

```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Prova PF",
      "cargo": "Agente",
      "banca": "CEBRASPE",
      "ano": 2024,
      "status": "PUBLICADA",
      "categoria": "SEGURANCA",
      "createdAt": "2026-07-04T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

Observação: a tela de protótipo também mostra `quantidadeQuestoes`. Esse dado ainda não existe no módulo `provas`; ele deve vir naturalmente do próximo módulo, `questoes`.

## Configuração

O projeto usa `ConfigModule` global.

Variáveis esperadas:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=concurso
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

Notas:

- `DB_SYNCHRONIZE=true` é útil apenas em desenvolvimento.
- Em produção, use `DB_SYNCHRONIZE=false` e migrations.

## Instalação

```bash
npm install
```

## Executar aplicação

Desenvolvimento:

```bash
npm run start:dev
```

Execução normal:

```bash
npm run start
```

Produção:

```bash
npm run build
npm run start:prod
```

## Testes

Executar todos os testes:

```bash
npm test
```

Executar em modo watch:

```bash
npm run test:watch
```

Executar cobertura:

```bash
npm run test:cov
```

Executar testes e2e:

```bash
npm run test:e2e
```

Rodar uma parte específica:

```bash
npm test -- provas
npm test -- criar-prova
npm test -- typeorm-prova
```

## Lint

Rodar ESLint:

```bash
npm run lint
```

Observação: o script atual usa `--fix`, então pode alterar arquivos automaticamente.

Para apenas verificar sem corrigir:

```bash
npx eslint "src/**/*.ts" "test/**/*.ts"
```

## Estado atual dos testes

O módulo `provas` possui testes para:

- domínio
  - entidade `Prova`
  - value objects `Banca`, `AnoProva`, `CategoriaProvaVO`

- aplicação
  - criar prova
  - listar provas
  - buscar prova por id
  - atualizar prova
  - remover prova

- apresentação
  - controller de provas
  - presenter de prova

- infraestrutura
  - mapper de prova
  - repository TypeORM
  - query builder da listagem

## Próximos passos

### 1. Módulo Questões

Criar o módulo `questoes`, já pensando que as questões serão geradas por importação de arquivo.

Primeira modelagem sugerida:

```txt
Questao
Alternativa
```

Regras iniciais:

- questão precisa pertencer a uma prova
- questão precisa ter enunciado
- questão precisa ter pelo menos duas alternativas
- questão precisa ter exatamente uma alternativa correta
- alternativa precisa ter texto

Esse módulo permitirá alimentar `quantidadeQuestoes` nos cards da tela de provas.

### 2. Módulo Importações

Criar fluxo para importar arquivos e gerar provas/questões.

Fluxo esperado:

```txt
upload de arquivo
processamento
extração de prova
extração de questões
relatório de erros/sucesso
revisão manual
```

### 3. Relacionar Provas e Questões

Depois do módulo `questoes`, a listagem de provas pode passar a retornar:

```txt
quantidadeQuestoes
```

Esse dado deve ser calculado a partir das questões vinculadas à prova, não armazenado diretamente como campo principal da entidade `Prova`.

### 4. Autenticação e Usuários

Futuro módulo para:

- cadastro de usuário
- login
- perfil
- permissões
- progresso individual

### 5. Simulados

Criar simulados a partir de questões já cadastradas/importadas.

Possíveis casos de uso:

- criar simulado
- responder questão
- finalizar simulado
- calcular desempenho

## Observações de arquitetura

- DTOs pertencem à camada de entrada/presentation/application, não ao domínio.
- Inputs de use case ficam próximos ao caso de uso.
- Value Objects protegem regras pequenas e importantes do domínio.
- Presenters convertem entidade de domínio para resposta HTTP.
- Mappers convertem domínio para persistência e persistência para domínio.
- Query builders TypeORM ficam em `infra`, porque conhecem detalhes do ORM.
- Controllers devem ser finos: recebem HTTP, chamam use case e retornam presenter.
