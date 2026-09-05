import { useState } from "react";
import ParcoursSelector from "./components/ParcoursSelector/ParcoursSelector";
import PartieA from "./components/PartieA/PartieA";
import PartieB from "./components/PartieB/PartieB";
import PartieC from "./components/PartieC/PartieC";
import Atelier from "./components/SimulateurTechnologique/Atelier";
import { Logomark } from "./components/Logomark";
import { ModuleIcon } from "./components/ModuleIcon";
import type { Parcours, SectionEpreuve } from "./types/curriculum";
import { getStructureEpreuve } from "./types/curriculum";
import { LIBELLES_MODULES } from "./utils/libellesPratique";

type Vue = "parcours" | "modules" | SectionEpreuve | "atelier";

export default function App() {
  const [parcours, setParcours] = useState<Parcours | null>(null);
  const [vue, setVue] = useState<Vue>("parcours");

  function choisirParcours(p: Parcours) {
    setParcours(p);
    setVue("modules");
  }

  function retourModules() {
    setVue("modules");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Logomark />
        <div>
          <span className="wordmark">sciences4</span>
          <span className="eyebrow">Corrige.moi · 4e secondaire</span>
        </div>
      </header>

      {vue === "parcours" && <ParcoursSelector onConfirm={choisirParcours} />}

      {vue === "modules" && parcours && (
        <ModulesPratique parcours={parcours} onSelection={setVue} onRetour={() => setVue("parcours")} />
      )}

      {vue === "A" && <PartieA onRetour={retourModules} />}
      {vue === "B" && <PartieB onRetour={retourModules} />}
      {vue === "C" && <PartieC onRetour={retourModules} />}
      {vue === "atelier" && <Atelier onRetour={retourModules} />}
    </div>
  );
}

function ModulesPratique({
  parcours,
  onSelection,
  onRetour,
}: {
  parcours: Parcours;
  onSelection: (v: Vue) => void;
  onRetour: () => void;
}) {
  const structure = getStructureEpreuve(parcours);

  return (
    <div className="panel">
      <span className="eyebrow-label">{parcours}</span>
      <h2>Choisis un module</h2>
      <p className="lede">
        Chaque module s'entraîne indépendamment. Reviens-y aussi souvent que
        tu veux.
      </p>

      <div className="modules-grid">
        {structure.sections.map((s: { section: SectionEpreuve; nombreQuestions: number }) => {
          const libelle = LIBELLES_MODULES[s.section];
          return (
            <button
              key={s.section}
              type="button"
              className="module-card"
              onClick={() => onSelection(s.section)}
            >
              <span className="module-icon">
                <ModuleIcon name={libelle.icone} />
              </span>
              <span>
                <h3>{libelle.titre}</h3>
                <p>{libelle.description}</p>
              </span>
              <span className="module-share">{s.nombreQuestions} questions</span>
            </button>
          );
        })}

        <button
          type="button"
          className="module-card"
          onClick={() => onSelection("atelier")}
        >
          <span className="module-icon">
            <ModuleIcon name="cube" />
          </span>
          <span>
            <h3>L'Atelier</h3>
            <p>Explore et assemble des mécanismes en 3D.</p>
          </span>
        </button>
      </div>

      <button type="button" className="ghost" style={{ marginTop: "1.5rem" }} onClick={onRetour}>
        Changer de parcours
      </button>
    </div>
  );
}
