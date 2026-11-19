import type { DiagrammeSchema } from "../../types/question";
import DiagrammePlanIncline from "./DiagrammePlanIncline";
import DiagrammeVitesseTemps from "./DiagrammeVitesseTemps";
import DiagrammeProjectile from "./DiagrammeProjectile";
import DiagrammeOptique from "./DiagrammeOptique";

interface DiagrammeQuestionProps {
  diagramme: DiagrammeSchema;
  /** True une fois toutes les sous-questions notées — révèle vecteurs/rayons/portée. */
  montrerCorrige: boolean;
}

/** Aiguille vers le bon composant de schéma selon le type du diagramme de la question. */
export default function DiagrammeQuestion({ diagramme, montrerCorrige }: DiagrammeQuestionProps) {
  if (diagramme.type === "plan-incline") {
    return <DiagrammePlanIncline angleDegres={diagramme.angleDegres} forceMotriceN={diagramme.forceMotriceN} corrige={montrerCorrige ? diagramme.corrige : undefined} />;
  }
  if (diagramme.type === "vt-graph") {
    return <DiagrammeVitesseTemps points={diagramme.points} />;
  }
  if (diagramme.type === "projectile") {
    return (
      <DiagrammeProjectile
        horizontal={diagramme.horizontal}
        viMS={diagramme.viMS}
        angleDegres={diagramme.angleDegres}
        hauteurInitialeM={diagramme.hauteurInitialeM}
        corrige={montrerCorrige ? diagramme.corrige : undefined}
      />
    );
  }
  return <DiagrammeOptique element={diagramme.element} fM={diagramme.fM} doM={diagramme.doM} hoM={diagramme.hoM} corrige={montrerCorrige ? diagramme.corrige : undefined} />;
}
