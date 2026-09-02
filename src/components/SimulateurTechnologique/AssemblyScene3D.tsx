import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeElements } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { BoxGeometry } from "three";
import type { Group } from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

type AssemblyScene3DProps = {
  objectId: "mixer" | "reel-mower";
  activeStage: string;
  playing: boolean;
  speed: number;
  exploded: boolean;
  resetKey: number;
};

const stageColors: Record<string, string> = {
  moteur: "#ef713b",
  engrenage: "#718497",
  courroie: "#3f9c95",
  came: "#f2c955",
  sortie: "#ef713b",
};

const stageOffsets: Record<string, [number, number, number]> = {
  moteur: [-0.15, 0.3, 0],
  engrenage: [-0.05, 0.12, 0.08],
  courroie: [0.1, 0.35, 0],
  came: [0.14, 0.15, 0.1],
  sortie: [0.15, 0.42, 0],
  "roue-essieu": [-0.1, 0.12, 0.05],
  levier: [0.16, 0.28, 0.12],
};

function offsetFor(stage: string, exploded: boolean): [number, number, number] {
  return exploded ? stageOffsets[stage] ?? [0, 0, 0] : [0, 0, 0];
}

function MechanismLabel({
  children,
  position,
  color,
}: {
  children: string;
  position: [number, number, number];
  color: string;
}) {
  return (
    <Html position={position} center distanceFactor={7} style={{ pointerEvents: "none" }}>
      <span className="scene-3d-label" style={{ borderColor: color }}>
        {children}
      </span>
    </Html>
  );
}

