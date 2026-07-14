# Concurso API

API em NestJS para uma plataforma de estudos para concursos, construída com foco em Clean Architecture, DDD e testes automatizados.

O projeto ainda está em evolução. Atualmente os módulos mais avançados são `provas` e `questoes`, que servem como base arquitetural para os próximos módulos, principalmente `importacoes`, `simulados` e `usuarios`.

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

Observação: a tela de protótipo também mostra `quantidadeQuestoes`. O módulo `questoes` já existe, mas a listagem de provas ainda não agrega essa contagem.

## Módulo Questões

O módulo `questoes` já possui domínio, casos de uso, persistência TypeORM, camada HTTP e testes.

Esse módulo foi modelado pensando em dois fluxos:

- questões criadas manualmente pelo usuário
- questões importadas a partir de arquivos de prova

### Entidades principais

`Questao` possui:

- `id`
- `provaId`
- `numero`
- `enunciado`
- `tipo`
- `status`
- `alternativas`
- `gabarito`
- `disciplina`
- `assunto`
- `textoApoio`
- `createdAt`
- `updatedAt`

`Alternativa` possui:

- `id`
- `texto`
- `letra`

### Value Objects

- `TipoQuestao`
  - valores aceitos:
    - `MULTIPLA_ESCOLHA`
    - `MULTIPLAS_CORRETAS`
    - `CERTO_ERRADO`
    - `DISCURSIVA`

- `StatusQuestao`
  - valores aceitos:
    - `RASCUNHO`
    - `IMPORTADA`
    - `PENDENTE_REVISAO`
    - `PUBLICADA`
    - `ANULADA`

- `Gabarito`
  - suporta alternativas
  - suporta certo/errado
  - suporta resposta discursiva
  - normaliza alternativas para maiúsculas
  - impede gabarito vazio

### Regras de domínio

Regras já protegidas no domínio:

- questão precisa pertencer a uma prova
- questão precisa ter enunciado
- questão objetiva precisa ter alternativas suficientes para publicação
- questão publicada precisa ter gabarito
- questão de múltipla escolha deve ter exatamente uma alternativa correta
- questão de múltiplas corretas deve ter ao menos uma alternativa correta
- questão importada sem dados suficientes é enviada para revisão
- alternativa precisa ter texto

### Casos de uso

Implementados:

- `CriarQuestaoUseCase`
- `ImportarQuestaoUseCase`
- `ListarQuestoesPorProvaUseCase`
- `BuscarQuestaoPorIdUseCase`
- `PublicarQuestaoUseCase`
- `EnviarQuestaoParaRevisaoUseCase`
- `AnularQuestaoUseCase`

### Persistência

O módulo possui:

- `QuestaoOrmEntity`
- `AlternativaOrmEntity`
- `QuestaoMapper`
- `TypeOrmQuestaoRepository`

O repository implementa a interface de domínio `QuestaoRepository`, mantendo os casos de uso desacoplados do TypeORM.

### Camada HTTP

Base:

```txt
/questoes
```

Rotas atuais:

```txt
POST  /questoes
POST  /questoes/importar
GET   /questoes/prova/:provaId
GET   /questoes/:id
PATCH /questoes/:id/publicar
PATCH /questoes/:id/revisao
PATCH /questoes/:id/anular
```

DTOs atuais:

- `CriarQuestaoDto`
- `ImportarQuestaoDto`

Também existem:

- `QuestaoPresenter`, para converter domínio em resposta HTTP
- `GabaritoHttpMapper`, para converter entrada HTTP em value object `Gabarito`

Exemplo de criação:

```json
{
  "provaId": "550e8400-e29b-41d4-a716-446655440999",
  "numero": 1,
  "enunciado": "Constituição Federal de 88 é rígida?",
  "tipo": "CERTO_ERRADO",
  "alternativas": [
    {
      "texto": "Certo",
      "letra": "C"
    },
    {
      "texto": "Errado",
      "letra": "E"
    }
  ],
  "gabarito": {
    "tipo": "CERTO_ERRADO",
    "valores": ["CERTO"]
  },
  "disciplina": "Direito Constitucional",
  "assunto": "Constituição",
  "textoApoio": "Texto de apoio"
}
```

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
npm test -- questoes
npm test -- criar-prova
npm test -- criar-questao
npm test -- typeorm-prova
npm test -- typeorm-questao
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

O módulo `questoes` possui testes para:

- domínio
  - entidade `Questao`
  - entidade `Alternativa`
  - value objects `TipoQuestao`, `StatusQuestao`, `Gabarito`

- aplicação
  - criar questão
  - importar questão
  - listar questões por prova
  - buscar questão por id
  - publicar questão
  - enviar questão para revisão
  - anular questão

- apresentação
  - controller de questões
  - presenter de questão
  - mapper HTTP de gabarito

- infraestrutura
  - mapper de questão
  - repository TypeORM de questão

## Próximos passos

### 1. Ajustes finais do módulo Questões

Possíveis melhorias antes de avançar:

- criar `AtualizarQuestaoUseCase`
- criar `RemoverQuestaoUseCase`
- decidir se listagem de questões precisa de paginação e filtros
- agregar `quantidadeQuestoes` na listagem de provas

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

Esse fluxo deve ficar em um módulo próprio, porque importar arquivo envolve uma regra diferente de simplesmente cadastrar questão.

Fluxo provável:

- receber arquivo
- identificar tipo do arquivo
- extrair texto
- separar cabeçalho da prova
- separar questões
- identificar alternativas
- identificar gabarito quando existir
- registrar inconsistências
- permitir revisão antes de publicar

### 3. Relacionar Provas e Questões

A listagem de provas pode passar a retornar:

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
- Mappers HTTP ficam na camada `presentation`, porque adaptam dados de entrada/saída da API.
