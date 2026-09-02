import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { PALETTE_MECANISME } from "./palette";
import { positionPoussoirCameExcentrique } from "../../engines/transformationEngine";
import type { DonneesCame } from "../../types/mecanisme3D";

interface CameViewerProps {
  data: DonneesCame;
  height?: number;
}

export default function CameViewer({ data, height = 320 }: CameViewerProps) {
  const longueurPoussoir = data.rayonCame * 1.8;
  const distanceCamera = calculerDistanceCamera(data.rayonCame * 2.4 + longueurPoussoir);

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera}>
      <CameScene data={data} />
    </SceneWrapper>
  );
}

/** Contenu 3D seul, sans Canvas propre — pour composition dans une scène partagée. */
export function CameScene({ data }: { data: DonneesCame }) {
  const { rayonCame, excentricite, vitesseAngulaireAnimation } = data;
  const longueurPoussoir = rayonCame * 1.8;

  const camGroupRef = useRef<Group>(null);
  const poussoirRef = useRef<Mesh>(null);
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    angleRef.current += vitesseAngulaireAnimation * delta;
    if (camGroupRef.current) camGroupRef.current.rotation.z = angleRef.current;
    if (poussoirRef.current) {
      const contact = positionPoussoirCameExcentrique(rayonCame, excentricite, angleRef.current);
      poussoirRef.current.position.y = contact + longueurPoussoir / 2;
    }
  });

  return (
    <>
      <group ref={camGroupRef}>
        <mesh position={[excentricite, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[rayonCame, rayonCame, 0.32, 48]} />
          <meshStandardMaterial color={PALETTE_MECANISME[0]} metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.17]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
          <meshStandardMaterial color="#1c2740" />
        </mesh>
      </group>

      <mesh ref={poussoirRef} castShadow>
        <boxGeometry args={[0.18, longueurPoussoir, 0.18]} />
        <meshStandardMaterial color={PALETTE_MECANISME[1]} metalness={0.3} roughness={0.6} />
      </mesh>

      <mesh position={[0.35, 0, -0.1]}>
        <boxGeometry args={[0.04, rayonCame * 3.5, 0.04]} />
        <meshStandardMaterial color="#3a3f4b" transparent opacity={0.4} />
      </mesh>
    </>
  );
}
