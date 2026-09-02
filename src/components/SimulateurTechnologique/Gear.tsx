import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { GearLayout } from "./gearLayout";
import { GEAR_THICKNESS } from "./gearLayout";

interface GearProps {
  layout: GearLayout;
  color: string;
  /** Facteur global appliqué à `speed` pour obtenir une vitesse angulaire visible (rad/s). */
  angularSpeedScale: number;
}

/**
 * Un engrenage : disque principal (CylinderGeometry) orienté pour faire
 * face à la caméra, couronne de petites dents dont le nombre reprend
 * exactement `teeth`, et un repère radial contrasté qui rend la rotation
 * immédiatement visible à l'œil.
 */
export function Gear({ layout, color, angularSpeedScale }: GearProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += layout.direction * layout.speed * angularSpeedScale * delta;
  });

  const { radius, teeth } = layout;
  const epaisseurDent = radius * 0.16;
  const longueurDent = radius * 0.22;

  return (
    <group ref={groupRef} position={[layout.x, 0, 0]}>
      {/* Disque principal — l'axe natif du cylindre (Y) est tourné pour pointer selon Z,
          de sorte que la face circulaire regarde la caméra (vue de face). */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, GEAR_THICKNESS, 48]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.55} />
      </mesh>

      {/* Couronne de dents — une boîte par dent, répartie uniformément, orientée radialement. */}
      {Array.from({ length: teeth }).map((_, i) => {
        const angle = (i / teeth) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + longueurDent / 2);
        const y = Math.sin(angle) * (radius + longueurDent / 2);
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[longueurDent, epaisseurDent, GEAR_THICKNESS * 0.9]} />
            <meshStandardMaterial color={color} metalness={0.35} roughness={0.55} />
          </mesh>
        );
      })}

      {/* Repère de rotation — trait contrasté du centre au bord, sur la face avant. */}
      <mesh position={[radius / 2, 0, GEAR_THICKNESS / 2 + 0.005]}>
        <boxGeometry args={[radius, radius * 0.08, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>

      {/* Moyeu central, purement visuel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, GEAR_THICKNESS / 2 + 0.006]}>
        <cylinderGeometry args={[radius * 0.12, radius * 0.12, 0.02, 24]} />
        <meshStandardMaterial color="#1c2740" />
      </mesh>
    </group>
  );
}
