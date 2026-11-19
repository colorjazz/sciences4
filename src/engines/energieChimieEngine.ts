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

// ------------------------------------------------------------
// Affirmations vrai/faux — bilan énergétique d'une transformation
// ------------------------------------------------------------

export interface AffirmationEnergieTransformation {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_ENERGIE_TRANSFORMATIONS: AffirmationEnergieTransformation[] = [
  {
    id: "energie-activation-sommet",
    affirmation: "Dans un diagramme énergétique, l'énergie d'activation correspond à l'écart entre l'énergie des réactifs et l'énergie au sommet de la courbe (état de transition).",
    correcte: true,
    explication: "C'est exactement la définition : Ea = énergie au sommet - énergie des réactifs, qu'elle soit la réaction exothermique ou endothermique.",
  },
  {
    id: "confusion-exo-endo",
    affirmation: "Une réaction exothermique est une réaction où les produits ont une énergie plus élevée que celle des réactifs, puisque de l'énergie a été absorbée du milieu.",
    correcte: false,
    explication: "Faux : c'est la description d'une réaction endothermique. Dans une réaction exothermique, les produits ont une énergie PLUS BASSE que les réactifs, et l'excédent d'énergie est dégagé vers le milieu (ΔH < 0).",
  },
  {
    id: "calorimetre-qmct",
    affirmation: "Dans un calorimètre, la quantité de chaleur libérée ou absorbée par une réaction se calcule à partir de la masse d'eau, de sa capacité thermique massique et de la variation de température observée (Q = mcΔT).",
    correcte: true,
    explication: "C'est le principe du calorimètre : la chaleur échangée par la réaction est transférée à l'eau environnante, et se mesure par Q = mcΔT, avec c = 4,19 J/(g·°C) pour l'eau.",
  },
];

export function affirmationEnergieTransformationAleatoire(): AffirmationEnergieTransformation {
  return BANQUE_ENERGIE_TRANSFORMATIONS[Math.floor(Math.random() * BANQUE_ENERGIE_TRANSFORMATIONS.length)];
}
