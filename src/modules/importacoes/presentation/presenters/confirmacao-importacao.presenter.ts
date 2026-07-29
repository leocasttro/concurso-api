import {
  ProvaHttpResponse,
  ProvaPresenter,
} from '../../../provas/presentation/presenters/prova.presenter';
import {
  QuestaoHttpResponse,
  QuestaoPresenter,
} from '../../../questoes/presentation/presenters/questao.presenter';
import { Prova } from '../../../provas/domain/entities/prova.entity';
import { Questao } from '../../../questoes/domain/entities/questao.entity';

export type ConfirmacaoImportacaoHttpResponse = {
  prova: ProvaHttpResponse;
  questoes: QuestaoHttpResponse[];
};

export class ConfirmacaoImportacaoPresenter {
  static toHTTP(input: {
    prova: Prova;
    questoes: Questao[];
  }): ConfirmacaoImportacaoHttpResponse {
    return {
      prova: ProvaPresenter.toHTTP(input.prova),
      questoes: input.questoes.map((questao) =>
        QuestaoPresenter.toHTTP(questao),
      ),
    };
  }
}
