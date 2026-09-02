import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { PALETTE_MECANISME } from "./palette";
import { calculerVisSansFin } from "../../engines/transmissionEngine";
import type { DonneesVisSansFin } from "../../types/mecanisme3D";

interface VisSansFinViewerProps {
  data: DonneesVisSansFin;
  height?: number;
}

const RAYON_ROUE_SCALE = 0.045;
const VITESSE_VIS_VISUELLE = 3.5;

/**
 * Composant extérieur : ne fait que le calcul de mise à l'échelle et
 * la caméra, puis délègue le rendu animé à VisSansFinScene, rendu en
 * enfant de SceneWrapper. IMPORTANT : useFrame/useRef doivent être
 * appelés dans un composant réellement rendu à l'intérieur de
 * <Canvas>, jamais dans le composant qui crée le Canvas lui-même.
 */
export default function VisSansFinViewer({ data, height = 320 }: VisSansFinViewerProps) {
  const rayonRoue = data.dentsRoue * RAYON_ROUE_SCALE;
  const distanceCamera = calculerDistanceCamera(rayonRoue * 1.6);

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera}>
      <VisSansFinScene data={data} />
    </SceneWrapper>
  );
}

/** Contenu 3D seul, sans Canvas propre — pour composition dans une scène partagée. */
export function VisSansFinScene({ data }: { data: DonneesVisSansFin }) {
  const { dentsRoue, sensVis } = data;
  const rayonRoue = dentsRoue * RAYON_ROUE_SCALE;
  const { rapportReduction } = calculerVisSansFin(data.dentsRoue, data.nombreFilets);

  const rayonVis = rayonRoue * 0.22;
  const longueurVis = rayonRoue * 2.6;

  const roueRef = useRef<Group>(null);
  const visRef = useRef<Group>(null);
  const vitesseRoue = VITESSE_VIS_VISUELLE / rapportReduction;

  useFrame((_, delta) => {
    if (visRef.current) visRef.current.rotation.x += sensVis * VITESSE_VIS_VISUELLE * delta;
    if (roueRef.current) roueRef.current.rotation.z += vitesseRoue * delta;
  });

  const longueurDent = rayonRoue * 0.2;
  const epaisseurDent = rayonRoue * 0.14;
  const epaisseurRoue = 0.3;

  return (
    <>
      <group ref={roueRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[rayonRoue, rayonRoue, epaisseurRoue, 40]} />
          <meshStandardMaterial color={PALETTE_MECANISME[0]} metalness={0.35} roughness={0.55} />
        </mesh>
        {Array.from({ length: dentsRoue }).map((_, i) => {
          const angle = (i / dentsRoue) * Math.PI * 2;
          const r = rayonRoue + longueurDent / 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[longueurDent, epaisseurDent, epaisseurRoue * 0.9]} />
              <meshStandardMaterial color={PALETTE_MECANISME[0]} metalness={0.35} roughness={0.55} />
            </mesh>
          );
        })}
      </group>

      <group ref={visRef} position={[0, -(rayonRoue + rayonVis + 0.03), 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[rayonVis, rayonVis, longueurVis, 24]} />
          <meshStandardMaterial color={PALETTE_MECANISME[1]} metalness={0.5} roughness={0.4} />
        </mesh>
        {Array.from({ length: 16 }).map((_, i) => {
          const t = i / 15 - 0.5;
          const x = t * longueurVis * 0.85;
          return (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, (i * Math.PI) / 4]}>
              <torusGeometry args={[rayonVis * 1.2, rayonVis * 0.12, 8, 16]} />
              <meshStandardMaterial color="#f2e6c8" />
            </mesh>
          );
        })}
      </group>
    </>
  );
}
