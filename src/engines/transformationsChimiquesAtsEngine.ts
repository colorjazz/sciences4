/**
 * transformationsChimiquesAtsEngine.ts
 * ------------------------------------------------------------------
 * Concepts prescrits ATS : "Combustion" et "Oxydation" — sous-thème
 * Transformations chimiques (Univers matériel), propre au parcours
 * ATS. Bien plus limité que chimieEngine.ts (ST), qui reste réservé
 * au parcours ST — ne jamais réutiliser chimieEngine.ts pour ATS.
 *
 * Portée confirmée dans la Progression des apprentissages ATS (MEQ,
 * 2011/2021), section Transformations, colonne 4e secondaire ATS :
 * - Oxydation : « représenter une réaction d'oxydation à l'aide du
 *   modèle particulaire » et « associer des réactions chimiques
 *   connues à des réactions d'oxydation (ex. combustion, formation de
 *   la rouille) ».
 * - Combustion : « décrire les manifestations perceptibles d'une
 *   combustion vive (dégagement de chaleur, production de lumière) »
 *   et « expliquer une réaction de combustion à l'aide du triangle de
 *   feu ».
 * ------------------------------------------------------------------
 */

export interface AffirmationChimieAts {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_OXYDATION: AffirmationChimieAts[] = [
  {
    id: "rouille-oxydation",
    affirmation: "La formation de la rouille sur une pièce de métal est un exemple de réaction d'oxydation.",
    correcte: true,
    explication: "La rouille se forme quand le fer réagit avec le dioxygène de l'air : c'est une réaction d'oxydation connue.",
  },
  {
    id: "oxydation-flamme-obligatoire",
    affirmation: "Une réaction d'oxydation nécessite toujours une flamme visible pour se produire.",
    correcte: false,
    explication: "Faux : la formation de la rouille est une oxydation qui se produit lentement, sans aucune flamme.",
  },
  {
    id: "combustion-est-oxydation",
    affirmation: "La combustion est un exemple de réaction chimique connue qu'on associe à l'oxydation.",
    correcte: true,
    explication: "La combustion (comme la formation de la rouille) est une réaction d'oxydation : c'est l'exemple classique associé à ce concept.",
  },
  {
    id: "oxydation-toujours-metal",
    affirmation: "Seuls les métaux peuvent subir une réaction d'oxydation.",
    correcte: false,
    explication: "Faux : la combustion du bois ou du papier, par exemple, est aussi une réaction d'oxydation — pas seulement les métaux.",
  },
];

export const BANQUE_COMBUSTION: AffirmationChimieAts[] = [
  {
    id: "triangle-feu",
    affirmation: "Le triangle du feu est formé du combustible, du comburant et d'une source de chaleur.",
    correcte: true,
    explication: "Ce sont les trois éléments nécessaires à une combustion, représentés par le triangle du feu : retirer l'un des trois éteint le feu.",
  },
  {
    id: "combustion-que-chaleur",
    affirmation: "Une combustion vive dégage uniquement de la chaleur, jamais de lumière.",
    correcte: false,
    explication: "Faux : une combustion vive produit à la fois un dégagement de chaleur ET de la lumière (une flamme).",
  },
  {
    id: "comburant-souvent-oxygene",
    affirmation: "Dans la plupart des combustions courantes, le comburant est le dioxygène de l'air.",
    correcte: true,
    explication: "Le comburant est la substance qui permet la combustion : dans la grande majorité des cas courants, c'est le dioxygène de l'air.",
  },
  {
    id: "retirer-comburant-inutile",
    affirmation: "Pour éteindre un feu, retirer le comburant (ex. étouffer les flammes) n'a aucun effet.",
    correcte: false,
    explication: "Faux : retirer n'importe lequel des trois éléments du triangle du feu — dont le comburant — éteint la combustion.",
  },
];

export function affirmationOxydationAleatoire(): AffirmationChimieAts {
  return BANQUE_OXYDATION[Math.floor(Math.random() * BANQUE_OXYDATION.length)];
}

export function affirmationCombustionAleatoire(): AffirmationChimieAts {
  return BANQUE_COMBUSTION[Math.floor(Math.random() * BANQUE_COMBUSTION.length)];
}