function Gear({
  position,
  radius,
  teeth,
  color,
  active,
  rotation,
  gearRef,
}: {
  position: [number, number, number];
  radius: number;
  teeth: number;
  color: string;
  active: boolean;
  rotation: number;
  gearRef?: (instance: Group | null) => void;
}) {
  return (
    <group ref={gearRef} position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.22, 32]} />
        <meshStandardMaterial
          color={active ? "#f2bd47" : color}
          metalness={0.55}
          roughness={0.33}
          emissive={active ? "#7b5720" : "#000000"}
          emissiveIntensity={active ? 0.35 : 0}
        />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <torusGeometry args={[radius * 0.72, 0.045, 8, 32]} />
        <meshStandardMaterial color="#26364e" metalness={0.45} roughness={0.4} />
      </mesh>
      {Array.from({ length: teeth }).map((_, index) => {
        const angle = (index / teeth) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * radius * 1.04, 0.04, Math.sin(angle) * radius * 1.04]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.11, 0.2, 0.16]} />
            <meshStandardMaterial color={active ? "#f2bd47" : color} metalness={0.5} roughness={0.35} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[radius * 0.16, radius * 0.16, 0.08, 20]} />
        <meshStandardMaterial color="#26364e" metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Motor({
  position,
  active,
  playing,
  speed,
  resetKey,
}: {
  position: [number, number, number];
  active: boolean;
  playing: boolean;
  speed: number;
  resetKey: number;
}) {
  const shaftRef = useRef<Group>(null);
  const shaftPhase = useRef(0);

  useEffect(() => {
    shaftPhase.current = 0;
  }, [resetKey]);

  useFrame((_, delta) => {
    if (playing) shaftPhase.current += delta * speed * 2.8;
    if (shaftRef.current) shaftRef.current.rotation.x = shaftPhase.current * 2.1;
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.05, 1.15]} />
        <meshStandardMaterial color={active ? "#f2bd47" : "#657184"} metalness={0.6} roughness={0.34} />
      </mesh>
      {[-0.3, 0, 0.3].map((y) => (
        <mesh key={y} position={[0, y, 0.59]}>
          <boxGeometry args={[0.92, 0.07, 0.035]} />
          <meshStandardMaterial color="#c3cbd0" metalness={0.65} roughness={0.3} />
        </mesh>
      ))}
      <group ref={shaftRef}>
        <mesh position={[0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.28, 20]} />
          <meshStandardMaterial color="#ef713b" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function BeltAssembly({
  position,
  active,
  playing,
  speed,
  resetKey,
}: {
  position: [number, number, number];
  active: boolean;
  playing: boolean;
  speed: number;
  resetKey: number;
}) {
  const beltColor = active ? "#f2bd47" : "#3f9c95";
  const beltPhase = useRef(0);
  const leftPulleyRef = useRef<Group>(null);
  const rightPulleyRef = useRef<Group>(null);
  const beltTeethRef = useRef<Group>(null);
  const beltPath = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2;
        return [Math.cos(angle) * 1.14, 0.16, Math.sin(angle) * 0.67] as [number, number, number];
      }),
    [],
  );

  useEffect(() => {
    beltPhase.current = 0;
  }, [resetKey]);

  useFrame((_, delta) => {
    if (playing) beltPhase.current += delta * speed * 2.2;
    const phase = beltPhase.current;
    if (leftPulleyRef.current) leftPulleyRef.current.rotation.y = phase;
    if (rightPulleyRef.current) rightPulleyRef.current.rotation.y = phase * 0.62;
    if (beltTeethRef.current) {
      beltTeethRef.current.children.forEach((tooth, index) => {
        const angle = (index / beltTeethRef.current!.children.length) * Math.PI * 2 + phase;
        tooth.position.set(Math.cos(angle) * 1.14, 0.2, Math.sin(angle) * 0.67);
        tooth.rotation.y = -angle;
      });
    }
  });

  return (
    <group position={position}>
      <group ref={leftPulleyRef} position={[-0.58, 0, 0]}>
        <Gear position={[0, 0, 0]} radius={0.32} teeth={12} color="#6f9d99" active={active} rotation={0} />
      </group>
      <group ref={rightPulleyRef} position={[0.58, 0, 0]}>
        <Gear position={[0, 0, 0]} radius={0.51} teeth={20} color="#6f9d99" active={active} rotation={0} />
      </group>
      <Line
        points={beltPath}
        color={beltColor}
        lineWidth={active ? 4 : 2.5}
      />
      <group ref={beltTeethRef}>
        {Array.from({ length: 20 }, (_, index) => (
          <mesh key={index} position={beltPath[Math.floor((index / 20) * beltPath.length)]} castShadow>
            <boxGeometry args={[0.11, 0.08, 0.045]} />
            <meshStandardMaterial color={beltColor} metalness={0.35} roughness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Shaft({
  position,
  length,
  color = "#26364e",
}: {
  position: [number, number, number];
  length: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.07, 0.07, length, 12]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.28} />
    </mesh>
  );
}

function Whisk({ active }: { active: boolean }) {
  const color = active ? "#f2bd47" : "#26364e";
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.62, 14]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.2, 0.025, 8, 24]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.34, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.15, 0.022, 8, 24]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.52, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.08, 0.018, 8, 20]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.32} />
      </mesh>
    </group>
  );
}

