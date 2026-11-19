/**
 * energieChimieEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Aspect énergétique des transformations" — Chimie, 5e
 * secondaire. Portée confirmée : diagramme énergétique, énergie
 * d'activation, variation d'enthalpie, chaleur molaire de réaction
 * (calorimètre, loi de Hess, enthalpies de liaison).
 * ------------------------------------------------------------------
 */

/** Capacité thermique massique de l'eau, en J/(g·°C) — valeur de référence standard. */
export const CAPACITE_THERMIQUE_EAU = 4.19;

// ------------------------------------------------------------
// Diagramme énergétique — énergie d'activation, variation d'enthalpie
// ------------------------------------------------------------

export interface DiagrammeEnergetique {
  energieReactifsKJ: number;
  energieProduitsKJ: number;
  /** Énergie au sommet de la courbe (état de transition) — toujours ≥ aux deux autres. */
  energieMaxKJ: number;
}

export function genererDiagrammeEnergetique(): DiagrammeEnergetique {
  const energieReactifsKJ = Math.floor(Math.random() * 150 + 50); // 50–199 kJ
  const energieProduitsKJ = Math.floor(Math.random() * 150 + 20); // 20–169 kJ
  const plusHaute = Math.max(energieReactifsKJ, energieProduitsKJ);
  const energieMaxKJ = plusHaute + Math.floor(Math.random() * 80 + 20); // au moins 20 kJ au-dessus
  return { energieReactifsKJ, energieProduitsKJ, energieMaxKJ };
}

export function calculerEnergieActivation(diagramme: DiagrammeEnergetique): { eaKJ: number } {
  return { eaKJ: diagramme.energieMaxKJ - diagramme.energieReactifsKJ };
}

export function calculerEnergieActivationInverse(diagramme: DiagrammeEnergetique): { eaInverseKJ: number } {
  return { eaInverseKJ: diagramme.energieMaxKJ - diagramme.energieProduitsKJ };
}

export function calculerVariationEnthalpie(diagramme: DiagrammeEnergetique): { deltaHKJ: number } {
  return { deltaHKJ: diagramme.energieProduitsKJ - diagramme.energieReactifsKJ };
}

export function classifierReaction(deltaHKJ: number): "exothermique" | "endothermique" {
  return deltaHKJ < 0 ? "exothermique" : "endothermique";
}

// ------------------------------------------------------------
// Chaleur molaire de réaction — calorimètre : Q = mcΔT, puis /n
// ------------------------------------------------------------

export function resoudreChaleurCalorimetre(params: { masseEauG: number; deltaTCelsius: number }): { chaleurJ: number } {
  return { chaleurJ: params.masseEauG * CAPACITE_THERMIQUE_EAU * params.deltaTCelsius };
}

export function resoudreChaleurMolaire(params: { chaleurJ: number; nMolReagi: number }): { chaleurMolaireKJParMol: number } {
  return { chaleurMolaireKJParMol: params.chaleurJ / 1000 / params.nMolReagi };
}
