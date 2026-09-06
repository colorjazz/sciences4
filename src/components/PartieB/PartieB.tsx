import { useState } from "react";
import { genererQuestionCourte } from "../../generators/reponseCourteGenerator";
import { useGenerationQuestion } from "../../hooks/useGenerationQuestion";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";
import SousQuestionBloc from "../SousQuestionBloc";
import type { ResultatSousQuestion } from "../../types/question";
import type { Parcours } from "../../types/curriculum";

interface PartieBProps {
  parcours: Parcours;
  onRetour: () => void;
}

export default function PartieB({ parcours, onRetour }: PartieBProps) {
  const { donnee: question, chargement, erreur, regenerer } = useGenerationQuestion(() =>
    genererQuestionCourte(parcours)
  );
  const [resultats, setResultats] = useState<Record<string, ResultatSousQuestion>>({});
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsMaxTotal, setPointsMaxTotal] = useState(0);

  function noterSousQuestion(r: ResultatSousQuestion) {
    setResultats((prev) => ({ ...prev, [r.sousQuestionId]: r }));
  }

  const toutesNotees = question ? question.sousQuestions.every((sq) => resultats[sq.id]) : false;

  function nouvelleQuestion() {
    if (question && toutesNotees) {
      const gagnes = question.sousQuestions.reduce((s, sq) => s + (resultats[sq.id]?.points ?? 0), 0);
      const max = question.sousQuestions.reduce((s, sq) => s + sq.bareme.pointsMax, 0);
      setPointsTotal((p) => p + gagnes);
      setPointsMaxTotal((m) => m + max);
    }
    setResultats({});
    regenerer();
  }

  return (
    <div className="panel">
      <div className="module-header">
        <button className="retour-lien" onClick={onRetour} type="button">
          ← Modules
        </button>
        {pointsMaxTotal > 0 && (
          <span className="compteur">
            {pointsTotal}/{pointsMaxTotal} points
          </span>
        )}
      </div>

      <span className="eyebrow-label">Questions à réponse construite</span>
      <h2 style={{ marginBottom: "1.25rem" }}>Montre ta démarche</h2>

      <div className="question-card">
        {chargement && <EtatChargement message="Génération de la question..." />}

        {erreur && <EtatErreur message={erreur} onReessayer={regenerer} />}

        {question && !chargement && !erreur && (
          <>
            <p className="question-enonce">{question.enonce}</p>

            {question.sousQuestions.map((sq) => (
              <SousQuestionBloc key={sq.id} sousQuestion={sq} onNote={noterSousQuestion} />
            ))}
          </>
        )}
      </div>

      {question && toutesNotees && !chargement && !erreur && (
        <button type="button" className="primary" onClick={nouvelleQuestion}>
          Question suivante
        </button>
      )}
    </div>
  );
}