function AssemblyModel({
  activeStage,
  playing,
  speed,
  exploded,
  resetKey,
}: AssemblyScene3DProps) {
  const phase = useRef(0);
  const largeGearRef = useRef<Group | null>(null);
  const smallGearRef = useRef<Group | null>(null);
  const finalGearRef = useRef<Group>(null);
  const leftDriveRef = useRef<Group>(null);
  const rightDriveRef = useRef<Group>(null);
  const whiskLeftRef = useRef<Group>(null);
  const whiskRightRef = useRef<Group>(null);
  const housingGeometry = useMemo(() => new BoxGeometry(8.4, 2.45, 3.72), []);

  useEffect(() => {
    phase.current = 0;
  }, [resetKey]);

  useFrame((_, delta) => {
    if (playing) phase.current += delta * speed * 2.8;
    const t = phase.current;
    if (largeGearRef.current) largeGearRef.current.rotation.y = -t * 1.05;
    if (smallGearRef.current) smallGearRef.current.rotation.y = t * 2.1;
    if (finalGearRef.current) finalGearRef.current.rotation.y = t * 0.62;
    if (leftDriveRef.current) leftDriveRef.current.rotation.y = t * 0.62;
    if (rightDriveRef.current) rightDriveRef.current.rotation.y = -t * 0.62;
    if (whiskLeftRef.current) whiskLeftRef.current.rotation.y = t * 0.62;
    if (whiskRightRef.current) whiskRightRef.current.rotation.y = -t * 0.62;
  });

  const isActive = (id: string) => activeStage === id;
  const motorOffset = offsetFor("moteur", exploded);
  const gearOffset = offsetFor("engrenage", exploded);
  const beltOffset = offsetFor("courroie", exploded);
  const camOffset = offsetFor("came", exploded);
  const outputOffset = offsetFor("sortie", exploded);

  return (
    <group rotation={[0.12, -0.14, 0]}>
      <mesh position={[0, -1.35, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.12, 3.9]} />
        <meshStandardMaterial color="#9d978a" roughness={0.8} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[8.4, 2.45, 3.72]} />
        <meshStandardMaterial
          color="#d4ccbb"
          roughness={0.45}
          metalness={0.06}
          transparent
          opacity={exploded ? 0.08 : 0.22}
          depthWrite={false}
        />
      </mesh>
      <lineSegments position={[0, 0.05, 0]}>
        <edgesGeometry args={[housingGeometry]} />
        <lineBasicMaterial color="#445062" transparent opacity={0.75} />
      </lineSegments>

      <group position={[-2.8 + motorOffset[0], motorOffset[1], motorOffset[2]]}>
        <Motor active={isActive("moteur")} position={[0, 0, 0]} playing={playing} speed={speed} resetKey={resetKey} />
        <MechanismLabel position={[0, 0.86, 0]} color={stageColors.moteur}>MOTEUR</MechanismLabel>
      </group>

      <group position={[gearOffset[0], gearOffset[1], gearOffset[2]]}>
        <Gear gearRef={(instance) => { largeGearRef.current = instance; }} position={[-0.55, 0, 0]} radius={0.78} teeth={20} color="#718497" active={isActive("engrenage")} rotation={0} />
        <Gear gearRef={(instance) => { smallGearRef.current = instance; }} position={[-1.75, 0.02, 0]} radius={0.36} teeth={10} color="#8796a1" active={isActive("engrenage")} rotation={0} />
        <Shaft position={[-2.18, 0, 0]} length={0.22} color="#ef713b" />
        <MechanismLabel position={[-1.12, 0.95, 0]} color={stageColors.engrenage}>RÉDUCTEUR</MechanismLabel>
      </group>

      <group position={[beltOffset[0], beltOffset[1], beltOffset[2]]}>
        <BeltAssembly position={[1.35, 0, 0]} active={isActive("courroie")} playing={playing} speed={speed} resetKey={resetKey} />
        <Shaft position={[0.5, 0, 0]} length={0.42} color="#3f9c95" />
        <MechanismLabel position={[1.35, 0.95, 0]} color={stageColors.courroie}>COURROIE CRANTÉE</MechanismLabel>
      </group>

      <group position={[camOffset[0], camOffset[1], camOffset[2]]}>
        <group ref={finalGearRef} position={[2.9, 0.04, 0]}>
          <Gear position={[0, 0, 0]} radius={0.46} teeth={16} color="#f2c955" active={isActive("came")} rotation={0} />
          <mesh position={[0, -0.48, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.92, 14]} />
            <meshStandardMaterial color="#a87b21" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
        <Shaft position={[2.3, 0.04, 0]} length={0.4} color="#a87b21" />
        <MechanismLabel position={[2.9, 0.92, 0]} color={stageColors.came}>RENVOI D'ANGLE</MechanismLabel>
        <group position={[2.9 + outputOffset[0], -0.52 + outputOffset[1], outputOffset[2]]}>
          <group ref={leftDriveRef} position={[0, 0, 0]}>
            <Gear position={[0, 0, 0]} radius={0.22} teeth={12} color="#e2a83e" active={isActive("sortie")} rotation={0} />
          </group>
          <group ref={rightDriveRef} position={[0.46, 0, 0]}>
            <Gear position={[0, 0, 0]} radius={0.22} teeth={12} color="#e2a83e" active={isActive("sortie")} rotation={0} />
          </group>
          <group ref={whiskLeftRef} position={[0, 0, 0]}>
            <Whisk active={isActive("sortie")} />
          </group>
          <group ref={whiskRightRef} position={[0.46, 0, 0]}>
            <Whisk active={isActive("sortie")} />
          </group>
          <MechanismLabel position={[0.23, 1.38, 0]} color={stageColors.sortie}>PAIRE DE FOUETS</MechanismLabel>
        </group>
      </group>
    </group>
  );
}

