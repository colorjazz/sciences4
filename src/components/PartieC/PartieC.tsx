import { useState } from "react";
import { genererQuestionAnalyse } from "../../generators/analyseGenerator";
import { useGenerationQuestion } from "../../hooks/useGenerationQuestion";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";
import MecanismeViewer, { LegendeMecanisme } from "../SimulateurTechnologique/MecanismeViewer";
import PoteauCompletViewer from "../SimulateurTechnologique/PoteauCompletViewer";
import CircuitViewer from "../SimulateurTechnologique/CircuitViewer";
import Atelier from "../SimulateurTechnologique/Atelier";
import AssemblagePanel from "./AssemblagePanel";
import SousQuestionBloc from "../SousQuestionBloc";
import type { ResultatSousQuestion } from "../../types/question";

interface PartieCProps {
  onRetour: () => void;
}

type VueSectionC = "analyse" | "atelier";

function TitreSousSection({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </p>
  );
}

export default function PartieC({ onRetour }: PartieCProps) {
  const [vueSectionC, setVueSectionC] = useState<VueSectionC>("analyse");
  const { donnee: question, chargement, erreur, regenerer } = useGenerationQuestion(genererQuestionAnalyse, {
    autoStart: false,
  });
  const [resultats, setResultats] = useState<Record<string, ResultatSousQuestion>>({});
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsMaxTotal, setPointsMaxTotal] = useState(0);

  function noterSousQuestion(r: ResultatSousQuestion) {
    setResultats((prev) => ({ ...prev, [r.sousQuestionId]: r }));
  }

  const toutesNotees = question ? question.sousQuestions.every((sq) => resultats[sq.id]) : false;

  function nouvelleAnalyse() {
    if (question && toutesNotees) {
      const gagnes = question.sousQuestions.reduce((s, sq) => s + (resultats[sq.id]?.points ?? 0), 0);
      const max = question.sousQuestions.reduce((s, sq) => s + sq.bareme.pointsMax, 0);
      setPointsTotal((p) => p + gagnes);
      setPointsMaxTotal((m) => m + max);
    }
    setResultats({});
    regenerer();
  }

  if (vueSectionC === "atelier") {
    return <Atelier onRetour={() => setVueSectionC("analyse")} labelRetour="← Analyser un objet" />;
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

      <span className="eyebrow-label">Questions d'analyse technologique</span>
      <h2 style={{ marginBottom: "1.25rem" }}>Étudie cet objet technique</h2>

      <div className="segmented-control">
        <button type="button" className="active" onClick={() => setVueSectionC("analyse")}>
          Analyser un objet
        </button>
        <button type="button" onClick={() => setVueSectionC("atelier")}>
          L'Atelier
        </button>
      </div>

      <div className="question-card">
        {!question && !chargement && !erreur && (
          <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <p className="lede" style={{ margin: "0 auto 1.25rem", maxWidth: "42ch" }}>
              Quand tu es prêt·e, génère un objet technique à analyser.
            </p>
            <button type="button" className="primary" style={{ marginTop: 0 }} onClick={regenerer}>
              Générer un exercice
            </button>
          </div>
        )}

        {chargement && <EtatChargement message="Invention d'un objet technique..." />}

        {erreur && <EtatErreur message={erreur} onReessayer={regenerer} />}

        {question && !chargement && !erreur && (
          <>
            {question.fonctionGlobale && (
              <div className="fonction-globale-encadre">
                <span className="eyebrow-label" style={{ marginBottom: "0.2rem" }}>
                  Fonction globale
                </span>
                {question.fonctionGlobale}
              </div>
            )}

            <div className="objet-technique">{question.descriptionObjet}</div>

            {question.assemblage && <AssemblagePanel assemblage={question.assemblage} />}

            {question.mecanismes3D && question.mecanismes3D.length === 2 && (
              <div style={{ marginTop: "1.25rem" }}>
                <TitreSousSection>Vue d'ensemble</TitreSousSection>
                <PoteauCompletViewer
                  mecanisme1={question.mecanismes3D[0]}
                  mecanisme2={question.mecanismes3D[1]}
                  height={340}
                />
              </div>
            )}

            {question.mecanismes3D?.map((mecanisme, i) => (
              <div key={i} style={{ marginTop: "1.25rem" }}>
                <TitreSousSection>Mécanisme {i + 1}</TitreSousSection>
                <MecanismeViewer mecanisme={mecanisme} height={280} />
                <LegendeMecanisme mecanisme={mecanisme} />
              </div>
            ))}

            {question.circuitElectrique && (
              <div style={{ marginTop: "1.25rem" }}>
                <TitreSousSection>Circuit électrique</TitreSousSection>
                <CircuitViewer circuit={question.circuitElectrique} />
              </div>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              {question.sousQuestions.map((sq) => (
                <SousQuestionBloc key={sq.id} sousQuestion={sq} onNote={noterSousQuestion} />
              ))}
            </div>
          </>
        )}
      </div>

      {question && toutesNotees && !chargement && !erreur && (
        <button type="button" className="primary" style={{ marginTop: "1.25rem" }} onClick={nouvelleAnalyse}>
          Nouvel objet technique
        </button>
      )}
    </div>
  );
}
