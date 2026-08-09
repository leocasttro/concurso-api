from typing import Literal

from pydantic import BaseModel


TipoQuestao = Literal[
    "MULTIPLA_ESCOLHA",
    "MULTIPLAS_CORRETAS",
    "CERTO_ERRADO",
    "DISCURSIVA",
    "DESCONHECIDA",
]

TipoGabarito = Literal[
    "ALTERNATIVAS",
    "CERTO_ERRADO",
    "DISCURSIVO",
]

class TextoExtraidoResponse(BaseModel):
    nome_arquivo: str
    paginas: int
    texto: str


class AlternativaResponse(BaseModel):
    letra: str | None = None
    texto: str

class GabaritoResponse(BaseModel):
    tipo: TipoGabarito
    valores: list[str]

class QuestaoResponse(BaseModel):
    numero: int | None = None
    enunciado: str
    tipo_sugerido: TipoQuestao
    alternativas: list[AlternativaResponse]
    texto_apoio: str | None = None
    disciplina: str | None = None
    assunto: str | None = None
    pagina_inicio: int | None = None
    pagina_fim: int | None = None
    confianca: float
    precisa_revisao: bool
    avisos: list[str]
    gabarito: GabaritoResponse | None = None


class MetadadosExtracaoResponse(BaseModel):
    nome_arquivo: str
    paginas: int
    total_questoes: int
    total_avisos: int
    total_erros: int


class QualidadeExtracaoResponse(BaseModel):
    percentual_confianca: float
    questoes_confiaveis: int
    questoes_para_revisao: int
    problemas: list[str]


class QuestoesExtraidasResponse(BaseModel):
    metadados: MetadadosExtracaoResponse
    qualidade: QualidadeExtracaoResponse
    questoes: list[QuestaoResponse]
    avisos: list[str]
    erros: list[str]
