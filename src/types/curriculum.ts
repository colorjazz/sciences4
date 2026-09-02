/**
 * curriculum.ts
 * ------------------------------------------------------------------
 * Structure typée du curriculum Science et technologie (ST, 055-410)
 * et Applications technologiques et scientifiques (ATS, 057-410)
 * pour la 4e secondaire, épreuve unique ministérielle.
 *
 * Source : Document d'information – Science et technologie et
 * Applications technologiques et scientifiques, 4e secondaire
 * (MEQ, Direction de l'évaluation des apprentissages, 2025-2026),
 * Annexes I, II, IV et V.
 *
 * IMPORTANT : ST et ATS sont deux programmes distincts avec deux
 * épreuves distinctes. Ils ne partagent PAS le même arbre de
 * concepts en Univers matériel / Terre et espace. L'Univers
 * technologique est largement commun mais présente des nuances
 * (voir noms de fonctions de commande notamment).
 *
 * L'Univers vivant est volontairement ABSENT de ce fichier : le MEQ
 * exclut explicitement ces concepts des épreuves ministérielles
 * (évaluation laissée à l'établissement scolaire). Le générateur de
 * questions d'épreuve ne doit jamais piger dans l'univers vivant.
 * ------------------------------------------------------------------
 */

// ============================================================
// 1. TYPES DE BASE
// ============================================================

/** Les deux parcours/programmes offerts par l'application. */
export type Parcours = "ST" | "ATS";

/** Les quatre univers du PFEQ. Univers vivant exclu des épreuves. */
export type UniversEvalue = "terreEspace" | "materiel" | "technologique";

/** Les trois sections de l'épreuve unique. */
export type SectionEpreuve = "A" | "B" | "C";

/**
 * Un concept prescrit, unité atomique du curriculum.
 * `id` doit être stable dans le temps (utilisé comme clé de génération
 * de prompt et de traçabilité pédagogique) : ne jamais le renommer,
 * seulement le déprécier si besoin.
 */
export interface ConceptPrescrit {
  id: string;
  libelle: string;
  /** Libellé exact du MEQ, utilisé pour la validation terminologique en Partie C */
  libelleOfficiel: string;
  /** Notes de portée, restrictions, précisions (ex: "aspects qualitatifs seulement") */
  note?: string;
  /** Formule(s) associée(s), si applicable (voir FORMULES_* plus bas) */
  formuleIds?: string[];
}

export interface SousTheme {
  id: string;
  titre: string;
  concepts: ConceptPrescrit[];
}

export interface Univers {
  id: UniversEvalue;
  titre: string;
  sousThemes: SousTheme[];
}

export interface CurriculumArbre {
  parcours: Parcours;
  codeEpreuve: string; // ex: "055-410" ou "057-410"
  univers: Univers[];
}

// ============================================================
// 2. FORMULES ET GRANDEURS (Annexes IV et V)
// ============================================================

export interface Formule {
  id: string;
  expression: string; // ex: "U = R I"
  variables: { symbole: string; nom: string; unite?: string }[];
  parcours: Parcours[]; // certaines formules sont communes aux deux
}

export const FORMULES: Formule[] = [
  {
    id: "loi-ohm",
    expression: "U = R I",
    variables: [
      { symbole: "U", nom: "différence de potentiel", unite: "V" },
      { symbole: "R", nom: "résistance", unite: "Ω" },
      { symbole: "I", nom: "intensité de courant électrique", unite: "A" },
    ],
    parcours: ["ST", "ATS"],
  },
  {
    id: "puissance-electrique",
    expression: "P = U I",
    variables: [
      { symbole: "P", nom: "puissance", unite: "W" },
      { symbole: "U", nom: "différence de potentiel", unite: "V" },
      { symbole: "I", nom: "intensité de courant électrique", unite: "A" },
    ],
    parcours: ["ST", "ATS"],
  },
  {
    id: "energie-consommee",
    expression: "E = P Δt",
    variables: [
      { symbole: "E", nom: "énergie consommée", unite: "J" },
      { symbole: "P", nom: "puissance", unite: "W" },
      { symbole: "Δt", nom: "variation de temps", unite: "s" },
    ],
    parcours: ["ST", "ATS"],
  },
  {
    id: "rendement-energetique",
    expression:
      "Rendement énergétique (%) = (Quantité d'énergie utile / Quantité d'énergie consommée) × 100",
    variables: [],
    parcours: ["ST", "ATS"],
  },
  {
    id: "concentration",
    expression: "C = m / V",
    variables: [
      { symbole: "C", nom: "concentration" },
      { symbole: "m", nom: "quantité de soluté" },
      { symbole: "V", nom: "quantité de solution" },
    ],
    parcours: ["ST"],
  },
  {
    id: "force-gravitationnelle",
    expression: "Fg = mg",
    variables: [
      { symbole: "Fg", nom: "force gravitationnelle", unite: "N" },
      { symbole: "m", nom: "masse", unite: "kg" },
      { symbole: "g", nom: "intensité du champ gravitationnel", unite: "N/kg" },
    ],
    parcours: ["ATS"],
  },
  {
    id: "vitesse",
    expression: "v = d / Δt",
    variables: [
      { symbole: "v", nom: "vitesse", unite: "m/s" },
      { symbole: "d", nom: "distance", unite: "m" },
      { symbole: "Δt", nom: "variation de temps", unite: "s" },
    ],
    parcours: ["ATS"],
  },
];

