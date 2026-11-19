/**
 * viteseReactionEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Vitesse de réaction" — Chimie, 5e secondaire. Portée
 * confirmée : facteurs qui influencent la vitesse de réaction (nature
 * des réactifs, concentration, surface de contact, température,
 * catalyseurs), loi des vitesses de réaction (expression algébrique
 * reliant concentration et vitesse).
 * ------------------------------------------------------------------
 */

export interface FacteurVitesse {
  id: string;
  facteur: string;
  effetAugmentation: string;
}

export const BANQUE_FACTEURS_VITESSE: FacteurVitesse[] = [
  { id: "nature-reactifs", facteur: "la nature des réactifs", effetAugmentation: "des réactifs intrinsèquement plus réactifs (ex. métaux alcalins) réagissent plus rapidement, peu importe les autres conditions" },
  { id: "concentration", facteur: "la concentration des réactifs", effetAugmentation: "augmenter la concentration des réactifs augmente la fréquence des collisions entre leurs particules, ce qui accélère la réaction" },
  { id: "surface-contact", facteur: "la surface de contact", effetAugmentation: "augmenter la surface de contact (ex. réduire un solide en poudre) expose plus de particules aux collisions, ce qui accélère la réaction" },
  { id: "temperature", facteur: "la température", effetAugmentation: "augmenter la température augmente l'énergie cinétique des particules, ce qui augmente la fréquence et l'efficacité des collisions" },
  { id: "catalyseur", facteur: "l'ajout d'un catalyseur", effetAugmentation: "un catalyseur abaisse l'énergie d'activation nécessaire à la réaction, ce qui l'accélère sans être lui-même consommé" },
];

export function facteurVitesseAleatoire(): FacteurVitesse {
  return BANQUE_FACTEURS_VITESSE[Math.floor(Math.random() * BANQUE_FACTEURS_VITESSE.length)];
}

// ------------------------------------------------------------
// Loi des vitesses de réaction : v = k[A]^ordre
// ------------------------------------------------------------

export function resoudreVitesseReaction(params: { k: number; concentrationMolL: number; ordre: number }): { vitesse: number } {
  return { vitesse: params.k * Math.pow(params.concentrationMolL, params.ordre) };
}

/** Facteur par lequel la vitesse est multipliée si la concentration est multipliée par `facteurConcentration`. */
export function calculerFacteurVariationVitesse(params: { facteurConcentration: number; ordre: number }): { facteurVitesse: number } {
  return { facteurVitesse: Math.pow(params.facteurConcentration, params.ordre) };
}
