/**
 * libellesPratique.ts
 * ------------------------------------------------------------------
 * curriculum.ts reste une transcription fidèle du Document
 * d'information du MEQ (sections A/B/C, pondération officielle) —
 * cette exactitude ne doit jamais être compromise.
 *
 * Ce fichier fait la traduction entre cette structure officielle et
 * le vocabulaire montré à l'élève. Consigne : ne jamais utiliser les
 * mots "épreuve", "examen" ou "ministériel" dans les libellés
 * destinés à l'interface. L'élève pratique des habiletés, il ne
 * "simule" pas un examen.
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
    titre: "Questions rapides",
    description:
      "Vérifie ta compréhension des concepts clés, un choix à la fois.",
    icone: "eclair",
  },
  B: {
    titre: "Résolution guidée",
    description:
      "Applique une formule, montre ta démarche, arrive à la bonne réponse.",
    icone: "regle",
  },
  C: {
    titre: "Analyse technique",
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
