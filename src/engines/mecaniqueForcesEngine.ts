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

// ============================================================
// Types de forces — concept prescrit ATS. Portée confirmée dans la
// Progression des apprentissages : « reconnaître différents types de
// forces dans des objets techniques ou des systèmes technologiques
// (ex. la force gravitationnelle dans une glissoire, la force
// magnétique exercée par un électroaimant) ».
// ============================================================

export interface ExempleTypeForce {
  id: string;
  situation: string;
  typeForce: string;
}

export const BANQUE_TYPES_FORCES: ExempleTypeForce[] = [
  { id: "glissoire", situation: "un enfant qui descend une glissoire", typeForce: "la force gravitationnelle" },
  { id: "electroaimant", situation: "une pièce de métal attirée par un électroaimant", typeForce: "la force magnétique" },
  { id: "ressort-comprime", situation: "un ressort comprimé qui repousse un objet", typeForce: "la force élastique" },
  { id: "frottement-freinage", situation: "les patins d'un vélo qui ralentissent la roue par contact", typeForce: "la force de frottement" },
];

export function exempleTypeForceAleatoire(): ExempleTypeForce {
  return BANQUE_TYPES_FORCES[Math.floor(Math.random() * BANQUE_TYPES_FORCES.length)];
}

// ============================================================
// Équilibre de deux forces — concept prescrit ATS. Portée confirmée :
// « décrire les conditions dans lesquelles un corps soumis à deux
// forces peut être en équilibre ».
// ============================================================

export interface AffirmationEquilibreForces {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_EQUILIBRE_FORCES: AffirmationEquilibreForces[] = [
  {
    id: "equilibre-meme-grandeur-sens-oppose",
    affirmation:
      "Un corps soumis à deux forces est en équilibre si ces deux forces ont la même grandeur, agissent sur la même droite et sont de sens opposés.",
    correcte: true,
    explication: "C'est exactement la condition d'équilibre de deux forces : même grandeur, même droite d'action, sens opposés — leur somme (résultante) est alors nulle.",
  },
  {
    id: "equilibre-meme-sens",
    affirmation: "Deux forces de même grandeur et de même sens, appliquées sur un corps, le maintiennent en équilibre.",
    correcte: false,
    explication: "Faux : si les deux forces vont dans le même sens, elles s'additionnent au lieu de s'annuler — le corps n'est pas en équilibre, il accélère dans ce sens.",
  },
  {
    id: "equilibre-grandeurs-differentes",
    affirmation: "Deux forces de grandeurs différentes, même si elles sont de sens opposés, ne mettent pas un corps en équilibre.",
    correcte: true,
    explication: "Si les grandeurs diffèrent, la résultante n'est pas nulle même si les sens sont opposés : le corps n'est donc pas en équilibre, il se déplace dans le sens de la force la plus grande.",
  },
];

export function affirmationEquilibreAleatoire(): AffirmationEquilibreForces {
  return BANQUE_EQUILIBRE_FORCES[Math.floor(Math.random() * BANQUE_EQUILIBRE_FORCES.length)];
}
