/**
 * mecaniqueEngine.ts
 * ------------------------------------------------------------------
 * Moteur déterministe pour l'analyse de trains d'engrenages simples
 * (transmission du mouvement, Univers technologique — commun à ST et
 * ATS). Sert principalement la Section C (analyse technique).
 * ------------------------------------------------------------------
 */

export type SensRotation = "horaire" | "antihoraire";

export interface Engrenage {
  id: string;
  nombreDents: number;
}

/**
 * Un train d'engrenages simple : une chaîne d'engrenages en prise directe
 * (chaque paire adjacente engrène directement, pas de courroie/chaîne).
 * Chaque engrènement direct inverse le sens de rotation.
 */
export interface TrainEngrenages {
  engrenages: Engrenage[];
  sensRotationEntree: SensRotation;
}

function inverser(sens: SensRotation): SensRotation {
  return sens === "horaire" ? "antihoraire" : "horaire";
}

/**
 * Calcule le sens de rotation de chaque engrenage de la chaîne.
 * Retourne un tableau parallèle à `train.engrenages`.
 */
export function calculerSensRotation(train: TrainEngrenages): SensRotation[] {
  const sens: SensRotation[] = [train.sensRotationEntree];
  for (let i = 1; i < train.engrenages.length; i++) {
    sens.push(inverser(sens[i - 1]));
  }
  return sens;
}

/**
 * Rapport de vitesse entre l'engrenage d'entrée et un engrenage de sortie :
 * vitesse_sortie / vitesse_entrée = dents_entrée / dents_sortie.
 * Un rapport > 1 signifie que la sortie tourne plus vite que l'entrée.
 */
export function calculerRapportVitesse(
  train: TrainEngrenages,
  indexEntree: number,
  indexSortie: number
): number {
  const dentsEntree = train.engrenages[indexEntree].nombreDents;
  const dentsSortie = train.engrenages[indexSortie].nombreDents;
  if (dentsSortie === 0) throw new Error("Nombre de dents de sortie ne peut pas être 0.");
  return dentsEntree / dentsSortie;
}

/** Retourne l'engrenage qui tourne le plus vite dans la chaîne (le moins de dents). */
export function trouverEngrenagePlusRapide(train: TrainEngrenages): Engrenage {
  return train.engrenages.reduce((plusRapide, courant) =>
    courant.nombreDents < plusRapide.nombreDents ? courant : plusRapide
  );
}

/** Génère un train d'engrenages aléatoire mais réaliste (2 à 3 engrenages, dents entre 10 et 60). */
export function genererTrainAleatoire(nombreEngrenages: 2 | 3 = 2): TrainEngrenages {
  const engrenages: Engrenage[] = [];
  const lettres = ["A", "B", "C"];
  for (let i = 0; i < nombreEngrenages; i++) {
    const dents = Math.floor(Math.random() * 11) * 5 + 10; // 10, 15, ..., 60
    engrenages.push({ id: lettres[i], nombreDents: dents });
  }
  const sensRotationEntree: SensRotation = Math.random() < 0.5 ? "horaire" : "antihoraire";
  return { engrenages, sensRotationEntree };
}
