/**
 * fluidesEngine.ts
 * ------------------------------------------------------------------
 * Concepts prescrits ATS : "Principe d'Archimède", "Principe de
 * Pascal", "Principe de Bernoulli" — sous-thème Fluides (Univers
 * matériel), propre au parcours ATS (absent de l'arbre ST).
 *
 * Portée confirmée dans la Progression des apprentissages ATS (MEQ,
 * 2011/2021), section Fluides, colonne 4e secondaire ATS :
 * - Archimède : relation entre le poids du volume d'eau déplacé par
 *   un corps immergé et la poussée verticale subie ; flottabilité.
 * - Pascal : objets techniques ou systèmes technologiques dont le
 *   fonctionnement s'appuie sur ce principe (systèmes hydrauliques,
 *   systèmes pneumatiques).
 * - Bernoulli : relation entre la vitesse d'un fluide et sa pression ;
 *   notion de portance.
 * ------------------------------------------------------------------
 */

export interface AffirmationFluide {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_ARCHIMEDE: AffirmationFluide[] = [
  {
    id: "poussee-poids-deplace",
    affirmation: "Un corps immergé subit une poussée verticale vers le haut égale au poids du volume de fluide qu'il déplace.",
    correcte: true,
    explication: "C'est exactement le principe d'Archimède : la poussée subie correspond au poids du volume de fluide déplacé par le corps immergé.",
  },
  {
    id: "flotte-si-masse-faible",
    affirmation: "Un objet flotte uniquement si sa masse totale est inférieure à un kilogramme.",
    correcte: false,
    explication: "Faux : un objet flotte si la poussée d'Archimède qu'il subit (liée à sa forme et au volume déplacé) équilibre ou dépasse son poids — sa masse absolue n'est pas le facteur déterminant (un navire en acier de plusieurs tonnes flotte).",
  },
  {
    id: "forme-influence-flottabilite",
    affirmation: "La forme d'un objet peut influencer sa flottabilité, même à masse égale.",
    correcte: true,
    explication: "Une forme qui déplace un plus grand volume de fluide subit une poussée d'Archimède plus grande, ce qui peut faire flotter un objet qui, sous une autre forme, aurait coulé.",
  },
];

export const BANQUE_PASCAL: AffirmationFluide[] = [
  {
    id: "hydraulique-multiplie-force",
    affirmation: "Un système hydraulique peut multiplier une force appliquée, grâce au principe de Pascal.",
    correcte: true,
    explication: "Le principe de Pascal permet à un système hydraulique de transmettre une pression pour produire une force plus grande sur un autre piston — c'est le principe des freins ou des vérins hydrauliques.",
  },
  {
    id: "pascal-liquides-seulement",
    affirmation: "Le principe de Pascal ne s'applique qu'aux liquides, jamais aux gaz.",
    correcte: false,
    explication: "Faux : le principe de Pascal s'applique aux fluides en général — c'est pourquoi il existe autant des systèmes hydrauliques (liquide) que des systèmes pneumatiques (gaz) qui s'y appuient.",
  },
  {
    id: "pneumatique-utilise-pascal",
    affirmation: "Un système pneumatique (à air comprimé) peut aussi s'appuyer sur le principe de Pascal.",
    correcte: true,
    explication: "Les systèmes pneumatiques transmettent une pression à travers un gaz comprimé, exactement comme les systèmes hydrauliques le font avec un liquide — les deux s'appuient sur le principe de Pascal.",
  },
];

export const BANQUE_BERNOULLI: AffirmationFluide[] = [
  {
    id: "vitesse-pression-inverse",
    affirmation: "Selon le principe de Bernoulli, plus la vitesse d'un fluide est grande, plus sa pression est faible.",
    correcte: true,
    explication: "C'est l'énoncé du principe de Bernoulli : la vitesse et la pression d'un fluide en écoulement varient en sens opposés.",
  },
  {
    id: "portance-bernoulli",
    affirmation: "La portance qui permet à une aile d'avion de voler peut s'expliquer par le principe de Bernoulli.",
    correcte: true,
    explication: "La forme de l'aile fait accélérer l'air au-dessus d'elle, ce qui y réduit la pression par rapport au-dessous : cette différence de pression crée la portance.",
  },
  {
    id: "bernoulli-vitesse-pression-meme-sens",
    affirmation: "Selon le principe de Bernoulli, la vitesse et la pression d'un fluide augmentent toujours ensemble.",
    correcte: false,
    explication: "Faux : c'est l'inverse — quand la vitesse d'un fluide augmente, sa pression diminue (et vice versa).",
  },
];

export function affirmationArchimedeAleatoire(): AffirmationFluide {
  return BANQUE_ARCHIMEDE[Math.floor(Math.random() * BANQUE_ARCHIMEDE.length)];
}

export function affirmationPascalAleatoire(): AffirmationFluide {
  return BANQUE_PASCAL[Math.floor(Math.random() * BANQUE_PASCAL.length)];
}

export function affirmationBernoulliAleatoire(): AffirmationFluide {
  return BANQUE_BERNOULLI[Math.floor(Math.random() * BANQUE_BERNOULLI.length)];
}
