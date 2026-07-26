import io
import re
from dataclasses import dataclass

import fitz
import pytesseract
from PIL import Image


@dataclass
class BlocoTexto:
    pagina: int
    coluna: int
    x0: float
    y0: float
    x1: float
    y1: float
    texto: str


class PdfTextExtractor:
    def extrair(self, conteudo_arquivo: bytes) -> tuple[str, int]:
        blocos, paginas = self.extrair_blocos(conteudo_arquivo)

        texto_completo = "\n".join(bloco.texto for bloco in blocos).strip()

        if self._texto_parece_util(texto_completo):
            return texto_completo, paginas

        texto_ocr = self._extrair_texto_com_ocr(conteudo_arquivo)

        return texto_ocr, paginas

    def extrair_blocos(self, conteudo_arquivo: bytes) -> tuple[list[BlocoTexto], int]:
        documento = fitz.open(stream=conteudo_arquivo, filetype="pdf")

        try:
            blocos_extraidos: list[BlocoTexto] = []

            for indice_pagina, pagina in enumerate(documento, start=1):
                blocos_extraidos.extend(
                    self._extrair_blocos_ordenados_da_pagina(
                        pagina=pagina,
                        numero_pagina=indice_pagina,
                    )
                )

            return blocos_extraidos, documento.page_count
        finally:
            documento.close()

    def _extrair_blocos_ordenados_da_pagina(
            self,
            pagina: fitz.Page,
            numero_pagina: int,
    ) -> list[BlocoTexto]:
        blocos = pagina.get_text("blocks")

        largura_pagina = pagina.rect.width
        meio_pagina = largura_pagina / 2

        blocos_texto: list[BlocoTexto] = []

        for bloco in blocos:
            x0, y0, x1, y1, texto, *_ = bloco

            texto_limpo = str(texto).strip()

            if not texto_limpo:
                continue

            if self._deve_ignorar_texto(texto_limpo):
                continue

            coluna = 0 if x0 < meio_pagina else 1

            blocos_texto.append(
                BlocoTexto(
                    pagina=numero_pagina,
                    coluna=coluna,
                    x0=float(x0),
                    y0=float(y0),
                    x1=float(x1),
                    y1=float(y1),
                    texto=texto_limpo,
                )
            )

        return sorted(
            blocos_texto,
            key=lambda bloco: (bloco.coluna, bloco.y0, bloco.x0),
        )

    def _deve_ignorar_texto(self, texto: str) -> bool:
        texto_normalizado = texto.strip().lower()

        if not texto_normalizado:
            return True

        if "pciconcursos" in texto_normalizado:
            return True

        if texto_normalizado.startswith("www."):
            return True

        return False

    def _texto_parece_util(self, texto: str) -> bool:
        texto_normalizado = texto.lower()

        if len(texto_normalizado) < 500:
            return False

        if "quest" in texto_normalizado:
            return True

        if re.search(r"\b\d{1,3}\s*[-.)]\s+", texto_normalizado):
            return True

        return False

    def _extrair_texto_com_ocr(self, conteudo_arquivo: bytes) -> str:
        documento = fitz.open(stream=conteudo_arquivo, filetype="pdf")

        try:
            textos_paginas: list[str] = []

            for pagina in documento:
                pixmap = pagina.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                imagem_bytes = pixmap.tobytes("png")
                imagem = Image.open(io.BytesIO(imagem_bytes))

                texto_pagina = self._extrair_texto_ocr_adaptativo(imagem)

                if texto_pagina:
                    textos_paginas.append(texto_pagina)

            return "\n".join(textos_paginas).strip()
        finally:
            documento.close()

    def _extrair_texto_ocr_por_colunas(self, imagem: Image.Image) -> list[str]:
        largura, altura = imagem.size
        meio = largura // 2
        sobreposicao = 20

        recortes = [
            imagem.crop((0, 0, meio + sobreposicao, altura)),
            imagem.crop((meio - sobreposicao, 0, largura, altura)),
        ]

        textos: list[str] = []

        for recorte in recortes:
            texto = pytesseract.image_to_string(
                recorte,
                lang="por",
                config="--psm 6",
            ).strip()

            if texto:
                textos.append(texto)

        return textos

    def _extrair_texto_ocr_adaptativo(self, imagem: Image.Image) -> str:
        texto_pagina_inteira = pytesseract.image_to_string(
            imagem,
            lang="por",
            config="--psm 6",
        ).strip()

        if not self._parece_pagina_de_questoes(texto_pagina_inteira):
            return texto_pagina_inteira

        textos_colunas = self._extrair_texto_ocr_por_colunas(imagem)

        return "\n".join(textos_colunas).strip()

    def _parece_pagina_de_questoes(self, texto: str) -> bool:
        texto_normalizado = texto.lower()

        if "questão" in texto_normalizado or "questao" in texto_normalizado:
            return True

        alternativas = re.findall(
            r"(?:^|\s)\(?[A-Ea-e]\)?[).]\s+",
            texto,
        )

        if len(alternativas) >= 4:
            return True

        numeros_de_questao = re.findall(
            r"(?im)^\s*(?:quest[ãa]o\s*)?\d{1,3}\s*[-.)]\s+",
            texto,
        )

        return len(numeros_de_questao) >= 2