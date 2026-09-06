/**
 * libellesPratique.ts
 * ------------------------------------------------------------------
 * curriculum.ts reste une transcription fidèle du Document
 * d'information du MEQ (sections A/B/C, pondération officielle) —
 * cette exactitude ne doit jamais être compromise.
 *
 * Ce fichier fait la traduction entre cette structure officielle et
 * le vocabulaire montré à l'élève. Consigne mise à jour à la demande
 * explicite de l'utilisateur : les trois modules reprennent
 * maintenant les noms de section réels de l'épreuve unique
 * (Questions à choix multiple / à réponse construite / d'analyse
 * technologique) — ce sont des noms génériques de structure
 * d'épreuve, pas du contenu confidentiel d'une épreuve précise.
 * ------------------------------------------------------------------
 */

import type { SectionEpreuve } from "../types/curriculum";

export interface LibellePratique {
  titre: string;
  description: string;
  /** clé d'icône, résolue dans le composant (voir ModuleIcon) */
  icone: "eclair" | "regle" | "engrenage";
}

export const LIBELLES_MODULES: Record<SectionEpreuve, LibellePratique> = {
  A: {
    titre: "Questions à choix multiple",
    description:
      "Vérifie ta compréhension des concepts clés, un choix à la fois.",
    icone: "eclair",
  },
  B: {
    titre: "Questions à réponse construite",
    description:
      "Applique une formule, montre ta démarche, arrive à la bonne réponse.",
    icone: "regle",
  },
  C: {
    titre: "Questions d'analyse technologique",
    description:
      "Étudie un mécanisme ou un objet et explique son fonctionnement.",
    icone: "engrenage",
  },
};

/** Couleurs de segment pour la barre de répartition, cohérentes avec les tokens CSS. */
export const COULEURS_SEGMENTS: Record<SectionEpreuve, string> = {
  A: "var(--cobalt)",
  B: "var(--brass)",
  C: "var(--ink)",
};
