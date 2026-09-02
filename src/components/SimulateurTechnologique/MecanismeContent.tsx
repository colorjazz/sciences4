import type { DonneesMecanisme } from "../../types/mecanisme3D";
import { GearTrainContent } from "./GearTrainViewer";
import { TransmissionContent } from "./TransmissionViewer";
import { VisSansFinScene } from "./VisSansFinViewer";
import { PignonCremaillereScene } from "./PignonCremaillereViewer";
import { VisEcrouScene } from "./VisEcrouViewer";
import { CameScene } from "./CameViewer";
import { BielleManivelleScene } from "./BielleManivelleViewer";

/**
 * Rendu du contenu 3D d'un mécanisme SANS créer son propre Canvas —
 * pour être composé à l'intérieur d'une scène partagée (la vue
 * d'ensemble de l'objet technique complet). Chaque composant calcule
 * ses propres dimensions à partir de `data`, donc peut être englobé
 * dans un <group position/rotation/scale> librement par le parent.
 */
export function MecanismeContent({ mecanisme }: { mecanisme: DonneesMecanisme }) {
  switch (mecanisme.type) {
    case "trainEngrenages":
      return <GearTrainContent data={mecanisme.data} />;
    case "transmissionSimple":
      return <TransmissionContent data={mecanisme.data} />;
    case "visSansFin":
      return <VisSansFinScene data={mecanisme.data} />;
    case "pignonCremaillere":
      return <PignonCremaillereScene data={mecanisme.data} />;
    case "visEcrou":
      return <VisEcrouScene data={mecanisme.data} />;
    case "came":
      return <CameScene data={mecanisme.data} />;
    case "bielleManivelle":
      return <BielleManivelleScene data={mecanisme.data} />;
  }
}
