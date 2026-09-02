import { useMemo } from "react";
import { SceneWrapper, calculerDistanceCamera } from "./SceneWrapper";
import { Gear } from "./Gear";
import { calculerDisposition, calculerLargeurTotale, type GearTrainData } from "./gearLayout";
import { PALETTE_MECANISME } from "./palette";

interface GearTrainViewerProps {
  data: GearTrainData;
  height?: number;
  angularSpeedScale?: number;
  controlesActifs?: boolean;
}

/**
 * Contenu 3D seul, sans Canvas propre — pour être composé dans une
 * scène partagée (ex. vue d'ensemble d'un objet technique complet).
 */
export function GearTrainContent({
  data,
  angularSpeedScale = 1.2,
}: {
  data: GearTrainData;
  angularSpeedScale?: number;
}) {
  const layout = calculerDisposition(data.gears);
  return (
    <>
      {layout.map((gearLayout, i) => (
        <Gear
          key={gearLayout.id}
          layout={gearLayout}
          color={PALETTE_MECANISME[i % PALETTE_MECANISME.length]}
          angularSpeedScale={angularSpeedScale}
        />
      ))}
    </>
  );
}

/**
 * Composant universel : prend n'importe quel JSON `{ gears: [...] }`
 * respectant l'interface GearSpec et génère la scène 3D correspondante
 * à la volée.
 */
export default function GearTrainViewer({
  data,
  height = 360,
  angularSpeedScale = 1.2,
  controlesActifs = true,
}: GearTrainViewerProps) {
  const layout = useMemo(() => calculerDisposition(data.gears), [data]);
  const largeurTotale = useMemo(() => calculerLargeurTotale(layout), [layout]);
  const distanceCamera = calculerDistanceCamera(largeurTotale / 2);

  if (layout.length === 0) {
    return <div style={{ height }} />;
  }

  return (
    <SceneWrapper height={height} distanceCamera={distanceCamera} controlesActifs={controlesActifs}>
      <GearTrainContent data={data} angularSpeedScale={angularSpeedScale} />
    </SceneWrapper>
  );
}

/** Légende optionnelle à afficher sous le canevas — associe couleur, id, dents et vitesse. */
export function LegendeGearTrain({ data }: { data: GearTrainData }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.75rem" }}>
      {data.gears.map((g, i) => (
        <div key={g.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: PALETTE_MECANISME[i % PALETTE_MECANISME.length],
              display: "inline-block",
            }}
          />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--graphite-soft)" }}>
            {g.id} · {g.teeth} dents · v={g.speed.toFixed(2)} · {g.direction === 1 ? "horaire" : "antihoraire"}
          </span>
        </div>
      ))}
    </div>
  );
}
