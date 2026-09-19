/**
 * fabricationEngine.ts
 * ------------------------------------------------------------------
 * Concept prescrit ATS : "Fabrication (caractéristiques du perçage,
 * du taraudage, du filetage et du cambrage [pliage])" — sous-thème
 * Fabrication (Univers technologique), propre au parcours ATS.
 *
 * Portée confirmée dans la Progression des apprentissages ATS,
 * section Fabrication : « décrire les caractéristiques des outils
 * nécessaires aux opérations de façonnage d'un matériau à usiner
 * (ex. la pointe d'un foret à métal est conique alors que celle d'un
 * foret à bois est à double lèvre) ».
 * ------------------------------------------------------------------
 */

export interface OperationFabrication {
  id: string;
  nom: string;
  description: string;
}

export const BANQUE_OPERATIONS_FABRICATION: OperationFabrication[] = [
  { id: "percage", nom: "le perçage", description: "crée un trou cylindrique dans un matériau à l'aide d'un foret" },
  { id: "taraudage", nom: "le taraudage", description: "crée un filet à l'intérieur d'un trou, pour y visser une pièce filetée" },
  { id: "filetage", nom: "le filetage", description: "crée un filet à l'extérieur d'une tige, comme celui d'une vis" },
  { id: "cambrage", nom: "le cambrage (pliage)", description: "courbe une pièce de matériau selon un angle précis, sans la couper" },
];

export function operationFabricationAleatoire(): OperationFabrication {
  return BANQUE_OPERATIONS_FABRICATION[Math.floor(Math.random() * BANQUE_OPERATIONS_FABRICATION.length)];
}
