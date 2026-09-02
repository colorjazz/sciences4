import { useState } from "react";
import AssemblyScene3D from "../SimulateurTechnologique/AssemblyScene3D";
import type { DonneesAssemblage } from "../../types/question";

interface AssemblagePanelProps {
  assemblage: DonneesAssemblage;
}

export default function AssemblagePanel({ assemblage }: AssemblagePanelProps) {
  const [activeStage, setActiveStage] = useState(assemblage.etapes[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [exploded, setExploded] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const selected = assemblage.etapes.find((e) => e.id === activeStage) ?? assemblage.etapes[0];

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <AssemblyScene3D
        objectId={assemblage.objectId}
        activeStage={activeStage}
        playing={playing}
        speed={speed}
        exploded={exploded}
        resetKey={resetKey}
      />

      <div className="assemblage-controles">
        <button type="button" className="ghost" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Lancer"}
        </button>
        <button type="button" className="ghost" onClick={() => setResetKey((k) => k + 1)}>
          Réinitialiser
        </button>
        <button
          type="button"
          className="ghost"
          style={exploded ? { borderColor: "var(--brass)", color: "var(--brass)" } : undefined}
          onClick={() => setExploded((e) => !e)}
        >
          {exploded ? "Rassembler" : "Vue éclatée"}
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--graphite-soft)" }}>
          Vitesse
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "90px" }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{speed.toFixed(2)}×</span>
        </label>
      </div>

      <div className="assemblage-stage-liste">
        {assemblage.etapes.map((etape) => (
          <button
            key={etape.id}
            type="button"
            className={`assemblage-stage-bouton${etape.id === activeStage ? " active" : ""}`}
            onClick={() => setActiveStage(etape.id)}
          >
            <span>{etape.label}</span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--graphite-soft)" }}>
              {etape.statut}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="assemblage-stage-detail">
          <strong>{selected.label}</strong> — {selected.famille}
          <p style={{ margin: "0.5rem 0 0" }}>{selected.relation}</p>
          <div className="assemblage-ratio-ligne">
            <span>Entrée</span>
            <span>{selected.entree}</span>
          </div>
          <div className="assemblage-ratio-ligne">
            <span>Sortie</span>
            <span>{selected.sortie}</span>
          </div>
          <div className="assemblage-ratio-ligne">
            <span>Rapport</span>
            <span>{selected.rapport}</span>
          </div>
        </div>
      )}
    </div>
  );
}
