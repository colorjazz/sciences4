import GearTrainViewer, { LegendeGearTrain } from "./GearTrainViewer";
import TransmissionViewer from "./TransmissionViewer";
import VisSansFinViewer from "./VisSansFinViewer";
import PignonCremaillereViewer from "./PignonCremaillereViewer";
import VisEcrouViewer from "./VisEcrouViewer";
import CameViewer from "./CameViewer";
import BielleManivelleViewer from "./BielleManivelleViewer";
import type { DonneesMecanisme } from "../../types/mecanisme3D";

interface MecanismeViewerProps {
  mecanisme: DonneesMecanisme;
  height?: number;
}

/**
 * Point d'entrée unique du rendu 3D pour la Section C : dispatche vers
 * le visualiseur approprié selon le type de mécanisme généré. Ajouter
 * un nouveau type de mécanisme ne demande qu'un cas ici + son propre
 * visualiseur, sans toucher au reste de l'application.
 */
export default function MecanismeViewer({ mecanisme, height = 320 }: MecanismeViewerProps) {
  switch (mecanisme.type) {
    case "trainEngrenages":
      return <GearTrainViewer data={mecanisme.data} height={height} />;
    case "transmissionSimple":
      return <TransmissionViewer data={mecanisme.data} height={height} />;
    case "visSansFin":
      return <VisSansFinViewer data={mecanisme.data} height={height} />;
    case "pignonCremaillere":
      return <PignonCremaillereViewer data={mecanisme.data} height={height} />;
    case "visEcrou":
      return <VisEcrouViewer data={mecanisme.data} height={height} />;
    case "came":
      return <CameViewer data={mecanisme.data} height={height} />;
    case "bielleManivelle":
      return <BielleManivelleViewer data={mecanisme.data} height={height} />;
  }
}

/** Légende optionnelle sous le canevas — seuls certains types en ont une pour l'instant. */
export function LegendeMecanisme({ mecanisme }: { mecanisme: DonneesMecanisme }) {
  if (mecanisme.type === "trainEngrenages") return <LegendeGearTrain data={mecanisme.data} />;
  return null;
}
