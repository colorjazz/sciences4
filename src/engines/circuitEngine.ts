/**
 * circuitEngine.ts
 * ------------------------------------------------------------------
 * Concept prescrit ST/ATS : "Fonctions électriques" (alimentation,
 * conduction, isolation, protection, commande, transformation de
 * l'énergie). Table de référence vérifiée, même logique que
 * liaisonsEngine.ts et materiauxEngine.ts — la fonction électrique
 * d'un composant n'est jamais laissée à l'invention de Gemini.
 * ------------------------------------------------------------------
 */

import type { ComposantCircuit, CircuitElectrique, SymboleCircuit, FonctionElectrique } from "../types/question";

interface DefinitionComposant {
  symbole: SymboleCircuit;
  nom: string;
  fonctionElectrique: FonctionElectrique;
}

export const BANQUE_COMPOSANTS_CIRCUIT: DefinitionComposant[] = [
  { symbole: "pile", nom: "pile", fonctionElectrique: "alimentation" },
  { symbole: "interrupteur-poussoir", nom: "interrupteur-poussoir", fonctionElectrique: "commande" },
  { symbole: "interrupteur-levier", nom: "interrupteur à levier", fonctionElectrique: "commande" },
  { symbole: "fusible", nom: "fusible", fonctionElectrique: "protection" },
  { symbole: "moteur", nom: "moteur", fonctionElectrique: "transformation-energie" },
  { symbole: "temoin-lumineux", nom: "témoin lumineux", fonctionElectrique: "transformation-energie" },
];

let compteurComposant = 0;
function nouveauComposant(def: DefinitionComposant): ComposantCircuit {
  compteurComposant += 1;
  return { id: `circuit-${def.symbole}-${compteurComposant}`, ...def };
}

/**
 * Construit un circuit simple à un seul chemin (pile → commande →
 * protection optionnelle → composant de sortie), cohérent avec le
 * vocabulaire du programme. `avecFusible` et le composant de sortie
 * sont choisis par l'appelant pour rester cohérents avec l'objet
 * technique de la question.
 */
export function construireCircuitSimple(params: {
  interrupteur?: "interrupteur-poussoir" | "interrupteur-levier";
  avecFusible?: boolean;
  sortie: "moteur" | "temoin-lumineux";
}): CircuitElectrique {
  const interrupteurNom = params.interrupteur ?? "interrupteur-poussoir";
  const composants: ComposantCircuit[] = [
    nouveauComposant(BANQUE_COMPOSANTS_CIRCUIT.find((c) => c.symbole === "pile")!),
    nouveauComposant(BANQUE_COMPOSANTS_CIRCUIT.find((c) => c.symbole === interrupteurNom)!),
  ];
  if (params.avecFusible) {
    composants.push(nouveauComposant(BANQUE_COMPOSANTS_CIRCUIT.find((c) => c.symbole === "fusible")!));
  }
  composants.push(nouveauComposant(BANQUE_COMPOSANTS_CIRCUIT.find((c) => c.symbole === params.sortie)!));

  return { composants };
}

export const LIBELLE_FONCTION_ELECTRIQUE: Record<FonctionElectrique, string> = {
  alimentation: "Alimentation",
  commande: "Commande",
  protection: "Protection",
  "transformation-energie": "Transformation de l'énergie",
  conduction: "Conduction",
  isolation: "Isolation",
};

export const LIBELLE_SYMBOLE_CIRCUIT: Record<SymboleCircuit, string> = {
  pile: "Pile",
  "interrupteur-poussoir": "Interrupteur-poussoir",
  "interrupteur-levier": "Interrupteur à levier",
  moteur: "Moteur",
  "temoin-lumineux": "Témoin lumineux",
  fusible: "Fusible",
};
