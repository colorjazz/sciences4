import { useState } from "react";
import { genererQuestionDeveloppementSecondaire5 } from "../../generators/developpementSecondaire5Generator";
import { useGenerationQuestion } from "../../hooks/useGenerationQuestion";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";
import SousQuestionBloc from "../SousQuestionBloc";
import QcmBlocUnique from "../QcmBlocUnique/QcmBlocUnique";
import DiagrammeQuestion from "../DiagrammesPhysique/DiagrammeQuestion";
import type { ResultatSousQuestion } from "../../types/question";
import type { CoursSecondaire5, Difficulte } from "../../types/curriculumSecondaire5";

interface PartieDeveloppementSecondaire5Props {
  cours: CoursSecondaire5;
  chapitresSelectionnes: Set<string>;
  difficulte: Difficulte;
  onRetour: () => void;
}

const LIBELLE_DIFFICULTE: Record<Difficulte, string> = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };

export default function PartieDeveloppementSecondaire5({
  cours,
  chapitresSelectionnes,
  difficulte,
  onRetour,
}: PartieDeveloppementSecondaire5Props) {
  const { donnee: question, chargement, erreur, regenerer } = useGenerationQuestion(() =>
    genererQuestionDeveloppementSecondaire5(cours, chapitresSelectionnes, difficulte)
  );
  const [resultats, setResultats] = useState<Record<string, ResultatSousQuestion>>({});
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsMaxTotal, setPointsMaxTotal] = useState(0);
  const [qcmRepondu, setQcmRepondu] = useState(false);

  function noterSousQuestion(r: ResultatSousQuestion) {
    setResultats((prev) => ({ ...prev, [r.sousQuestionId]: r }));
  }

  const estQcm = question?.type === "qcm";
  const toutesNotees = question && !estQcm ? question.sousQuestions.every((sq) => resultats[sq.id]) : false;
  const pretPourSuivante = estQcm ? qcmRepondu : toutesNotees;

  function nouvelleQuestion() {
    if (question && !estQcm && toutesNotees) {
      const gagnes = question.sousQuestions.reduce((s, sq) => s + (resultats[sq.id]?.points ?? 0), 0);
      const max = question.sousQuestions.reduce((s, sq) => s + sq.bareme.pointsMax, 0);
      setPointsTotal((p) => p + gagnes);
      setPointsMaxTotal((m) => m + max);
    }
    if (question && estQcm && qcmRepondu) {
      setPointsMaxTotal((m) => m + 1);
    }
    setResultats({});
    setQcmRepondu(false);
    regenerer();
  }

  return (
    <div className="panel">
      <div className="module-header">
        <button className="retour-lien" onClick={onRetour} type="button">
          ← Chapitres
        </button>
        {pointsMaxTotal > 0 && (
          <span className="compteur">
            {pointsTotal}/{pointsMaxTotal} points
          </span>
        )}
      </div>

      <span className="eyebrow-label">
        {cours === "CHIMIE5" ? "Chimie 5e" : "Physique 5e"} · {LIBELLE_DIFFICULTE[difficulte]}
      </span>
      <h2 style={{ marginBottom: "1.25rem" }}>Pratique</h2>

      <div className="question-card">
        {chargement && <EtatChargement message="Génération de la question..." />}

        {erreur && <EtatErreur message={erreur} onReessayer={regenerer} />}

        {question && !chargement && !erreur && question.type === "qcm" && (
          <QcmBlocUnique
            question={question}
            onReponse={(correct) => {
              setQcmRepondu(true);
              if (correct) setPointsTotal((p) => p + 1);
            }}
          />
        )}

        {question && !chargement && !erreur && question.type === "courte" && (
          <>
            {question.diagramme && (
              <div className="diagramme-physique">
                <DiagrammeQuestion diagramme={question.diagramme} montrerCorrige={toutesNotees} />
              </div>
            )}

            <p className="question-enonce">{question.enonce}</p>

            {question.sousQuestions.map((sq) => (
              <SousQuestionBloc key={sq.id} sousQuestion={sq} onNote={noterSousQuestion} />
            ))}
          </>
        )}
      </div>

      {question && pretPourSuivante && !chargement && !erreur && (
        <button type="button" className="primary" onClick={nouvelleQuestion}>
          Question suivante
        </button>
      )}
    </div>
  );
}
