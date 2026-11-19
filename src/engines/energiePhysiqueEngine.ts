/**
 * energiePhysiqueEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Transformation de l'énergie" — Physique, 5e secondaire.
 * Portée confirmée : énergie mécanique (relations entre énergie
 * cinétique, énergie potentielle, travail et chaleur ; analyse
 * quantitative d'une transformation), loi de Hooke, relation entre
 * puissance, travail et temps.
 * ------------------------------------------------------------------
 */

export const G_TERRESTRE = 9.8;

// ------------------------------------------------------------
// Énergie mécanique : Ek = ½mv², Ep = mgh, conservation Ek+Ep
// ------------------------------------------------------------

export function resoudreEnergieCinetique(params: { masseKg: number; vitesseMS: number }): { energieCinetiqueJ: number } {
  return { energieCinetiqueJ: 0.5 * params.masseKg * params.vitesseMS * params.vitesseMS };
}

export function resoudreEnergiePotentielle(params: { masseKg: number; hauteurM: number }): { energiePotentielleJ: number } {
  return { energiePotentielleJ: params.masseKg * G_TERRESTRE * params.hauteurM };
}

/** Conservation de l'énergie mécanique : chute d'une hauteur h, vitesse initiale nulle, trouve la vitesse finale. */
export function resoudreVitesseParConservationEnergie(params: { hauteurM: number }): { vitesseFinaleMS: number } {
  return { vitesseFinaleMS: Math.sqrt(2 * G_TERRESTRE * params.hauteurM) };
}

// ------------------------------------------------------------
// Loi de Hooke : E = ½kΔℓ²
// ------------------------------------------------------------

export function resoudreEnergieRessort(params: { constanteElasticiteNParM: number; variationLongueurM: number }): { energieJ: number } {
  return { energieJ: 0.5 * params.constanteElasticiteNParM * params.variationLongueurM * params.variationLongueurM };
}

// ------------------------------------------------------------
// Puissance, travail et temps : P = W/Δt
// ------------------------------------------------------------

export function resoudrePuissanceMecanique(params: { travailJ: number; dureeS: number }): { puissanceW: number } {
  return { puissanceW: params.travailJ / params.dureeS };
}

export function resoudreTravailMecanique(params: { puissanceW: number; dureeS: number }): { travailJ: number } {
  return { travailJ: params.puissanceW * params.dureeS };
}
