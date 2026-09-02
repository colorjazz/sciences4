import { useState } from "react";
import { genererQuestionAnalyse } from "../../generators/analyseGenerator";
import { useGenerationQuestion } from "../../hooks/useGenerationQuestion";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";
import MecanismeViewer, { LegendeMecanisme } from "../SimulateurTechnologique/MecanismeViewer";
import PoteauCompletViewer from "../SimulateurTechnologique/PoteauCompletViewer";
import AssemblagePanel from "./AssemblagePanel";

interface PartieCProps {
  onRetour: () => void;
}

export default function PartieC({ onRetour }: PartieCProps) {
  const { donnee: question, chargement, erreur, regenerer } = useGenerationQuestion(genererQuestionAnalyse);
  const [revelees, setRevelees] = useState<Set<string>>(new Set());

  function revelerToutes() {
    if (!question) return;
    setRevelees(new Set(question.sousQuestions.map((sq) => sq.id)));
  }

  function nouvelleAnalyse() {
    setRevelees(new Set());
    regenerer();
  }

  const touteReveleeDeja = question ? revelees.size === question.sousQuestions.length : false;

  return (
    <div className="panel">
      <div className="module-header">
        <button className="retour-lien" onClick={onRetour} type="button">
          ← Modules
        </button>
      </div>

      <span className="eyebrow-label">Analyse technique</span>
      <h2 style={{ marginBottom: "1.25rem" }}>Étudie cet objet technique</h2>

      <div className="question-card">
        {chargement && <EtatChargement message="Invention d'un objet technique..." />}

        {erreur && <EtatErreur message={erreur} onReessayer={regenerer} />}

        {question && !chargement && !erreur && (
          <>
            <div className="objet-technique">{question.descriptionObjet}</div>

            {question.assemblage && <AssemblagePanel assemblage={question.assemblage} />}

            {question.mecanismes3D && question.mecanismes3D.length === 2 && (
              <div style={{ marginTop: "1.25rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--graphite-soft)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Vue d'ensemble
                </p>
                <PoteauCompletViewer
                  mecanisme1={question.mecanismes3D[0]}
                  mecanisme2={question.mecanismes3D[1]}
                  height={340}
                />
              </div>
            )}

            {question.mecanismes3D?.map((mecanisme, i) => (
              <div key={i} style={{ marginTop: "1.25rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--graphite-soft)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Mécanisme {i + 1}
                </p>
                <MecanismeViewer mecanisme={mecanisme} height={280} />
                <LegendeMecanisme mecanisme={mecanisme} />
              </div>
            ))}

            <div style={{ marginTop: "1.5rem" }}>
              {question.sousQuestions.map((sq) => {
                const revele = revelees.has(sq.id);
                return (
                  <div className="sous-question" key={sq.id}>
                    <p className="enonce">{sq.enonce}</p>
                    {!revele ? (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setRevelees((prev) => new Set(prev).add(sq.id))}
                      >
                        Voir la réponse
                      </button>
                    ) : (
                      <div className="explication">
                        <strong>Réponse : {sq.reponseAttendue}.</strong> {sq.explication}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {question && !chargement && !erreur && (
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          {!touteReveleeDeja && (
            <button type="button" className="ghost" onClick={revelerToutes}>
              Tout révéler
            </button>
          )}
          <button type="button" className="primary" style={{ marginTop: 0 }} onClick={nouvelleAnalyse}>
            Nouvel objet technique
          </button>
        </div>
      )}
    </div>
  );
}
