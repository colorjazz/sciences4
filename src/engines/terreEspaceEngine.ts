/**
 * terreEspaceEngine.ts
 * ------------------------------------------------------------------
 * Tables de référence déterministes pour l'univers Terre et espace —
 * jusqu'ici complètement absent des générateurs (aucun scénario A/B/C
 * n'y piochait, malgré une vraie pondération prévue dans
 * STRUCTURE_EPREUVE_ST/ATS). Comme pour la chimie (chimieEngine.ts),
 * la classification correcte vient d'une table vérifiée, jamais de
 * Gemini — qui n'écrit que l'habillage narratif.
 * ------------------------------------------------------------------
 */

// ------------------------------------------------------------
// ST — Effet de serre (sous-thème Atmosphère)
// ------------------------------------------------------------

export type ClasseGaz = "ges" | "non-ges";

export interface GazAtmospherique {
  nom: string;
  classe: ClasseGaz;
}

/** Gaz à effet de serre et gaz atmosphériques courants qui n'en sont pas. */
export const BANQUE_GAZ: GazAtmospherique[] = [
  { nom: "le dioxyde de carbone (CO2)", classe: "ges" },
  { nom: "le méthane (CH4)", classe: "ges" },
  { nom: "la vapeur d'eau (H2O)", classe: "ges" },
  { nom: "le protoxyde d'azote (N2O)", classe: "ges" },
  { nom: "l'ozone (O3) troposphérique", classe: "ges" },
  { nom: "le diazote (N2)", classe: "non-ges" },
  { nom: "le dioxygène (O2)", classe: "non-ges" },
  { nom: "l'argon (Ar)", classe: "non-ges" },
];

// ------------------------------------------------------------
// ATS — Cyclone et anticyclone (sous-thème Atmosphère)
// ------------------------------------------------------------

export type ClasseSystemeMeteo = "cyclone" | "anticyclone";

export interface SystemeMeteo {
  pression: "basse" | "haute";
  classe: ClasseSystemeMeteo;
}

export function classifierSystemeMeteo(pression: "basse" | "haute"): ClasseSystemeMeteo {
  return pression === "basse" ? "cyclone" : "anticyclone";
}

// ------------------------------------------------------------
// ST et ATS — Ressources énergétiques (partagé : sous-thème répété
// dans les trois sphères Lithosphère/Hydrosphère/Atmosphère, présent
// à l'identique dans les deux arbres de curriculum.ts).
// ------------------------------------------------------------

export type SphereTerreEspace = "lithosphere" | "hydrosphere" | "atmosphere";

export interface RessourceEnergetique {
  nom: string;
  renouvelable: boolean;
  sphere: SphereTerreEspace;
}

export const BANQUE_RESSOURCES_ENERGETIQUES: RessourceEnergetique[] = [
  { nom: "le pétrole", renouvelable: false, sphere: "lithosphere" },
  { nom: "le charbon", renouvelable: false, sphere: "lithosphere" },
  { nom: "le gaz naturel", renouvelable: false, sphere: "lithosphere" },
  { nom: "l'uranium", renouvelable: false, sphere: "lithosphere" },
  { nom: "l'énergie hydroélectrique", renouvelable: true, sphere: "hydrosphere" },
  { nom: "l'énergie marémotrice", renouvelable: true, sphere: "hydrosphere" },
  { nom: "l'énergie éolienne", renouvelable: true, sphere: "atmosphere" },
  { nom: "l'énergie solaire", renouvelable: true, sphere: "atmosphere" },
];

/** Concept id (sans préfixe st-/ats-) associé à chaque sphère, pour la traçabilité. */
export const CONCEPT_SUFFIXE_PAR_SPHERE: Record<SphereTerreEspace, string> = {
  lithosphere: "te-ressources-energetiques-litho",
  hydrosphere: "te-ressources-energetiques-hydro",
  atmosphere: "te-ressources-energetiques-atmo",
};

export const LIBELLE_SPHERE: Record<SphereTerreEspace, string> = {
  lithosphere: "la lithosphère",
  hydrosphere: "l'hydrosphère",
  atmosphere: "l'atmosphère",
};

// ------------------------------------------------------------
// ST — Salinité (sous-thème Hydrosphère). Même formule que la
// concentration (C = m/V), appliquée au contexte de l'eau salée —
// absent de l'arbre ATS.
// ------------------------------------------------------------

export type ClasseSalinite = "douce" | "saumatre" | "salee";

export function classifierSalinite(saliniteGL: number): ClasseSalinite {
  if (saliniteGL < 0.5) return "douce";
  if (saliniteGL <= 30) return "saumatre";
  return "salee";
}

// ------------------------------------------------------------
// ST — Cycle du carbone (sous-thème Cycles biogéochimiques).
// Portée confirmée dans la Progression des apprentissages : décrire
// des transformations liées à la circulation du carbone (exemples
// officiels : photosynthèse, décomposition des végétaux, dissolution
// dans l'eau, combustion des combustibles fossiles). Les distracteurs
// viennent volontairement d'autres cycles biogéochimiques (azote,
// phosphore) documentés juste à côté dans le même document — pas de
// l'invention, mais pas non plus des concepts prescrits pour ST.
// ------------------------------------------------------------

export interface PhenomeneBiogeochimique {
  id: string;
  texte: string;
  cycle: "carbone" | "azote" | "phosphore";
}

export const BANQUE_PHENOMENES_BIOGEOCHIMIQUES: PhenomeneBiogeochimique[] = [
  { id: "photosynthese", texte: "la photosynthèse, qui fixe le carbone atmosphérique dans les plantes", cycle: "carbone" },
  { id: "decomposition-vegetaux", texte: "la décomposition des végétaux, qui relâche le carbone qu'ils contenaient", cycle: "carbone" },
  { id: "dissolution-co2", texte: "la dissolution du dioxyde de carbone dans l'eau des océans", cycle: "carbone" },
  { id: "combustion-fossiles", texte: "la combustion des combustibles fossiles, qui relâche le carbone qu'ils contenaient", cycle: "carbone" },
  { id: "fixation-azote", texte: "la fixation de l'azote atmosphérique par certaines bactéries du sol", cycle: "azote" },
  { id: "nitrification", texte: "la nitrification, qui transforme l'ammoniac du sol en nitrates", cycle: "azote" },
  { id: "erosion-roches", texte: "l'érosion des roches, qui libère le phosphore qu'elles contiennent", cycle: "phosphore" },
];

export function phenomeneCarboneAleatoire(): PhenomeneBiogeochimique {
  const phenomenes = BANQUE_PHENOMENES_BIOGEOCHIMIQUES.filter((p) => p.cycle === "carbone");
  return phenomenes[Math.floor(Math.random() * phenomenes.length)];
}

export function phenomenesHorsCarbone(n: number): PhenomeneBiogeochimique[] {
  const autres = [...BANQUE_PHENOMENES_BIOGEOCHIMIQUES.filter((p) => p.cycle !== "carbone")];
  const resultat: PhenomeneBiogeochimique[] = [];
  for (let i = 0; i < n && autres.length > 0; i++) {
    const idx = Math.floor(Math.random() * autres.length);
    resultat.push(autres.splice(idx, 1)[0]);
  }
  return resultat;
}
