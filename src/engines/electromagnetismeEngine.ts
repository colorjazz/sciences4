/**
 * electromagnetismeEngine.ts
 * ------------------------------------------------------------------
 * Concepts prescrits ST : "Champ magnétique d'un fil parcouru par un
 * courant" et "Forces d'attraction et de répulsion" — sous-thème
 * Électromagnétisme (Univers matériel).
 *
 * Portée exacte confirmée dans la Progression des apprentissages
 * (MEQ, 2011), section Électricité et électromagnétisme, colonne 4e
 * secondaire :
 * - Champ magnétique d'un fil : « décrire le champ magnétique produit
 *   autour d'un fil parcouru par un courant électrique (règle de la
 *   main droite) » + « nommer des moyens qui permettent de modifier
 *   l'intensité du champ magnétique (nature du fil, intensité du
 *   courant) ».
 * - Attraction/répulsion : « comparer le comportement d'une boussole
 *   dans le champ magnétique d'un aimant et dans celui créé par un
 *   fil parcouru par un courant électrique ».
 *
 * Contrairement à l'électromagnétisme ATS (solénoïde, induction —
 * absent de l'arbre ST), ce moteur reste volontairement limité au fil
 * droit, seule portée prescrite pour ST.
 * ------------------------------------------------------------------
 */

export interface FacteurChampMagnetique {
  id: string;
  texte: string;
  influenceIntensite: boolean;
}

/** Facteurs qui influencent (ou non) l'intensité du champ autour d'un fil parcouru par un courant. */
export const BANQUE_FACTEURS_CHAMP: FacteurChampMagnetique[] = [
  { id: "intensite-courant", texte: "l'intensité du courant qui circule dans le fil", influenceIntensite: true },
  { id: "nature-fil", texte: "la nature (le matériau) du fil conducteur", influenceIntensite: true },
  { id: "couleur-fil", texte: "la couleur de l'isolant du fil", influenceIntensite: false },
  { id: "temperature-piece", texte: "la température ambiante de la pièce", influenceIntensite: false },
  { id: "longueur-tuyau", texte: "la forme du boîtier qui entoure le fil", influenceIntensite: false },
];

export interface ScenarioBoussole {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

/** Comportement d'une boussole près d'un aimant vs près d'un fil parcouru par un courant. */
export const BANQUE_SCENARIOS_BOUSSOLE: ScenarioBoussole[] = [
  {
    id: "fil-devie",
    affirmation:
      "Approchée d'un fil parcouru par un courant électrique, l'aiguille d'une boussole dévie, tout comme elle le ferait près d'un aimant.",
    correcte: true,
    explication:
      "Un fil parcouru par un courant électrique produit aussi un champ magnétique autour de lui : la boussole y réagit exactement comme elle réagirait près d'un aimant.",
  },
  {
    id: "fil-immobile",
    affirmation:
      "Approchée d'un fil parcouru par un courant électrique, l'aiguille d'une boussole reste immobile, car seul un aimant permanent crée un champ magnétique.",
    correcte: false,
    explication:
      "C'est faux : un courant électrique produit lui aussi un champ magnétique. La boussole dévie près d'un fil parcouru par un courant, tout comme près d'un aimant.",
  },
  {
    id: "coupure-courant",
    affirmation:
      "Si on coupe le courant qui circule dans le fil, l'aiguille de la boussole cesse d'être déviée par ce fil.",
    correcte: true,
    explication:
      "Le champ magnétique autour d'un fil n'existe que lorsqu'un courant y circule — contrairement à celui d'un aimant permanent, qui reste présent en tout temps.",
  },
  {
    id: "aimant-plus-fort",
    affirmation:
      "Le champ magnétique produit par un fil parcouru par un courant ne peut jamais être aussi fort que celui d'un aimant permanent.",
    correcte: false,
    explication:
      "C'est faux : en augmentant l'intensité du courant (ou en enroulant le fil, comme dans un solénoïde), le champ magnétique produit peut dépasser celui de bien des aimants permanents.",
  },
];

export function facteurChampAleatoire(): FacteurChampMagnetique {
  return BANQUE_FACTEURS_CHAMP[Math.floor(Math.random() * BANQUE_FACTEURS_CHAMP.length)];
}

export function scenarioBoussoleAleatoire(): ScenarioBoussole {
  return BANQUE_SCENARIOS_BOUSSOLE[Math.floor(Math.random() * BANQUE_SCENARIOS_BOUSSOLE.length)];
}

// ============================================================
// Champ magnétique d'un solénoïde et induction électromagnétique —
// concepts prescrits ATS uniquement (absents de l'arbre ST).
//
// Portée confirmée dans la Progression des apprentissages ATS :
// - Solénoïde : « décrire le champ magnétique produit par un
//   solénoïde (règle de la main droite) » + « nommer des moyens qui
//   permettent de modifier l'intensité du champ magnétique produit
//   par un solénoïde (nature du noyau, intensité du courant, nombre
//   de spires) ».
// - Induction : « nommer des moyens d'induire un courant électrique
//   dans un fil (ex. mouvement d'un aimant, variation de l'intensité
//   d'un champ magnétique) ».
// ============================================================

export const BANQUE_FACTEURS_SOLENOIDE: FacteurChampMagnetique[] = [
  { id: "intensite-courant-solenoide", texte: "l'intensité du courant qui circule dans le solénoïde", influenceIntensite: true },
  { id: "nature-noyau", texte: "la nature du noyau (avec ou sans noyau de fer) inséré dans le solénoïde", influenceIntensite: true },
  { id: "nombre-spires", texte: "le nombre de spires (tours de fil) du solénoïde", influenceIntensite: true },
  { id: "couleur-isolant-solenoide", texte: "la couleur de l'isolant du fil enroulé", influenceIntensite: false },
  { id: "temperature-piece-solenoide", texte: "la température ambiante de la pièce", influenceIntensite: false },
  { id: "forme-boitier-solenoide", texte: "la forme du boîtier qui entoure le solénoïde", influenceIntensite: false },
];

export interface MoyenInduction {
  id: string;
  texte: string;
  induitCourant: boolean;
}

export const BANQUE_MOYENS_INDUCTION: MoyenInduction[] = [
  { id: "mouvement-aimant", texte: "déplacer un aimant à proximité du fil", induitCourant: true },
  { id: "variation-champ", texte: "faire varier l'intensité d'un champ magnétique à proximité du fil", induitCourant: true },
  { id: "aimant-immobile", texte: "laisser un aimant immobile à proximité du fil, sans le bouger", induitCourant: false },
  { id: "champ-constant", texte: "maintenir un champ magnétique parfaitement constant près du fil", induitCourant: false },
  { id: "chauffer-fil", texte: "chauffer légèrement le fil, sans aimant ni champ magnétique à proximité", induitCourant: false },
];

export function facteurSolenoideAleatoire(): FacteurChampMagnetique {
  return BANQUE_FACTEURS_SOLENOIDE[Math.floor(Math.random() * BANQUE_FACTEURS_SOLENOIDE.length)];
}

export function moyenInductionAleatoire(): MoyenInduction {
  return BANQUE_MOYENS_INDUCTION[Math.floor(Math.random() * BANQUE_MOYENS_INDUCTION.length)];
}
