import { useState } from "react";
import { genererQuestionQCM } from "../../generators/qcmGenerator";
import { useGenerationQuestion } from "../../hooks/useGenerationQuestion";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";

interface PartieAProps {
  onRetour: () => void;
}

export default function PartieA({ onRetour }: PartieAProps) {
  const { donnee: question, chargement, erreur, regenerer } = useGenerationQuestion(genererQuestionQCM);
  const [choixSelectionne, setChoixSelectionne] = useState<string | null>(null);
  const [bonnes, setBonnes] = useState(0);
  const [total, setTotal] = useState(0);

  const aRepondu = choixSelectionne !== null;
  const estCorrect = question ? choixSelectionne === question.bonneReponseId : false;

  function selectionner(choixId: string) {
    if (aRepondu || !question) return;
    setChoixSelectionne(choixId);
    setTotal((t) => t + 1);
    if (choixId === question.bonneReponseId) setBonnes((b) => b + 1);
  }

  function nouvelleQuestion() {
    setChoixSelectionne(null);
    regenerer();
  }

  return (
    <div className="panel">
      <div className="module-header">
        <button className="retour-lien" onClick={onRetour} type="button">
          ← Modules
        </button>
        {total > 0 && (
          <span className="compteur">
            {bonnes}/{total} bonnes réponses
          </span>
        )}
      </div>

      <span className="eyebrow-label">Questions rapides</span>
      <h2 style={{ marginBottom: "1.25rem" }}>Un concept à la fois</h2>

      <div className="question-card">
        {chargement && <EtatChargement message="Génération de la question..." />}

        {erreur && <EtatErreur message={erreur} onReessayer={regenerer} />}

        {question && !chargement && !erreur && (
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
                <strong>{estCorrect ? "Exact." : "Pas tout à fait."}</strong>
                {question.explication}
              </div>
            )}
          </>
        )}
      </div>

      {aRepondu && (
        <button type="button" className="primary" onClick={nouvelleQuestion}>
          Question suivante
        </button>
      )}
    </div>
  );
}
