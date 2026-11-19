export type Palier = "4e" | "5e";

interface PalierSelectorProps {
  onConfirm: (palier: Palier) => void;
}

const DESCRIPTIONS: Record<Palier, { titre: string; sousTitre: string }> = {
  "4e": {
    titre: "4e secondaire",
    sousTitre: "Science et technologie (ST) ou Applications technologiques et scientifiques (ATS) — épreuve unique ministérielle.",
  },
  "5e": {
    titre: "5e secondaire",
    sousTitre: "Chimie ou Physique — cours optionnels, pratique libre par chapitre.",
  },
};

export default function PalierSelector({ onConfirm }: PalierSelectorProps) {
  return (
    <div className="panel">
      <span className="eyebrow-label">Avant de commencer</span>
      <h2>Quelle année suis-tu ?</h2>
      <p className="lede">Choisis ton année pour voir les cours disponibles.</p>

      <div className="parcours-grid">
        {(Object.keys(DESCRIPTIONS) as Palier[]).map((p) => (
          <button key={p} type="button" className="parcours-card" onClick={() => onConfirm(p)}>
            <span className="code">{p}</span>
            <h3>{DESCRIPTIONS[p].titre}</h3>
            <p>{DESCRIPTIONS[p].sousTitre}</p>
            <span className="card-foot">
              <span>Choisir</span>
              <span className="card-arrow" aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
