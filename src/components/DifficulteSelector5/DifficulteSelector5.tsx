import type { Difficulte } from "../../types/curriculumSecondaire5";

interface DifficulteSelector5Props {
  onConfirm: (difficulte: Difficulte) => void;
  onRetour: () => void;
}

const DESCRIPTIONS: Record<Difficulte, { titre: string; sousTitre: string }> = {
  facile: {
    titre: "Facile",
    sousTitre: "Nombres plus ronds, étapes plus courtes — pour bien saisir chaque notion.",
  },
  moyen: {
    titre: "Moyen",
    sousTitre: "Niveau standard — comparable aux exercices typiques de la classe.",
  },
  difficile: {
    titre: "Difficile",
    sousTitre: "Valeurs plus exigeantes, étapes supplémentaires — pour se mettre au défi.",
  },
};

export default function DifficulteSelector5({ onConfirm, onRetour }: DifficulteSelector5Props) {
  return (
    <div className="panel">
      <span className="eyebrow-label">Avant de pratiquer</span>
      <h2>Quel niveau de difficulté ?</h2>
      <p className="lede">Tu peux revenir changer ton niveau en tout temps.</p>

      <div className="parcours-grid">
        {(Object.keys(DESCRIPTIONS) as Difficulte[]).map((d) => (
          <button key={d} type="button" className="parcours-card" onClick={() => onConfirm(d)}>
            <span className="code">{d === "facile" ? "1" : d === "moyen" ? "2" : "3"}</span>
            <h3>{DESCRIPTIONS[d].titre}</h3>
            <p>{DESCRIPTIONS[d].sousTitre}</p>
            <span className="card-foot">
              <span>Choisir</span>
              <span className="card-arrow" aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="ghost" style={{ marginTop: "1.5rem" }} onClick={onRetour}>
        Changer de chapitres
      </button>
    </div>
  );
}
