/**
 * ingenierieElectriqueEngine.ts
 * ------------------------------------------------------------------
 * Concepts prescrits ST/ATS : "Fonction d'alimentation", "Fonction de
 * conduction, d'isolation et de protection", "Fonction de commande",
 * "Fonction de transformation de l'énergie" — sous-thème Ingénierie
 * électrique (Univers technologique).
 *
 * Portée confirmée dans la Progression des apprentissages (MEQ,
 * 2011), section Ingénierie électrique, colonne 4e secondaire —
 * chaque banque ci-dessous reprend les exemples et la portée exacts
 * du document (sources de courant, types d'interrupteurs, code de
 * couleurs des résistors, transformations d'énergie).
 * ------------------------------------------------------------------
 */

// ============================================================
// Fonction de conduction — code de couleurs des résistors (4 bandes)
// ============================================================

export const COULEURS_CHIFFRE: { nom: string; valeur: number }[] = [
  { nom: "noir", valeur: 0 },
  { nom: "brun", valeur: 1 },
  { nom: "rouge", valeur: 2 },
  { nom: "orange", valeur: 3 },
  { nom: "jaune", valeur: 4 },
  { nom: "vert", valeur: 5 },
  { nom: "bleu", valeur: 6 },
  { nom: "violet", valeur: 7 },
  { nom: "gris", valeur: 8 },
  { nom: "blanc", valeur: 9 },
];

export interface ResistorColore {
  bande1: string;
  bande2: string;
  bandeMultiplicateur: string;
  resistanceOhm: number;
}

/** Résistor à 4 bandes (2 chiffres + multiplicateur + tolérance dorée, non testée ici). */
export function genererResistorAleatoire(): ResistorColore {
  const chiffre1 = COULEURS_CHIFFRE[1 + Math.floor(Math.random() * 9)]; // jamais noir en 1re bande (valeur non nulle)
  const chiffre2 = COULEURS_CHIFFRE[Math.floor(Math.random() * 10)];
  const exposant = Math.floor(Math.random() * 4); // ×1 à ×1000
  const multiplicateur = COULEURS_CHIFFRE[exposant];
  const resistanceOhm = (chiffre1.valeur * 10 + chiffre2.valeur) * 10 ** exposant;

  return {
    bande1: chiffre1.nom,
    bande2: chiffre2.nom,
    bandeMultiplicateur: multiplicateur.nom,
    resistanceOhm,
  };
}

// ============================================================
// Fonction d'alimentation — sources de courant électrique
// ============================================================

export interface SourceAlimentation {
  id: string;
  nom: string;
  description: string;
}

export const BANQUE_SOURCES_ALIMENTATION: SourceAlimentation[] = [
  { id: "pile-chimique", nom: "une pile chimique", description: "transforme l'énergie chimique en énergie électrique" },
  { id: "pile-solaire", nom: "une pile solaire", description: "transforme l'énergie rayonnante (lumière) en énergie électrique" },
  { id: "alternateur", nom: "un alternateur", description: "transforme l'énergie mécanique (mouvement) en énergie électrique" },
  { id: "thermocouple", nom: "un thermocouple", description: "transforme une différence de température en énergie électrique" },
  { id: "piezoelectrique", nom: "un dispositif piézoélectrique", description: "transforme une contrainte mécanique (pression, vibration) en énergie électrique" },
];

export function sourceAlimentationAleatoire(): SourceAlimentation {
  return BANQUE_SOURCES_ALIMENTATION[Math.floor(Math.random() * BANQUE_SOURCES_ALIMENTATION.length)];
}

// ============================================================
// Fonction de commande — types d'interrupteurs
// ============================================================

export interface TypeInterrupteur {
  id: string;
  nom: string;
  description: string;
}

export const BANQUE_INTERRUPTEURS: TypeInterrupteur[] = [
  { id: "levier", nom: "à levier", description: "actionné en basculant un petit bras rigide" },
  { id: "poussoir", nom: "poussoir", description: "actionné en appuyant, reprend sa position au relâchement" },
  { id: "bascule", nom: "à bascule", description: "actionné en basculant d'une position à l'autre (ex. interrupteur mural)" },
  { id: "magnetique", nom: "à commande magnétique", description: "actionné par la proximité d'un aimant, sans contact direct" },
];

export function interrupteurAleatoire(): TypeInterrupteur {
  return BANQUE_INTERRUPTEURS[Math.floor(Math.random() * BANQUE_INTERRUPTEURS.length)];
}

// ============================================================
// Fonction de transformation de l'énergie (dans un circuit)
// ============================================================

export interface TransformationEnergieElec {
  id: string;
  composant: string;
  transformation: string;
}

/**
 * Électricité → lumière, chaleur, vibration ou magnétisme — les quatre
 * formes explicitement nommées dans le libellé officiel du concept
 * (curriculum.ts, st-ut-transformation-energie-elec). Un moteur
 * (électricité → mouvement) n'y figure pas : volontairement exclu.
 */
export const BANQUE_TRANSFORMATIONS_ELEC: TransformationEnergieElec[] = [
  { id: "ampoule", composant: "une ampoule", transformation: "lumière et chaleur" },
  { id: "grille-pain", composant: "l'élément chauffant d'un grille-pain", transformation: "chaleur" },
  { id: "haut-parleur", composant: "un haut-parleur", transformation: "vibration (son)" },
  { id: "electroaimant", composant: "un électroaimant", transformation: "magnétisme" },
];

export function transformationElecAleatoire(): TransformationEnergieElec {
  return BANQUE_TRANSFORMATIONS_ELEC[Math.floor(Math.random() * BANQUE_TRANSFORMATIONS_ELEC.length)];
}
