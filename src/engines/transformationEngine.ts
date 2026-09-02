/**
 * transformationEngine.ts
 * ------------------------------------------------------------------
 * Systèmes où le mouvement change de nature (rotation ↔ translation).
 * Concept prescrit ST : "Fonction, composantes et utilisation des
 * systèmes de transformation du mouvement (vis et écrou, cames,
 * bielles, manivelles, coulisses et systèmes bielle et manivelle,
 * pignon et crémaillère)".
 *
 * Simplifications documentées ci-dessous, assumées pour rester dans
 * la portée d'un cours de 4e secondaire :
 * - Bielle-manivelle : formule EXACTE (pas une approximation
 *   sinusoïdale), en supposant que le piston est parfaitement aligné
 *   avec l'axe de rotation de la manivelle (aucun déport latéral).
 * - Came : profil circulaire excentrique uniquement (le cas le plus
 *   simple et le plus enseigné) — pas de profil complexe/développante.
 * ------------------------------------------------------------------
 */

// ============================================================
// Pignon et crémaillère
// ============================================================

export interface ResultatPignonCremaillere {
  /** v = ω × r, vitesse linéaire de la crémaillère */
  vitesseLineaire: number;
  reversible: true;
}

export function calculerPignonCremaillere(
  rayonPignon: number,
  vitesseAngulaire: number
): ResultatPignonCremaillere {
  return {
    vitesseLineaire: rayonPignon * vitesseAngulaire,
    reversible: true,
  };
}

// ============================================================
// Vis et écrou
// ============================================================

export interface ResultatVisEcrou {
  /** déplacement = pas × nombre de tours */
  deplacementMm: number;
  /** Généralement non réversible pour un filet standard (auto-blocage par friction) */
  reversible: false;
}

export function calculerVisEcrou(pasMm: number, nombreTours: number): ResultatVisEcrou {
  return {
    deplacementMm: pasMm * nombreTours,
    reversible: false,
  };
}

// ============================================================
// Came circulaire excentrique
// ============================================================

/**
 * Position du poussoir en contact avec une came circulaire dont l'axe de
 * rotation est décalé du centre géométrique de `excentricite`. Formule
 * exacte pour ce profil simple : d(θ) = e·cos θ + √(R² − e²·sin²θ).
 */
export function positionPoussoirCameExcentrique(
  rayonCame: number,
  excentricite: number,
  angleRad: number
): number {
  const terme = rayonCame ** 2 - (excentricite * Math.sin(angleRad)) ** 2;
  return excentricite * Math.cos(angleRad) + Math.sqrt(Math.max(0, terme));
}

/** Course totale (déplacement max − min) du poussoir = 2 × excentricité, pour ce profil. */
export function calculerCourseCame(excentricite: number): number {
  return 2 * excentricite;
}

// ============================================================
// Bielle et manivelle
// ============================================================

/**
 * Position exacte du piston pour un système bielle-manivelle classique
 * (piston aligné avec l'axe de rotation de la manivelle) :
 * x(θ) = r·cos θ + √(L² − r²·sin²θ), où r = rayon manivelle, L = longueur bielle.
 */
export function positionPiston(
  rayonManivelle: number,
  longueurBielle: number,
  angleRad: number
): number {
  const terme = longueurBielle ** 2 - (rayonManivelle * Math.sin(angleRad)) ** 2;
  return rayonManivelle * Math.cos(angleRad) + Math.sqrt(Math.max(0, terme));
}

/** Course totale du piston = 2 × rayon de la manivelle. */
export function calculerCourseManivelle(rayonManivelle: number): number {
  return 2 * rayonManivelle;
}
