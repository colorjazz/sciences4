import { useState } from "react";
import ParcoursSelector from "./components/ParcoursSelector/ParcoursSelector";
import ChapitreSelector from "./components/ChapitreSelector/ChapitreSelector";
import PartieA from "./components/PartieA/PartieA";
import PartieB from "./components/PartieB/PartieB";
import PartieC from "./components/PartieC/PartieC";
import { Logomark } from "./components/Logomark";
import type { Parcours, SectionEpreuve } from "./types/curriculum";
import { getStructureEpreuve } from "./types/curriculum";
import { LIBELLES_MODULES } from "./utils/libellesPratique";
import { chapitresDisponibles, sectionADuContenu } from "./utils/couverturePratique";

type Vue = "parcours" | "chapitres" | "modules" | SectionEpreuve;

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
  const [chapitresSelectionnes, setChapitresSelectionnes] = useState<Set<string>>(new Set());
  const [vue, setVue] = useState<Vue>("parcours");

  function choisirParcours(p: Parcours) {
    setParcours(p);
    // Par défaut, tous les chapitres disponibles sont sélectionnés (comme
    // le comportement d'origine, avant l'ajout du filtre par chapitre).
    setChapitresSelectionnes(chapitresDisponibles(p));
    setVue("chapitres");
  }

  function confirmerChapitres(selection: Set<string>) {
    setChapitresSelectionnes(selection);
    setVue("modules");
  }

  function retourModules() {
    setVue("modules");
  }

  const surModules = vue === "chapitres" || vue === "modules" || vue === "A" || vue === "B" || vue === "C";

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

      {vue === "chapitres" && parcours && (
        <ChapitreSelector
          parcours={parcours}
          selectionInitiale={chapitresSelectionnes}
          onConfirm={confirmerChapitres}
          onRetour={() => setVue("parcours")}
        />
      )}

      {vue === "modules" && parcours && (
        <ModulesPratique
          parcours={parcours}
          chapitresSelectionnes={chapitresSelectionnes}
          onSelection={setVue}
          onChangerChapitres={() => setVue("chapitres")}
        />
      )}

      {vue === "A" && parcours && (
        <PartieA parcours={parcours} chapitresSelectionnes={chapitresSelectionnes} onRetour={retourModules} />
      )}
      {vue === "B" && parcours && (
        <PartieB parcours={parcours} chapitresSelectionnes={chapitresSelectionnes} onRetour={retourModules} />
      )}
      {vue === "C" && parcours && <PartieC parcours={parcours} onRetour={retourModules} />}

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
  chapitresSelectionnes,
  onSelection,
  onChangerChapitres,
}: {
  parcours: Parcours;
  chapitresSelectionnes: Set<string>;
  onSelection: (v: Vue) => void;
  onChangerChapitres: () => void;
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
          const disponible = sectionADuContenu(parcours, s.section, chapitresSelectionnes);
          return (
            <button
              key={s.section}
              type="button"
              className={`module-card${disponible ? "" : " indisponible"}`}
              disabled={!disponible}
              onClick={() => onSelection(s.section)}
            >
              <h3 className={libelle.logoPrefix ? "module-card-brand" : undefined}>
                {libelle.logoPrefix ? (
                  <>
                    {libelle.logoPrefix}
                    <span className="module-card-brand-tag">{libelle.titre}</span>
                  </>
                ) : (
                  libelle.titre
                )}
              </h3>
              <p>{disponible ? libelle.description : "Aucun chapitre sélectionné n'a de contenu ici pour l'instant."}</p>
              <span className="card-foot">
                <span>{disponible ? `${s.nombreQuestions} questions` : "Bientôt"}</span>
                <span className="card-arrow" aria-hidden="true">→</span>
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" className="ghost" style={{ marginTop: "1.5rem" }} onClick={onChangerChapitres}>
        Changer les chapitres
      </button>
    </div>
  );
}
