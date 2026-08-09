import re

from app.schemas import (
    GabaritoExtraidoResponse,
    ModeloGabaritoResponse,
    RespostaGabaritoExtraidaResponse,
)


class AnswerKeyParser:
    def parse(
        self,
        texto: str,
        nome_arquivo: str = "desconhecido.pdf",
        paginas: int = 0,
    ) -> GabaritoExtraidoResponse:
        texto_limpo = texto.strip()

        if not texto_limpo:
            return GabaritoExtraidoResponse(
                nome_arquivo=nome_arquivo,
                paginas=paginas,
                gabaritos=[],
                avisos=[],
                erros=["Texto do gabarito está vazio."],
            )

        gabaritos = self._extrair_modelos(texto_limpo)

        avisos = [
            aviso
            for gabarito in gabaritos
            for aviso in gabarito.avisos
        ]

        erros = [] if any(g.respostas for g in gabaritos) else [
            "Nenhuma resposta foi identificada no arquivo de gabarito."
        ]

        return GabaritoExtraidoResponse(
            nome_arquivo=nome_arquivo,
            paginas=paginas,
            gabaritos=gabaritos,
            avisos=avisos,
            erros=erros,
        )


    def _extrair_tabelas_item_gabarito(self, texto: str) -> dict[int, str]:
        linhas = [linha.strip() for linha in texto.splitlines() if linha.strip()]
        respostas: dict[int, str] = {}

        for index, linha in enumerate(linhas):
            if not re.match(r"(?i)^item\b", linha):
                continue

            proxima_linha = self._proxima_linha_gabarito(linhas, index + 1)

            if not proxima_linha:
                continue

            numeros = [int(valor) for valor in re.findall(r"\b\d{1,3}\b", linha)]
            valores = re.findall(r"(?<![A-Z])([A-E]|\*)(?![A-Z])", proxima_linha.upper())

            for numero, valor in zip(numeros, valores):
                respostas[numero] = valor

        return respostas

    def _proxima_linha_gabarito(
        self,
        linhas: list[str],
        inicio: int,
    ) -> str | None:
        for linha in linhas[inicio:inicio + 3]:
            if re.match(r"(?i)^gabarito\b", linha):
                return linha

        return None

    def _extrair_pares_numero_valor(self, texto: str) -> dict[int, str]:
        respostas: dict[int, str] = {}

        matches = re.finditer(
            r"(?<!\d)\b0*(\d{1,3})\b\s*[-.)]?\s*([A-Ea-e]|\*)",
            texto,
        )

        for match in matches:
            numero = int(match.group(1))
            valor = match.group(2).upper()
            respostas[numero] = valor

        return respostas

    def _extrair_modelos(self, texto: str) -> list[ModeloGabaritoResponse]:
        respostas_item_gabarito = self._extrair_tabelas_item_gabarito(texto)

        if respostas_item_gabarito:
            return [
                self._montar_modelo(
                    identificador=None,
                    respostas=respostas_item_gabarito,
                )
            ]

        modelos_por_coluna = self._extrair_modelos_por_colunas(texto)

        if modelos_por_coluna:
            return modelos_por_coluna

        respostas = self._extrair_pares_numero_valor(texto)

        return [
            self._montar_modelo(
                identificador=None,
                respostas=respostas,
            )
        ]

    def _montar_modelo(
        self,
        identificador: str | None,
        respostas: dict[int, str],
    ) -> ModeloGabaritoResponse:
        avisos: list[str] = []

        if not respostas:
            avisos.append(
                f"Nenhuma resposta foi identificada em {identificador or 'gabarito'}."
            )

        return ModeloGabaritoResponse(
            identificador=identificador,
            respostas=[
                RespostaGabaritoExtraidaResponse(
                    numero=numero,
                    valor=valor,
                    anulada=valor == "*",
                )
                for numero, valor in sorted(respostas.items())
            ],
            avisos=avisos,
        )

    def _extrair_modelos_por_colunas(
        self,
        texto: str,
    ) -> list[ModeloGabaritoResponse]:
        modelos: dict[str, dict[int, str]] = {}
        modelo_por_coluna: dict[int, str] = {}

        for linha in texto.splitlines():
            segmentos = self._separar_segmentos_visuais(linha)

            for coluna, segmento in enumerate(segmentos):
                identificador = self._extrair_identificador_modelo(segmento)

                if identificador:
                    modelo_por_coluna[coluna] = identificador
                    modelos.setdefault(identificador, {})
                    continue

                respostas = self._extrair_pares_numero_valor(segmento)

                if not respostas:
                    continue

                modelo_atual = modelo_por_coluna.get(coluna)

                if not modelo_atual:
                    continue

                modelos.setdefault(modelo_atual, {}).update(respostas)

        return [
            self._montar_modelo(
                identificador=identificador,
                respostas=respostas,
            )
            for identificador, respostas in modelos.items()
        ]

    def _separar_segmentos_visuais(self, linha: str) -> list[str]:
        return [
            segmento.strip()
            for segmento in re.split(r"\s{10,}", linha)
            if segmento.strip()
        ]

    def _extrair_identificador_modelo(self, texto: str) -> str | None:
        match = re.search(
            r"(?i)\b(?:caderno|tipo|modelo)\s*(?:de\s*prova\s*)?\d{1,2}\b",
            texto,
        )

        if not match:
            return None

        return texto.strip()