/**
 * langageDesLignesEngine.ts
 * ------------------------------------------------------------------
 * Concepts prescrits ATS : "Cotation fonctionnelle" et
 * "Développements (prisme, cylindre, pyramide, cône)" — sous-thème
 * Langage des lignes (Univers technologique), propre au parcours ATS.
 *
 * La majeure partie de ce sous-thème (projection orthogonale, lignes
 * de base, vues en coupe...) est fondamentalement visuelle et ne se
 * prête pas à une question à choix multiple textuelle fidèle sans un
 * vrai dessin technique — ces deux concepts restent les seuls
 * couverts ici, volontairement, plutôt que d'improviser une
 * représentation graphique approximative.
 *
 * Portée confirmée dans la Progression des apprentissages ATS :
 * - Cotation fonctionnelle : « définir la cotation fonctionnelle
 *   comme l'ensemble des tolérances spécifiées liées à certaines
 *   pièces qui assurent le bon fonctionnement d'un objet (ex. la
 *   distance entre deux axes est déterminante quant à la prise des
 *   roues dentées dans un engrenage) ».
 * - Développements : « associer le développement de formes
 *   tridimensionnelles à la fabrication d'objets à partir de
 *   matériaux en feuilles (ex. fabrication de boîtes de carton, de
 *   conduits d'aération en métal) ».
 * ------------------------------------------------------------------
 */

export interface AffirmationCotationFonctionnelle {
  id: string;
  affirmation: string;
  correcte: boolean;
  explication: string;
}

export const BANQUE_COTATION_FONCTIONNELLE: AffirmationCotationFonctionnelle[] = [
  {
    id: "cotation-tolerance-fonctionnement",
    affirmation:
      "La cotation fonctionnelle regroupe les tolérances liées aux pièces dont dépend le bon fonctionnement de l'objet (ex. la distance entre deux axes d'un engrenage).",
    correcte: true,
    explication:
      "C'est exactement sa définition : la cotation fonctionnelle cible les dimensions et tolérances critiques pour que les pièces s'assemblent et fonctionnent correctement ensemble.",
  },
  {
    id: "cotation-toutes-dimensions",
    affirmation: "La cotation fonctionnelle s'applique à absolument toutes les dimensions d'un objet, sans distinction.",
    correcte: false,
    explication:
      "Faux : elle cible spécifiquement les dimensions et tolérances dont dépend le fonctionnement de l'objet — pas toutes les dimensions indifféremment.",
  },
  {
    id: "cotation-engrenage-exemple",
    affirmation: "Dans un engrenage, la distance entre les axes des deux roues dentées est un exemple typique de cote fonctionnelle.",
    correcte: true,
    explication: "Si cette distance n'est pas respectée, les dents des deux roues n'engrènent pas correctement : c'est donc bien une cote fonctionnelle critique.",
  },
];

export interface DeveloppementSolide {
  id: string;
  solide: string;
  exempleObjet: string;
}

export const BANQUE_DEVELOPPEMENTS: DeveloppementSolide[] = [
  { id: "prisme-boite", solide: "un prisme", exempleObjet: "une boîte de carton pliable" },
  { id: "cylindre-conduit", solide: "un cylindre", exempleObjet: "un conduit d'aération en métal" },
  { id: "pyramide-emballage", solide: "une pyramide", exempleObjet: "un emballage de carton en pointe" },
  { id: "cone-entonnoir", solide: "un cône", exempleObjet: "un entonnoir en métal ou en carton" },
];

export function affirmationCotationAleatoire(): AffirmationCotationFonctionnelle {
  return BANQUE_COTATION_FONCTIONNELLE[Math.floor(Math.random() * BANQUE_COTATION_FONCTIONNELLE.length)];
}

export function developpementAleatoire(): DeveloppementSolide {
  return BANQUE_DEVELOPPEMENTS[Math.floor(Math.random() * BANQUE_DEVELOPPEMENTS.length)];
}