export interface Grandeur {
  nom: string;
  symbole: string;
  valeur: string;
  parcours: Parcours[];
}

export const GRANDEURS: Grandeur[] = [
  {
    nom: "Masse volumique de l'eau",
    symbole: "ρ",
    valeur: "1,0 g/mL = 1,0 kg/L = 1000 kg/m³",
    parcours: ["ST"],
  },
  {
    nom: "Kilowatt-heure",
    symbole: "kW·h",
    valeur: "1 kW·h = 3 600 000 J",
    parcours: ["ST", "ATS"],
  },
  {
    nom: "Intensité du champ gravitationnel terrestre",
    symbole: "g",
    valeur: "9,8 N/kg",
    parcours: ["ATS"],
  },
];

// ============================================================
// 3. PONDÉRATION DE L'ÉPREUVE (Section 2 du Document d'information)
// ============================================================

export interface RepartitionSection {
  section: SectionEpreuve;
  nombreQuestions: number;
  ponderation: number; // en % du total de l'épreuve
  repartitionUnivers: Partial<Record<UniversEvalue, number>>; // nb de questions par univers dans cette section
}

export interface StructureEpreuve {
  parcours: Parcours;
  codeEpreuve: string;
  dureeMinutes: number;
  totalQuestions: number;
  pointsParQuestion: number;
  sections: RepartitionSection[];
  ponderationParUnivers: Record<UniversEvalue, number>; // % du total de l'épreuve
}

export const STRUCTURE_EPREUVE_ST: StructureEpreuve = {
  parcours: "ST",
  codeEpreuve: "055-410",
  dureeMinutes: 180,
  totalQuestions: 25,
  pointsParQuestion: 4,
  sections: [
    {
      section: "A",
      nombreQuestions: 15,
      ponderation: 60,
      repartitionUnivers: { terreEspace: 4, materiel: 10, technologique: 1 },
    },
    {
      section: "B",
      nombreQuestions: 5,
      ponderation: 20,
      repartitionUnivers: { terreEspace: 1, materiel: 3, technologique: 1 },
    },
    {
      section: "C",
      nombreQuestions: 5,
      ponderation: 20,
      repartitionUnivers: { technologique: 5 },
    },
  ],
  ponderationParUnivers: { terreEspace: 20, materiel: 52, technologique: 28 },
};

export const STRUCTURE_EPREUVE_ATS: StructureEpreuve = {
  parcours: "ATS",
  codeEpreuve: "057-410",
  dureeMinutes: 180,
  totalQuestions: 25,
  pointsParQuestion: 4,
  sections: [
    {
      section: "A",
      nombreQuestions: 15,
      ponderation: 60,
      repartitionUnivers: { terreEspace: 1, materiel: 9, technologique: 5 },
    },
    {
      section: "B",
      nombreQuestions: 4,
      ponderation: 16,
      repartitionUnivers: { terreEspace: 1, materiel: 2, technologique: 1 },
    },
    {
      section: "C",
      nombreQuestions: 6,
      ponderation: 24,
      repartitionUnivers: { technologique: 6 },
    },
  ],
  ponderationParUnivers: { terreEspace: 8, materiel: 44, technologique: 48 },
};

// ============================================================
// 4. ARBRE DE CURRICULUM — SCIENCE ET TECHNOLOGIE (055-410)
// ============================================================

