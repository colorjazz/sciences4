/**
 * electriciteEngine.ts
 * ------------------------------------------------------------------
 * Moteur déterministe pour les calculs d'électricité (U=RI, P=UI,
 * E=PΔt, rendement énergétique). PUR TypeScript, sans appel à
 * Gemini : ce moteur EST la source de vérité pour la correction.
 *
 * Principe (identique à math4) : Gemini génère l'énoncé/le contexte
 * narratif, ce moteur calcule la bonne réponse et valide la démarche
 * de l'élève, incluant la conversion d'unités — piège le plus
 * fréquent identifié (mA→A, ms→s, Wh→kWh, minutes→secondes).
 * ------------------------------------------------------------------
 */

// ============================================================
// Conversion d'unités
// ============================================================

export type UniteTemps = "ms" | "s" | "min" | "h";
export type UniteCourant = "mA" | "A";
export type UniteEnergie = "J" | "kJ" | "Wh" | "kWh";

const FACTEURS_TEMPS_VERS_SECONDES: Record<UniteTemps, number> = {
  ms: 0.001,
  s: 1,
  min: 60,
  h: 3600,
};

const FACTEURS_COURANT_VERS_AMPERES: Record<UniteCourant, number> = {
  mA: 0.001,
  A: 1,
};

const FACTEURS_ENERGIE_VERS_JOULES: Record<UniteEnergie, number> = {
  J: 1,
  kJ: 1000,
  Wh: 3600,
  kWh: 3_600_000, // conforme à la grandeur officielle de l'Annexe IV/V : 1 kWh = 3 600 000 J
};

export function convertirVersSecondes(valeur: number, unite: UniteTemps): number {
  return valeur * FACTEURS_TEMPS_VERS_SECONDES[unite];
}

export function convertirVersAmperes(valeur: number, unite: UniteCourant): number {
  return valeur * FACTEURS_COURANT_VERS_AMPERES[unite];
}

export function convertirVersJoules(valeur: number, unite: UniteEnergie): number {
  return valeur * FACTEURS_ENERGIE_VERS_JOULES[unite];
}

// ============================================================
// Calculs — Loi d'Ohm : U = R I
// ============================================================

export interface ResultatOhm {
  tensionV: number;
  resistanceOhm: number;
  courantA: number;
}

/** Calcule la variable manquante parmi U, R, I. Fournir exactement deux valeurs. */
export function resoudreLoiOhm(params: {
  tensionV?: number;
  resistanceOhm?: number;
  courantA?: number;
}): ResultatOhm {
  const { tensionV, resistanceOhm, courantA } = params;

  if (tensionV === undefined && resistanceOhm !== undefined && courantA !== undefined) {
    return { tensionV: resistanceOhm * courantA, resistanceOhm, courantA };
  }
  if (resistanceOhm === undefined && tensionV !== undefined && courantA !== undefined) {
    if (courantA === 0) throw new Error("Division par zéro : le courant ne peut pas être 0 A.");
    return { tensionV, resistanceOhm: tensionV / courantA, courantA };
  }
  if (courantA === undefined && tensionV !== undefined && resistanceOhm !== undefined) {
    if (resistanceOhm === 0) throw new Error("Division par zéro : la résistance ne peut pas être 0 Ω.");
    return { tensionV, resistanceOhm, courantA: tensionV / resistanceOhm };
  }

  throw new Error(
    "resoudreLoiOhm attend exactement deux des trois valeurs (tensionV, resistanceOhm, courantA)."
  );
}

// ============================================================
// Calculs — Puissance : P = U I
// ============================================================

export interface ResultatPuissance {
  puissanceW: number;
  tensionV: number;
  courantA: number;
}

