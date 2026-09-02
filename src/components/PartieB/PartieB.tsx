import { useState } from "react";
import { genererQuestionCourte } from "../../generators/reponseCourteGenerator";
import { useGenerationQuestion } from "../../hooks/useGenerationQuestion";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";

interface PartieBProps {
  onRetour: () => void;
}

export default function PartieB({ onRetour }: PartieBProps) {
  const { donnee: question, chargement, erreur, regenerer } = useGenerationQuestion(genererQuestionCourte);
  const [saisie, setSaisie] = useState("");
  const [verifie, setVerifie] = useState(false);
  const [bonnes, setBonnes] = useState(0);
  const [total, setTotal] = useState(0);

  const valeurSaisie = Number(saisie.replace(",", "."));

  function calculerEcart(): number {
    if (!question) return Infinity;
    return question.reponseAttendue === 0
      ? Math.abs(valeurSaisie)
      : Math.abs((valeurSaisie - question.reponseAttendue) / question.reponseAttendue);
  }

  const estCorrect = question ? verifie && !Number.isNaN(valeurSaisie) && calculerEcart() <= question.toleranceRelative : false;

  function verifier() {
    if (saisie.trim() === "" || !question) return;
    setVerifie(true);
    setTotal((t) => t + 1);
    if (!Number.isNaN(valeurSaisie) && calculerEcart() <= question.toleranceRelative) {
      setBonnes((b) => b + 1);
    }
  }

  function nouvelleQuestion() {
    setSaisie("");
    setVerifie(false);
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

      <span className="eyebrow-label">Résolution guidée</span>
      <h2 style={{ marginBottom: "1.25rem" }}>Montre ta démarche</h2>

      <div className="question-card">
        {chargement && <EtatChargement message="Génération de la question..." />}

        {erreur && <EtatErreur message={erreur} onReessayer={regenerer} />}

        {question && !chargement && !erreur && (
          <>
            <p className="question-enonce">{question.enonce}</p>

            <ul className="demarche-hints">
              {question.etapesDemarche.map((etape, i) => (
                <li key={i}>{etape}</li>
              ))}
            </ul>

            <div className="reponse-inline">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ta réponse"
                value={saisie}
                disabled={verifie}
                onChange={(e) => setSaisie(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifier()}
              />
              <span className="unite">{question.uniteAttendue}</span>
            </div>

            {verifie && (
              <div className={`feedback ${estCorrect ? "succes" : "erreur"}`}>
                <strong>
                  {estCorrect
                    ? "Exact."
                    : `Réponse attendue : ${question.reponseAttendue} ${question.uniteAttendue}`}
                </strong>
                {question.explication}
              </div>
            )}
          </>
        )}
      </div>

      {question && !verifie && !chargement && !erreur && (
        <button type="button" className="primary" disabled={saisie.trim() === ""} onClick={verifier}>
          Vérifier
        </button>
      )}
      {verifie && (
        <button type="button" className="primary" onClick={nouvelleQuestion}>
          Question suivante
        </button>
      )}
    </div>
  );
}
