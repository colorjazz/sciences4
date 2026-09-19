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
  | "bois"
  | "ceramique";

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
  {
    id: "ceramique",
    nom: "céramique",
    categorie: "ceramique",
    proprietesCles: [
      "bonne résistance à la chaleur",
      "grande dureté",
      "bonne résistance à l'usure",
      "cassante (faible résistance aux chocs)",
    ],
    exempleUsage: "revêtement intérieur des fours",
  },
];

export function choisirMateriauAleatoire(): Materiau {
  return BANQUE_MATERIAUX[Math.floor(Math.random() * BANQUE_MATERIAUX.length)];
}

export function trouverMateriauParId(id: string): Materiau | undefined {
  return BANQUE_MATERIAUX.find((m) => m.id === id);
}

// ============================================================
// Contraintes mécaniques — traction, compression, torsion, flexion,
// cisaillement (concept prescrit "Contraintes", portée confirmée
// dans la Progression des apprentissages : les cinq types sont
// prescrits pour ST en 4e secondaire).
// ============================================================

export type TypeContrainte = "traction" | "compression" | "torsion" | "flexion" | "cisaillement";

export interface ScenarioContrainte {
  id: string;
  situation: string;
  type: TypeContrainte;
  explication: string;
}

export const BANQUE_CONTRAINTES: ScenarioContrainte[] = [
  {
    id: "corde-tiree",
    situation: "une corde d'escalade tirée par le grimpeur à ses deux extrémités",
    type: "traction",
    explication: "Les deux extrémités sont tirées en sens opposés vers l'extérieur : la pièce s'étire, c'est de la traction.",
  },
  {
    id: "poteau-charge",
    situation: "un poteau de bois qui supporte le poids d'un toit",
    type: "compression",
    explication: "Le poteau est écrasé par une charge dirigée vers l'intérieur, dans le sens de sa longueur : c'est de la compression.",
  },
  {
    id: "tournevis",
    situation: "la tige d'un tournevis qu'on tord pour visser une vis coincée",
    type: "torsion",
    explication: "La tige subit une rotation en sens opposé à ses deux extrémités : c'est de la torsion.",
  },
  {
    id: "tremplin",
    situation: "un tremplin de piscine plié vers le bas sous le poids d'un plongeur",
    type: "flexion",
    explication: "La pièce se courbe sous une charge perpendiculaire à sa longueur : c'est de la flexion.",
  },
  {
    id: "ciseaux",
    situation: "une feuille de papier coupée par des ciseaux",
    type: "cisaillement",
    explication: "Deux forces opposées glissent l'une contre l'autre de part et d'autre d'un même plan : c'est du cisaillement.",
  },
];

export function scenarioContrainteAleatoire(): ScenarioContrainte {
  return BANQUE_CONTRAINTES[Math.floor(Math.random() * BANQUE_CONTRAINTES.length)];
}

// ============================================================
// Modification des propriétés (dégradation, protection) — concept
// prescrit commun à ST et ATS. Portée confirmée dans les deux
// Progressions des apprentissages : « décrire différents traitements
// pour contrer la dégradation des matériaux (ex. plaquage des
// métaux, traitement antirouille à l'huile, peinture) ».
// ============================================================

export interface TraitementDegradation {
  id: string;
  nom: string;
  role: string;
}

export const BANQUE_TRAITEMENTS_DEGRADATION: TraitementDegradation[] = [
  { id: "plaquage", nom: "le plaquage des métaux", role: "recouvre le métal d'une fine couche d'un autre métal plus résistant à la corrosion" },
  { id: "antirouille-huile", nom: "un traitement antirouille à l'huile", role: "forme une barrière qui empêche l'humidité et l'air d'atteindre le métal" },
  { id: "peinture", nom: "l'application de peinture", role: "forme une barrière protectrice contre l'humidité et l'air à la surface du matériau" },
];

export function traitementDegradationAleatoire(): TraitementDegradation {
  return BANQUE_TRAITEMENTS_DEGRADATION[Math.floor(Math.random() * BANQUE_TRAITEMENTS_DEGRADATION.length)];
}
