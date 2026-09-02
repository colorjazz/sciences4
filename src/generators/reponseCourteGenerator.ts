/**
 * reponseCourteGenerator.ts — module "Résolution guidée" (Section B, ST)
 * ------------------------------------------------------------------
 * Même principe que qcmGenerator.ts : Gemini écrit la mise en
 * situation en direct à chaque appel, jamais les valeurs numériques
 * ni la réponse attendue.
 * ------------------------------------------------------------------
 */

import type { QuestionCourte } from "../types/question";
import {
  calculerEnergieJoules,
  joulesVersKilowattheures,
  type UniteTemps,
} from "../engines/electriciteEngine";
import { calculerConcentration } from "../engines/chimieEngine";
import { demanderMiseEnSituation } from "../ai/geminiClient";

function idAleatoire(prefixe: string): string {
  return `${prefixe}-${Math.random().toString(36).slice(2, 9)}`;
}

// ------------------------------------------------------------
// Énergie électrique — E = P Δt, avec piège de conversion de temps
// ------------------------------------------------------------

async function genCourteEnergieElectrique(): Promise<QuestionCourte> {
  const puissanceW = Math.floor(Math.random() * 15 + 5) * 100; // 500–2000 W
  const unitesTemps: UniteTemps[] = ["min", "h"];
  const uniteTemps = unitesTemps[Math.floor(Math.random() * unitesTemps.length)];
  const duree =
    uniteTemps === "min" ? Math.floor(Math.random() * 40 + 10) : Math.floor(Math.random() * 4 + 1);

  const energieJoules = calculerEnergieJoules(puissanceW, duree, uniteTemps);
  const energieKWh = joulesVersKilowattheures(energieJoules);

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur la consommation d'énergie électrique.",
    `L'appareil décrit doit avoir une puissance de EXACTEMENT ${puissanceW} watts et fonctionner pendant EXACTEMENT ${duree} ${uniteTemps === "min" ? "minutes" : "heures"}.`,
    "Choisis un appareil électroménager ou électronique réaliste — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune énergie consommée, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);
  const enonce = `${miseEnSituation} Quelle quantité d'énergie, en kilowattheures (kWh), cet appareil a-t-il consommée ?`;

  return {
    id: idAleatoire("courte-energie"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "st-um-puissance-energie",
    enonce,
    uniteAttendue: "kWh",
    reponseAttendue: Number(energieKWh.toFixed(3)),
    toleranceRelative: 0.02,
    etapesDemarche: [
      "Convertir la durée en secondes",
      "Calculer E = P × Δt (résultat en joules)",
      "Convertir le résultat de joules en kWh (1 kWh = 3 600 000 J)",
    ],
    explication: `Δt = ${duree} ${uniteTemps} converti en secondes, puis E = P × Δt = ${energieJoules.toFixed(0)} J, soit ${energieKWh.toFixed(3)} kWh après conversion.`,
  };
}

// ------------------------------------------------------------
// Concentration — C = m / V
// ------------------------------------------------------------

async function genCourteConcentration(): Promise<QuestionCourte> {
  const masseGrammes = Math.floor(Math.random() * 40 + 10); // 10–49 g
  const volumeLitres = Number((Math.random() * 1.5 + 0.5).toFixed(1)); // 0.5–2.0 L
  const concentration = calculerConcentration(masseGrammes, volumeLitres);

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur la préparation d'une solution.",
    `La situation doit impliquer EXACTEMENT ${masseGrammes} grammes de soluté dissous dans une solution de EXACTEMENT ${volumeLitres} litres.`,
    "Choisis un contexte réaliste (laboratoire scolaire, cuisine, jardinage, piscine) — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune concentration, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);
  const enonce = `${miseEnSituation} Quelle est la concentration de cette solution, en g/L ?`;

  return {
    id: idAleatoire("courte-concentration"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "st-um-concentration",
    enonce,
    uniteAttendue: "g/L",
    reponseAttendue: Number(concentration.toFixed(2)),
    toleranceRelative: 0.02,
    etapesDemarche: [
      "Identifier la masse de soluté (m) et le volume de solution (V)",
      "Calculer C = m / V",
    ],
    explication: `C = m / V = ${masseGrammes} / ${volumeLitres} = ${concentration.toFixed(2)} g/L.`,
  };
}

// ------------------------------------------------------------
// Sélecteur
// ------------------------------------------------------------

const GENERATEURS_DISPONIBLES = [genCourteEnergieElectrique, genCourteConcentration];

export async function genererQuestionCourte(): Promise<QuestionCourte> {
  const generateur =
    GENERATEURS_DISPONIBLES[Math.floor(Math.random() * GENERATEURS_DISPONIBLES.length)];
  return generateur();
}
