/**
 * curriculumSecondaire5.ts
 * ------------------------------------------------------------------
 * Chimie et Physique, programmes OPTIONNELS de 5e secondaire.
 *
 * Volontairement un fichier séparé de curriculum.ts (ST/ATS, 4e
 * secondaire) : ces deux cours n'ont ni épreuve ministérielle unique,
 * ni pondération A/B/C, ni répartition par univers — contrairement à
 * ST/ATS, ce sont des cours à option évalués par l'enseignant. On ne
 * force donc PAS ces cours dans le type `Parcours` ni dans
 * `STRUCTURE_EPREUVE_ST/ATS` : ça les ferait hériter d'une mécanique
 * (sections, pondérations) qui ne leur correspond pas.
 *
 * Source : Progression des apprentissages au secondaire — Chimie,
 * programme optionnel de 5e secondaire (MEQ, 22 août 2011) et
 * Physique, programme optionnel de 5e secondaire (MEQ, 22 août 2011).
 *
 * Seuls les concepts PROPRES au programme de 5e (précédés d'un
 * chiffre dans les tableaux du MEQ, colonne "CHI"/"PHY" cochée d'une
 * étoile) sont repris ici comme concepts testables. Les connaissances
 * réutilisées de 3e/4e secondaire (ex. notion de mole, pression,
 * relation travail-force-déplacement) sont des préalables, pas des
 * objets d'évaluation nouveaux de ce cours — elles ne sont donc pas
 * dupliquées dans cet arbre, sauf quand un concept de 5e s'appuie
 * directement dessus (la formule est alors réutilisée telle quelle).
 * ------------------------------------------------------------------
 */

import type { ConceptPrescrit, Formule } from "./curriculum";

export type CoursSecondaire5 = "CHIMIE5" | "PHYSIQUE5";

export interface ChapitreSecondaire5 {
  id: string;
  titre: string;
  concepts: ConceptPrescrit[];
}

export interface CurriculumArbreSecondaire5 {
  cours: CoursSecondaire5;
  titreCours: string;
  chapitres: ChapitreSecondaire5[];
}

// ============================================================
// Formules propres à la 5e secondaire (en plus de FORMULES dans
// curriculum.ts, réutilisées telles quelles quand applicable).
// ============================================================

