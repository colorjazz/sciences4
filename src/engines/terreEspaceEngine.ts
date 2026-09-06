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
