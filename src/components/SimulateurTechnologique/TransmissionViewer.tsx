import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { Gear } from "./Gear";
import { PALETTE_MECANISME } from "./palette";
import type { DonneesTransmissionSimple } from "../../types/mecanisme3D";

interface TransmissionViewerProps {
  data: DonneesTransmissionSimple;
  height?: number;
}

/**
 * Bande (poulie-courroie) ou chaîne segmentée (roue-chaîne) reliant deux
 * disques distants. Approximation visuelle : les deux brins sont tracés
 * horizontalement au rayon moyen des deux disques plutôt que par un
 * calcul exact de tangente externe (accessoire pour l'objectif
 * pédagogique — montrer que les deux éléments sont liés et tournent
 * dans le même sens).
 */
function LienTransmission({
  x1,
  x2,
  rayon1,
  rayon2,
  estChaine,
}: {
  x1: number;
  x2: number;
  rayon1: number;
  rayon2: number;
  estChaine: boolean;
}) {
  const rayonMoyen = (rayon1 + rayon2) / 2;
  const longueur = x2 - x1;
  const centreX = (x1 + x2) / 2;
  const couleur = "#2a2a2a";

  if (!estChaine) {
    return (
      <>
        <mesh position={[centreX, rayonMoyen, 0.12]}>
          <boxGeometry args={[longueur, rayonMoyen * 0.12, 0.08]} />
          <meshStandardMaterial color={couleur} />
        </mesh>
        <mesh position={[centreX, -rayonMoyen, 0.12]}>
          <boxGeometry args={[longueur, rayonMoyen * 0.12, 0.08]} />
          <meshStandardMaterial color={couleur} />
        </mesh>
      </>
    );
  }

  const nbSegments = Math.max(8, Math.round(longueur / (rayonMoyen * 0.35)));
  const largeurSegment = (longueur / nbSegments) * 0.75;

  return (
    <>
      {Array.from({ length: nbSegments }).map((_, i) => {
        const t = i / (nbSegments - 1);
        const x = x1 + t * longueur;
        return (
          <group key={i}>
            <mesh position={[x, rayonMoyen, 0.12]}>
              <boxGeometry args={[largeurSegment, rayonMoyen * 0.16, 0.08]} />
              <meshStandardMaterial color={couleur} />
            </mesh>
            <mesh position={[x, -rayonMoyen, 0.12]}>
              <boxGeometry args={[largeurSegment, rayonMoyen * 0.16, 0.08]} />
              <meshStandardMaterial color={couleur} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** Calcule les positions X des deux disques, réutilisé par le contenu et la caméra. */
function calculerLayoutTransmission(data: DonneesTransmissionSimple) {
  const { liaison, entree, sortie } = data;
  const contactDirect = liaison === "roues-friction";
  const ecart = contactDirect ? 0 : Math.max(entree.rayon, sortie.rayon) * 2.4;
  const x1 = -(entree.rayon + (contactDirect ? 0 : ecart / 2));
  const x2 = contactDirect ? x1 + entree.rayon + sortie.rayon : x1 + entree.rayon + ecart + sortie.rayon;
  const sensSortie: 1 | -1 = contactDirect ? (entree.sens === 1 ? -1 : 1) : entree.sens;
  const rapportVitesse = entree.rayon / sortie.rayon;
  return { contactDirect, x1, x2, sensSortie, rapportVitesse };
}

/** Contenu 3D seul, sans Canvas propre — pour composition dans une scène partagée. */
export function TransmissionContent({ data }: { data: DonneesTransmissionSimple }) {
  const { liaison, entree, sortie } = data;
  const { contactDirect, x1, x2, sensSortie, rapportVitesse } = calculerLayoutTransmission(data);

  return (
    <>
      <Gear
        layout={{ id: entree.id, teeth: entree.dents ?? 0, speed: 1, direction: entree.sens, radius: entree.rayon, x: x1 }}
        color={PALETTE_MECANISME[0]}
        angularSpeedScale={1.2}
      />
      <Gear
        layout={{ id: sortie.id, teeth: sortie.dents ?? 0, speed: rapportVitesse, direction: sensSortie, radius: sortie.rayon, x: x2 }}
        color={PALETTE_MECANISME[1]}
        angularSpeedScale={1.2}
      />
      {!contactDirect && (
        <LienTransmission x1={x1} x2={x2} rayon1={entree.rayon} rayon2={sortie.rayon} estChaine={liaison === "roue-chaine"} />
      )}
    </>
  );
}

export default function TransmissionViewer({ data, height = 320 }: TransmissionViewerProps) {
  const { entree, sortie } = data;
  const { x1, x2 } = calculerLayoutTransmission(data);
  const largeurTotale = x2 + sortie.rayon - (x1 - entree.rayon);
  const distanceCamera = calculerDistanceCamera(largeurTotale / 2);

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera}>
      <TransmissionContent data={data} />
    </SceneWrapper>
  );
}
