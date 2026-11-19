/**
 * optiqueGeometriqueEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Optique géométrique" — Physique, 5e secondaire. Portée
 * confirmée : rayons incident/réfléchi, angles d'incidence et de
 * réflexion (loi de la réflexion), rayons incident/réfracté, indice
 * de réfraction (n = c/v), loi de Snell-Descartes (n1sinθ1 = n2sinθ2),
 * réflexion totale interne, type d'image (réelle/virtuelle),
 * caractéristiques de l'image (Gr = hi/ho = -di/do ; 1/f = 1/di+1/do).
 * ------------------------------------------------------------------
 */

/** Vitesse de la lumière dans le vide, en m/s. */
export const VITESSE_LUMIERE = 3.0e8;

// ------------------------------------------------------------
// Loi de la réflexion : l'angle de réflexion égale l'angle d'incidence
// ------------------------------------------------------------

export function resoudreAngleReflexion(params: { angleIncidenceDegres: number }): { angleReflexionDegres: number } {
  return { angleReflexionDegres: params.angleIncidenceDegres };
}

// ------------------------------------------------------------
// Indice de réfraction : n = c/v
// ------------------------------------------------------------

export function resoudreIndiceRefraction(params: { vitesseMilieuMS: number }): { indice: number } {
  return { indice: VITESSE_LUMIERE / params.vitesseMilieuMS };
}

export function resoudreVitesseDansMilieu(params: { indice: number }): { vitesseMilieuMS: number } {
  return { vitesseMilieuMS: VITESSE_LUMIERE / params.indice };
}

// ------------------------------------------------------------
// Loi de Snell-Descartes (réfraction) : n1 sinθ1 = n2 sinθ2
// ------------------------------------------------------------

export function resoudreAngleRefraction(params: { n1: number; angle1Degres: number; n2: number }): { angle2Degres: number } {
  const sinAngle2 = (params.n1 * Math.sin((params.angle1Degres * Math.PI) / 180)) / params.n2;
  return { angle2Degres: (Math.asin(sinAngle2) * 180) / Math.PI };
}

/** Angle critique de réflexion totale interne (n1 > n2 requis — milieu plus réfringent vers moins réfringent). */
export function resoudreAngleCritique(params: { n1: number; n2: number }): { angleCritiqueDegres: number } {
  return { angleCritiqueDegres: (Math.asin(params.n2 / params.n1) * 180) / Math.PI };
}

// ------------------------------------------------------------
// Images (miroirs et lentilles) : 1/f = 1/di + 1/do ; Gr = hi/ho = -di/do
// ------------------------------------------------------------

export function resoudreDistanceImage(params: { distanceObjetM: number; distanceFocaleM: number }): { distanceImageM: number } {
  const inverseDi = 1 / params.distanceFocaleM - 1 / params.distanceObjetM;
  return { distanceImageM: 1 / inverseDi };
}

export function resoudreGrandissement(params: { distanceImageM: number; distanceObjetM: number }): { grandissement: number } {
  return { grandissement: -params.distanceImageM / params.distanceObjetM };
}

export function resoudreHauteurImage(params: { grandissement: number; hauteurObjetM: number }): { hauteurImageM: number } {
  return { hauteurImageM: params.grandissement * params.hauteurObjetM };
}

/** Convention utilisée ici : image réelle si di > 0 (du même côté que la lumière sortante), virtuelle si di < 0. */
export function classifierTypeImage(distanceImageM: number): "reelle" | "virtuelle" {
  return distanceImageM > 0 ? "reelle" : "virtuelle";
}

// ------------------------------------------------------------
// Rayons incident/réfléchi/réfracté, diffuse vs spéculaire — qualitatif
// ------------------------------------------------------------

export interface AffirmationOptique {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_AFFIRMATIONS_OPTIQUE: AffirmationOptique[] = [
  {
    id: "reflexion-speculaire-surface-lisse",
    affirmation: "La réflexion spéculaire se produit sur une surface lisse et polie, où les rayons réfléchis restent parallèles entre eux.",
    correcte: true,
    explication: "Sur une surface lisse (ex. un miroir), tous les rayons parallèles incidents sont réfléchis parallèlement entre eux dans une même direction : c'est la réflexion spéculaire.",
  },
  {
    id: "reflexion-diffuse-surface-rugueuse",
    affirmation: "La réflexion diffuse se produit sur une surface rugueuse, où les rayons réfléchis repartent dans des directions désordonnées.",
    correcte: true,
    explication: "Sur une surface rugueuse, les irrégularités microscopiques font que des rayons parallèles incidents sont réfléchis dans des directions variées : c'est la réflexion diffuse, qui permet de voir les objets sous plusieurs angles.",
  },
  {
    id: "reflexion-totale-fibre-optique",
    affirmation: "La réflexion totale interne permet à la lumière de se propager dans une fibre optique sans s'échapper par les parois.",
    correcte: true,
    explication: "Quand la lumière frappe la paroi de la fibre avec un angle supérieur à l'angle critique, elle est entièrement réfléchie à l'intérieur plutôt que de se réfracter vers l'extérieur — c'est ce principe qui guide la lumière le long de la fibre.",
  },
  {
    id: "refraction-sans-deviation",
    affirmation: "Un rayon lumineux qui passe d'un milieu à un autre ne change jamais de direction, même si les deux milieux ont des indices de réfraction différents.",
    correcte: false,
    explication: "Faux : dès que les indices de réfraction des deux milieux diffèrent, le rayon change de direction en traversant la surface (sauf s'il est perpendiculaire à celle-ci) — c'est la réfraction, décrite par la loi de Snell-Descartes.",
  },
];

export function affirmationOptiqueAleatoire(): AffirmationOptique {
  return BANQUE_AFFIRMATIONS_OPTIQUE[Math.floor(Math.random() * BANQUE_AFFIRMATIONS_OPTIQUE.length)];
}