function MowerWheel({
  position,
  active,
  wheelRef,
}: {
  position: [number, number, number];
  active: boolean;
  wheelRef: RefObject<Group>;
}) {
  const color = active ? "#f2bd47" : "#354d4a";
  return (
    <group ref={wheelRef} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.26, 32]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.15]}>
        <torusGeometry args={[0.6, 0.075, 10, 32]} />
        <meshStandardMaterial color="#b8ad91" metalness={0.2} roughness={0.62} />
      </mesh>
      {Array.from({ length: 6 }).map((_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0.16]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.055, 0.62, 0.07]} />
            <meshStandardMaterial color="#b8ad91" metalness={0.25} roughness={0.58} />
          </mesh>
        );
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 20]} />
        <meshStandardMaterial color="#26364e" metalness={0.6} roughness={0.28} />
      </mesh>
    </group>
  );
}

function CuttingReel({
  reelRef,
  active,
}: {
  reelRef: RefObject<Group>;
  active: boolean;
}) {
  const color = active ? "#f2bd47" : "#557c72";
  return (
    <group ref={reelRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 2.35, 16]} />
        <meshStandardMaterial color="#26364e" metalness={0.62} roughness={0.28} />
      </mesh>
      {Array.from({ length: 5 }).flatMap((_, bladeIndex) =>
        Array.from({ length: 5 }).map((__, segmentIndex) => {
          const axial = segmentIndex / 4 - 0.5;
          const angle = (bladeIndex / 5) * Math.PI * 2 + axial * 0.72;
          return (
            <mesh
              key={`${bladeIndex}-${segmentIndex}`}
              position={[Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, axial * 2.2]}
              rotation={[0, 0, angle + 0.55]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.075, 0.52]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
          );
        }),
      )}
      {[-1.17, 1.17].map((z) => (
        <mesh key={z} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z]}>
          <cylinderGeometry args={[0.57, 0.57, 0.08, 28]} />
          <meshStandardMaterial color={active ? "#f2bd47" : "#6d8b82"} metalness={0.45} roughness={0.34} />
        </mesh>
      ))}
    </group>
  );
}