export const FORMULES_SECONDAIRE5: Formule[] = [
  // --- Chimie 5e ---
  {
    id: "loi-generale-gaz",
    expression: "p₁V₁ / n₁T₁ = p₂V₂ / n₂T₂",
    variables: [
      { symbole: "p", nom: "pression" },
      { symbole: "V", nom: "volume" },
      { symbole: "n", nom: "quantité de matière", unite: "mol" },
      { symbole: "T", nom: "température", unite: "K" },
    ],
    parcours: [],
  },
  {
    id: "loi-gaz-parfaits",
    expression: "pV = nRT",
    variables: [
      { symbole: "p", nom: "pression", unite: "kPa" },
      { symbole: "V", nom: "volume", unite: "L" },
      { symbole: "n", nom: "quantité de matière", unite: "mol" },
      { symbole: "R", nom: "constante des gaz parfaits", unite: "8,314 kPa·L/(mol·K)" },
      { symbole: "T", nom: "température", unite: "K" },
    ],
    parcours: [],
  },
  {
    id: "loi-dalton",
    expression: "p(totale) = p(A) + p(B) + p(C) + …",
    variables: [{ symbole: "p", nom: "pression partielle" }],
    parcours: [],
  },
  {
    id: "chaleur-molaire",
    expression: "ΔE = Q = mcΔT",
    variables: [
      { symbole: "Q", nom: "quantité de chaleur", unite: "J" },
      { symbole: "m", nom: "masse", unite: "g" },
      { symbole: "c", nom: "capacité thermique massique", unite: "J/(g·°C)" },
      { symbole: "ΔT", nom: "variation de température", unite: "°C" },
    ],
    parcours: [],
  },
  {
    id: "constante-ionisation-eau",
    expression: "Ke = [H₃O⁺][OH⁻] = 1,0 × 10⁻¹⁴ (à 25 °C)",
    variables: [
      { symbole: "Ke", nom: "constante d'ionisation de l'eau" },
      { symbole: "[H₃O⁺]", nom: "concentration molaire en ions hydronium", unite: "mol/L" },
      { symbole: "[OH⁻]", nom: "concentration molaire en ions hydroxyde", unite: "mol/L" },
    ],
    parcours: [],
  },
  {
    id: "ph",
    expression: "pH = -log₁₀[H₃O⁺]",
    variables: [{ symbole: "[H₃O⁺]", nom: "concentration molaire en ions hydronium", unite: "mol/L" }],
    parcours: [],
  },
  // --- Physique 5e ---
  {
    id: "mru-position",
    expression: "Δs = vΔt",
    variables: [
      { symbole: "Δs", nom: "déplacement", unite: "m" },
      { symbole: "v", nom: "vitesse", unite: "m/s" },
      { symbole: "Δt", nom: "variation de temps", unite: "s" },
    ],
    parcours: [],
  },
  {
    id: "mrua-acceleration",
    expression: "a = Δv / Δt",
    variables: [
      { symbole: "a", nom: "accélération", unite: "m/s²" },
      { symbole: "Δv", nom: "variation de vitesse", unite: "m/s" },
      { symbole: "Δt", nom: "variation de temps", unite: "s" },
    ],
    parcours: [],
  },
  {
    id: "mrua-distance",
    expression: "Δs = v᷈ᵢΔt + ½aΔt²",
    variables: [
      { symbole: "Δs", nom: "déplacement", unite: "m" },
      { symbole: "vᵢ", nom: "vitesse initiale", unite: "m/s" },
      { symbole: "a", nom: "accélération", unite: "m/s²" },
    ],
    parcours: [],
  },
  {
    id: "lois-newton-f-ma",
    expression: "F = ma",
    variables: [
      { symbole: "F", nom: "force appliquée", unite: "N" },
      { symbole: "m", nom: "masse", unite: "kg" },
      { symbole: "a", nom: "accélération", unite: "m/s²" },
    ],
    parcours: [],
  },
  {
    id: "force-frottement",
    expression: "Ff = Fmotrice - Frésultante",
    variables: [
      { symbole: "Ff", nom: "force de frottement", unite: "N" },
      { symbole: "Fmotrice", nom: "force motrice", unite: "N" },
      { symbole: "Frésultante", nom: "force résultante", unite: "N" },
    ],
    parcours: [],
  },
  {
    id: "loi-hooke",
    expression: "E = ½kΔℓ²",
    variables: [
      { symbole: "E", nom: "énergie potentielle élastique", unite: "J" },
      { symbole: "k", nom: "constante d'élasticité", unite: "N/m" },
      { symbole: "Δℓ", nom: "variation de longueur par rapport au repos", unite: "m" },
    ],
    parcours: [],
  },
  {
    id: "puissance-travail-temps",
    expression: "P = W / Δt",
    variables: [
      { symbole: "P", nom: "puissance", unite: "W" },
      { symbole: "W", nom: "travail", unite: "J" },
      { symbole: "Δt", nom: "variation de temps", unite: "s" },
    ],
    parcours: [],
  },
  {
    id: "indice-refraction",
    expression: "n = c / v",
    variables: [
      { symbole: "n", nom: "indice de réfraction" },
      { symbole: "c", nom: "vitesse de la lumière dans le vide", unite: "m/s" },
      { symbole: "v", nom: "vitesse de la lumière dans le milieu", unite: "m/s" },
    ],
    parcours: [],
  },
  {
    id: "loi-snell-descartes-refraction",
    expression: "n₁sinθ₁ = n₂sinθ₂",
    variables: [
      { symbole: "n", nom: "indice de réfraction du milieu" },
      { symbole: "θ", nom: "angle par rapport à la normale", unite: "°" },
    ],
    parcours: [],
  },
];

// ============================================================
// Chimie, programme optionnel de 5e secondaire
// ============================================================

