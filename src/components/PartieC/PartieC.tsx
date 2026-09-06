import { useState } from "react";
import { genAnalyseAssemblage, genererQuestionAnalyseComposee } from "../../generators/analyseGenerator";
import { useGenerationQuestion } from "../../hooks/useGenerationQuestion";
import { EtatChargement, EtatErreur } from "../EtatsAsynchrones";
import MecanismeViewer, { LegendeMecanisme } from "../SimulateurTechnologique/MecanismeViewer";
import PoteauCompletViewer from "../SimulateurTechnologique/PoteauCompletViewer";
import CircuitViewer from "../SimulateurTechnologique/CircuitViewer";
import Atelier from "../SimulateurTechnologique/Atelier";
import AssemblagePanel from "./AssemblagePanel";
import SousQuestionBloc from "../SousQuestionBloc";
import type { ResultatSousQuestion } from "../../types/question";
import type { Parcours } from "../../types/curriculum";

interface PartieCProps {
  parcours: Parcours;
  onRetour: () => void;
}

type VueSectionC = "atelier" | "choix" | "simulation" | "exercice";

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

export default function PartieC({ parcours, onRetour }: PartieCProps) {
  const [vueSectionC, setVueSectionC] = useState<VueSectionC>("atelier");

  const simulation = useGenerationQuestion(() => genAnalyseAssemblage(parcours), { autoStart: false });
  const exercice = useGenerationQuestion(() => genererQuestionAnalyseComposee(parcours), { autoStart: false });

  const [resultats, setResultats] = useState<Record<string, ResultatSousQuestion>>({});
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsMaxTotal, setPointsMaxTotal] = useState(0);
  const [simulationTerminee, setSimulationTerminee] = useState(false);

  const estSimulation = vueSectionC === "simulation";
  const actif = estSimulation ? simulation : exercice;
  const { donnee: question, chargement, erreur } = actif;

  function noterSousQuestion(r: ResultatSousQuestion) {
    setResultats((prev) => ({ ...prev, [r.sousQuestionId]: r }));
  }

  const toutesNotees = question ? question.sousQuestions.every((sq) => resultats[sq.id]) : false;

  function commencerSimulation() {
    setResultats({});
    setSimulationTerminee(false);
    setPointsTotal(0);
    setPointsMaxTotal(0);
    setVueSectionC("simulation");
    simulation.regenerer();
  }

  function commencerExercices() {
    setResultats({});
    setPointsTotal(0);
    setPointsMaxTotal(0);
    setVueSectionC("exercice");
    exercice.regenerer();
  }

  function terminerSimulation() {
    if (question && toutesNotees) {
      const gagnes = question.sousQuestions.reduce((s, sq) => s + (resultats[sq.id]?.points ?? 0), 0);
      const max = question.sousQuestions.reduce((s, sq) => s + sq.bareme.pointsMax, 0);
      setPointsTotal(gagnes);
      setPointsMaxTotal(max);
    }
    setSimulationTerminee(true);
  }

  function nouvelExercice() {
    if (question && toutesNotees) {
      const gagnes = question.sousQuestions.reduce((s, sq) => s + (resultats[sq.id]?.points ?? 0), 0);
      const max = question.sousQuestions.reduce((s, sq) => s + sq.bareme.pointsMax, 0);
      setPointsTotal((p) => p + gagnes);
      setPointsMaxTotal((m) => m + max);
    }
    setResultats({});
    exercice.regenerer();
  }

  if (vueSectionC === "atelier") {
    return <Atelier onRetour={onRetour} onExercer={() => setVueSectionC("choix")} labelRetour="← Modules" />;
  }

  if (vueSectionC === "choix") {
    return (
      <div className="panel">
        <div className="module-header">
          <button className="retour-lien" onClick={() => setVueSectionC("atelier")} type="button">
            ← L'Atelier
          </button>
        </div>

        <span className="eyebrow-label">Section C</span>
        <h2 style={{ marginBottom: "0.5rem" }}>Analyse technologique</h2>
        <p className="lede" style={{ marginBottom: "1.25rem" }}>
          Choisis comment tu veux t'exercer.
        </p>

        <div className="modules-grid">
          <button type="button" className="module-card" onClick={commencerSimulation}>
            <h3>Simulation de l'épreuve</h3>
            <p>
              Un seul objet technique complet, comme à l'examen : fonction globale, mécanismes, matériau, circuit —
              noté avec le vrai barème.
            </p>
            <span className="card-foot">
              <span>1 objet</span>
              <span className="card-arrow" aria-hidden="true">→</span>
            </span>
          </button>
          <button type="button" className="module-card" onClick={commencerExercices}>
            <h3>Exercices</h3>
            <p>Entraîne-toi notion par notion, autant de fois que tu veux — pas une simulation de l'épreuve.</p>
            <span className="card-foot">
              <span>Illimité</span>
              <span className="card-arrow" aria-hidden="true">→</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="module-header">
        <button className="retour-lien" onClick={() => setVueSectionC("choix")} type="button">
          ← Section C
        </button>
        {pointsMaxTotal > 0 && (
          <span className="compteur">
            {pointsTotal}/{pointsMaxTotal} points
          </span>
        )}
      </div>

      <span className="eyebrow-label">{estSimulation ? "Simulation de l'épreuve" : "Exercices"}</span>
      <h2 style={{ marginBottom: "1.25rem" }}>Étudie cet objet technique</h2>

      <div className="question-card">
        {chargement && <EtatChargement message="Invention d'un objet technique..." />}

        {erreur && <EtatErreur message={erreur} onReessayer={actif.regenerer} />}

        {question && !chargement && !erreur && !(estSimulation && simulationTerminee) && (
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

        {estSimulation && simulationTerminee && (
          <div className="resultat-final">
            <span className="eyebrow-label">Résultat de la simulation</span>
            <h2 style={{ margin: "0 0 0.5rem" }}>
              {pointsTotal} / {pointsMaxTotal}
            </h2>
            <p className="lede">
              {pointsMaxTotal > 0 ? Math.round((pointsTotal / pointsMaxTotal) * 100) : 0} % de bonnes réponses.
            </p>
          </div>
        )}
      </div>

      {estSimulation && question && toutesNotees && !simulationTerminee && !chargement && !erreur && (
        <button type="button" className="primary" style={{ marginTop: "1.25rem" }} onClick={terminerSimulation}>
          Voir le résultat
        </button>
      )}
      {!estSimulation && question && toutesNotees && !chargement && !erreur && (
        <button type="button" className="primary" style={{ marginTop: "1.25rem" }} onClick={nouvelExercice}>
          Nouvel objet technique
        </button>
      )}
    </div>
  );
}
