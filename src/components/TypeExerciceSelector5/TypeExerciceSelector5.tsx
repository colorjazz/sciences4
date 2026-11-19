import { useState } from "react";
import type { TypeExerciceSecondaire5 } from "../../types/curriculumSecondaire5";

interface TypeExerciceSelector5Props {
  selectionInitiale: Set<TypeExerciceSecondaire5>;
  onConfirm: (selection: Set<TypeExerciceSecondaire5>) => void;
  onRetour: () => void;
}

const TYPES: { id: TypeExerciceSecondaire5; titre: string; description: string }[] = [
  { id: "developpement", titre: "Développement", description: "Problèmes à étapes, avec démarche et corrigé détaillé." },
  { id: "qcm", titre: "QCM rapide", description: "Affirmations vrai ou faux, réponse immédiate." },
  { id: "appariement", titre: "Appariement", description: "Associe chaque terme ou formule à sa bonne réponse." },
];

export default function TypeExerciceSelector5({ selectionInitiale, onConfirm, onRetour }: TypeExerciceSelector5Props) {
  const [selection, setSelection] = useState<Set<TypeExerciceSecondaire5>>(new Set(selectionInitiale));

  function basculer(id: TypeExerciceSecondaire5) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toutSelectionner() {
    setSelection(new Set(TYPES.map((t) => t.id)));
  }

  function toutDeselectionner() {
    setSelection(new Set());
  }

  return (
    <div className="panel">
      <span className="eyebrow-label">Avant de pratiquer</span>
      <h2>Quels types d'exercices veux-tu pratiquer ?</h2>
      <p className="lede">Tu peux en choisir plusieurs, et revenir changer ta sélection en tout temps.</p>

      <div className="chapitres-actions">
        <button type="button" className="ghost" onClick={toutSelectionner}>
          Tout sélectionner
        </button>
        <button type="button" className="ghost" onClick={toutDeselectionner}>
          Tout désélectionner
        </button>
      </div>

      <div className="chapitre-grille type-exercice-grille">
        {TYPES.map((t) => {
          const coche = selection.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              className={`chapitre-carte${coche ? " selected" : ""}`}
              aria-pressed={coche}
              onClick={() => basculer(t.id)}
            >
              <span className="chapitre-carte-coche" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5 10 17.5 19 7" />
                </svg>
              </span>
              <span className="chapitre-carte-titre">{t.titre}</span>
              <span className="chapitre-carte-description">{t.description}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <button type="button" className="ghost" onClick={onRetour}>
          Changer de difficulté
        </button>
        <button
          type="button"
          className="primary"
          style={{ marginTop: 0 }}
          disabled={selection.size === 0}
          onClick={() => onConfirm(selection)}
        >
          Continuer {selection.size > 0 ? `(${selection.size} type${selection.size > 1 ? "s" : ""})` : ""}
        </button>
      </div>
    </div>
  );
}
