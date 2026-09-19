/**
 * couverturePratique.ts
 * ------------------------------------------------------------------
 * Déclare honnêtement, par parcours et par section, quels chapitres
 * (sous-thèmes de curriculum.ts) ont réellement un générateur aujourd'hui —
 * utilisée par ChapitreSelector pour griser les chapitres "à venir" et par
 * ModulesPratique pour désactiver un module si aucun chapitre sélectionné
 * n'y a de contenu.
 *
 * Reflète l'état réel de qcmGenerator.ts (Section A), reponseCourteGenerator.ts
 * (Section B) et analyseGenerator.ts (Section C, toujours "ingenierie-mecanique"
 * dans les deux parcours) au moment où ce fichier a été écrit — à
 * remettre à jour si un nouveau scénario/générateur est ajouté ailleurs.
 * ------------------------------------------------------------------
 */

import type { Parcours, SectionEpreuve } from "../types/curriculum";

export const CHAPITRES_AVEC_CONTENU: Record<Parcours, Record<SectionEpreuve, Set<string>>> = {
  ST: {
    A: new Set([
      "electricite",
      "proprietes-solutions",
      "transformations-chimiques",
      "ingenierie-mecanique",
      "atmosphere",
      "cycles-biogeochimiques",
      "organisation-matiere",
      "electromagnetisme",
      "transformation-energie",
      "ingenierie-electrique",
      "materiaux-st",
    ]),
    B: new Set([
      "electricite",
      "proprietes-solutions",
      "ingenierie-mecanique",
      "lithosphere",
      "hydrosphere",
      "atmosphere",
      "transformation-energie",
      "ingenierie-electrique",
    ]),
    C: new Set(["ingenierie-mecanique"]),
  },
  ATS: {
    A: new Set(["electricite", "ingenierie-mecanique", "forces-mouvements", "atmosphere", "transformation-energie", "ingenierie-electrique"]),
    B: new Set([
      "electricite",
      "forces-mouvements",
      "ingenierie-mecanique",
      "lithosphere",
      "hydrosphere",
      "atmosphere",
      "transformation-energie",
      "ingenierie-electrique",
    ]),
    // Les mécanismes de Section C (engrenages, cames, etc.) sont les mêmes
    // notions d'ingénierie mécanique que pour ST — le générateur est
    // parcours-agnostique (voir versConceptIdParcours dans analyseGenerator.ts).
    C: new Set(["ingenierie-mecanique"]),
  },
};

/** Un sous-thème est "disponible" s'il a du contenu dans au moins une section. */
export function chapitreDisponible(parcours: Parcours, sousThemeId: string): boolean {
  const couverture = CHAPITRES_AVEC_CONTENU[parcours];
  return (Object.keys(couverture) as SectionEpreuve[]).some((section) =>
    couverture[section].has(sousThemeId)
  );
}

/** Vrai si au moins un chapitre sélectionné a du contenu pour cette section. */
export function sectionADuContenu(
  parcours: Parcours,
  section: SectionEpreuve,
  chapitresSelectionnes: Set<string>
): boolean {
  const couverture = CHAPITRES_AVEC_CONTENU[parcours][section];
  for (const id of chapitresSelectionnes) {
    if (couverture.has(id)) return true;
  }
  return false;
}

/** Tous les chapitres disponibles (toutes sections confondues) pour un parcours. */
export function chapitresDisponibles(parcours: Parcours): Set<string> {
  const couverture = CHAPITRES_AVEC_CONTENU[parcours];
  const resultat = new Set<string>();
  for (const section of Object.keys(couverture) as SectionEpreuve[]) {
    for (const id of couverture[section]) resultat.add(id);
  }
  return resultat;
}
