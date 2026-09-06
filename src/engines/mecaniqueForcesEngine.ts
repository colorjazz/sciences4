/**
 * mecaniqueForcesEngine.ts
 * ------------------------------------------------------------------
 * Moteur déterministe pour les concepts "Forces et mouvements" de
 * l'Univers matériel — propres au parcours ATS (Applications
 * technologiques et scientifiques) ; absents du parcours ST, qui n'a
 * pas ce sous-thème (voir curriculum.ts, CURRICULUM_ATS.materiel).
 * ------------------------------------------------------------------
 */

/** Intensité du champ gravitationnel terrestre (grandeur ATS, curriculum.ts GRANDEURS). */
export const G_TERRESTRE_N_PAR_KG = 9.8;

export function resoudreForceGravitationnelle(params: { masseKg: number }): { forceN: number } {
  return { forceN: params.masseKg * G_TERRESTRE_N_PAR_KG };
}

export function resoudreVitesse(params: { distanceM: number; tempsS: number }): { vitesseMS: number } {
  return { vitesseMS: params.distanceM / params.tempsS };
}
