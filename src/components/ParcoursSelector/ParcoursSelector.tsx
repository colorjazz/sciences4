import { useState } from "react";
import type { Parcours } from "../../types/curriculum";
import { getStructureEpreuve } from "../../types/curriculum";
import { LIBELLES_MODULES, COULEURS_SEGMENTS } from "../../utils/libellesPratique";

interface ParcoursSelectorProps {
  onConfirm: (parcours: Parcours) => void;
}

const DESCRIPTIONS: Record<Parcours, { titre: string; sousTitre: string }> = {
  ST: {
    titre: "Science et technologie",
    sousTitre: "Inclut la chimie quantitative : balancement, concentration, pH.",
  },
  ATS: {
    titre: "Applications technologiques et scientifiques",
    sousTitre: "Accent sur les mécanismes, les matériaux, les fluides et les forces.",
  },
};

export default function ParcoursSelector({ onConfirm }: ParcoursSelectorProps) {
  const [selection, setSelection] = useState<Parcours | null>(null);

  const structure = selection ? getStructureEpreuve(selection) : null;

  return (
    <div className="panel">
      <span className="eyebrow-label">Avant de commencer</span>
      <h2>Quel parcours suis-tu ?</h2>
      <p className="lede">
        Le contenu des exercices change selon le programme inscrit à ton
        horaire. Choisis celui qui correspond au tien.
      </p>

      <div className="parcours-grid">
        {(Object.keys(DESCRIPTIONS) as Parcours[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`parcours-card${selection === p ? " selected" : ""}`}
            onClick={() => setSelection(p)}
            aria-pressed={selection === p}
          >
            <span className="code">{p}</span>
            <h3>{DESCRIPTIONS[p].titre}</h3>
            <p>{DESCRIPTIONS[p].sousTitre}</p>
          </button>
        ))}
      </div>

      {structure && (
        <div className="repartition">
          <div className="repartition-title">Répartition des exercices</div>
          <div className="repartition-bar">
            {structure.sections.map((s) => (
              <div
                key={s.section}
                className="repartition-segment"
                style={{
                  width: `${s.ponderation}%`,
                  backgroundColor: COULEURS_SEGMENTS[s.section],
                }}
              />
            ))}
          </div>
          <div className="repartition-legend">
            {structure.sections.map((s) => (
              <div className="repartition-legend-item" key={s.section}>
                <span
                  className="repartition-legend-swatch"
                  style={{ backgroundColor: COULEURS_SEGMENTS[s.section] }}
                />
                {LIBELLES_MODULES[s.section].titre}
                <span className="repartition-legend-value">{s.ponderation}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className="primary"
        disabled={!selection}
        onClick={() => selection && onConfirm(selection)}
      >
        Continuer
      </button>
    </div>
  );
}