export const CURRICULUM_ST: CurriculumArbre = {
  parcours: "ST",
  codeEpreuve: "055-410",
  univers: [
    {
      id: "terreEspace",
      titre: "Terre et espace",
      sousThemes: [
        {
          id: "cycles-biogeochimiques",
          titre: "Cycles biogéochimiques",
          concepts: [
            { id: "st-te-cycle-carbone", libelle: "Cycle du carbone", libelleOfficiel: "Cycle du carbone" },
          ],
        },
        {
          id: "lithosphere",
          titre: "Lithosphère",
          concepts: [
            { id: "st-te-pergelisol", libelle: "Pergélisol", libelleOfficiel: "Pergélisol" },
            { id: "st-te-ressources-energetiques-litho", libelle: "Ressources énergétiques", libelleOfficiel: "Ressources énergétiques" },
          ],
        },
        {
          id: "hydrosphere",
          titre: "Hydrosphère",
          concepts: [
            { id: "st-te-bassin-versant", libelle: "Bassin versant", libelleOfficiel: "Bassin versant" },
            { id: "st-te-circulation-oceanique", libelle: "Circulation océanique", libelleOfficiel: "Circulation océanique" },
            { id: "st-te-glacier-banquise", libelle: "Glacier et banquise", libelleOfficiel: "Glacier et banquise" },
            { id: "st-te-salinite", libelle: "Salinité", libelleOfficiel: "Salinité" },
            { id: "st-te-ressources-energetiques-hydro", libelle: "Ressources énergétiques", libelleOfficiel: "Ressources énergétiques" },
          ],
        },
        {
          id: "atmosphere",
          titre: "Atmosphère",
          concepts: [
            { id: "st-te-effet-serre", libelle: "Effet de serre", libelleOfficiel: "Effet de serre" },
            { id: "st-te-ressources-energetiques-atmo", libelle: "Ressources énergétiques", libelleOfficiel: "Ressources énergétiques" },
          ],
        },
      ],
    },
    {
      id: "materiel",
      titre: "Univers matériel",
      sousThemes: [
        {
          id: "proprietes-solutions",
          titre: "Propriétés physiques des solutions",
          concepts: [
            { id: "st-um-concentration", libelle: "Concentration (g/L, %, ppm)", libelleOfficiel: "Concentration (g/L, %, ppm)", formuleIds: ["concentration"] },
            { id: "st-um-echelle-ph", libelle: "Échelle pH", libelleOfficiel: "Échelle pH" },
            { id: "st-um-ions", libelle: "Ions", libelleOfficiel: "Ions" },
            { id: "st-um-conductibilite", libelle: "Conductibilité électrique", libelleOfficiel: "Conductibilité électrique" },
          ],
        },
        {
          id: "transformations-chimiques",
          titre: "Transformations chimiques",
          concepts: [
            { id: "st-um-combustion", libelle: "Combustion", libelleOfficiel: "Combustion" },
            { id: "st-um-photosynthese-respiration", libelle: "Photosynthèse et respiration", libelleOfficiel: "Photosynthèse et respiration" },
            { id: "st-um-neutralisation", libelle: "Réaction de neutralisation acidobasique", libelleOfficiel: "Réaction de neutralisation acidobasique" },
            { id: "st-um-balancement", libelle: "Balancement d'équations chimiques", libelleOfficiel: "Balancement d'équations chimiques" },
            { id: "st-um-conservation-masse", libelle: "Loi de conservation de la masse", libelleOfficiel: "Loi de conservation de la masse" },
          ],
        },
        {
          id: "organisation-matiere",
          titre: "Organisation de la matière",
          concepts: [
            { id: "st-um-rutherford-bohr", libelle: "Modèle atomique de Rutherford-Bohr", libelleOfficiel: "Modèle atomique de Rutherford-Bohr" },
            { id: "st-um-familles-periodes", libelle: "Familles et périodes du tableau périodique", libelleOfficiel: "Familles et périodes du tableau périodique" },
          ],
        },
        {
          id: "electricite",
          titre: "Électricité",
          concepts: [
            { id: "st-um-charge-electrique", libelle: "Charge électrique", libelleOfficiel: "Charge électrique" },
            { id: "st-um-electricite-statique", libelle: "Électricité statique", libelleOfficiel: "Électricité statique" },
            { id: "st-um-loi-ohm", libelle: "Loi d'Ohm", libelleOfficiel: "Loi d'Ohm", formuleIds: ["loi-ohm"] },
            { id: "st-um-circuits-electriques", libelle: "Circuits électriques", libelleOfficiel: "Circuits électriques" },
            {
              id: "st-um-puissance-energie",
              libelle: "Relation entre puissance et énergie électrique",
              libelleOfficiel: "Relation entre puissance et énergie électrique",
              formuleIds: ["puissance-electrique", "energie-consommee"],
            },
          ],
        },
        {
          id: "electromagnetisme",
          titre: "Électromagnétisme",
          concepts: [
            { id: "st-um-attraction-repulsion", libelle: "Forces d'attraction et de répulsion", libelleOfficiel: "Forces d'attraction et de répulsion" },
            { id: "st-um-champ-fil", libelle: "Champ magnétique d'un fil parcouru par un courant", libelleOfficiel: "Champ magnétique d'un fil parcouru par un courant" },
          ],
        },
        {
          id: "transformation-energie",
          titre: "Transformation de l'énergie",
          concepts: [
            { id: "st-um-conservation-energie", libelle: "Loi de la conservation de l'énergie", libelleOfficiel: "Loi de la conservation de l'énergie" },
            { id: "st-um-rendement", libelle: "Rendement énergétique", libelleOfficiel: "Rendement énergétique", formuleIds: ["rendement-energetique"] },
          ],
        },
      ],
    },
    {
      id: "technologique",
      titre: "Univers technologique",
      sousThemes: [
        {
          id: "ingenierie-mecanique",
          titre: "Ingénierie mécanique",
          concepts: [
            { id: "st-ut-liaisons", libelle: "Caractéristiques des liaisons des pièces mécaniques", libelleOfficiel: "Caractéristiques des liaisons des pièces mécaniques" },
            { id: "st-ut-guidage", libelle: "Fonction de guidage", libelleOfficiel: "Fonction de guidage" },
            {
              id: "st-ut-transmission",
              libelle: "Systèmes de transmission du mouvement",
              libelleOfficiel:
                "Construction et particularités du mouvement des systèmes de transmission du mouvement (roues de friction, poulies et courroie, engrenage, roues dentées et chaîne, roue et vis sans fin)",
            },
            { id: "st-ut-changement-vitesse", libelle: "Changements de vitesse", libelleOfficiel: "Changements de vitesse" },
            {
              id: "st-ut-transformation-mvt",
              libelle: "Systèmes de transformation du mouvement",
              libelleOfficiel:
                "Construction et particularités du mouvement des systèmes de transformation du mouvement (vis et écrou, cames, bielles, manivelles, coulisses et systèmes bielle et manivelle, pignon et crémaillère)",
            },
          ],
        },
        {
          id: "ingenierie-electrique",
          titre: "Ingénierie électrique",
          concepts: [
            { id: "st-ut-alimentation", libelle: "Fonction d'alimentation", libelleOfficiel: "Fonction d'alimentation" },
            { id: "st-ut-conduction-isolation", libelle: "Fonction de conduction, d'isolation et de protection", libelleOfficiel: "Fonction de conduction, d'isolation et de protection" },
            { id: "st-ut-commande", libelle: "Fonction de commande", libelleOfficiel: "Fonction de commande" },
            {
              id: "st-ut-transformation-energie-elec",
              libelle: "Fonction de transformation de l'énergie",
              libelleOfficiel: "Fonction de transformation de l'énergie (électricité, lumière, chaleur, vibration, magnétisme)",
            },
          ],
        },
        {
          id: "materiaux-st",
          titre: "Matériaux",
          concepts: [
            { id: "st-ut-contraintes", libelle: "Contraintes", libelleOfficiel: "Contraintes", note: "Traction, compression, torsion, flexion, cisaillement (portée définie dans la Progression des apprentissages)" },
            { id: "st-ut-proprietes-mecaniques", libelle: "Caractérisation des propriétés mécaniques", libelleOfficiel: "Caractérisation des propriétés mécaniques" },
            { id: "st-ut-plastiques", libelle: "Matières plastiques (thermoplastiques, thermodurcissables)", libelleOfficiel: "Matières plastiques (thermoplastiques, thermodurcissables)" },
            { id: "st-ut-ceramiques", libelle: "Céramiques", libelleOfficiel: "Céramiques" },
            { id: "st-ut-degradation", libelle: "Modification des propriétés (dégradation, protection)", libelleOfficiel: "Modification des propriétés (dégradation, protection)" },
          ],
        },
      ],
    },
  ],
};

