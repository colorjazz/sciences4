import { useState } from "react";
import type { Parcours } from "../../types/curriculum";
import { getSousThemes } from "../../types/curriculum";
import { chapitreDisponible, chapitresDisponibles } from "../../utils/couverturePratique";

interface ChapitreSelectorProps {
  parcours: Parcours;
  selectionInitiale: Set<string>;
  onConfirm: (selection: Set<string>) => void;
  onRetour: () => void;
}

export default function ChapitreSelector({
  parcours,
  selectionInitiale,
  onConfirm,
  onRetour,
}: ChapitreSelectorProps) {
  const [selection, setSelection] = useState<Set<string>>(new Set(selectionInitiale));
  const sousThemes = getSousThemes(parcours);
  const disponibles = chapitresDisponibles(parcours);

  const groupes = new Map<string, { titre: string; items: typeof sousThemes }>();
  for (const st of sousThemes) {
    if (!groupes.has(st.universId)) groupes.set(st.universId, { titre: st.universTitre, items: [] });
    groupes.get(st.universId)!.items.push(st);
  }

  function basculer(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toutSelectionner() {
    setSelection(new Set(disponibles));
  }

  function toutDeselectionner() {
    setSelection(new Set());
  }

  const nbSelectionnes = [...selection].filter((id) => disponibles.has(id)).length;

  return (
    <div className="panel">
      <span className="eyebrow-label">{parcours}</span>
      <h2>Quels chapitres veux-tu pratiquer ?</h2>
      <p className="lede">
        Choisis les chapitres vus en classe jusqu'ici. Tu peux revenir changer
        ta sélection en tout temps depuis le menu des modules.
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
        {[...groupes.entries()].map(([universId, groupe]) => (
          <div className="chapitre-groupe" key={universId}>
            <h3>{groupe.titre}</h3>
            <div className="chapitre-grille">
              {groupe.items.map((st) => {
                const dispo = chapitreDisponible(parcours, st.id);
                const coche = selection.has(st.id) && dispo;
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`chapitre-carte${coche ? " selected" : ""}${dispo ? "" : " indisponible"}`}
                    disabled={!dispo}
                    aria-pressed={coche}
                    onClick={() => dispo && basculer(st.id)}
                  >
                    <span className="chapitre-carte-coche" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5 10 17.5 19 7" />
                      </svg>
                    </span>
                    <span className="chapitre-carte-titre">{st.titre}</span>
                    {!dispo && <span className="chapitre-badge">Bientôt disponible</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <button type="button" className="ghost" onClick={onRetour}>
          Changer de parcours
        </button>
        <button
          type="button"
          className="primary"
          style={{ marginTop: 0 }}
          disabled={nbSelectionnes === 0}
          onClick={() => onConfirm(selection)}
        >
          Continuer {nbSelectionnes > 0 ? `(${nbSelectionnes} chapitre${nbSelectionnes > 1 ? "s" : ""})` : ""}
        </button>
      </div>
    </div>
  );
}
