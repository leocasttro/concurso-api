from fastapi import APIRouter, File, UploadFile

from app.services.pdf_text_extractor import PdfTextExtractor
from app.services.question_parser import QuestionParser
from app.schemas import (
    TextoExtraidoResponse,
    QuestoesExtraidasResponse,
    GabaritoExtraidoResponse,
)
from app.services.answer_key_parser import AnswerKeyParser

answer_key_parser = AnswerKeyParser()

router = APIRouter(prefix="/extrair", tags=["extrair"])

pdf_text_extractor = PdfTextExtractor()
question_parser = QuestionParser()


@router.post("/texto", response_model=TextoExtraidoResponse)
async def extrair_texto(file: UploadFile = File(...)) -> TextoExtraidoResponse:
    conteudo_arquivo = await file.read()

    texto, paginas = pdf_text_extractor.extrair(conteudo_arquivo)

    return TextoExtraidoResponse(
        nome_arquivo=file.filename or "desconhecido.pdf",
        paginas=paginas,
        texto=texto,
    )


@router.post("/questoes", response_model=QuestoesExtraidasResponse)
async def extrair_questoes(file: UploadFile = File(...)) -> QuestoesExtraidasResponse:
    conteudo_arquivo = await file.read()

    texto, paginas = pdf_text_extractor.extrair(conteudo_arquivo)

    return question_parser.parse(
        texto=texto,
        nome_arquivo=file.filename or "desconhecido.pdf",
        paginas=paginas,
    )

@router.post("/gabarito", response_model=GabaritoExtraidoResponse)
async def extrair_gabarito(file: UploadFile = File(...)) -> GabaritoExtraidoResponse:
    conteudo_arquivo = await file.read()

    texto, paginas = pdf_text_extractor.extrair(conteudo_arquivo)

    return answer_key_parser.parse(
        texto=texto,
        nome_arquivo=file.filename or "desconhecido.pdf",
        paginas=paginas,
    )