import { useState } from "react";

interface ChapitreSimple {
  id: string;
  titre: string;
}

interface ChapitreSelectorSimpleProps {
  eyebrowLabel: string;
  chapitres: ChapitreSimple[];
  selectionInitiale: Set<string>;
  onConfirm: (selection: Set<string>) => void;
  onRetour: () => void;
  libelleRetour: string;
}

/**
 * Version générique de ChapitreSelector, sans couplage au type Parcours
 * (ST/ATS) ni à couverturePratique.ts : tous les chapitres fournis sont
 * considérés disponibles (le cas d'une liste de chapitres "à venir" ne
 * s'applique pas ici — le 5e secondaire a été construit avec un
 * générateur pour chacun de ses chapitres dès le départ).
 */
export default function ChapitreSelectorSimple({
  eyebrowLabel,
  chapitres,
  selectionInitiale,
  onConfirm,
  onRetour,
  libelleRetour,
}: ChapitreSelectorSimpleProps) {
  const [selection, setSelection] = useState<Set<string>>(new Set(selectionInitiale));

  function basculer(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toutSelectionner() {
    setSelection(new Set(chapitres.map((c) => c.id)));
  }

  function toutDeselectionner() {
    setSelection(new Set());
  }

  return (
    <div className="panel">
      <span className="eyebrow-label">{eyebrowLabel}</span>
      <h2>Quels chapitres veux-tu pratiquer ?</h2>
      <p className="lede">
        Choisis les chapitres vus en classe jusqu'ici. Tu peux revenir changer
        ta sélection en tout temps.
      </p>

      <div className="chapitres-actions">
        <button type="button" className="ghost" onClick={toutSelectionner}>
          Tout sélectionner
        </button>
        <button type="button" className="ghost" onClick={toutDeselectionner}>
          Tout désélectionner
        </button>
      </div>

      <div className="chapitres-groupes">
        <div className="chapitre-groupe">
          <div className="chapitre-grille">
            {chapitres.map((c) => {
              const coche = selection.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`chapitre-carte${coche ? " selected" : ""}`}
                  aria-pressed={coche}
                  onClick={() => basculer(c.id)}
                >
                  <span className="chapitre-carte-coche" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5 10 17.5 19 7" />
                    </svg>
                  </span>
                  <span className="chapitre-carte-titre">{c.titre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <button type="button" className="ghost" onClick={onRetour}>
          {libelleRetour}
        </button>
        <button
          type="button"
          className="primary"
          style={{ marginTop: 0 }}
          disabled={selection.size === 0}
          onClick={() => onConfirm(selection)}
        >
          Continuer {selection.size > 0 ? `(${selection.size} chapitre${selection.size > 1 ? "s" : ""})` : ""}
        </button>
      </div>
    </div>
  );
}
