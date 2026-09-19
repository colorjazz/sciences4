/**
 * organisationMatiereEngine.ts
 * ------------------------------------------------------------------
 * Concepts prescrits ST : "Modèle atomique de Rutherford-Bohr" et
 * "Familles et périodes du tableau périodique" — sous-thème
 * Organisation de la matière (Univers matériel).
 *
 * Portée exacte confirmée dans la Progression des apprentissages
 * (MEQ, 2011), section Organisation, colonne 3e/4e secondaire :
 * - Rutherford-Bohr : « décrire »/« représenter des atomes à l'aide
 *   du modèle de Rutherford-Bohr » — répartition des électrons par
 *   couche (K, L, M...), modèle simplifié 2/8/8/... valide pour les
 *   20 premiers éléments enseignés au secondaire.
 * - Groupes (familles) et périodes : « situer les groupes et les
 *   périodes dans le tableau périodique », « décrire des
 *   caractéristiques communes aux éléments d'un même groupe »,
 *   « associer le nombre de couches électroniques d'un élément au
 *   numéro de la période à laquelle il appartient ».
 *
 * Table de référence vérifiée (numéro atomique, répartition
 * électronique par couche, période, famille) — jamais laissée à
 * l'invention de Gemini, comme chimieEngine.ts et terreEspaceEngine.ts.
 * ------------------------------------------------------------------
 */

export interface ElementChimique {
  symbole: string;
  nom: string;
  numeroAtomique: number;
  /** Répartition des électrons par couche (K, L, M, N...), modèle de Rutherford-Bohr simplifié. */
  electronsParCouche: number[];
  periode: number;
  groupeNumero: number;
  groupeNom: string;
}

/** Les 20 premiers éléments — ceux couverts par le modèle de Rutherford-Bohr simplifié enseigné au secondaire. */
export const BANQUE_ELEMENTS: ElementChimique[] = [
  { symbole: "H", nom: "hydrogène", numeroAtomique: 1, electronsParCouche: [1], periode: 1, groupeNumero: 1, groupeNom: "hydrogène (hors famille)" },
  { symbole: "He", nom: "hélium", numeroAtomique: 2, electronsParCouche: [2], periode: 1, groupeNumero: 18, groupeNom: "gaz nobles" },
  { symbole: "Li", nom: "lithium", numeroAtomique: 3, electronsParCouche: [2, 1], periode: 2, groupeNumero: 1, groupeNom: "métaux alcalins" },
  { symbole: "Be", nom: "béryllium", numeroAtomique: 4, electronsParCouche: [2, 2], periode: 2, groupeNumero: 2, groupeNom: "métaux alcalino-terreux" },
  { symbole: "B", nom: "bore", numeroAtomique: 5, electronsParCouche: [2, 3], periode: 2, groupeNumero: 13, groupeNom: "famille du bore" },
  { symbole: "C", nom: "carbone", numeroAtomique: 6, electronsParCouche: [2, 4], periode: 2, groupeNumero: 14, groupeNom: "famille du carbone" },
  { symbole: "N", nom: "azote", numeroAtomique: 7, electronsParCouche: [2, 5], periode: 2, groupeNumero: 15, groupeNom: "famille de l'azote" },
  { symbole: "O", nom: "oxygène", numeroAtomique: 8, electronsParCouche: [2, 6], periode: 2, groupeNumero: 16, groupeNom: "famille de l'oxygène" },
  { symbole: "F", nom: "fluor", numeroAtomique: 9, electronsParCouche: [2, 7], periode: 2, groupeNumero: 17, groupeNom: "halogènes" },
  { symbole: "Ne", nom: "néon", numeroAtomique: 10, electronsParCouche: [2, 8], periode: 2, groupeNumero: 18, groupeNom: "gaz nobles" },
  { symbole: "Na", nom: "sodium", numeroAtomique: 11, electronsParCouche: [2, 8, 1], periode: 3, groupeNumero: 1, groupeNom: "métaux alcalins" },
  { symbole: "Mg", nom: "magnésium", numeroAtomique: 12, electronsParCouche: [2, 8, 2], periode: 3, groupeNumero: 2, groupeNom: "métaux alcalino-terreux" },
  { symbole: "Al", nom: "aluminium", numeroAtomique: 13, electronsParCouche: [2, 8, 3], periode: 3, groupeNumero: 13, groupeNom: "famille du bore" },
  { symbole: "Si", nom: "silicium", numeroAtomique: 14, electronsParCouche: [2, 8, 4], periode: 3, groupeNumero: 14, groupeNom: "famille du carbone" },
  { symbole: "P", nom: "phosphore", numeroAtomique: 15, electronsParCouche: [2, 8, 5], periode: 3, groupeNumero: 15, groupeNom: "famille de l'azote" },
  { symbole: "S", nom: "soufre", numeroAtomique: 16, electronsParCouche: [2, 8, 6], periode: 3, groupeNumero: 16, groupeNom: "famille de l'oxygène" },
  { symbole: "Cl", nom: "chlore", numeroAtomique: 17, electronsParCouche: [2, 8, 7], periode: 3, groupeNumero: 17, groupeNom: "halogènes" },
  { symbole: "Ar", nom: "argon", numeroAtomique: 18, electronsParCouche: [2, 8, 8], periode: 3, groupeNumero: 18, groupeNom: "gaz nobles" },
  { symbole: "K", nom: "potassium", numeroAtomique: 19, electronsParCouche: [2, 8, 8, 1], periode: 4, groupeNumero: 1, groupeNom: "métaux alcalins" },
  { symbole: "Ca", nom: "calcium", numeroAtomique: 20, electronsParCouche: [2, 8, 8, 2], periode: 4, groupeNumero: 2, groupeNom: "métaux alcalino-terreux" },
];

export function elementAleatoire(): ElementChimique {
  return BANQUE_ELEMENTS[Math.floor(Math.random() * BANQUE_ELEMENTS.length)];
}

export function electronsDeValence(element: ElementChimique): number {
  return element.electronsParCouche[element.electronsParCouche.length - 1];
}

/** Formate la répartition électronique façon Rutherford-Bohr, ex. "2, 8, 1". */
export function formaterRepartition(element: ElementChimique): string {
  return element.electronsParCouche.join(", ");
}
