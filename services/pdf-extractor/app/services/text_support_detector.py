import re
from dataclasses import dataclass


@dataclass
class TextoApoioDetectado:
    inicio: int
    fim: int
    texto: str
    padrao: str
    confianca: float


class TextSupportDetector:
    def detectar(self, texto: str) -> list[TextoApoioDetectado]:
        textos_apoio: list[TextoApoioDetectado] = []

        textos_apoio.extend(self._detectar_intervalos_explicitos(texto))
        textos_apoio.extend(self._detectar_questao_unica(texto))
        textos_apoio.extend(self._detectar_quantidade_relativa(texto))
        textos_apoio.extend(self._detectar_texto_titulado_implicito(texto))
        textos_apoio.extend(self._detectar_blocos_longos_sem_alternativas(texto))

        return self._remover_duplicados_por_confianca(textos_apoio)

    def _detectar_blocos_longos_sem_alternativas(
            self,
            texto: str,
    ) -> list[TextoApoioDetectado]:
        regex_questao = re.compile(
            r"(?im)^\s*(?:QUEST[ÃA]O\s*)?(\d{1,3})\s*[-.)]?\s+"
        )

        matches = list(regex_questao.finditer(texto))
        textos_apoio: list[TextoApoioDetectado] = []

        for index, match in enumerate(matches):
            numero = int(match.group(1))

            inicio_janela = matches[index - 1].end() if index > 0 else 0
            fim_janela = match.start()

            trecho = texto[inicio_janela:fim_janela].strip()

            if not self._parece_bloco_longo_de_apoio(trecho):
                continue

            texto_limpo = self._limpar_texto_apoio(trecho)

            textos_apoio.append(
                TextoApoioDetectado(
                    inicio=numero,
                    fim=self._estimar_fim_texto_apoio(numero),
                    texto=texto_limpo,
                    padrao="BLOCO_LONGO_SEM_ALTERNATIVAS",
                    confianca=0.65,
                )
            )

        return textos_apoio

    def _parece_bloco_longo_de_apoio(self, trecho: str) -> bool:
        texto_limpo = self._limpar_texto_apoio(trecho)

        if len(texto_limpo) < 500:
            return False

        if self._tem_alternativas(texto_limpo):
            return False

        termos_instrucao = [
            "instruções",
            "cartão-resposta",
            "cartão de respostas",
            "folha de texto definitivo",
            "duração total",
            "chave de segurança",
            "concurso público",
            "leia com atenção",
            "não se comunique",
            "ao terminar a prova",
        ]

        texto_lower = texto_limpo.lower()

        if any(termo in texto_lower for termo in termos_instrucao):
            return False

        termos_de_questao = [
            "assinale",
            "é correto afirmar",
            "está correto",
            "são verdadeiras",
            "analise as afirmativas",
            "pode-se afirmar",
            "marque a alternativa",
        ]

        if any(termo in texto_lower for termo in termos_de_questao):
            return False

        quantidade_frases = len(re.findall(r"[.!?]", texto_limpo))

        if quantidade_frases < 3:
            return False

        return True


    def _tem_alternativas(self, texto: str) -> bool:
        alternativas = re.findall(
            r"(?:^|\s)\(?[A-Ea-e]\)?[).]\s+",
            texto,
        )

        return len(alternativas) >= 2


    def _detectar_texto_titulado_implicito(
            self,
            texto: str
    ) -> list[TextoApoioDetectado]:
        regex = re.compile(
            r"(?im)^\s*(?:TEXTO|Texto)\s*(?:[IVXLCDM]+|\d+)?(?:\s*[–-]\s*.+)?\s*$"
        )

        textos_apoio: list[TextoApoioDetectado] = []

        for match in regex.finditer(texto):
            proxima_questao = self._encontrar_proxima_questao(texto, match.end())

            if proxima_questao is None:
                continue

            inicio_questao = self._encontrar_inicio_questao(
                texto=texto,
                numero=proxima_questao,
                posicao_inicial=match.end(),
            )

            if inicio_questao is None:
                continue

            trecho = texto[match.start():inicio_questao].strip()
            texto_limpo = self._limpar_texto_apoio(trecho)

            if len(texto_limpo) < 120:
                continue

            textos_apoio.append(
                TextoApoioDetectado(
                    inicio=proxima_questao,
                    fim=self._estimar_fim_texto_apoio(proxima_questao),
                    texto=texto_limpo,
                    padrao="TEXTO_TITULADO_IMPLICITO",
                    confianca=0.75,
                )
            )
        return textos_apoio

    def _estimar_fim_texto_apoio(self, inicio: int) -> int:
        return inicio + 9


    def _remover_duplicados_por_confianca(
            self,
            textos_apoio: list[TextoApoioDetectado],
    ) -> list[TextoApoioDetectado]:
        melhores_por_intervalo: dict[tuple[int, int], TextoApoioDetectado] = {}

        for texto_apoio in textos_apoio:
            chave = (texto_apoio.inicio, texto_apoio.fim)
            atual = melhores_por_intervalo.get(chave)

            if atual is None or texto_apoio.confianca > atual.confianca:
                melhores_por_intervalo[chave] = texto_apoio

        return list(melhores_por_intervalo.values())

    def _detectar_intervalos_explicitos(self, texto: str) -> list[TextoApoioDetectado]:
        regex_texto_antes_intervalo = re.compile(
            r"(?im)"
            r"(?:atenção[:.]?\s*)?"
            r"(?:considere|leia|analise|use|baseie-se|para responder).*?"
            r"(?:texto|crônica|periodo|período|trecho|canção).*?"
            r"(?:quest(?:ões|oes)|itens|perguntas|questions).*?"
            r"(?:n[úu]meros?|n[ºo]s?|de)?\s*"
            r"(\d{1,3})\s*(?:a|até|-|to)\s*(\d{1,3})",
        )

        regex_intervalo_antes_texto = re.compile(
            r"(?im)"
            r"(?:para responder|responda|com base).*?"
            r"(?:quest(?:ões|oes)|itens|perguntas|questions).*?"
            r"(?:n[úu]meros?|n[ºo]s?|de)?\s*"
            r"(\d{1,3})\s*(?:a|até|-|to)\s*(\d{1,3}).*?"
            r"(?:leia|considere|analise|baseie-se).*?"
            r"(?:texto|crônica|periodo|período|trecho|canção|abaixo|seguir)",
        )

        textos_apoio: list[TextoApoioDetectado] = []

        textos_apoio.extend(
            self._extrair_por_matches(
                texto=texto,
                matches=list(regex_texto_antes_intervalo.finditer(texto)),
                padrao="INTERVALO_EXPLICITO",
                confianca=0.95,
            )
        )

        textos_apoio.extend(
            self._extrair_por_matches(
                texto=texto,
                matches=list(regex_intervalo_antes_texto.finditer(texto)),
                padrao="INTERVALO_EXPLICITO_INVERTIDO",
                confianca=0.95,
            )
        )

        return textos_apoio

    def _detectar_questao_unica(self, texto: str) -> list[TextoApoioDetectado]:
        regex = re.compile(
            r"(?im)"
            r"(?:considere|leia|analise|use|baseie-se|para responder).*?"
            r"(?:texto|crônica|periodo|período|trecho|canção).*?"
            r"(?:quest(?:ão|ao)|item)\s*(\d{1,3})",
        )

        textos_apoio: list[TextoApoioDetectado] = []

        for match in regex.finditer(texto):
            numero = int(match.group(1))
            inicio_texto = match.end()
            inicio_questao = self._encontrar_inicio_questao(
                texto,
                numero,
                inicio_texto,
            )

            if inicio_questao is None:
                continue

            trecho = texto[inicio_texto:inicio_questao].strip()

            if len(trecho) < 80:
                continue

            textos_apoio.append(
                TextoApoioDetectado(
                    inicio=numero,
                    fim=numero,
                    texto=self._limpar_texto_apoio(trecho),
                    padrao="QUESTAO_UNICA",
                    confianca=0.9,
                )
            )

        return textos_apoio

    def _detectar_quantidade_relativa(self, texto: str) -> list[TextoApoioDetectado]:
        regex = re.compile(
            r"(?im)"
            r"(?:leia|considere|analise).*?"
            r"(?:texto|canção|crônica|periodo|período|trecho).*?"
            r"(?:próximas|proximas|seguintes)\s+"
            r"(duas|três|tres|quatro|cinco)\s+"
            r"(?:quest(?:ões|oes)|perguntas|questions)",
        )

        quantidade_por_extenso = {
            "duas": 2,
            "três": 3,
            "tres": 3,
            "quatro": 4,
            "cinco": 5,
        }

        textos_apoio: list[TextoApoioDetectado] = []

        for match in regex.finditer(texto):
            quantidade = quantidade_por_extenso[match.group(1).lower()]
            proxima_questao = self._encontrar_proxima_questao(texto, match.end())

            if proxima_questao is None:
                continue

            inicio = proxima_questao
            fim = inicio + quantidade - 1
            inicio_texto = match.end()
            inicio_questao = self._encontrar_inicio_questao(
                texto,
                inicio,
                inicio_texto,
            )

            if inicio_questao is None:
                continue

            trecho = texto[inicio_texto:inicio_questao].strip()

            if len(trecho) < 80:
                continue

            textos_apoio.append(
                TextoApoioDetectado(
                    inicio=inicio,
                    fim=fim,
                    texto=self._limpar_texto_apoio(trecho),
                    padrao="QUANTIDADE_RELATIVA",
                    confianca=0.8,
                )
            )

        return textos_apoio

    def _extrair_por_matches(
            self,
            texto: str,
            matches: list[re.Match],
            padrao: str,
            confianca: float,
    ) -> list[TextoApoioDetectado]:
        textos_apoio: list[TextoApoioDetectado] = []

        for match in matches:
            inicio = int(match.group(1))
            fim = int(match.group(2))
            inicio_texto = match.end()
            inicio_questao = self._encontrar_inicio_questao(
                texto,
                inicio,
                inicio_texto,
            )

            if inicio_questao is None:
                continue

            trecho = texto[inicio_texto:inicio_questao].strip()

            if len(trecho) < 80:
                continue

            textos_apoio.append(
                TextoApoioDetectado(
                    inicio=inicio,
                    fim=fim,
                    texto=self._limpar_texto_apoio(trecho),
                    padrao=padrao,
                    confianca=confianca,
                )
            )

        return textos_apoio

    def _encontrar_inicio_questao(
            self,
            texto: str,
            numero: int,
            posicao_inicial: int,
    ) -> int | None:
        regex = re.compile(
            rf"(?im)^\s*(?:QUEST[ÃA]O\s*)?{numero}\s*[-.)]?\s+"
        )

        match = regex.search(texto, posicao_inicial)

        if not match:
            return None

        return match.start()

    def _encontrar_proxima_questao(
            self,
            texto: str,
            posicao_inicial: int,
    ) -> int | None:
        regex = re.compile(
            r"(?im)^\s*(?:QUEST[ÃA]O\s*)?(\d{1,3})\s*[-.)]?\s+"
        )

        match = regex.search(texto, posicao_inicial)

        if not match:
            return None

        return int(match.group(1))

    def _limpar_texto_apoio(self, texto: str) -> str:
        linhas = [linha.strip() for linha in texto.splitlines() if linha.strip()]

        linhas = [
            linha
            for linha in linhas
            if "pciconcursos" not in linha.lower()
               and not linha.lower().startswith("www.")
               and "chave de segurança" not in linha.lower()
        ]

        return " ".join(linhas).strip()