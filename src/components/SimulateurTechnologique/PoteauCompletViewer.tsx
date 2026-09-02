import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { MecanismeContent } from "./MecanismeContent";
import type { DonneesMecanisme, TypeMecanisme } from "../../types/mecanisme3D";

interface PoteauCompletViewerProps {
  mecanisme1: DonneesMecanisme;
  mecanisme2: DonneesMecanisme;
  height?: number;
}

const HAUTEUR_POTEAU = 4.2;
const RAYON_POTEAU = 0.12;
/** Les deux mécanismes sont réduits par rapport à leur vue détaillée, pour tenir sur le poteau. */
const ECHELLE_APERCU = 0.55;

/**
 * Mécanismes de transformation dont l'axe de translation (initialement
 * horizontal dans leur scène détaillée) doit être tourné de 90° pour
 * s'aligner avec l'axe vertical du poteau. La came n'a pas besoin de
 * cette rotation : son poussoir se déplace déjà verticalement.
 */
const NECESSITE_ROTATION_VERTICALE: Partial<Record<TypeMecanisme, boolean>> = {
  visEcrou: true,
  pignonCremaillere: true,
  bielleManivelle: true,
  came: false,
};

/**
 * Vue d'ensemble : le poteau complet avec les deux mécanismes de l'objet
 * technique positionnés à leur emplacement réel, tous deux animés en
 * même temps que les vues détaillées ci-dessous (trois Canvas actifs
 * simultanément).
 */
export default function PoteauCompletViewer({
  mecanisme1,
  mecanisme2,
  height = 380,
}: PoteauCompletViewerProps) {
  const distanceCamera = calculerDistanceCamera(HAUTEUR_POTEAU / 2 + 1.2);
  const rotationVerticale = NECESSITE_ROTATION_VERTICALE[mecanisme2.type] ?? false;

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[RAYON_POTEAU, RAYON_POTEAU, HAUTEUR_POTEAU, 20]} />
        <meshStandardMaterial color="#8a8a86" metalness={0.3} roughness={0.6} />
      </mesh>

      <mesh position={[0, HAUTEUR_POTEAU / 2 + 0.05, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.06]} />
        <meshStandardMaterial color="#8a8a86" metalness={0.3} roughness={0.6} />
      </mesh>

      <group position={[0.55, -HAUTEUR_POTEAU / 2 + 0.6, 0]} scale={ECHELLE_APERCU}>
        <MecanismeContent mecanisme={mecanisme1} />
      </group>

      <group
        position={[0.5, HAUTEUR_POTEAU / 2 - 1.1, 0]}
        rotation={rotationVerticale ? [0, 0, Math.PI / 2] : [0, 0, 0]}
        scale={ECHELLE_APERCU}
      >
        <MecanismeContent mecanisme={mecanisme2} />
      </group>
    </SceneWrapper>
  );
}
