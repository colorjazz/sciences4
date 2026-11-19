/**
 * dynamiquePhysiqueEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Dynamique" — Physique, 5e secondaire. Portée confirmée :
 * accélération gravitationnelle (Terre/Lune), force gravitationnelle,
 * lois de Newton (inertie, F = ma, action-réaction), force de
 * frottement, force centripète, diagramme de corps libre, équilibre
 * et résultante de plusieurs forces.
 * ------------------------------------------------------------------
 */

export const G_TERRESTRE = 9.8;
export const G_LUNAIRE = 1.6;

// ------------------------------------------------------------
// Lois de Newton — 2e loi : F = ma
// ------------------------------------------------------------

export function resoudreForceNewton(params: { masseKg: number; accelerationMS2: number }): { forceN: number } {
  return { forceN: params.masseKg * params.accelerationMS2 };
}

export function resoudreAccelerationNewton(params: { forceN: number; masseKg: number }): { accelerationMS2: number } {
  return { accelerationMS2: params.forceN / params.masseKg };
}

export interface ExempleLoiNewton {
  id: string;
  loi: "1re" | "2e" | "3e";
  nomLoi: string;
  exemple: string;
  explication: string;
}

export const BANQUE_LOIS_NEWTON: ExempleLoiNewton[] = [
  {
    id: "inertie-freinage",
    loi: "1re",
    nomLoi: "principe d'inertie",
    exemple: "les passagers d'une voiture sont projetés vers l'avant lorsque le véhicule freine brusquement",
    explication: "Selon le principe d'inertie, un corps conserve son état de mouvement tant qu'aucune force extérieure ne l'en empêche : les passagers continuent d'avancer même si la voiture ralentit.",
  },
  {
    id: "inertie-nappe",
    loi: "1re",
    nomLoi: "principe d'inertie",
    exemple: "on peut retirer rapidement une nappe sous de la vaisselle sans que celle-ci tombe",
    explication: "La vaisselle a tendance à rester immobile (inertie) pendant le court instant où la nappe est retirée, grâce à un mouvement suffisamment rapide.",
  },
  {
    id: "action-reaction-fusee",
    loi: "3e",
    nomLoi: "principe d'action-réaction",
    exemple: "une fusée est propulsée vers le haut en éjectant des gaz vers le bas",
    explication: "Pour chaque action, il existe une réaction de même grandeur et de sens opposé : la fusée pousse les gaz vers le bas (action), et les gaz poussent la fusée vers le haut (réaction).",
  },
  {
    id: "action-reaction-nage",
    loi: "3e",
    nomLoi: "principe d'action-réaction",
    exemple: "un nageur avance en poussant l'eau vers l'arrière avec ses mains et ses pieds",
    explication: "Le nageur exerce une force sur l'eau vers l'arrière (action) ; en retour, l'eau exerce une force égale et opposée sur le nageur, qui le propulse vers l'avant (réaction).",
  },
];

export function exempleLoiNewtonAleatoire(): ExempleLoiNewton {
  return BANQUE_LOIS_NEWTON[Math.floor(Math.random() * BANQUE_LOIS_NEWTON.length)];
}

// ------------------------------------------------------------
// Force de frottement : Ff = Fmotrice - Frésultante
// ------------------------------------------------------------

export function resoudreForceFrottement(params: { forceMotriceN: number; forceResultanteN: number }): { forceFrottementN: number } {
  return { forceFrottementN: params.forceMotriceN - params.forceResultanteN };
}

// ------------------------------------------------------------
// Équilibre et résultante de plusieurs forces (cas colinéaire,
// toutes les forces agissant sur une même droite)
// ------------------------------------------------------------

export interface ForceColineaire {
  grandeurN: number;
  sens: "positif" | "negatif";
}

export function resoudreResultanteColineaire(forces: ForceColineaire[]): { resultanteN: number; sens: "positif" | "negatif" } {
  const somme = forces.reduce((acc, f) => acc + (f.sens === "positif" ? f.grandeurN : -f.grandeurN), 0);
  return { resultanteN: Math.abs(somme), sens: somme >= 0 ? "positif" : "negatif" };
}

export function resoudreEquilibrante(resultante: { resultanteN: number; sens: "positif" | "negatif" }): { equilibranteN: number; sens: "positif" | "negatif" } {
  return { equilibranteN: resultante.resultanteN, sens: resultante.sens === "positif" ? "negatif" : "positif" };
}

// ------------------------------------------------------------
// Force centripète — effet qualitatif
// ------------------------------------------------------------

export interface AffirmationForceCentripete {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_FORCE_CENTRIPETE: AffirmationForceCentripete[] = [
  {
    id: "centripete-vers-centre",
    affirmation: "La force centripète qui agit sur un corps en mouvement circulaire est toujours dirigée vers le centre de la trajectoire.",
    correcte: true,
    explication: "Par définition, la force centripète (du latin « qui cherche le centre ») est orientée vers le centre du cercle décrit par le corps, ce qui le maintient sur sa trajectoire circulaire.",
  },
  {
    id: "centripete-maintient-trajectoire",
    affirmation: "Sans force centripète, un corps en mouvement circulaire continuerait son mouvement en ligne droite plutôt qu'en cercle.",
    correcte: true,
    explication: "C'est la force centripète qui courbe continuellement la trajectoire d'un corps vers le centre ; sans elle, l'inertie du corps le ferait poursuivre tout droit, tangentiellement au cercle.",
  },
  {
    id: "centripete-direction-mouvement",
    affirmation: "La force centripète agit toujours dans la même direction que le mouvement du corps, comme une force qui le pousse vers l'avant.",
    correcte: false,
    explication: "Faux : la force centripète est perpendiculaire à la direction instantanée du mouvement — elle est dirigée vers le centre du cercle, pas vers l'avant du corps.",
  },
];

export function affirmationForceCentripeteAleatoire(): AffirmationForceCentripete {
  return BANQUE_FORCE_CENTRIPETE[Math.floor(Math.random() * BANQUE_FORCE_CENTRIPETE.length)];
}
