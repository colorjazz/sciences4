export interface GearSpec {
  id: string;
  /** Nombre de dents — détermine le rayon, proportionnellement */
  teeth: number;
  /** Vitesse de rotation relative (unité arbitraire, cohérente entre tous les engrenages du train) */
  speed: number;
  /** Sens de rotation : 1 = horaire (vue de face), -1 = antihoraire */
  direction: 1 | -1;
}

export interface GearTrainData {
  gears: GearSpec[];
}

// ============================================================
// Systèmes de transmission du mouvement (rotation → rotation)
// ============================================================

export interface DonneesTransmissionSimple {
  liaison: "roues-friction" | "poulie-courroie" | "roue-chaine";
  entree: { id: string; rayon: number; dents?: number; sens: 1 | -1 };
  sortie: { id: string; rayon: number; dents?: number };
}

export interface DonneesVisSansFin {
  dentsRoue: number;
  nombreFilets: number;
  sensVis: 1 | -1;
}

// ============================================================
// Systèmes de transformation du mouvement (rotation ↔ translation)
// ============================================================

export interface DonneesPignonCremaillere {
  rayonPignon: number;
  dentsPignon: number;
  /** Vitesse angulaire de consigne (rad/s), utilisée pour le calcul demandé à l'élève */
  vitesseAngulaire: number;
  sensRotation: 1 | -1;
}

export interface DonneesVisEcrou {
  pasMm: number;
  nombreTours: number;
  /** Vitesse angulaire purement visuelle, pour l'animation */
  vitesseAngulaireAnimation: number;
}

export interface DonneesCame {
  rayonCame: number;
  excentricite: number;
  vitesseAngulaireAnimation: number;
}

export interface DonneesBielleManivelle {
  rayonManivelle: number;
  longueurBielle: number;
  vitesseAngulaireAnimation: number;
}

/** Union discriminée : toute question d'analyse porte sur un seul de ces mécanismes. */
export type DonneesMecanisme =
  | { type: "trainEngrenages"; data: GearTrainData }
  | { type: "transmissionSimple"; data: DonneesTransmissionSimple }
  | { type: "visSansFin"; data: DonneesVisSansFin }
  | { type: "pignonCremaillere"; data: DonneesPignonCremaillere }
  | { type: "visEcrou"; data: DonneesVisEcrou }
  | { type: "came"; data: DonneesCame }
  | { type: "bielleManivelle"; data: DonneesBielleManivelle };

/** Juste le discriminant "type" des 7 variantes ci-dessus, utile pour des tables de configuration génériques. */
export type TypeMecanisme = DonneesMecanisme["type"];
