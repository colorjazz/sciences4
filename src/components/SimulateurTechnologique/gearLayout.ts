/**
 * gearLayout.ts
 * ------------------------------------------------------------------
 * Logique purement géométrique, sans dépendance à Three.js ni React :
 * calcule le rayon et la position X de chaque engrenage à partir du
 * JSON d'entrée. Séparée du rendu pour rester testable comme les
 * autres moteurs déterministes du projet (electriciteEngine,
 * mecaniqueEngine, etc.).
 * ------------------------------------------------------------------
 */

import type { GearSpec } from "../../types/mecanisme3D";
export type { GearSpec, GearTrainData } from "../../types/mecanisme3D";

export interface GearLayout extends GearSpec {
  /** Rayon calculé, proportionnel au nombre de dents */
  radius: number;
  /** Position sur l'axe X, centre de l'engrenage */
  x: number;
}

/** Unités de rayon par dent — ajuste la taille globale de la scène. */
export const RADIUS_SCALE = 0.045;

/** Épaisseur (profondeur en Z) commune à tous les engrenages. */
export const GEAR_THICKNESS = 0.35;

export function calculerRayon(teeth: number): number {
  return teeth * RADIUS_SCALE;
}

/**
 * Calcule les positions X d'une série de rayons placés bord à bord
 * (rebords qui se touchent exactement), puis recentre l'ensemble
 * autour de x=0. Fonction générique réutilisée par tout mécanisme à
 * contact direct (trains d'engrenages, roues de friction).
 */
export function calculerDispositionTouchante(rayons: number[]): number[] {
  if (rayons.length === 0) return [];

  const positions: number[] = [0];
  for (let i = 1; i < rayons.length; i++) {
    positions.push(positions[i - 1] + rayons[i - 1] + rayons[i]);
  }

  const bordGauche = positions[0] - rayons[0];
  const bordDroit = positions[positions.length - 1] + rayons[rayons.length - 1];
  const decalage = (bordGauche + bordDroit) / 2;

  return positions.map((p) => p - decalage);
}

/**
 * Calcule la position X et le rayon de chaque engrenage d'un train en
 * prise directe : les rebords de deux engrenages adjacents se touchent
 * exactement (distance entre centres = somme des rayons). L'ensemble est
 * ensuite recentré autour de x = 0 pour faciliter le cadrage caméra.
 */
export function calculerDisposition(gears: GearSpec[]): GearLayout[] {
  if (gears.length === 0) return [];

  const rayons = gears.map((g) => calculerRayon(g.teeth));
  const positionsX = calculerDispositionTouchante(rayons);

  return gears.map((gear, i) => ({
    ...gear,
    radius: rayons[i],
    x: positionsX[i],
  }));
}

/** Largeur totale occupée par le train, utile pour cadrer la caméra. */
export function calculerLargeurTotale(layout: GearLayout[]): number {
  if (layout.length === 0) return 0;
  const premier = layout[0];
  const dernier = layout[layout.length - 1];
  return dernier.x + dernier.radius - (premier.x - premier.radius);
}