export const CURRICULUM_CHIMIE5: CurriculumArbreSecondaire5 = {
  cours: "CHIMIE5",
  titreCours: "Chimie (5e secondaire)",
  chapitres: [
    {
      id: "gaz",
      titre: "Gaz",
      concepts: [
        { id: "chi5-gaz-reactivite", libelle: "Réactivité chimique de certains gaz", libelleOfficiel: "Associer l'utilisation de certains gaz dans diverses applications à leur réactivité chimique" },
        { id: "chi5-gaz-theorie-cinetique", libelle: "Théorie cinétique des gaz", libelleOfficiel: "Expliquer le comportement macroscopique d'un gaz (compressibilité, expansion, diffusion) à l'aide de la théorie cinétique" },
        { id: "chi5-gaz-nombre-avogadro", libelle: "Nombre d'Avogadro", libelleOfficiel: "Exprimer une quantité de particules à l'aide du nombre d'Avogadro" },
        { id: "chi5-gaz-loi-generale", libelle: "Loi générale des gaz", libelleOfficiel: "Appliquer la relation mathématique entre la pression, le volume, la quantité de matière et la température d'un gaz", formuleIds: ["loi-generale-gaz"] },
        { id: "chi5-gaz-gaz-parfaits", libelle: "Loi des gaz parfaits", libelleOfficiel: "Appliquer la relation mathématique entre la pression, le volume, la quantité de matière, la constante des gaz parfaits et la température d'un gaz", formuleIds: ["loi-gaz-parfaits"] },
        { id: "chi5-gaz-loi-dalton", libelle: "Loi de Dalton", libelleOfficiel: "Appliquer la relation mathématique entre la pression totale d'un mélange gazeux et les pressions partielles des gaz qui le composent", formuleIds: ["loi-dalton"] },
        { id: "chi5-gaz-hypothese-avogadro", libelle: "Hypothèse d'Avogadro", libelleOfficiel: "Utiliser l'hypothèse d'Avogadro pour prédire la quantité de matière présente dans des volumes de gaz soumis aux mêmes conditions de température et de pression" },
        { id: "chi5-gaz-volume-molaire", libelle: "Volume molaire gazeux", libelleOfficiel: "Calculer le volume molaire gazeux à des conditions de température et de pression données (normales, ambiantes)" },
      ],
    },
    {
      id: "energie-transformations",
      titre: "Aspect énergétique des transformations",
      concepts: [
        { id: "chi5-energie-diagramme", libelle: "Diagramme énergétique", libelleOfficiel: "Représenter et interpréter le bilan énergétique d'une transformation chimique sous la forme d'un diagramme énergétique" },
        { id: "chi5-energie-activation", libelle: "Énergie d'activation", libelleOfficiel: "Déterminer l'énergie d'activation d'une transformation à l'aide de son diagramme énergétique" },
        { id: "chi5-energie-enthalpie", libelle: "Variation d'enthalpie", libelleOfficiel: "Expliquer qualitativement et déterminer la variation de l'enthalpie des substances au cours d'une réaction chimique" },
        { id: "chi5-energie-chaleur-molaire", libelle: "Chaleur molaire de réaction", libelleOfficiel: "Déterminer la chaleur molaire d'une réaction à l'aide d'un calorimètre, de la loi de Hess ou des enthalpies de liaison", formuleIds: ["chaleur-molaire"] },
      ],
    },
    {
      id: "vitesse-reaction",
      titre: "Vitesse de réaction",
      concepts: [
        { id: "chi5-vitesse-facteurs", libelle: "Facteurs qui influencent la vitesse de réaction", libelleOfficiel: "Expliquer l'effet de la nature des réactifs, de la concentration, de la surface de contact, de la température et des catalyseurs sur la vitesse d'une réaction", note: "Nature des réactifs, concentration, surface de contact, température, catalyseurs" },
        { id: "chi5-vitesse-loi", libelle: "Loi des vitesses de réaction", libelleOfficiel: "Décrire la relation entre la concentration des réactifs et la vitesse d'une réaction à l'aide d'expressions algébriques, et déterminer l'effet d'une variation de concentration" },
      ],
    },
    {
      id: "equilibre-chimique",
      titre: "Équilibre chimique",
      concepts: [
        { id: "chi5-equilibre-facteurs", libelle: "Facteurs qui influencent l'état d'équilibre", libelleOfficiel: "Expliquer qualitativement l'état d'équilibre dynamique et l'effet d'une modification de la température, de la pression ou de la concentration sur l'état d'équilibre d'un système" },
        { id: "chi5-equilibre-le-chatelier", libelle: "Principe de Le Chatelier", libelleOfficiel: "Prévoir le sens du déplacement de l'état d'équilibre d'un système et les effets de ce déplacement sur les concentrations des réactifs et des produits" },
        { id: "chi5-equilibre-ka-kb", libelle: "Constantes d'acidité et de basicité", libelleOfficiel: "Exprimer sous forme d'une expression algébrique et déterminer expérimentalement la constante d'acidité ou de basicité d'un système, et associer la force des acides et des bases à la valeur de leur constante" },
        { id: "chi5-equilibre-kps", libelle: "Constante du produit de solubilité", libelleOfficiel: "Exprimer sous forme d'une expression algébrique, calculer et utiliser la constante du produit de solubilité d'une substance" },
        { id: "chi5-equilibre-ke", libelle: "Constante d'ionisation de l'eau", libelleOfficiel: "Exprimer sous forme d'une expression algébrique la constante d'équilibre de l'ionisation de l'eau et calculer la concentration molaire des ions hydronium et hydroxyde, à 25 °C", formuleIds: ["constante-ionisation-eau"] },
        { id: "chi5-equilibre-ph", libelle: "Relation entre le pH et la concentration molaire des ions hydronium", libelleOfficiel: "Décrire et appliquer la relation entre le pH et la concentration molaire des ions hydronium et hydroxyde", formuleIds: ["ph"] },
      ],
    },
  ],
};

