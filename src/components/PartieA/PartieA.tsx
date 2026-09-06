import { useState } from "react";
import { genererLotQuestionsQCM } from "../../generators/qcmGenerator";
import { useGenerationLot } from "../../hooks/useGenerationLot";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";

interface PartieAProps {
  onRetour: () => void;
}

const NOMBRE_QUESTIONS = 15;

export default function PartieA({ onRetour }: PartieAProps) {
  const { donnees: questions, chargement, erreur, regenerer } = useGenerationLot(() =>
    genererLotQuestionsQCM(NOMBRE_QUESTIONS)
  );
  const [index, setIndex] = useState(0);
  const [choixSelectionne, setChoixSelectionne] = useState<string | null>(null);
  const [bonnes, setBonnes] = useState(0);

  const question = questions ? questions[index] : null;
  const termine = questions ? index >= questions.length : false;
  const aRepondu = choixSelectionne !== null;
  const bonneReponseId = question ? (question.type === "qcm" ? question.bonneReponseId : question.bonneOptionId) : null;
  const estCorrect = aRepondu && choixSelectionne === bonneReponseId;

  function selectionner(id: string) {
    if (aRepondu || !question) return;
    setChoixSelectionne(id);
    if (id === bonneReponseId) setBonnes((b) => b + 1);
  }

  function suivante() {
    setChoixSelectionne(null);
    setIndex((i) => i + 1);
  }

  function recommencer() {
    setIndex(0);
    setChoixSelectionne(null);
    setBonnes(0);
    regenerer();
  }

  return (
    <div className="panel">
      <div className="module-header">
        <button className="retour-lien" onClick={onRetour} type="button">
          ← Modules
        </button>
        {questions && !termine && (
          <span className="compteur">
            Question {index + 1}/{questions.length}
          </span>
        )}
      </div>

      <span className="eyebrow-label">Questions à choix multiple</span>
      <h2 style={{ marginBottom: "1.25rem" }}>Un concept à la fois</h2>

      <div className="question-card">
        {chargement && <EtatChargement message={`Génération des ${NOMBRE_QUESTIONS} questions...`} />}

        {erreur && <EtatErreur message={erreur} onReessayer={regenerer} />}

        {questions && !chargement && !erreur && !termine && question && (
          <>
            <p className="question-enonce">{question.enonce}</p>

            {question.type === "qcm" ? (
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
            ) : (
              <div className="qcm-tableau-wrap">
                <table className="qcm-tableau">
                  <thead>
                    <tr>
                      <th />
                      {question.colonnes.map((col) => (
                        <th key={col.id}>{col.titre}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {question.options.map((o) => {
                      let classe = "";
                      if (aRepondu && o.id === question.bonneOptionId) classe = "correct";
                      else if (aRepondu && o.id === choixSelectionne) classe = "incorrect";
                      return (
                        <tr
                          key={o.id}
                          className={classe}
                          onClick={() => selectionner(o.id)}
                          style={{ cursor: aRepondu ? "default" : "pointer" }}
                        >
                          <td className="qcm-tableau-lettre">{o.id.toUpperCase()})</td>
                          {question.colonnes.map((col) => (
                            <td key={col.id}>{o.valeurs[col.id]}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {aRepondu && (
              <div className={`feedback ${estCorrect ? "succes" : "erreur"}`}>
                <strong>{estCorrect ? "Exact." : "Réponse incorrecte."}</strong>
                {question.explication}
              </div>
            )}
          </>
        )}

        {questions && termine && !chargement && !erreur && (
          <div className="resultat-final">
            <span className="eyebrow-label">Résultat</span>
            <h2 style={{ margin: "0 0 0.5rem" }}>
              {bonnes} / {questions.length}
            </h2>
            <p className="lede">{Math.round((bonnes / questions.length) * 100)} % de bonnes réponses.</p>
          </div>
        )}
      </div>

      {question && aRepondu && !termine && (
        <button type="button" className="primary" onClick={suivante}>
          {index + 1 < (questions?.length ?? 0) ? "Question suivante" : "Voir le résultat"}
        </button>
      )}
      {termine && (
        <button type="button" className="primary" onClick={recommencer}>
          Recommencer ({NOMBRE_QUESTIONS} nouvelles questions)
        </button>
      )}
    </div>
  );
}
