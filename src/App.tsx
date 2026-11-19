import { useState } from "react";
import ParcoursSelector from "./components/ParcoursSelector/ParcoursSelector";
import ChapitreSelector from "./components/ChapitreSelector/ChapitreSelector";
import PartieA from "./components/PartieA/PartieA";
import PartieB from "./components/PartieB/PartieB";
import PartieC from "./components/PartieC/PartieC";
import PalierSelector from "./components/PalierSelector/PalierSelector";
import CoursSecondaire5Selector from "./components/CoursSecondaire5Selector/CoursSecondaire5Selector";
import ChapitreSelectorSimple from "./components/ChapitreSelectorSimple/ChapitreSelectorSimple";
import DifficulteSelector5 from "./components/DifficulteSelector5/DifficulteSelector5";
import TypeExerciceSelector5 from "./components/TypeExerciceSelector5/TypeExerciceSelector5";
import PartieDeveloppementSecondaire5 from "./components/PartieDeveloppementSecondaire5/PartieDeveloppementSecondaire5";
import { Logomark } from "./components/Logomark";
import type { Parcours, SectionEpreuve } from "./types/curriculum";
import { getStructureEpreuve } from "./types/curriculum";
import type { CoursSecondaire5, Difficulte, TypeExerciceSecondaire5 } from "./types/curriculumSecondaire5";
import { getCurriculumSecondaire5 } from "./types/curriculumSecondaire5";
import { LIBELLES_MODULES } from "./utils/libellesPratique";
import { chapitresDisponibles, sectionADuContenu } from "./utils/couverturePratique";

type Vue =
  | "palier"
  | "parcours"
  | "chapitres"
  | "modules"
  | SectionEpreuve
  | "cours5"
  | "chapitres5"
  | "difficulte5"
  | "typeExercice5"
  | "pratique5";

const TOUS_TYPES_EXERCICE_5: Set<TypeExerciceSecondaire5> = new Set(["developpement", "qcm", "appariement"]);

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
  const [cours5, setCours5] = useState<CoursSecondaire5 | null>(null);
  const [chapitres5Selectionnes, setChapitres5Selectionnes] = useState<Set<string>>(new Set());
  const [difficulte5, setDifficulte5] = useState<Difficulte>("moyen");
  const [typesExercice5Selectionnes, setTypesExercice5Selectionnes] = useState<Set<TypeExerciceSecondaire5>>(TOUS_TYPES_EXERCICE_5);
  const [vue, setVue] = useState<Vue>("palier");
  const [flowActif, setFlowActif] = useState<"4e" | "5e" | null>(null);

  function choisirPalier(p: "4e" | "5e") {
    setFlowActif(p);
    setVue(p === "4e" ? "parcours" : "cours5");
  }

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

  function choisirCours5(c: CoursSecondaire5) {
    setCours5(c);
    setChapitres5Selectionnes(new Set(getCurriculumSecondaire5(c).chapitres.map((ch) => ch.id)));
    setVue("chapitres5");
  }

  function confirmerChapitres5(selection: Set<string>) {
    setChapitres5Selectionnes(selection);
    setVue("difficulte5");
  }

  function confirmerDifficulte5(d: Difficulte) {
    setDifficulte5(d);
    setVue("typeExercice5");
  }

  function confirmerTypeExercice5(selection: Set<TypeExerciceSecondaire5>) {
    setTypesExercice5Selectionnes(selection);
    setVue("pratique5");
  }

  const surModules =
    vue === "chapitres" ||
    vue === "modules" ||
    vue === "A" ||
    vue === "B" ||
    vue === "C" ||
    vue === "cours5" ||
    vue === "chapitres5" ||
    vue === "difficulte5" ||
    vue === "typeExercice5" ||
    vue === "pratique5";

  return (
    <div className="app-shell">
      <header className="app-header">
        <Logomark />
        <div>
          <span className="wordmark">Atomisé</span>
          <span className="eyebrow">4e et 5e secondaire</span>
        </div>
      </header>

      {vue === "palier" && (
        <div className="hero-card">
          <span className="hero-badge">
            <span aria-hidden="true">●</span> Sciences
          </span>
          <h1>Prépare-toi, à ton rythme</h1>
          <p className="hero-sub">
            Choisis ton année, puis ton cours — entraîne-toi module par
            module, autant de fois que tu veux.
          </p>
        </div>
      )}

      {vue === "palier" && <PalierSelector onConfirm={choisirPalier} />}

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

      {vue === "cours5" && <CoursSecondaire5Selector onConfirm={choisirCours5} onRetour={() => setVue("palier")} />}

      {vue === "chapitres5" && cours5 && (
        <ChapitreSelectorSimple
          eyebrowLabel={cours5 === "CHIMIE5" ? "Chimie 5e" : "Physique 5e"}
          chapitres={getCurriculumSecondaire5(cours5).chapitres.map((c) => ({ id: c.id, titre: c.titre }))}
          selectionInitiale={chapitres5Selectionnes}
          onConfirm={confirmerChapitres5}
          onRetour={() => setVue("cours5")}
          libelleRetour="Changer de cours"
        />
      )}

      {vue === "difficulte5" && cours5 && (
        <DifficulteSelector5 onConfirm={confirmerDifficulte5} onRetour={() => setVue("chapitres5")} />
      )}

      {vue === "typeExercice5" && cours5 && (
        <TypeExerciceSelector5
          selectionInitiale={typesExercice5Selectionnes}
          onConfirm={confirmerTypeExercice5}
          onRetour={() => setVue("difficulte5")}
        />
      )}

      {vue === "pratique5" && cours5 && (
        <PartieDeveloppementSecondaire5
          cours={cours5}
          chapitresSelectionnes={chapitres5Selectionnes}
          difficulte={difficulte5}
          typesExercice={typesExercice5Selectionnes}
          onRetour={() => setVue("typeExercice5")}
        />
      )}

      <nav className="bottom-nav" aria-label="Navigation principale">
        <button
          type="button"
          className={vue === "palier" ? "active" : ""}
          onClick={() => setVue("palier")}
        >
          {ICON_ACCUEIL}
          Accueil
        </button>
        <button
          type="button"
          className={surModules ? "active" : ""}
          onClick={() => {
            if (flowActif === "5e") setVue(cours5 ? "chapitres5" : "cours5");
            else setVue(parcours ? "modules" : "palier");
          }}
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
