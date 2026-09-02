/**
 * chimieEngine.ts
 * ------------------------------------------------------------------
 * Moteur déterministe pour les concepts de chimie propres au
 * programme Science et technologie (ST, 055-410). Ces concepts sont
 * ABSENTS du programme ATS — ne jamais importer ce moteur pour des
 * questions ATS.
 * ------------------------------------------------------------------
 */

// ============================================================
// Concentration : C = m / V
// ============================================================

export function calculerConcentration(masseGrammes: number, volumeLitres: number): number {
  if (volumeLitres === 0) throw new Error("Division par zéro : le volume ne peut pas être 0 L.");
  return masseGrammes / volumeLitres;
}

// ============================================================
// Échelle pH — classification qualitative
// ============================================================

export type ClassePH = "acide" | "neutre" | "basique";

export function classifierPH(valeurPH: number): ClassePH {
  if (valeurPH < 7) return "acide";
  if (valeurPH === 7) return "neutre";
  return "basique";
}

// ============================================================
// Balancement d'équations chimiques
// ============================================================

/**
 * Une équation chimique simplifiée : coefficients entiers appliqués à des
 * formules fixes. On ne modélise pas de parseur chimique complet — les
 * formules et le nombre d'atomes par élément sont pré-calculés à la main
 * pour chaque équation de la banque, ce qui garantit l'exactitude sans
 * dépendre d'un solveur générique (risque d'erreur plus élevé que gain).
 */
export interface EquationChimique {
  id: string;
  /** Formules des réactifs, dans l'ordre d'affichage */
  reactifs: string[];
  /** Formules des produits, dans l'ordre d'affichage */
  produits: string[];
  /** Coefficients corrects, dans l'ordre [réactifs..., produits...] */
  coefficientsCorrects: number[];
}

export const BANQUE_EQUATIONS: EquationChimique[] = [
  {
    id: "combustion-magnesium",
    reactifs: ["Mg", "O2"],
    produits: ["MgO"],
    coefficientsCorrects: [2, 1, 2],
  },
  {
    id: "synthese-ammoniac",
    reactifs: ["N2", "H2"],
    produits: ["NH3"],
    coefficientsCorrects: [1, 3, 2],
  },
  {
    id: "synthese-eau",
    reactifs: ["H2", "O2"],
    produits: ["H2O"],
    coefficientsCorrects: [2, 1, 2],
  },
  {
    id: "sulfure-fer",
    reactifs: ["Fe", "S"],
    produits: ["FeS"],
    coefficientsCorrects: [1, 1, 1],
  },
  {
    id: "decomposition-chlorate",
    reactifs: ["KClO3"],
    produits: ["KCl", "O2"],
    coefficientsCorrects: [2, 2, 3],
  },
];

/** Vérifie si un jeu de coefficients proposé correspond exactement à la solution balancée. */
export function estBalancementCorrect(
  equation: EquationChimique,
  coefficientsProposes: number[]
): boolean {
  if (coefficientsProposes.length !== equation.coefficientsCorrects.length) return false;
  return coefficientsProposes.every((c, i) => c === equation.coefficientsCorrects[i]);
}

/**
 * Génère un jeu de coefficients incorrects mais plausibles, en perturbant
 * un seul coefficient de la solution correcte (piège classique : élève qui
 * ne balance qu'un seul côté de l'équation).
 */
export function genererCoefficientsErrones(equation: EquationChimique): number[] {
  const proposition = [...equation.coefficientsCorrects];
  const indexAPerturber = Math.floor(Math.random() * proposition.length);
  const delta = Math.random() < 0.5 ? 1 : -1;
  proposition[indexAPerturber] = Math.max(1, proposition[indexAPerturber] + delta);
  return proposition;
}

/** Formatte une équation avec ses coefficients pour affichage (ex: "2 Mg + O2 → 2 MgO"). */
export function formaterEquation(equation: EquationChimique, coefficients: number[]): string {
  const n = equation.reactifs.length;
  const partiesReactifs = equation.reactifs.map(
    (formule, i) => `${coefficients[i] > 1 ? coefficients[i] + " " : ""}${formule}`
  );
  const partiesProduits = equation.produits.map(
    (formule, i) => `${coefficients[n + i] > 1 ? coefficients[n + i] + " " : ""}${formule}`
  );
  return `${partiesReactifs.join(" + ")} → ${partiesProduits.join(" + ")}`;
}
