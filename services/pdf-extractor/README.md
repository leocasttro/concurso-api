# Serviço de Extração de PDF

Microserviço em Python/FastAPI responsável por extrair texto e questões de arquivos PDF de provas de concurso.

Este serviço existe separado da API principal em NestJS porque a leitura de PDF, OCR, tratamento de colunas e reconhecimento de padrões de prova são tarefas mais naturais no ecossistema Python.

## Estágio Atual

O microserviço já possui uma primeira versão funcional para importar provas em PDF nativo e PDFs que precisam de OCR.

Funcionalidades implementadas:

- Extração de texto de PDF nativo com PyMuPDF.
- Fallback para OCR com Tesseract quando o texto nativo não parece útil.
- Leitura OCR adaptativa.
- Leitura por colunas para páginas de questões.
- Parser de questões objetivas.
- Identificação de alternativas.
- Detecção de textos de apoio.
- Associação de texto de apoio às questões correspondentes.
- Remoção de textos de apoio duplicados por maior confiança.
- Marcação de questões que precisam de revisão.
- Relatório de qualidade da extração.

Fluxo atual:

```txt
PDF
-> extrai texto
-> detecta textos de apoio
-> separa questões
-> identifica alternativas
-> calcula confiança
-> retorna JSON para revisão/importação
```

## Tecnologias

- Python
- FastAPI
- Uvicorn
- PyMuPDF
- Pydantic
- Pillow
- pytesseract
- Tesseract OCR

## Instalação

Entre na pasta do microserviço:

```bash
cd services/pdf-extractor
```

Crie o ambiente virtual:

```bash
python3 -m venv .venv
```

Ative o ambiente:

```bash
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Também é necessário ter o Tesseract instalado no sistema operacional.

Em distribuições baseadas em Ubuntu/Debian:

```bash
sudo apt install tesseract-ocr tesseract-ocr-por
```

## Executando

Dentro da pasta `services/pdf-extractor`, execute:

```bash
uvicorn app.main:app --reload --port 8000
```

O serviço ficará disponível em:

```txt
http://localhost:8000
```

Teste de saúde:

```bash
curl http://localhost:8000/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

## Endpoints

### Extrair Texto

Extrai o texto bruto do PDF.

```txt
POST /extrair/texto
```

Exemplo:

```bash
curl -X POST http://localhost:8000/extrair/texto \
  -F "file=@/home/leonardo/Downloads/prova_obj.pdf;type=application/pdf" \
  -o /tmp/texto-extraido.json
```

Conferir o início do texto:

```bash
python3 - <<'PY'
import json

with open('/tmp/texto-extraido.json') as f:
    data = json.load(f)

print('páginas:', data['paginas'])
print(data['texto'][:3000])
PY
```

Esse endpoint pode retornar capa, instruções, cabeçalhos e rodapés. Isso é esperado, pois ele mostra o texto bruto extraído.

### Extrair Questões

Extrai as questões estruturadas da prova.

```txt
POST /extrair/questoes
```

Exemplo com PDF nativo:

```bash
curl -X POST http://localhost:8000/extrair/questoes \
  -F "file=@/home/leonardo/Downloads/prova_obj.pdf;type=application/pdf" \
  -o /tmp/questoes-prova-obj.json
```

Exemplo com PDF OCR:

```bash
curl -X POST http://localhost:8000/extrair/questoes \
  -F "file=@/home/leonardo/Downloads/analista_tec_infor_ambi_aplic_arquitetura.pdf;type=application/pdf" \
  -o /tmp/questoes-ocr.json
```

Conferir resumo:

```bash
python3 - <<'PY'
import json

with open('/tmp/questoes-prova-obj.json') as f:
    data = json.load(f)

print(data['metadados'])
print(data['qualidade'])
PY
```

Conferir primeiras questões:

