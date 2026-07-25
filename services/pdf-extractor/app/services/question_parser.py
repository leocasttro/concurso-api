import re

from app.schemas import (
    AlternativaResponse,
    MetadadosExtracaoResponse,
    QuestaoResponse,
    QuestoesExtraidasResponse,
)


from app.services.text_support_detector import (
    TextSupportDetector,
    TextoApoioDetectado,
)


class QuestionParser:
    def parse(
            self,
            texto: str,
            nome_arquivo: str = "desconhecido.pdf",
            paginas: int = 0,
    ) -> QuestoesExtraidasResponse:
        texto_limpo = texto.strip()

        if not texto_limpo:
            erros = ["Texto da prova está vazio."]

            return QuestoesExtraidasResponse(
                metadados=MetadadosExtracaoResponse(
                    nome_arquivo=nome_arquivo,
                    paginas=paginas,
                    total_questoes=0,
                    total_avisos=0,
                    total_erros=len(erros),
                ),
                questoes=[],
                avisos=[],
                erros=erros,
            )

        textos_apoio = TextSupportDetector().detectar(texto_limpo)

        blocos = self._separar_blocos_de_questoes(texto_limpo)

        if not blocos:
            erros = ["Nenhuma questão foi identificada no texto."]

            return QuestoesExtraidasResponse(
                metadados=MetadadosExtracaoResponse(
                    nome_arquivo=nome_arquivo,
                    paginas=paginas,
                    total_questoes=0,
                    total_avisos=0,
                    total_erros=len(erros),
                ),
                questoes=[],
                avisos=[],
                erros=erros,
            )

        questoes = [
            self._converter_bloco_em_questao(
                bloco=bloco,
                textos_apoio=textos_apoio,
            )
            for bloco in blocos
        ]

        avisos = [
            aviso
            for questao in questoes
            for aviso in questao.avisos
        ]

        return QuestoesExtraidasResponse(
            metadados=MetadadosExtracaoResponse(
                nome_arquivo=nome_arquivo,
                paginas=paginas,
                total_questoes=len(questoes),
                total_avisos=len(avisos),
                total_erros=0,
            ),
            questoes=questoes,
            avisos=avisos,
            erros=[],
        )

    def _separar_blocos_de_questoes(self, texto: str) -> list[str]:
        regex_questao = re.compile(
            r"(?m)(?:^|(?<=[.;:?!]\s))\s*(?:(?:QUEST[ÃA]O|Quest[ãa]o)\s*)?(\d{1,3})\s*[-.)]\s+"
        )

        matches = list(regex_questao.finditer(texto))
        matches_validos = self._filtrar_matches_por_sequencia(matches)

        blocos: list[str] = []

        for index, match in enumerate(matches_validos):
            inicio = match.start()
            fim = (
                matches_validos[index + 1].start()
                if index + 1 < len(matches_validos)
                else len(texto)
            )

            bloco = texto[inicio:fim].strip()

            if bloco:
                blocos.append(bloco)

        return blocos

    def _filtrar_matches_por_sequencia(
            self,
            matches: list[re.Match],
    ) -> list[re.Match]:
        if not matches:
            return []

        matches_validos: list[re.Match] = []
        proximo_numero_esperado: int | None = None

        for match in matches:
            numero = int(match.group(1))

            if not matches_validos:
                matches_validos.append(match)
                proximo_numero_esperado = numero + 1
                continue

            if (
                    proximo_numero_esperado is not None
                    and numero == proximo_numero_esperado
            ):
                matches_validos.append(match)
                proximo_numero_esperado = numero + 1
                continue

            if numero > (proximo_numero_esperado or 0):
                matches_validos.append(match)
                proximo_numero_esperado = numero + 1

        return matches_validos

    def _converter_bloco_em_questao(
            self,
            bloco: str,
            textos_apoio: list[TextoApoioDetectado],
    ) -> QuestaoResponse:
        numero = self._extrair_numero(bloco)
        alternativas = self._extrair_alternativas(bloco)
        enunciado = self._extrair_enunciado(bloco)
        tipo_sugerido = self._detectar_tipo(alternativas)
        avisos = self._gerar_avisos(enunciado, alternativas, numero)

        confianca = self._calcular_confianca(enunciado, alternativas)

        texto_apoio = self._resolver_texto_apoio(
            numero=numero,
            textos_apoio=textos_apoio,
        )

        return QuestaoResponse(
            numero=numero,
            enunciado=enunciado,
            tipo_sugerido=tipo_sugerido,
            alternativas=alternativas,
            texto_apoio=texto_apoio,
            disciplina=None,
            assunto=None,
            pagina_inicio=None,
            pagina_fim=None,
            confianca=confianca,
            precisa_revisao=confianca < 0.8 or len(avisos) > 0,
            avisos=avisos,
        )

    def _resolver_texto_apoio(
            self,
            numero: int | None,
            textos_apoio: list[TextoApoioDetectado],
    ) -> str | None:
        if not numero:
            return None

        for texto_apoio in textos_apoio:
            if texto_apoio.inicio <= numero <= texto_apoio.fim:
                return texto_apoio.texto

        return None


    def _extrair_numero(self, bloco: str) -> int | None:
        match = re.match(
            r"^\s*(?:(?:QUEST[ÃA]O|Quest[ãa]o)\s*)?(\d{1,3})\s*[-.)]\s+",
            bloco,
        )

        if not match:
            return None

        return int(match.group(1))

    def _extrair_enunciado(self, bloco: str) -> str:
        linhas = self._linhas_validas(bloco)

        if not linhas:
            return ""

        primeira_linha = self._remover_prefixo_numero(linhas[0])
        linhas_sem_numero = [primeira_linha, *linhas[1:]]

        linhas_sem_numero = [linha for linha in linhas_sem_numero if linha]

        indice_primeira_alternativa = self._indice_primeira_alternativa(
            linhas_sem_numero
        )

        if indice_primeira_alternativa == -1:
            return " ".join(linhas_sem_numero).strip()

        return " ".join(linhas_sem_numero[:indice_primeira_alternativa]).strip()

    def _extrair_alternativas(self, bloco: str) -> list[AlternativaResponse]:
        linhas = self._linhas_validas(bloco)

        alternativas: list[AlternativaResponse] = []
        alternativa_atual: dict[str, str] | None = None

        for linha in linhas:
            match = re.match(r"^\(?([a-eA-E])\)?[).]\s+(.+)$", linha)

            if match:
                if alternativa_atual:
                    alternativas.append(
                        AlternativaResponse(
                            letra=alternativa_atual["letra"],
                            texto=alternativa_atual["texto"].strip(),
                        )
                    )

                alternativa_atual = {
                    "letra": match.group(1).upper(),
                    "texto": match.group(2).strip(),
                }

                continue

            if alternativa_atual and not self._parece_inicio_de_questao(linha):
                alternativa_atual["texto"] += f" {linha.strip()}"

        if alternativa_atual:
            alternativas.append(
                AlternativaResponse(
                    letra=alternativa_atual["letra"],
                    texto=alternativa_atual["texto"].strip(),
                )
            )

        return alternativas

    def _linhas_validas(self, texto: str) -> list[str]:
        return [
            linha.strip()
            for linha in texto.splitlines()
            if linha.strip() and not self._deve_ignorar_linha(linha)
        ]

    def _deve_ignorar_linha(self, linha: str) -> bool:
        texto = linha.strip().lower()

        if texto.startswith("www."):
            return True

        if "pciconcursos" in texto:
            return True

        if texto in {"agente de polícia", "2004"}:
            return True

        return False

    def _indice_primeira_alternativa(self, linhas: list[str]) -> int:
        for index, linha in enumerate(linhas):
            if re.match(r"^\(?[a-eA-E]\)?[).]\s+", linha):
                return index

        return -1

    def _parece_inicio_de_questao(self, linha: str) -> bool:
        return bool(
            re.match(
                r"^\s*(?:(?:QUEST[ÃA]O|Quest[ãa]o)\s*)?\d{1,3}\s*[-.)]\s+",
                linha,
            )
        )

    def _detectar_tipo(self, alternativas: list[AlternativaResponse]) -> str:
        if len(alternativas) >= 2:
            return "MULTIPLA_ESCOLHA"

        return "DESCONHECIDA"

    def _gerar_avisos(
            self,
            enunciado: str,
            alternativas: list[AlternativaResponse],
            numero: int | None,
    ) -> list[str]:
        avisos: list[str] = []
        identificador = numero or "sem número"

        if not enunciado:
            avisos.append(f"Questão {identificador} está sem enunciado.")

        if len(enunciado) < 20:
            avisos.append(f"Questão {identificador} possui enunciado muito curto.")

        if len(alternativas) not in {0, 4, 5}:
            avisos.append(
                f"Questão {identificador} possui {len(alternativas)} alternativas."
            )

        return avisos

    def _calcular_confianca(
            self,
            enunciado: str,
            alternativas: list[AlternativaResponse],
    ) -> float:
        if not enunciado:
            return 0.2

        if len(alternativas) == 5:
            return 0.9

        if len(alternativas) == 4:
            return 0.85

        if len(alternativas) >= 2:
            return 0.65

        return 0.45

    def _remover_prefixo_numero(self, linha: str) -> str:
        return re.sub(
            r"^\s*(?:(?:QUEST[ÃA]O|Quest[ãa]o)\s*)?\d{1,3}\s*[-.)]\s+",
            "",
            linha,
        ).strip()