function ReelMowerModel({
  activeStage,
  playing,
  speed,
  exploded,
  resetKey,
}: AssemblyScene3DProps) {
  const phase = useRef(0);
  const leftWheelRef = useRef<Group>(null);
  const rightWheelRef = useRef<Group>(null);
  const inputGearRef = useRef<Group | null>(null);
  const reelGearRef = useRef<Group | null>(null);
  const reelRef = useRef<Group>(null);
  const housingGeometry = useMemo(() => new BoxGeometry(6.3, 1.7, 2.55), []);

  useEffect(() => {
    phase.current = 0;
  }, [resetKey]);

  useFrame((_, delta) => {
    if (playing) phase.current += delta * speed * 1.8;
    const t = phase.current;
    if (leftWheelRef.current) leftWheelRef.current.rotation.z = t;
    if (rightWheelRef.current) rightWheelRef.current.rotation.z = t;
    if (inputGearRef.current) inputGearRef.current.rotation.y = t;
    if (reelGearRef.current) reelGearRef.current.rotation.y = -t * 0.795;
    if (reelRef.current) reelRef.current.rotation.z = -t * 0.795;
  });

  const isActive = (id: string) => activeStage === id;
  const wheelOffset = offsetFor("roue-essieu", exploded);
  const gearOffset = offsetFor("engrenage", exploded);
  const leverOffset = offsetFor("levier", exploded);

  return (
    <group rotation={[0.1, -0.12, 0]}>
      <mesh position={[0, -1.37, 0]} receiveShadow>
        <boxGeometry args={[7.4, 0.12, 3.45]} />
        <meshStandardMaterial color="#9d978a" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.08, 0]} castShadow>
        <primitive object={housingGeometry} attach="geometry" />
        <meshStandardMaterial
          color="#6d8578"
          roughness={0.46}
          metalness={0.12}
          transparent
          opacity={exploded ? 0.1 : 0.34}
          depthWrite={false}
        />
      </mesh>
      <lineSegments position={[0, -0.08, 0]}>
        <edgesGeometry args={[housingGeometry]} />
        <lineBasicMaterial color="#26364e" transparent opacity={0.78} />
      </lineSegments>

      <group position={wheelOffset}>
        <MowerWheel wheelRef={leftWheelRef} position={[1.55, -0.58, 1.15]} active={isActive("roue-essieu")} />
        <MowerWheel wheelRef={rightWheelRef} position={[1.55, -0.58, -1.15]} active={isActive("roue-essieu")} />
        <mesh position={[1.55, -0.58, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 2.35, 16]} />
          <meshStandardMaterial color="#26364e" metalness={0.65} roughness={0.27} />
        </mesh>
        <MechanismLabel position={[1.55, 0.54, 1.15]} color="#ef713b">ROUE · ESSIEU</MechanismLabel>
      </group>

      <group position={[gearOffset[0], -0.58 + gearOffset[1], 1.38 + gearOffset[2]]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <Gear gearRef={(instance) => { inputGearRef.current = instance; }} position={[1.55, 0, 0]} radius={0.31} teeth={12} color="#d3a345" active={isActive("engrenage")} rotation={0} />
          <Gear gearRef={(instance) => { reelGearRef.current = instance; }} position={[0.85, 0, 0]} radius={0.39} teeth={14} color="#879b91" active={isActive("engrenage")} rotation={0} />
        </group>
        <MechanismLabel position={[1.18, 0.54, 0]} color="#718497">ENGRENAGE LATÉRAL</MechanismLabel>
      </group>

      <group position={[gearOffset[0], gearOffset[1], gearOffset[2]]}>
        <group position={[0.85, -0.58, 0]}>
          <CuttingReel reelRef={reelRef} active={isActive("engrenage")} />
        </group>
        <mesh position={[0.85, -0.58, 1.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.28, 14]} />
          <meshStandardMaterial color="#26364e" metalness={0.58} roughness={0.3} />
        </mesh>
      </group>

      <group position={[leverOffset[0], leverOffset[1], 0.92 + leverOffset[2]]}>
        <mesh position={[2.2, 0.42, 0]} rotation={[0, 0, -0.38]} castShadow>
          <boxGeometry args={[0.14, 1.15, 0.16]} />
          <meshStandardMaterial color={isActive("levier") ? "#f2bd47" : "#ef713b"} metalness={0.4} roughness={0.32} />
        </mesh>
        <mesh position={[2.42, 0.92, 0]} castShadow>
          <sphereGeometry args={[0.15, 18, 12]} />
          <meshStandardMaterial color="#26364e" metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[2.2, -0.12, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.24, 16]} />
          <meshStandardMaterial color="#26364e" metalness={0.5} roughness={0.3} />
        </mesh>
        <MechanismLabel position={[2.36, 1.24, 0]} color="#ef713b">LEVIER</MechanismLabel>
      </group>

      <group>
        {[-0.72, 0.72].map((z) => (
          <mesh key={z} position={[2.4, 1.1, z]} rotation={[0, 0, -0.55]} castShadow>
            <boxGeometry args={[0.16, 2.25, 0.16]} />
            <meshStandardMaterial color="#354d4a" metalness={0.35} roughness={0.46} />
          </mesh>
        ))}
        <mesh position={[3.3, 1.98, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 1.7, 20]} />
          <meshStandardMaterial color="#26364e" metalness={0.45} roughness={0.35} />
        </mesh>
      </group>

      <MechanismLabel position={[0.85, 0.58, 1.14]} color="#3f9c95">LAMES HÉLICOÏDALES</MechanismLabel>
    </group>
  );
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function MowerFallback({ playing, exploded }: Pick<AssemblyScene3DProps, "playing" | "exploded">) {
  return (
    <div className={`scene-fallback mower-fallback ${playing ? "is-playing" : ""} ${exploded ? "exploded" : ""}`} role="img" aria-label="Schéma de secours d'une tondeuse à gazon manuelle à cylindre">
      <div className="mower-fallback-ground" />
      <div className="mower-fallback-frame">
        <div className="mower-fallback-reel"><i /><i /><i /><i /><span>LAMES HÉLICOÏDALES</span></div>
        <div className="mower-fallback-wheel mower-fallback-wheel-left"><b /><b /><b /><span>ROUE · ESSIEU</span></div>
        <div className="mower-fallback-wheel mower-fallback-wheel-right"><b /><b /><b /></div>
        <div className="mower-fallback-gears"><b /><b /><span>ENGRENAGE LATÉRAL</span></div>
        <div className="mower-fallback-lever"><i /><span>LEVIER</span></div>
        <div className="mower-fallback-handle" />
      </div>
      <span className="fallback-note">Mode schéma · poussée → roues → engrenages → cylindre de coupe.</span>
    </div>
  );
}

