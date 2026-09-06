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
