/**
 * liaisonsEngine.ts
 * ------------------------------------------------------------------
 * Concept prescrit ST : "Caractéristiques des liaisons des pièces
 * mécaniques". Comme pour le balancement d'équations chimiques, ces
 * caractéristiques sont des faits techniques vérifiés à l'avance
 * (table de référence), pas laissés à l'invention de Gemini — une
 * liaison mal caractérisée serait une erreur factuelle inacceptable.
 * ------------------------------------------------------------------
 */

export interface CaracteristiquesLiaison {
  demontable: boolean;
  /** false = élastique (la liaison permet une déformation/un jeu voulu) */
  rigide: boolean;
}

export interface Liaison {
  id: string;
  nom: string;
  caracteristiques: CaracteristiquesLiaison;
  justification: string;
}

export const BANQUE_LIAISONS: Liaison[] = [
  {
    id: "vis-ecrou-liaison",
    nom: "vis et écrou",
    caracteristiques: { demontable: true, rigide: true },
    justification:
      "On peut dévisser sans endommager les pièces (démontable) ; une fois serrée, aucun jeu ni déformation n'est prévu (rigide).",
  },
  {
    id: "soudure-liaison",
    nom: "soudure",
    caracteristiques: { demontable: false, rigide: true },
    justification:
      "Une fois soudées, les pièces ne peuvent être séparées sans les endommager (indémontable) ; l'assemblage ne bouge pas (rigide).",
  },
  {
    id: "rivet-liaison",
    nom: "rivetage",
    caracteristiques: { demontable: false, rigide: true },
    justification:
      "Le rivet doit être percé pour séparer les pièces (indémontable) ; l'assemblage ne prévoit aucun mouvement (rigide).",
  },
  {
    id: "charniere-liaison",
    nom: "charnière",
    caracteristiques: { demontable: true, rigide: true },
    justification:
      "Les vis de fixation de la charnière peuvent être retirées (démontable) ; la charnière elle-même ne se déforme pas, elle permet un pivotement sans jeu structural (rigide).",
  },
  {
    id: "ressort-liaison",
    nom: "ressort de compression",
    caracteristiques: { demontable: true, rigide: false },
    justification:
      "Le ressort peut être retiré (démontable) ; il se déforme volontairement sous la charge et reprend sa forme (élastique).",
  },
  {
    id: "collage-liaison",
    nom: "collage",
    caracteristiques: { demontable: false, rigide: true },
    justification:
      "Le collage crée un assemblage permanent, difficile à séparer sans dommage (indémontable) ; il ne prévoit aucun mouvement (rigide).",
  },
  {
    id: "clavette-liaison",
    nom: "clavette",
    caracteristiques: { demontable: true, rigide: true },
    justification:
      "La clavette peut être retirée pour désassembler l'arbre et la pièce qu'il entraîne (démontable) ; elle transmet le mouvement sans jeu voulu (rigide).",
  },
];

export function choisirLiaisonAleatoire(): Liaison {
  return BANQUE_LIAISONS[Math.floor(Math.random() * BANQUE_LIAISONS.length)];
}

export function trouverLiaisonParId(id: string): Liaison | undefined {
  return BANQUE_LIAISONS.find((l) => l.id === id);
}