function AssemblyFallback({ playing, exploded }: Pick<AssemblyScene3DProps, "playing" | "exploded">) {
  return (
    <div className={`scene-fallback ${playing ? "is-playing" : ""} ${exploded ? "exploded" : ""}`} role="img" aria-label="Schéma de secours de l'assemblage complet du batteur électrique">
      <div className="fallback-housing">
        <div className="fallback-part fallback-motor"><span>MOTEUR</span><i /></div>
        <div className="fallback-part fallback-gears"><b /><b /><span>RÉDUCTEUR</span></div>
        <div className="fallback-part fallback-belt"><b /><b /><span>COURROIE</span></div>
        <div className="fallback-part fallback-cam"><i /><span>RENVOI</span></div>
        <div className="fallback-part fallback-output"><b /><b /><span>FOUETS</span></div>
      </div>
      <span className="fallback-note">Mode schéma · la vue 3D sera disponible dès qu'une accélération graphique est active.</span>
    </div>
  );
}

export default function AssemblyScene3D(props: AssemblyScene3DProps) {
  const [webglAvailable] = useState(canUseWebGL);
  const isMower = props.objectId === "reel-mower";

  return (
    <div className={`scene-wrap scene-3d-wrap ${props.playing ? "is-playing" : ""} ${props.exploded ? "exploded" : ""}`} data-testid="assembly-scene">
      <span className="scene-label top">Vue d'inspection · banc 04</span>
      <span className="scene-label bottom">Glisser pour tourner · molette pour zoomer</span>
      {webglAvailable ? (
        <Canvas
          className="scene-canvas"
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [7, 5.8, 8.5], fov: 38 }}
          aria-label={isMower ? "Modèle 3D d'une tondeuse à gazon manuelle avec roues, engrenages, levier et cylindre de coupe" : "Modèle 3D d'un batteur électrique avec moteur, réducteur, courroie, renvoi et fouets rotatifs"}
        >
          <color attach="background" args={["#e3dccb"]} />
          <ambientLight intensity={1.6} />
          <directionalLight position={[4, 8, 5]} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-5, 3, -4]} intensity={1.3} color="#f2c955" />
          {isMower ? <ReelMowerModel {...props} /> : <AssemblyModel {...props} />}
          <OrbitControls makeDefault enablePan={false} minDistance={6} maxDistance={13} target={[0, 0, 0]} />
        </Canvas>
      ) : isMower ? (
        <MowerFallback playing={props.playing} exploded={props.exploded} />
      ) : (
        <AssemblyFallback playing={props.playing} exploded={props.exploded} />
      )}
    </div>
  );
}