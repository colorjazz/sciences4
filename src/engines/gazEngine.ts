/**
 * gazEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Gaz" — Chimie, 5e secondaire. Portée confirmée dans la
 * Progression des apprentissages : loi générale des gaz (p1V1/n1T1 =
 * p2V2/n2T2), loi des gaz parfaits (pV = nRT), loi de Dalton,
 * hypothèse d'Avogadro, volume molaire gazeux, nombre d'Avogadro,
 * réactivité de certains gaz, théorie cinétique des gaz.
 * ------------------------------------------------------------------
 */

/** Constante des gaz parfaits, en kPa·L/(mol·K) — convention utilisée au Québec. */
export const R_GAZ_PARFAITS = 8.314;

/** Nombre d'Avogadro, en particules/mol. */
export const NOMBRE_AVOGADRO = 6.022e23;

/** Volume molaire gazeux à TPN (0 °C, 101,3 kPa), en L/mol. */
export const VOLUME_MOLAIRE_TPN = 22.4;

/** Volume molaire gazeux à TAPN (25 °C, 101,3 kPa), en L/mol. */
export const VOLUME_MOLAIRE_TAPN = 24.5;

// ------------------------------------------------------------
// Loi générale des gaz (quantité de matière constante, 2 états)
// ------------------------------------------------------------

export function resoudreGazLoiGeneralePression(params: {
  p1KPa: number;
  v1L: number;
  t1K: number;
  v2L: number;
  t2K: number;
}): { p2KPa: number } {
  const { p1KPa, v1L, t1K, v2L, t2K } = params;
  return { p2KPa: (p1KPa * v1L * t2K) / (t1K * v2L) };
}

export function resoudreGazLoiGeneraleVolume(params: {
  p1KPa: number;
  v1L: number;
  t1K: number;
  p2KPa: number;
  t2K: number;
}): { v2L: number } {
  const { p1KPa, v1L, t1K, p2KPa, t2K } = params;
  return { v2L: (p1KPa * v1L * t2K) / (t1K * p2KPa) };
}

// ------------------------------------------------------------
// Loi des gaz parfaits : pV = nRT
// ------------------------------------------------------------

export function resoudrePressionGazParfait(params: { nMol: number; tK: number; vL: number }): { pKPa: number } {
  return { pKPa: (params.nMol * R_GAZ_PARFAITS * params.tK) / params.vL };
}

export function resoudreVolumeGazParfait(params: { nMol: number; tK: number; pKPa: number }): { vL: number } {
  return { vL: (params.nMol * R_GAZ_PARFAITS * params.tK) / params.pKPa };
}

export function resoudreQuantiteMatiereGazParfait(params: { pKPa: number; vL: number; tK: number }): { nMol: number } {
  return { nMol: (params.pKPa * params.vL) / (R_GAZ_PARFAITS * params.tK) };
}

// ------------------------------------------------------------
// Loi de Dalton : p(totale) = p(A) + p(B) + p(C) + ...
// ------------------------------------------------------------

export function resoudrePressionTotaleDalton(pressionsPartiellesKPa: number[]): { pTotaleKPa: number } {
  return { pTotaleKPa: pressionsPartiellesKPa.reduce((a, b) => a + b, 0) };
}

export function resoudrePressionPartielleManquante(pTotaleKPa: number, pressionsConnuesKPa: number[]): { pManquanteKPa: number } {
  return { pManquanteKPa: pTotaleKPa - pressionsConnuesKPa.reduce((a, b) => a + b, 0) };
}

// ------------------------------------------------------------
// Hypothèse d'Avogadro : volumes égaux, mêmes T et p => mêmes n
// ------------------------------------------------------------

export function resoudreQuantiteViaAvogadro(params: { n1Mol: number; v1L: number; v2L: number }): { n2Mol: number } {
  return { n2Mol: (params.n1Mol * params.v2L) / params.v1L };
}

// ------------------------------------------------------------
// Volume molaire gazeux à des conditions données (généralise TPN/TAPN)
// ------------------------------------------------------------

export function calculerVolumeMolaire(params: { tK: number; pKPa: number }): { vmLParMol: number } {
  return { vmLParMol: (R_GAZ_PARFAITS * params.tK) / params.pKPa };
}

// ------------------------------------------------------------
// Réactivité de certains gaz — concept qualitatif
// ------------------------------------------------------------

export interface UsageGazReactif {
  id: string;
  gaz: string;
  application: string;
  raisonReactivite: string;
}

export const BANQUE_REACTIVITE_GAZ: UsageGazReactif[] = [
  {
    id: "argon-ampoules",
    gaz: "l'argon",
    application: "le remplissage des ampoules incandescentes",
    raisonReactivite: "il est très peu réactif (gaz inerte) : il ne réagit pas avec le filament chaud, contrairement à l'oxygène de l'air qui l'oxyderait",
  },
  {
    id: "azote-croustilles",
    gaz: "l'azote",
    application: "le remplissage des sacs de croustilles",
    raisonReactivite: "il est très peu réactif : il déplace l'oxygène de l'air pour empêcher l'oxydation (rancissement) des aliments",
  },
  {
    id: "acetylene-torches",
    gaz: "l'acétylène",
    application: "les torches à souder",
    raisonReactivite: "il est très réactif et réagit vivement avec l'oxygène, ce qui dégage une très grande quantité de chaleur lors de sa combustion",
  },
  {
    id: "helium-dirigeables",
    gaz: "l'hélium",
    application: "le remplissage des dirigeables et ballons",
    raisonReactivite: "il est très peu réactif (gaz inerte), ce qui le rend sécuritaire comparé à l'hydrogène, lui aussi léger mais hautement inflammable",
  },
];

export function usageGazAleatoire(): UsageGazReactif {
  return BANQUE_REACTIVITE_GAZ[Math.floor(Math.random() * BANQUE_REACTIVITE_GAZ.length)];
}

// ------------------------------------------------------------
// Théorie cinétique des gaz — comportement macroscopique
// ------------------------------------------------------------

export interface AffirmationTheorieCinetique {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_THEORIE_CINETIQUE: AffirmationTheorieCinetique[] = [
  {
    id: "compressibilite",
    affirmation: "Un gaz est compressible parce que ses particules sont très espacées les unes des autres, laissant beaucoup de vide entre elles.",
    correcte: true,
    explication: "C'est exactement ce que prédit la théorie cinétique : le grand espace entre les particules d'un gaz permet de réduire le volume qu'elles occupent en les rapprochant.",
  },
  {
    id: "expansion",
    affirmation: "Un gaz se répand pour occuper tout l'espace disponible parce que ses particules sont immobiles et fixes les unes par rapport aux autres.",
    correcte: false,
    explication: "Faux : les particules d'un gaz sont au contraire en mouvement constant et désordonné, ce qui leur permet de se répandre dans tout l'espace disponible (expansion).",
  },
  {
    id: "diffusion",
    affirmation: "La diffusion d'un gaz (ex. une odeur qui se propage dans une pièce) s'explique par le mouvement constant et désordonné de ses particules.",
    correcte: true,
    explication: "Les particules d'un gaz se déplacent continuellement dans toutes les directions, ce qui leur permet de se mélanger progressivement à l'air environnant : c'est la diffusion.",
  },
];

export function affirmationTheorieCinetiqueAleatoire(): AffirmationTheorieCinetique {
  return BANQUE_THEORIE_CINETIQUE[Math.floor(Math.random() * BANQUE_THEORIE_CINETIQUE.length)];
}
