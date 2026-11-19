/**
 * cinematiqueEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Cinématique" — Physique, 5e secondaire. Portée confirmée :
 * système de référence, mouvement rectiligne uniforme (MRU), mouvement
 * rectiligne uniformément accéléré (MRUA), vitesse moyenne et
 * instantanée, chute libre, mouvement sur un plan incliné, mouvement
 * des projectiles.
 * ------------------------------------------------------------------
 */

/** Accélération gravitationnelle terrestre, en m/s². */
export const G_TERRESTRE = 9.8;

// ------------------------------------------------------------
// Mouvement rectiligne uniforme (MRU) : Δs = vΔt
// ------------------------------------------------------------

export function resoudreDeplacementMRU(params: { vitesseMS: number; dureeS: number }): { deplacementM: number } {
  return { deplacementM: params.vitesseMS * params.dureeS };
}

export function resoudreVitesseMRU(params: { deplacementM: number; dureeS: number }): { vitesseMS: number } {
  return { vitesseMS: params.deplacementM / params.dureeS };
}

// ------------------------------------------------------------
// Mouvement rectiligne uniformément accéléré (MRUA)
// a = Δv/Δt ; Δs = viΔt + ½aΔt²
// ------------------------------------------------------------

export function resoudreAccelerationMRUA(params: { viMS: number; vfMS: number; dureeS: number }): { accelerationMS2: number } {
  return { accelerationMS2: (params.vfMS - params.viMS) / params.dureeS };
}

export function resoudreVitesseFinaleMRUA(params: { viMS: number; accelerationMS2: number; dureeS: number }): { vfMS: number } {
  return { vfMS: params.viMS + params.accelerationMS2 * params.dureeS };
}

export function resoudreDeplacementMRUA(params: { viMS: number; accelerationMS2: number; dureeS: number }): { deplacementM: number } {
  return { deplacementM: params.viMS * params.dureeS + 0.5 * params.accelerationMS2 * params.dureeS * params.dureeS };
}

// ------------------------------------------------------------
// Chute libre — cas particulier du MRUA avec a = g
// ------------------------------------------------------------

export function resoudreChuteLibre(params: { viMS: number; dureeS: number }): { vfMS: number; deplacementM: number } {
  const vfMS = params.viMS + G_TERRESTRE * params.dureeS;
  const deplacementM = params.viMS * params.dureeS + 0.5 * G_TERRESTRE * params.dureeS * params.dureeS;
  return { vfMS, deplacementM };
}

export function resoudreTempsChuteLibre(params: { hauteurM: number }): { dureeS: number } {
  return { dureeS: Math.sqrt((2 * params.hauteurM) / G_TERRESTRE) };
}

// ------------------------------------------------------------
// Mouvement sur un plan incliné — composante de g parallèle au plan
// ------------------------------------------------------------

export function resoudreAccelerationPlanIncline(params: { angleDegres: number }): { accelerationMS2: number } {
  return { accelerationMS2: G_TERRESTRE * Math.sin((params.angleDegres * Math.PI) / 180) };
}

// ------------------------------------------------------------
// Mouvement des projectiles — lancement horizontal (combinaison
// MRU horizontal + MRUA vertical en chute libre)
// ------------------------------------------------------------

export function resoudreProjectileHorizontal(params: { vitesseHorizontaleMS: number; dureeS: number }): { distanceHorizontaleM: number } {
  return { distanceHorizontaleM: params.vitesseHorizontaleMS * params.dureeS };
}

export function resoudreProjectileChuteVerticale(params: { dureeS: number }): { chuteVerticaleM: number } {
  return { chuteVerticaleM: 0.5 * G_TERRESTRE * params.dureeS * params.dureeS };
}

export function resoudreProjectileTempsChute(params: { hauteurInitialeM: number }): { dureeS: number } {
  return { dureeS: Math.sqrt((2 * params.hauteurInitialeM) / G_TERRESTRE) };
}

// ------------------------------------------------------------
// Vitesse moyenne vs vitesse instantanée — distinction qualitative
// ------------------------------------------------------------

export interface AffirmationVitesseMoyInstant {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_VITESSE_MOY_INSTANT: AffirmationVitesseMoyInstant[] = [
  {
    id: "vitesse-moyenne-ensemble",
    affirmation: "La vitesse moyenne d'un objet tient compte de tout le trajet parcouru et de la durée totale du déplacement.",
    correcte: true,
    explication: "La vitesse moyenne se calcule sur l'ensemble du trajet (déplacement total / temps total), contrairement à la vitesse instantanée qui ne décrit qu'un seul instant.",
  },
  {
    id: "vitesse-instantanee-moment-precis",
    affirmation: "La vitesse instantanée correspond à la vitesse d'un objet à un instant précis, qui peut différer de sa vitesse moyenne sur tout le trajet.",
    correcte: true,
    explication: "La vitesse instantanée est la vitesse « vue à l'horloge » à un moment donné — un objet qui accélère ou ralentit a une vitesse instantanée qui varie, même si sa vitesse moyenne reste fixe.",
  },
  {
    id: "vitesse-moyenne-toujours-egale",
    affirmation: "La vitesse moyenne et la vitesse instantanée d'un objet sont toujours égales, peu importe le mouvement.",
    correcte: false,
    explication: "Faux : elles ne sont égales que dans un mouvement rectiligne uniforme (vitesse constante). Dès qu'il y a accélération, la vitesse instantanée varie dans le temps alors que la vitesse moyenne reste une seule valeur globale.",
  },
];

export function affirmationVitesseMoyInstantAleatoire(): AffirmationVitesseMoyInstant {
  return BANQUE_VITESSE_MOY_INSTANT[Math.floor(Math.random() * BANQUE_VITESSE_MOY_INSTANT.length)];
}
