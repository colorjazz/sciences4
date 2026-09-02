import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { PALETTE_MECANISME } from "./palette";
import { positionPiston } from "../../engines/transformationEngine";
import type { DonneesBielleManivelle } from "../../types/mecanisme3D";

interface BielleManivelleViewerProps {
  data: DonneesBielleManivelle;
  height?: number;
}

export default function BielleManivelleViewer({ data, height = 320 }: BielleManivelleViewerProps) {
  const distanceCamera = calculerDistanceCamera(data.rayonManivelle + data.longueurBielle + 0.6);

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera}>
      <BielleManivelleScene data={data} />
    </SceneWrapper>
  );
}

/** Contenu 3D seul, sans Canvas propre — pour composition dans une scène partagée. */
export function BielleManivelleScene({ data }: { data: DonneesBielleManivelle }) {
  const { rayonManivelle, longueurBielle, vitesseAngulaireAnimation } = data;

  const manivelleRef = useRef<Group>(null);
  const bielleGroupRef = useRef<Group>(null);
  const pistonRef = useRef<Mesh>(null);
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    angleRef.current += vitesseAngulaireAnimation * delta;
    const theta = angleRef.current;

    const pinX = rayonManivelle * Math.cos(theta);
    const pinY = rayonManivelle * Math.sin(theta);
    const pistonX = positionPiston(rayonManivelle, longueurBielle, theta);

    if (manivelleRef.current) manivelleRef.current.rotation.z = theta;
    if (pistonRef.current) pistonRef.current.position.x = pistonX;
    if (bielleGroupRef.current) {
      const angleBielle = Math.atan2(0 - pinY, pistonX - pinX);
      bielleGroupRef.current.position.set(pinX, pinY, 0);
      bielleGroupRef.current.rotation.z = angleBielle;
    }
  });

  const epaisseur = 0.1;

  return (
    <>
      <group ref={manivelleRef}>
        <mesh position={[rayonManivelle / 2, 0, 0]} castShadow>
          <boxGeometry args={[rayonManivelle, epaisseur, epaisseur]} />
          <meshStandardMaterial color={PALETTE_MECANISME[0]} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[epaisseur * 0.7, epaisseur * 0.7, 0.06, 16]} />
          <meshStandardMaterial color="#1c2740" />
        </mesh>
      </group>

      <group ref={bielleGroupRef}>
        <mesh position={[longueurBielle / 2, 0, 0]} castShadow>
          <boxGeometry args={[longueurBielle, epaisseur * 0.8, epaisseur * 0.8]} />
          <meshStandardMaterial color={PALETTE_MECANISME[1]} metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      <mesh ref={pistonRef} castShadow>
        <boxGeometry args={[0.22, 0.3, 0.22]} />
        <meshStandardMaterial color={PALETTE_MECANISME[2]} metalness={0.3} roughness={0.6} />
      </mesh>

      <mesh position={[longueurBielle * 0.5, 0, -0.12]}>
        <boxGeometry args={[longueurBielle * 1.4, 0.04, 0.04]} />
        <meshStandardMaterial color="#3a3f4b" transparent opacity={0.35} />
      </mesh>
    </>
  );
}
