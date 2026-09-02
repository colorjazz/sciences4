/**
 * materiauxEngine.ts
 * ------------------------------------------------------------------
 * Concept prescrit ST : "Types et propriétés" (alliages à base de fer,
 * métaux et alliages non ferreux, matières plastiques, bois). Table
 * de référence vérifiée, même logique que liaisonsEngine.ts.
 * ------------------------------------------------------------------
 */

export type CategorieMateriau =
  | "metal-ferreux"
  | "metal-non-ferreux"
  | "thermoplastique"
  | "thermodurcissable"
  | "bois";

export interface Materiau {
  id: string;
  nom: string;
  categorie: CategorieMateriau;
  proprietesCles: string[];
  exempleUsage: string;
}

export const BANQUE_MATERIAUX: Materiau[] = [
  {
    id: "acier",
    nom: "acier (alliage à base de fer)",
    categorie: "metal-ferreux",
    proprietesCles: [
      "grande résistance mécanique",
      "bonne dureté",
      "sensible à la corrosion (rouille) s'il n'est pas protégé",
    ],
    exempleUsage: "pièces structurales soumises à de fortes contraintes",
  },
  {
    id: "aluminium",
    nom: "aluminium",
    categorie: "metal-non-ferreux",
    proprietesCles: ["léger", "résiste bien à la corrosion", "bon conducteur thermique et électrique"],
    exempleUsage: "boîtiers ou pièces où la légèreté est un avantage",
  },
  {
    id: "thermoplastique",
    nom: "matière thermoplastique (ex. ABS, polyéthylène)",
    categorie: "thermoplastique",
    proprietesCles: [
      "se ramollit et se remoule sous la chaleur",
      "bon isolant électrique",
      "peu coûteux à produire en grande série",
    ],
    exempleUsage: "boîtiers de petits appareils électroménagers",
  },
  {
    id: "thermodurcissable",
    nom: "matière thermodurcissable (ex. bakélite)",
    categorie: "thermodurcissable",
    proprietesCles: [
      "conserve sa forme même sous la chaleur une fois durcie",
      "résiste bien à la chaleur",
      "cassante, ne peut pas être refondue",
    ],
    exempleUsage: "poignées de casserole, prises électriques",
  },
  {
    id: "bois",
    nom: "bois",
    categorie: "bois",
    proprietesCles: [
      "bon isolant électrique et thermique",
      "propriétés variables selon l'essence",
      "sensible à l'humidité",
    ],
    exempleUsage: "manches d'outils, meubles",
  },
];

export function choisirMateriauAleatoire(): Materiau {
  return BANQUE_MATERIAUX[Math.floor(Math.random() * BANQUE_MATERIAUX.length)];
}

export function trouverMateriauParId(id: string): Materiau | undefined {
  return BANQUE_MATERIAUX.find((m) => m.id === id);
}
