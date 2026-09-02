/**
 * transmissionEngine.ts
 * ------------------------------------------------------------------
 * Systèmes où le mouvement reste de même nature (rotation → rotation).
 * Concepts prescrits ST : "Fonction, composantes et utilisation des
 * systèmes de transmission du mouvement (roues de friction, poulies
 * et courroie, engrenage, roues dentées et chaîne, roue et vis sans
 * fin)" + "Changements de vitesse".
 *
 * Note d'honnêteté : les caractérisations de réversibilité ci-dessous
 * reprennent les règles simplifiées habituellement enseignées à ce
 * niveau (contact direct/poulie/chaîne = réversible, vis sans fin =
 * non réversible/auto-bloquant). Ce sont des conventions pédagogiques
 * standards, pas des lois physiques absolues dans tous les cas réels
 * — à confronter à la Progression des apprentissages si des nuances y
 * sont précisées.
 * ------------------------------------------------------------------
 */

export type TypeLiaisonTransmission = "contact-direct" | "lien-souple";

export interface ResultatTransmission {
  sensSortie: 1 | -1;
  /** vitesse de sortie / vitesse d'entrée = rayon(entrée) / rayon(sortie) */
  rapportVitesse: number;
  reversible: boolean;
}

/**
 * - "contact-direct" (roues de friction, engrenages en prise directe) :
 *   les deux éléments tournent en sens opposés.
 * - "lien-souple" (poulie-courroie, roue-chaîne) : les deux éléments
 *   tournent dans le MÊME sens, car la courroie/chaîne relie les deux
 *   côtés de façon cohérente.
 */
export function calculerTransmission(
  typeLiaison: TypeLiaisonTransmission,
  rayonEntree: number,
  rayonSortie: number,
  sensEntree: 1 | -1
): ResultatTransmission {
  const sensSortie: 1 | -1 =
    typeLiaison === "contact-direct" ? (sensEntree === 1 ? -1 : 1) : sensEntree;
  return {
    sensSortie,
    rapportVitesse: rayonEntree / rayonSortie,
    reversible: true,
  };
}

export interface ResultatVisSansFin {
  /** Nombre de tours de vis nécessaires pour un tour complet de la roue */
  rapportReduction: number;
  reversible: false;
}

/**
 * Roue et vis sans fin : chaque tour de la vis avance la roue d'un nombre
 * de dents égal au nombre de filets de la vis (généralement 1 filet).
 * Mécanisme volontairement non réversible (auto-bloquant) — impossible
 * de faire tourner la vis en entraînant la roue, propriété exploitée
 * dans les mécanismes de levage ou de direction.
 */
export function calculerVisSansFin(dentsRoue: number, nombreFilets = 1): ResultatVisSansFin {
  return {
    rapportReduction: dentsRoue / nombreFilets,
    reversible: false,
  };
}