```bash
python3 - <<'PY'
import json

with open('/tmp/questoes-prova-obj.json') as f:
    data = json.load(f)

for q in data['questoes'][:10]:
    print(q['numero'], q['enunciado'][:120])
PY
```

Conferir texto de apoio:

```bash
python3 - <<'PY'
import json

with open('/tmp/questoes-prova-obj.json') as f:
    data = json.load(f)

for numero in [1, 2, 5, 10, 11]:
    questao = next((q for q in data['questoes'] if q['numero'] == numero), None)

    print('\nQUESTÃO', numero)
    print('tem texto apoio:', bool(questao and questao['texto_apoio']))

    if questao and questao['texto_apoio']:
        print(questao['texto_apoio'][:300])
PY
```

## Relatório de Qualidade

O endpoint `/extrair/questoes` retorna um bloco `qualidade`.

Exemplo:

```json
{
  "percentual_confianca": 91.5,
  "questoes_confiaveis": 94,
  "questoes_para_revisao": 6,
  "problemas": [
    "Questão 18 possui 3 alternativas."
  ]
}
```

Campos:

- `percentual_confianca`: média de confiança das questões extraídas.
- `questoes_confiaveis`: quantidade de questões sem alerta de revisão.
- `questoes_para_revisao`: quantidade de questões com baixa confiança ou avisos.
- `problemas`: lista consolidada dos avisos encontrados.

Esse percentual não representa a correção humana final. Ele representa uma confiança técnica da extração.

## Como Interpretar a Confiança

Cada questão recebe uma pontuação de confiança:

- `0.90`: questão com enunciado e 5 alternativas.
- `0.85`: questão com enunciado e 4 alternativas.
- `0.65`: questão com pelo menos 2 alternativas, mas estrutura suspeita.
- `0.45`: questão com enunciado, mas sem alternativas suficientes.
- `0.20`: questão sem enunciado.

Quando a questão possui baixa confiança ou avisos, ela é marcada com:

```json
{
  "precisa_revisao": true
}
```

## Textos de Apoio

O serviço detecta textos de apoio por padrões comuns em provas:

- Intervalo explícito: `Para responder às questões de 1 a 5...`
- Questão única: `Leia o texto para responder à questão 23.`
- Quantidade relativa: `Leia o texto para responder às próximas três questões.`
- Texto titulado implícito: `TEXTO 1`, `Texto I`, `TEXTO - DIAGNÓSTICO`.
- Blocos longos sem alternativas.

Quando mais de um padrão identifica o mesmo intervalo, o serviço mantém o candidato com maior confiança.

## Cuidados Atuais

O microserviço é propositalmente permissivo, porque provas reais variam muito entre bancas.

Pontos tratados:

- Evita confundir instruções iniciais numeradas com questões reais.
- Mantém compatibilidade com PDF nativo e PDF OCR.
- Usa OCR por colunas apenas quando a página parece uma página de questões.
- Mantém texto bruto separado da extração estruturada.

Ainda assim, alguns PDFs podem exigir revisão manual, principalmente quando:

- O OCR reconhece letras incorretamente.
- O PDF possui imagens de baixa qualidade.
- As alternativas aparecem sem padrão claro.
- A prova mistura colunas, tabelas, figuras e textos longos.
- A banca usa layout muito diferente.

## Próximos Passos

Próximas evoluções recomendadas:

1. Criar endpoint de debug para textos de apoio.
2. Criar endpoint de debug para blocos extraídos.
3. Salvar exemplos corrigidos manualmente para montar base de treinamento.
4. Integrar a API NestJS com o microserviço.
5. Criar fluxo de preview e confirmação da importação.
6. Evoluir para classificação com machine learning usando blocos rotulados.

Fluxo desejado na aplicação principal:

```txt
usuário envia PDF
-> microserviço extrai questões
-> NestJS recebe preview
-> usuário revisa questões suspeitas
-> usuário confirma
-> sistema salva prova e questões
```
