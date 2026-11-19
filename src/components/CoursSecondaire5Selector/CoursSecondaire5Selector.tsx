import type { CoursSecondaire5 } from "../../types/curriculumSecondaire5";

interface CoursSecondaire5SelectorProps {
  onConfirm: (cours: CoursSecondaire5) => void;
  onRetour: () => void;
}

const DESCRIPTIONS: Record<CoursSecondaire5, { titre: string; sousTitre: string }> = {
  CHIMIE5: {
    titre: "Chimie",
    sousTitre: "Gaz, aspect énergétique des transformations, vitesse de réaction, équilibre chimique.",
  },
  PHYSIQUE5: {
    titre: "Physique",
    sousTitre: "Cinématique, dynamique, transformation de l'énergie, optique géométrique.",
  },
};

export default function CoursSecondaire5Selector({ onConfirm, onRetour }: CoursSecondaire5SelectorProps) {
  return (
    <div className="panel">
      <span className="eyebrow-label">5e secondaire · option</span>
      <h2>Quel cours veux-tu pratiquer ?</h2>
      <p className="lede">Choisis le cours optionnel que tu suis cette année.</p>

      <div className="parcours-grid">
        {(Object.keys(DESCRIPTIONS) as CoursSecondaire5[]).map((c) => (
          <button key={c} type="button" className="parcours-card" onClick={() => onConfirm(c)}>
            <span className="code">{c === "CHIMIE5" ? "CHI" : "PHY"}</span>
            <h3>{DESCRIPTIONS[c].titre}</h3>
            <p>{DESCRIPTIONS[c].sousTitre}</p>
            <span className="card-foot">
              <span>Choisir</span>
              <span className="card-arrow" aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="ghost" style={{ marginTop: "1.5rem" }} onClick={onRetour}>
        Changer d'année
      </button>
    </div>
  );
}