export function resoudrePuissance(params: {
  puissanceW?: number;
  tensionV?: number;
  courantA?: number;
}): ResultatPuissance {
  const { puissanceW, tensionV, courantA } = params;

  if (puissanceW === undefined && tensionV !== undefined && courantA !== undefined) {
    return { puissanceW: tensionV * courantA, tensionV, courantA };
  }
  if (tensionV === undefined && puissanceW !== undefined && courantA !== undefined) {
    if (courantA === 0) throw new Error("Division par zéro : le courant ne peut pas être 0 A.");
    return { puissanceW, tensionV: puissanceW / courantA, courantA };
  }
  if (courantA === undefined && puissanceW !== undefined && tensionV !== undefined) {
    if (tensionV === 0) throw new Error("Division par zéro : la tension ne peut pas être 0 V.");
    return { puissanceW, tensionV, courantA: puissanceW / tensionV };
  }

  throw new Error(
    "resoudrePuissance attend exactement deux des trois valeurs (puissanceW, tensionV, courantA)."
  );
}

// ============================================================
// Calculs — Énergie consommée : E = P Δt
// ============================================================

/**
 * Calcule l'énergie consommée en joules.
 * @param puissanceW Puissance en watts
 * @param deltaTemps Durée, dans l'unité fournie
 * @param uniteTemps Unité de la durée fournie (converti en secondes en interne)
 */
export function calculerEnergieJoules(
  puissanceW: number,
  deltaTemps: number,
  uniteTemps: UniteTemps
): number {
  const deltaTSecondes = convertirVersSecondes(deltaTemps, uniteTemps);
  return puissanceW * deltaTSecondes;
}

export function joulesVersKilowattheures(joules: number): number {
  return joules / FACTEURS_ENERGIE_VERS_JOULES.kWh;
}

// ============================================================
// Calculs — Rendement énergétique
// ============================================================

/**
 * Rendement énergétique (%) = (énergie utile / énergie consommée) × 100
 * Les deux valeurs doivent être dans la même unité.
 */
export function calculerRendementEnergetique(
  energieUtile: number,
  energieConsommee: number
): number {
  if (energieConsommee === 0) {
    throw new Error("Division par zéro : l'énergie consommée ne peut pas être 0.");
  }
  return (energieUtile / energieConsommee) * 100;
}

// ============================================================
// Validation de la démarche de l'élève (Partie B)
// ============================================================

export interface EtapeDemarcheElectricite {
  formuleEcrite: boolean; // l'élève a-t-il écrit la formule ?
  substitutionCorrecte: boolean; // la substitution numérique avec unités est-elle correcte ?
  reponseFinale: number;
  toleranceRelative?: number; // ex: 0.01 pour ±1%, utile si arrondis intermédiaires
}

export interface ResultatValidation {
  correct: boolean;
  ecartRelatif: number | null;
  messages: string[];
}

/**
 * Compare la réponse finale de l'élève à la réponse calculée par ce moteur
 * (jamais à une réponse générée par Gemini). Donne aussi un diagnostic sur
 * les étapes de démarche manquantes, conformément aux critères MEQ
 * (formule + substitution + réponse avec unités).
 */
export function validerReponseElectricite(
  reponseAttendue: number,
  demarche: EtapeDemarcheElectricite
): ResultatValidation {
  const tolerance = demarche.toleranceRelative ?? 0.01;
  const ecartRelatif =
    reponseAttendue === 0
      ? Math.abs(demarche.reponseFinale)
      : Math.abs((demarche.reponseFinale - reponseAttendue) / reponseAttendue);

  const messages: string[] = [];
  if (!demarche.formuleEcrite) {
    messages.push("La formule utilisée n'est pas explicitement inscrite.");
  }
  if (!demarche.substitutionCorrecte) {
    messages.push("La substitution numérique (avec unités) contient une erreur.");
  }

  const correct = ecartRelatif <= tolerance && demarche.formuleEcrite && demarche.substitutionCorrecte;

  if (correct) {
    messages.push("Réponse finale conforme à la valeur attendue.");
  } else if (ecartRelatif > tolerance) {
    messages.push(
      `Réponse finale hors tolérance (écart relatif de ${(ecartRelatif * 100).toFixed(1)} %). ` +
        "Vérifier une possible erreur de conversion d'unités."
    );
  }

  return { correct, ecartRelatif, messages };
}
