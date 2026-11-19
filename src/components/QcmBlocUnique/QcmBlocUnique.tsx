import { useState } from "react";
import type { QuestionQCMSimple } from "../../types/question";

interface QcmBlocUniqueProps {
  question: QuestionQCMSimple;
  /** Appelé une seule fois, quand l'élève répond (vrai = bonne réponse). */
  onReponse: (correct: boolean) => void;
}

/**
 * Rendu d'une question QCM unique (pas un lot de 15 comme PartieA) —
 * utilisé par le mode "diversité d'exercices" du secondaire 5, où QCM,
 * appariement et problèmes à développement sont piges un à la fois.
 */
export default function QcmBlocUnique({ question, onReponse }: QcmBlocUniqueProps) {
  const [choixSelectionne, setChoixSelectionne] = useState<string | null>(null);
  const aRepondu = choixSelectionne !== null;
  const estCorrect = aRepondu && choixSelectionne === question.bonneReponseId;

  function selectionner(id: string) {
    if (aRepondu) return;
    setChoixSelectionne(id);
    onReponse(id === question.bonneReponseId);
  }

  return (
    <>
      <p className="question-enonce">{question.enonce}</p>

      <div className="choix-liste">
        {question.choix.map((c, i) => {
          let classe = "choix-bouton";
          if (aRepondu && c.id === question.bonneReponseId) classe += " correct";
          else if (aRepondu && c.id === choixSelectionne) classe += " incorrect";
          return (
            <button
              key={c.id}
              type="button"
              className={classe}
              disabled={aRepondu}
              onClick={() => selectionner(c.id)}
            >
              <span className="choix-lettre">{String.fromCharCode(65 + i)}</span>
              {c.texte}
            </button>
          );
        })}
      </div>

      {aRepondu && (
        <div className={`feedback ${estCorrect ? "succes" : "erreur"}`}>
          <strong>{estCorrect ? "Exact." : "Réponse incorrecte."}</strong>
          {question.explication}
        </div>
      )}
    </>
  );
}
