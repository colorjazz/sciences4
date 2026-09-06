import { useState } from "react";
import ParcoursSelector from "./components/ParcoursSelector/ParcoursSelector";
import PartieA from "./components/PartieA/PartieA";
import PartieB from "./components/PartieB/PartieB";
import PartieC from "./components/PartieC/PartieC";
import { Logomark } from "./components/Logomark";
import type { Parcours, SectionEpreuve } from "./types/curriculum";
import { getStructureEpreuve } from "./types/curriculum";
import { LIBELLES_MODULES } from "./utils/libellesPratique";

type Vue = "parcours" | "modules" | SectionEpreuve;

const ICON_ACCUEIL = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

const ICON_MODULES = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

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

  const surModules = vue === "modules" || vue === "A" || vue === "B" || vue === "C";

  return (
    <div className="app-shell">
      <header className="app-header">
        <Logomark />
        <div>
          <span className="wordmark">sciences4</span>
          <span className="eyebrow">Corrige.moi · 4e secondaire</span>
        </div>
      </header>

      {vue === "parcours" && (
        <div className="hero-card">
          <span className="hero-badge">
            <span aria-hidden="true">●</span> Sciences · 4e secondaire
          </span>
          <h1>Prépare ton épreuve unique</h1>
          <p className="hero-sub">
            Choisis ton parcours (ST ou ATS), puis entraîne-toi module par
            module, à ton rythme et autant de fois que tu veux.
          </p>
        </div>
      )}

      {vue === "parcours" && <ParcoursSelector onConfirm={choisirParcours} />}

      {vue === "modules" && parcours && (
        <ModulesPratique parcours={parcours} onSelection={setVue} onRetour={() => setVue("parcours")} />
      )}

      {vue === "A" && <PartieA onRetour={retourModules} />}
      {vue === "B" && <PartieB onRetour={retourModules} />}
      {vue === "C" && <PartieC onRetour={retourModules} />}

      <nav className="bottom-nav" aria-label="Navigation principale">
        <button
          type="button"
          className={vue === "parcours" ? "active" : ""}
          onClick={() => setVue("parcours")}
        >
          {ICON_ACCUEIL}
          Accueil
        </button>
        <button
          type="button"
          className={surModules ? "active" : ""}
          onClick={() => setVue(parcours ? "modules" : "parcours")}
        >
          {ICON_MODULES}
          Modules
        </button>
      </nav>
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
              <h3>{libelle.titre}</h3>
              <p>{libelle.description}</p>
              <span className="card-foot">
                <span>{s.nombreQuestions} questions</span>
                <span className="card-arrow" aria-hidden="true">→</span>
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" className="ghost" style={{ marginTop: "1.5rem" }} onClick={onRetour}>
        Changer de parcours
      </button>
    </div>
  );
}
