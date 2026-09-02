import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface SceneWrapperProps {
  height: number;
  distanceCamera: number;
  controlesActifs?: boolean;
  children: ReactNode;
}

/**
 * Coquille commune à tous les visualiseurs de mécanismes : caméra
 * positionnée automatiquement selon la distance fournie, éclairage
 * ambiant + deux lumières ponctuelles, contrôles orbitaux. Évite de
 * dupliquer cette configuration dans chaque type de mécanisme.
 */
export function SceneWrapper({
  height,
  distanceCamera,
  controlesActifs = true,
  children,
}: SceneWrapperProps) {
  return (
    <div style={{ height, borderRadius: 12, overflow: "hidden", background: "var(--paper)" }}>
      <Canvas camera={{ position: [0, distanceCamera * 0.25, distanceCamera], fov: 40 }} shadows>
        <ambientLight intensity={0.55} />
        <pointLight position={[distanceCamera, distanceCamera, distanceCamera]} intensity={1.1} castShadow />
        <pointLight position={[-distanceCamera, -2, distanceCamera]} intensity={0.3} />
        {children}
        {controlesActifs && (
          <OrbitControls
            enablePan={false}
            minDistance={distanceCamera * 0.5}
            maxDistance={distanceCamera * 2}
          />
        )}
      </Canvas>
    </div>
  );
}

/** Calcule une distance de caméra raisonnable pour qu'un objet de cette largeur/hauteur tienne dans le champ de vision (fov=40°). */
export function calculerDistanceCamera(demiEnvergure: number): number {
  return Math.max(4, demiEnvergure / Math.tan((40 * Math.PI) / 360) + 1.5);
}
