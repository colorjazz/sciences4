/**
 * equilibreChimiqueEngine.ts
 * ------------------------------------------------------------------
 * Chapitre "Équilibre chimique" — Chimie, 5e secondaire. Portée
 * confirmée : facteurs qui influencent l'état d'équilibre, principe
 * de Le Chatelier, constantes d'acidité/de basicité, constante du
 * produit de solubilité, constante d'ionisation de l'eau, relation
 * entre le pH et la concentration molaire des ions hydronium.
 * ------------------------------------------------------------------
 */

/** Constante d'ionisation de l'eau à 25 °C. */
export const KE_EAU_25C = 1.0e-14;

// ------------------------------------------------------------
// pH, pOH, Ke
// ------------------------------------------------------------

export function calculerPH(concentrationHMolL: number): { ph: number } {
  return { ph: -Math.log10(concentrationHMolL) };
}

export function calculerConcentrationHDepuisPH(ph: number): { concentrationHMolL: number } {
  return { concentrationHMolL: Math.pow(10, -ph) };
}

export function calculerConcentrationOHDepuisH(concentrationHMolL: number): { concentrationOHMolL: number } {
  return { concentrationOHMolL: KE_EAU_25C / concentrationHMolL };
}

export function calculerPOH(concentrationOHMolL: number): { poh: number } {
  return { poh: -Math.log10(concentrationOHMolL) };
}

// ------------------------------------------------------------
// Constante d'acidité/de basicité : Ka = [H+][A-] / [HA] (à l'équilibre)
// ------------------------------------------------------------

export function calculerKa(params: { concHMolL: number; concAMolL: number; concHAMolL: number }): { ka: number } {
  return { ka: (params.concHMolL * params.concAMolL) / params.concHAMolL };
}

export function classifierForceAcide(ka: number): "fort" | "faible" {
  // Un acide fort se dissocie presque totalement (Ka très grand, souvent > 1).
  return ka > 1 ? "fort" : "faible";
}

// ------------------------------------------------------------
// Constante du produit de solubilité : sel binaire AB ⇌ A+ + B-, Kps = s²
// ------------------------------------------------------------

export function calculerKpsBinaire(solubiliteMolL: number): { kps: number } {
  return { kps: solubiliteMolL * solubiliteMolL };
}

export function calculerSolubiliteDepuisKpsBinaire(kps: number): { solubiliteMolL: number } {
  return { solubiliteMolL: Math.sqrt(kps) };
}

// ------------------------------------------------------------
// Principe de Le Chatelier — déplacement qualitatif de l'équilibre
// ------------------------------------------------------------

export interface PerturbationEquilibre {
  id: string;
  perturbation: string;
  sensDeplacement: string;
  explication: string;
}

export const BANQUE_LE_CHATELIER: PerturbationEquilibre[] = [
  {
    id: "ajout-reactif",
    perturbation: "l'ajout d'un réactif dans un système à l'équilibre",
    sensDeplacement: "vers les produits",
    explication: "Le système réagit en consommant une partie du réactif ajouté pour rétablir l'équilibre, ce qui déplace la réaction vers la formation de produits.",
  },
  {
    id: "ajout-produit",
    perturbation: "l'ajout d'un produit dans un système à l'équilibre",
    sensDeplacement: "vers les réactifs",
    explication: "Le système réagit en consommant une partie du produit ajouté pour rétablir l'équilibre, ce qui déplace la réaction vers la reformation de réactifs.",
  },
  {
    id: "retrait-produit",
    perturbation: "le retrait d'un produit d'un système à l'équilibre",
    sensDeplacement: "vers les produits",
    explication: "En retirant un produit, le système compense en formant davantage de produit, ce qui déplace la réaction vers les produits.",
  },
  {
    id: "hausse-temperature-endo",
    perturbation: "une hausse de température sur un système dont la réaction directe est endothermique",
    sensDeplacement: "vers les produits",
    explication: "Pour une réaction endothermique, la chaleur ajoutée se comporte comme un « réactif » supplémentaire : le système se déplace vers les produits pour en consommer l'excès.",
  },
  {
    id: "baisse-temperature-endo",
    perturbation: "une baisse de température sur un système dont la réaction directe est endothermique",
    sensDeplacement: "vers les réactifs",
    explication: "Retirer de la chaleur à une réaction endothermique revient à retirer un « réactif » : le système se déplace vers les réactifs pour en reformer.",
  },
];

export function perturbationLeChatelierAleatoire(): PerturbationEquilibre {
  return BANQUE_LE_CHATELIER[Math.floor(Math.random() * BANQUE_LE_CHATELIER.length)];
}
