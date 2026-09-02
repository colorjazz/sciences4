import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { PALETTE_MECANISME } from "./palette";
import type { DonneesVisEcrou } from "../../types/mecanisme3D";

interface VisEcrouViewerProps {
  data: DonneesVisEcrou;
  height?: number;
}

const RAYON_VIS = 0.16;
const ECHELLE_LONGUEUR = 0.09;

export default function VisEcrouViewer({ data, height = 320 }: VisEcrouViewerProps) {
  const longueurVisScene = Math.max(2.4, data.nombreTours * data.pasMm * ECHELLE_LONGUEUR * 1.4);
  const distanceCamera = calculerDistanceCamera(longueurVisScene / 2);

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera}>
      <VisEcrouScene data={data} />
    </SceneWrapper>
  );
}

/** Contenu 3D seul, sans Canvas propre — pour composition dans une scène partagée. */
export function VisEcrouScene({ data }: { data: DonneesVisEcrou }) {
  const { pasMm, vitesseAngulaireAnimation } = data;
  const longueurVisScene = Math.max(2.4, data.nombreTours * data.pasMm * ECHELLE_LONGUEUR * 1.4);

  const visRef = useRef<Group>(null);
  const ecrouRef = useRef<Mesh>(null);
  const angleRef = useRef(0);
  const sensRef = useRef<1 | -1>(1);

  const limite = longueurVisScene / 2 - RAYON_VIS * 1.5;
  const pasScene = pasMm * ECHELLE_LONGUEUR;

  useFrame((_, delta) => {
    angleRef.current += sensRef.current * vitesseAngulaireAnimation * delta;
    const deplacement = (angleRef.current / (2 * Math.PI)) * pasScene;

    if (Math.abs(deplacement) > limite) {
      sensRef.current = sensRef.current === 1 ? -1 : 1;
    }

    if (visRef.current) visRef.current.rotation.x = angleRef.current;
    if (ecrouRef.current) ecrouRef.current.position.x = deplacement;
  });

  const nbAnneaux = Math.max(4, Math.round(longueurVisScene / (pasScene || 0.3)));

  return (
    <>
      <group ref={visRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[RAYON_VIS, RAYON_VIS, longueurVisScene, 24]} />
          <meshStandardMaterial color={PALETTE_MECANISME[0]} metalness={0.5} roughness={0.4} />
        </mesh>
        {Array.from({ length: nbAnneaux }).map((_, i) => {
          const x = -longueurVisScene / 2 + (i + 0.5) * (longueurVisScene / nbAnneaux);
          return (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, (i * Math.PI) / 3]}>
              <torusGeometry args={[RAYON_VIS * 1.25, RAYON_VIS * 0.12, 8, 16]} />
              <meshStandardMaterial color="#f2e6c8" />
            </mesh>
          );
        })}
      </group>

      <mesh ref={ecrouRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[RAYON_VIS * 2, RAYON_VIS * 2, RAYON_VIS * 2.4, 8]} />
        <meshStandardMaterial color={PALETTE_MECANISME[1]} metalness={0.4} roughness={0.5} />
      </mesh>
    </>
  );
}
