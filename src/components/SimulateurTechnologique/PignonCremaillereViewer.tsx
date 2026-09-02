import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { PALETTE_MECANISME } from "./palette";
import type { DonneesPignonCremaillere } from "../../types/mecanisme3D";

interface PignonCremaillereViewerProps {
  data: DonneesPignonCremaillere;
  height?: number;
}

const NB_DENTS_VISUELLES_CREMAILLERE = 24;

export default function PignonCremaillereViewer({ data, height = 320 }: PignonCremaillereViewerProps) {
  const longueurCremaillere = data.rayonPignon * 8;
  const distanceCamera = calculerDistanceCamera(longueurCremaillere / 2);

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera}>
      <PignonCremaillereScene data={data} />
    </SceneWrapper>
  );
}

/** Contenu 3D seul, sans Canvas propre — pour composition dans une scène partagée. */
export function PignonCremaillereScene({ data }: { data: DonneesPignonCremaillere }) {
  const { rayonPignon, dentsPignon, vitesseAngulaire, sensRotation } = data;
  const longueurCremaillere = rayonPignon * 8;

  const pignonRef = useRef<Group>(null);
  const cremaillereRef = useRef<Group>(null);
  const positionRef = useRef(0);
  const sensRef = useRef<1 | -1>(sensRotation);

  const limite = longueurCremaillere / 2 - rayonPignon;

  useFrame((_, delta) => {
    const vitesseLineaire = rayonPignon * vitesseAngulaire;
    positionRef.current += sensRef.current * vitesseLineaire * delta;

    if (Math.abs(positionRef.current) > limite) {
      sensRef.current = sensRef.current === 1 ? -1 : 1;
      positionRef.current = Math.sign(positionRef.current) * limite;
    }

    if (pignonRef.current) {
      pignonRef.current.rotation.z += ((sensRef.current * vitesseLineaire) / rayonPignon) * delta;
    }
    if (cremaillereRef.current) {
      cremaillereRef.current.position.x = positionRef.current;
    }
  });

  const longueurDentPignon = rayonPignon * 0.22;
  const epaisseurDentPignon = rayonPignon * 0.16;
  const epaisseurDisque = 0.28;
  const largeurDentCremaillere = (longueurCremaillere / NB_DENTS_VISUELLES_CREMAILLERE) * 0.6;
  const pasCremaillere = longueurCremaillere / NB_DENTS_VISUELLES_CREMAILLERE;

  return (
    <>
      <group ref={pignonRef} position={[0, rayonPignon + 0.12, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[rayonPignon, rayonPignon, epaisseurDisque, 40]} />
          <meshStandardMaterial color={PALETTE_MECANISME[0]} metalness={0.35} roughness={0.55} />
        </mesh>
        {Array.from({ length: dentsPignon }).map((_, i) => {
          const angle = (i / dentsPignon) * Math.PI * 2;
          const r = rayonPignon + longueurDentPignon / 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[longueurDentPignon, epaisseurDentPignon, epaisseurDisque * 0.9]} />
              <meshStandardMaterial color={PALETTE_MECANISME[0]} metalness={0.35} roughness={0.55} />
            </mesh>
          );
        })}
        <mesh position={[rayonPignon / 2, 0, epaisseurDisque / 2 + 0.005]}>
          <boxGeometry args={[rayonPignon, rayonPignon * 0.08, 0.02]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.15} />
        </mesh>
      </group>

      <group ref={cremaillereRef}>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[longueurCremaillere, 0.16, epaisseurDisque]} />
          <meshStandardMaterial color={PALETTE_MECANISME[1]} metalness={0.3} roughness={0.6} />
        </mesh>
        {Array.from({ length: NB_DENTS_VISUELLES_CREMAILLERE }).map((_, i) => {
          const x = -longueurCremaillere / 2 + (i + 0.5) * pasCremaillere;
          return (
            <mesh key={i} position={[x, 0.04, 0]}>
              <boxGeometry args={[largeurDentCremaillere, 0.1, epaisseurDisque * 0.85]} />
              <meshStandardMaterial color={PALETTE_MECANISME[1]} metalness={0.3} roughness={0.6} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}