// ============================================================
// 5. ARBRE DE CURRICULUM — APPLICATIONS TECHNOLOGIQUES ET
//    SCIENTIFIQUES (057-410)
// ============================================================

export const CURRICULUM_ATS: CurriculumArbre = {
  parcours: "ATS",
  codeEpreuve: "057-410",
  univers: [
    {
      id: "terreEspace",
      titre: "Terre et espace",
      sousThemes: [
        {
          id: "lithosphere",
          titre: "Lithosphère",
          concepts: [
            { id: "ats-te-ressources-energetiques-litho", libelle: "Ressources énergétiques", libelleOfficiel: "Ressources énergétiques" },
          ],
        },
        {
          id: "hydrosphere",
          titre: "Hydrosphère",
          concepts: [
            { id: "ats-te-bassin-versant", libelle: "Bassin versant", libelleOfficiel: "Bassin versant" },
            { id: "ats-te-ressources-energetiques-hydro", libelle: "Ressources énergétiques", libelleOfficiel: "Ressources énergétiques" },
          ],
        },
        {
          id: "atmosphere",
          titre: "Atmosphère",
          concepts: [
            { id: "ats-te-cyclone-anticyclone", libelle: "Cyclone et anticyclone", libelleOfficiel: "Cyclone et anticyclone" },
            { id: "ats-te-ressources-energetiques-atmo", libelle: "Ressources énergétiques", libelleOfficiel: "Ressources énergétiques" },
          ],
        },
        {
          id: "espace",
          titre: "Espace",
          concepts: [
            { id: "ats-te-terre-lune", libelle: "Système Terre-Lune (effet gravitationnel)", libelleOfficiel: "Système Terre-Lune (effet gravitationnel)" },
          ],
        },
      ],
    },
    {
      id: "materiel",
      titre: "Univers matériel",
      sousThemes: [
        {
          id: "transformations-chimiques",
          titre: "Transformations chimiques",
          concepts: [
            { id: "ats-um-combustion", libelle: "Combustion", libelleOfficiel: "Combustion" },
            { id: "ats-um-oxydation", libelle: "Oxydation", libelleOfficiel: "Oxydation" },
          ],
        },
        {
          id: "electricite",
          titre: "Électricité",
          concepts: [
            { id: "ats-um-charge-electrique", libelle: "Charge électrique", libelleOfficiel: "Charge électrique" },
            { id: "ats-um-electricite-statique", libelle: "Électricité statique", libelleOfficiel: "Électricité statique" },
            { id: "ats-um-loi-ohm", libelle: "Loi d'Ohm", libelleOfficiel: "Loi d'Ohm", formuleIds: ["loi-ohm"] },
            { id: "ats-um-circuits-electriques", libelle: "Circuits électriques", libelleOfficiel: "Circuits électriques" },
            {
              id: "ats-um-puissance-energie",
              libelle: "Relation entre puissance et énergie électrique",
              libelleOfficiel: "Relation entre puissance et énergie électrique",
              formuleIds: ["puissance-electrique", "energie-consommee"],
            },
          ],
        },
        {
          id: "electromagnetisme",
          titre: "Électromagnétisme",
          concepts: [
            { id: "ats-um-attraction-repulsion", libelle: "Forces d'attraction et de répulsion", libelleOfficiel: "Forces d'attraction et de répulsion" },
            { id: "ats-um-champ-fil", libelle: "Champ magnétique d'un fil parcouru par un courant", libelleOfficiel: "Champ magnétique d'un fil parcouru par un courant" },
            { id: "ats-um-champ-solenoide", libelle: "Champ magnétique d'un solénoïde", libelleOfficiel: "Champ magnétique d'un solénoïde" },
            { id: "ats-um-induction", libelle: "Induction électromagnétique", libelleOfficiel: "Induction électromagnétique" },
          ],
        },
        {
          id: "transformation-energie",
          titre: "Transformation de l'énergie",
          concepts: [
            { id: "ats-um-conservation-energie", libelle: "Loi de la conservation de l'énergie", libelleOfficiel: "Loi de la conservation de l'énergie" },
            { id: "ats-um-rendement", libelle: "Rendement énergétique", libelleOfficiel: "Rendement énergétique", formuleIds: ["rendement-energetique"] },
          ],
        },
        {
          id: "fluides",
          titre: "Fluides",
          concepts: [
            { id: "ats-um-archimede", libelle: "Principe d'Archimède", libelleOfficiel: "Principe d'Archimède" },
            { id: "ats-um-pascal", libelle: "Principe de Pascal", libelleOfficiel: "Principe de Pascal" },
            { id: "ats-um-bernoulli", libelle: "Principe de Bernoulli", libelleOfficiel: "Principe de Bernoulli" },
          ],
        },
        {
          id: "forces-mouvements",
          titre: "Forces et mouvements",
          concepts: [
            { id: "ats-um-force", libelle: "Force", libelleOfficiel: "Force", formuleIds: ["force-gravitationnelle"] },
            { id: "ats-um-types-forces", libelle: "Types de forces", libelleOfficiel: "Types de forces" },
            { id: "ats-um-equilibre-deux-forces", libelle: "Équilibre de deux forces", libelleOfficiel: "Équilibre de deux forces" },
            {
              id: "ats-um-vitesse-distance-temps",
              libelle: "Relation entre vitesse constante, distance et temps",
              libelleOfficiel: "Relation entre vitesse constante, distance et temps",
              formuleIds: ["vitesse"],
            },
            { id: "ats-um-masse-poids", libelle: "Masse et poids", libelleOfficiel: "Masse et poids", formuleIds: ["force-gravitationnelle"] },
          ],
        },
      ],
    },
    {
      id: "technologique",
      titre: "Univers technologique",
      sousThemes: [
        {
          id: "langage-des-lignes",
          titre: "Langage des lignes",
          concepts: [
            { id: "ats-ut-projection-orthogonale", libelle: "Projection orthogonale à vues multiples (dessin d'ensemble)", libelleOfficiel: "Projection orthogonale à vues multiples (dessin d'ensemble)" },
            { id: "ats-ut-cotation-fonctionnelle", libelle: "Cotation fonctionnelle", libelleOfficiel: "Cotation fonctionnelle" },
            { id: "ats-ut-developpements", libelle: "Développements (prisme, cylindre, pyramide, cône)", libelleOfficiel: "Développements (prisme, cylindre, pyramide, cône)" },
            { id: "ats-ut-standards", libelle: "Standards et représentations (schémas, symboles)", libelleOfficiel: "Standards et représentations (schémas, symboles)" },
          ],
        },
        {
          id: "ingenierie-mecanique",
          titre: "Ingénierie mécanique",
          concepts: [
            { id: "ats-ut-adherence", libelle: "Adhérence et frottement entre les pièces", libelleOfficiel: "Adhérence et frottement entre les pièces" },
            { id: "ats-ut-degre-liberte", libelle: "Liaisons des pièces mécaniques (degré de liberté d'une pièce)", libelleOfficiel: "Liaisons des pièces mécaniques (degré de liberté d'une pièce)" },
            { id: "ats-ut-guidage", libelle: "Fonction de guidage", libelleOfficiel: "Fonction de guidage" },
            {
              id: "ats-ut-transmission",
              libelle: "Systèmes de transmission du mouvement",
              libelleOfficiel:
                "Construction et particularités du mouvement des systèmes de transmission du mouvement (roues de friction, poulies et courroie, engrenage, roues dentées et chaîne, roue et vis sans fin)",
            },
            { id: "ats-ut-changement-vitesse", libelle: "Changements de vitesse", libelleOfficiel: "Changements de vitesse" },
            {
              id: "ats-ut-transformation-mvt",
              libelle: "Systèmes de transformation du mouvement",
              libelleOfficiel:
                "Construction et particularités du mouvement des systèmes de transformation du mouvement (vis et écrou, cames, bielles, manivelles, coulisses, excentriques et systèmes bielle et manivelle, pignon et crémaillère)",
            },
          ],
        },
        {
          id: "ingenierie-electrique",
          titre: "Ingénierie électrique",
          concepts: [
            { id: "ats-ut-alimentation", libelle: "Fonction d'alimentation", libelleOfficiel: "Fonction d'alimentation" },
            { id: "ats-ut-conduction-isolation", libelle: "Fonction de conduction, d'isolation et de protection", libelleOfficiel: "Fonction de conduction, d'isolation et de protection (résistance et codification)" },
            {
              id: "ats-ut-commande",
              libelle: "Fonction de commande",
              libelleOfficiel: "Fonction de commande (types : unipolaire, unidirectionnel, bidirectionnel)",
            },
            {
              id: "ats-ut-transformation-energie-elec",
              libelle: "Fonction de transformation de l'énergie",
              libelleOfficiel: "Fonction de transformation de l'énergie (électricité, lumière, chaleur, vibration, magnétisme)",
            },
            { id: "ats-ut-autres-fonctions", libelle: "Autres fonctions (condensateur, diode, relais)", libelleOfficiel: "Autres fonctions (condensateur, diode, relais)" },
          ],
        },
        {
          id: "materiaux-ats",
          titre: "Matériaux",
          concepts: [
            { id: "ats-ut-contraintes", libelle: "Contraintes", libelleOfficiel: "Contraintes" },
            { id: "ats-ut-proprietes-mecaniques", libelle: "Caractérisation des propriétés mécaniques", libelleOfficiel: "Caractérisation des propriétés mécaniques" },
            { id: "ats-ut-plastiques", libelle: "Matières plastiques (thermoplastiques, thermodurcissables)", libelleOfficiel: "Matières plastiques (thermoplastiques, thermodurcissables)" },
            { id: "ats-ut-ceramiques", libelle: "Céramiques", libelleOfficiel: "Céramiques" },
            { id: "ats-ut-degradation", libelle: "Modification des propriétés (dégradation, protection)", libelleOfficiel: "Modification des propriétés (dégradation, protection)" },
          ],
        },
        {
          id: "fabrication",
          titre: "Fabrication",
          concepts: [
            {
              id: "ats-ut-fabrication",
              libelle: "Caractéristiques du perçage, du taraudage, du filetage et du cambrage (pliage)",
              libelleOfficiel: "Fabrication (caractéristiques du perçage, du taraudage, du filetage et du cambrage [pliage])",
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================
// 6. FONCTIONS UTILITAIRES
// ============================================================

export function getCurriculum(parcours: Parcours): CurriculumArbre {
  return parcours === "ST" ? CURRICULUM_ST : CURRICULUM_ATS;
}

export function getStructureEpreuve(parcours: Parcours): StructureEpreuve {
  return parcours === "ST" ? STRUCTURE_EPREUVE_ST : STRUCTURE_EPREUVE_ATS;
}

export function getFormulesForParcours(parcours: Parcours): Formule[] {
  return FORMULES.filter((f) => f.parcours.includes(parcours));
}

export function getGrandeursForParcours(parcours: Parcours): Grandeur[] {
  return GRANDEURS.filter((g) => g.parcours.includes(parcours));
}

/** Retourne un concept par son id, peu importe l'univers ou le sous-thème. */
export function findConceptById(
  parcours: Parcours,
  conceptId: string
): ConceptPrescrit | undefined {
  const arbre = getCurriculum(parcours);
  for (const univers of arbre.univers) {
    for (const sousTheme of univers.sousThemes) {
      const found = sousTheme.concepts.find((c) => c.id === conceptId);
      if (found) return found;
    }
  }
  return undefined;
}

/** Retourne tous les concepts d'un univers donné pour un parcours donné. */
export function getConceptsByUnivers(
  parcours: Parcours,
  universId: UniversEvalue
): ConceptPrescrit[] {
  const arbre = getCurriculum(parcours);
  const univers = arbre.univers.find((u) => u.id === universId);
  if (!univers) return [];
  return univers.sousThemes.flatMap((st) => st.concepts);
}

/**
 * Tire aléatoirement N concepts d'un univers donné, pondérés implicitement
 * par la distribution réelle des sous-thèmes (pas de biais vers un sous-thème
 * riche en concepts qui aurait plus de chances d'être pigé plusieurs fois
 * sans le vouloir — à utiliser côté génération de question pour respecter
 * la répartition officielle par univers/section).
 */
export function tirerConceptsAleatoires(
  parcours: Parcours,
  universId: UniversEvalue,
  n: number
): ConceptPrescrit[] {
  const concepts = [...getConceptsByUnivers(parcours, universId)];
  const resultat: ConceptPrescrit[] = [];
  for (let i = 0; i < n && concepts.length > 0; i++) {
    const idx = Math.floor(Math.random() * concepts.length);
    resultat.push(concepts.splice(idx, 1)[0]);
  }
  return resultat;
}