// ============================================================
// Physique, programme optionnel de 5e secondaire
// ============================================================

export const CURRICULUM_PHYSIQUE5: CurriculumArbreSecondaire5 = {
  cours: "PHYSIQUE5",
  titreCours: "Physique (5e secondaire)",
  chapitres: [
    {
      id: "cinematique",
      titre: "Cinématique",
      concepts: [
        { id: "phy5-cine-systeme-reference", libelle: "Système de référence", libelleOfficiel: "Choisir un système de référence approprié à la situation" },
        { id: "phy5-cine-mru-position", libelle: "Position, vitesse et temps (MRU)", libelleOfficiel: "Expliquer et appliquer la relation entre la position par rapport à l'origine, la vitesse et le temps dans un mouvement rectiligne uniforme", formuleIds: ["mru-position"] },
        { id: "phy5-cine-deplacement-distance", libelle: "Déplacement et distance parcourue", libelleOfficiel: "Distinguer le déplacement de la distance parcourue" },
        { id: "phy5-cine-mrua-acceleration", libelle: "Accélération, variation de vitesse et temps (MRUA)", libelleOfficiel: "Expliquer et appliquer la relation entre l'accélération d'un corps, la variation de sa vitesse et le temps pendant lequel elle varie", formuleIds: ["mrua-acceleration"] },
        { id: "phy5-cine-mrua-distance", libelle: "Accélération, distance parcourue et temps (MRUA)", libelleOfficiel: "Expliquer et appliquer la relation entre l'accélération d'un corps, la distance qu'il a parcourue et le temps écoulé", formuleIds: ["mrua-distance"] },
        { id: "phy5-cine-vitesse-moy-instant", libelle: "Vitesse moyenne et vitesse instantanée", libelleOfficiel: "Déterminer la vitesse moyenne et la vitesse instantanée d'un objet, et expliquer la distinction entre les deux" },
        { id: "phy5-cine-chute-libre", libelle: "Chute libre", libelleOfficiel: "Expliquer et déterminer le mouvement d'un corps en chute libre (position, déplacement, vitesse moyenne, vitesse instantanée, accélération)" },
        { id: "phy5-cine-plan-incline", libelle: "Mouvement sur un plan incliné", libelleOfficiel: "Expliquer et déterminer le mouvement d'un corps sur un plan incliné (position, déplacement, vitesse moyenne, vitesse instantanée, accélération)" },
        { id: "phy5-cine-projectiles", libelle: "Mouvement des projectiles", libelleOfficiel: "Expliquer le mouvement d'un projectile comme la combinaison d'un mouvement rectiligne uniforme et d'un mouvement rectiligne uniformément accéléré, et en déterminer la position, le déplacement, la vitesse instantanée ou le temps écoulé" },
      ],
    },
    {
      id: "dynamique",
      titre: "Dynamique",
      concepts: [
        { id: "phy5-dyn-accel-gravitationnelle", libelle: "Accélération gravitationnelle", libelleOfficiel: "Comparer les valeurs moyennes de l'accélération gravitationnelle terrestre et lunaire (9,8 m/s² sur Terre, 1,6 m/s² sur la Lune)" },
        { id: "phy5-dyn-force-gravitationnelle", libelle: "Force gravitationnelle", libelleOfficiel: "Associer la chute libre et le poids d'un corps à l'effet de la force gravitationnelle, et déterminer sa composante parallèle au déplacement (ex. plan incliné)", formuleIds: ["force-gravitationnelle"] },
        { id: "phy5-dyn-lois-newton", libelle: "Lois de Newton", libelleOfficiel: "Décrire qualitativement le principe d'inertie, la relation entre force/masse/accélération, le principe d'action-réaction, et expliquer un phénomène à l'aide des lois de Newton", note: "1re loi (inertie), 2e loi (F = ma), 3e loi (action-réaction)", formuleIds: ["lois-newton-f-ma"] },
        { id: "phy5-dyn-force-frottement", libelle: "Force de frottement", libelleOfficiel: "Expliquer les effets possibles d'une force de frottement, nommer les facteurs qui en modifient la grandeur, et déterminer sa valeur dans une situation donnée", note: "Calculs à l'aide des coefficients de frottement non exigés", formuleIds: ["force-frottement"] },
        { id: "phy5-dyn-force-centripete", libelle: "Force centripète", libelleOfficiel: "Expliquer qualitativement l'effet d'une force centripète sur un corps en mouvement" },
        { id: "phy5-dyn-corps-libre", libelle: "Diagramme de corps libre", libelleOfficiel: "Représenter les forces qui s'exercent sur un corps à l'aide de vecteurs" },
        { id: "phy5-dyn-equilibre-resultante", libelle: "Équilibre et résultante de plusieurs forces", libelleOfficiel: "Déterminer la grandeur et l'orientation du vecteur associé à la force résultante et à la force équilibrante d'un système de forces" },
      ],
    },
    {
      id: "energie-physique",
      titre: "Transformation de l'énergie",
      concepts: [
        { id: "phy5-energ-mecanique", libelle: "Énergie mécanique", libelleOfficiel: "Expliquer qualitativement une transformation d'énergie mécanique, appliquer les relations associées à l'énergie cinétique, à l'énergie potentielle, au travail et à la chaleur, et analyser quantitativement une transformation d'énergie mécanique", note: "Réutilise Ek = ½mv² et Ep = mgh" },
        { id: "phy5-energ-hooke", libelle: "Loi de Hooke", libelleOfficiel: "Expliquer et appliquer la relation entre l'énergie potentielle élastique d'un ressort hélicoïdal, sa constante d'élasticité et la variation de sa longueur par rapport à celle au repos", formuleIds: ["loi-hooke"] },
        { id: "phy5-energ-puissance-travail", libelle: "Puissance, travail et temps", libelleOfficiel: "Expliquer et appliquer la relation entre la puissance d'un système, le travail accompli et le temps pendant lequel il s'effectue", formuleIds: ["puissance-travail-temps"] },
      ],
    },
    {
      id: "optique-geometrique",
      titre: "Optique géométrique",
      concepts: [
        { id: "phy5-opt-reflexion-rayons", libelle: "Rayons incident et réfléchi", libelleOfficiel: "Définir un rayon lumineux, l'identifier sur une représentation schématique, et distinguer la réflexion diffuse de la réflexion spéculaire" },
        { id: "phy5-opt-reflexion-angles", libelle: "Angles d'incidence et de réflexion", libelleOfficiel: "Mesurer les angles d'incidence et de réflexion, et expliquer qualitativement et quantitativement un phénomène à l'aide de la loi de la réflexion" },
        { id: "phy5-opt-refraction-rayons", libelle: "Rayons incident et réfracté", libelleOfficiel: "Identifier les rayons incident et réfracté sur une représentation schématique ou dans une situation réelle" },
        { id: "phy5-opt-indice-refraction", libelle: "Indice de réfraction", libelleOfficiel: "Définir et déterminer l'indice de réfraction d'un milieu, expliquer un phénomène à l'aide de la loi de la réfraction, et expliquer le phénomène de réflexion totale interne", note: "Mirage, fibre optique", formuleIds: ["indice-refraction", "loi-snell-descartes-refraction"] },
        { id: "phy5-opt-type-image", libelle: "Type d'image", libelleOfficiel: "Expliquer la distinction entre image réelle et image virtuelle" },
        { id: "phy5-opt-images-caracteristiques", libelle: "Caractéristiques de l'image", libelleOfficiel: "Déterminer les caractéristiques de l'image obtenue (miroirs et lentilles) et appliquer les relations mathématiques qui permettent de déterminer la position, l'orientation et la hauteur d'un objet ou de son image", note: "Gr = hi/ho = -di/do ; 1/f = 1/di + 1/do (miroirs plans ou sphériques, lentilles)" },
      ],
    },
  ],
};

export function getCurriculumSecondaire5(cours: CoursSecondaire5): CurriculumArbreSecondaire5 {
  return cours === "CHIMIE5" ? CURRICULUM_CHIMIE5 : CURRICULUM_PHYSIQUE5;
}
