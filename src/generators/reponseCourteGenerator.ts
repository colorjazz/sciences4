/**
 * reponseCourteGenerator.ts — module "Résolution guidée" (Section B, ST)
 * ------------------------------------------------------------------
 * Comme l'épreuve réelle (questions 16 à 20) : une mise en situation,
 * puis une batterie de sous-questions a/b, chacune notée à crédit
 * partiel (voir engines/notationEngine.ts) — pas juste une seule
 * valeur numérique bonne/mauvaise comme avant.
 *
 * Gemini écrit la mise en situation en direct à chaque appel, jamais
 * les valeurs numériques ni les réponses attendues.
 * ------------------------------------------------------------------
 */

import type { QuestionCourte, SousQuestionNumerique, SousQuestionChoixUnique, OptionChoix } from "../types/question";
import {
  calculerEnergieJoules,
  joulesVersKilowattheures,
  resoudrePuissance,
  type UniteTemps,
} from "../engines/electriciteEngine";
import { calculerConcentration } from "../engines/chimieEngine";
import { demanderMiseEnSituation } from "../ai/geminiClient";

function idAleatoire(prefixe: string): string {
  return `${prefixe}-${Math.random().toString(36).slice(2, 9)}`;
}

// ------------------------------------------------------------
// Énergie électrique — plaque signalétique : P = U I, puis E = P Δt
// (comme la question 18 : calcul de la puissance, puis de l'énergie)
// ------------------------------------------------------------

async function genCourtePlaqueSignaletique(): Promise<QuestionCourte> {
  const tensionV = Number((Math.random() * 100 + 12).toFixed(1)); // 12–112 V
  const courantA = Number((Math.random() * 4 + 0.5).toFixed(1)); // 0.5–4.5 A
  const { puissanceW } = resoudrePuissance({ tensionV, courantA });

  const unitesTemps: UniteTemps[] = ["min", "h"];
  const uniteTemps = unitesTemps[Math.floor(Math.random() * unitesTemps.length)];
  const duree =
    uniteTemps === "min" ? Math.floor(Math.random() * 40 + 10) : Number((Math.random() * 3 + 0.5).toFixed(1));

  const energieJoules = calculerEnergieJoules(puissanceW, duree, uniteTemps);
  const energieKWh = joulesVersKilowattheures(energieJoules);

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur la plaque signalétique d'un appareil électrique.",
    `L'appareil décrit doit avoir EXACTEMENT ${tensionV} volts et EXACTEMENT ${courantA} ampères inscrits sur sa plaque signalétique,`,
    `et être utilisé pendant EXACTEMENT ${duree} ${uniteTemps === "min" ? "minutes" : "heures"}.`,
    "Choisis un appareil électroménager ou électronique réaliste — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune puissance ni énergie, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);

  const sousQuestionPuissance: SousQuestionNumerique = {
    id: "puissance",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la puissance de cet appareil ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "W",
    reponseAttendue: Number(puissanceW.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `P = U × I = ${tensionV} × ${courantA} = ${puissanceW.toFixed(2)} W.`,
  };

  const sousQuestionEnergie: SousQuestionNumerique = {
    id: "energie",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `Quelle quantité d'énergie cet appareil a-t-il consommée pendant ${duree} ${uniteTemps === "min" ? "minutes" : "heures"} ?`,
    bareme: { pointsMax: 2 },
    uniteAttendue: "kWh",
    reponseAttendue: Number(energieKWh.toFixed(3)),
    toleranceRelative: 0.02,
    explication: `Δt = ${duree} ${uniteTemps} converti en secondes, puis E = P × Δt = ${energieJoules.toFixed(0)} J, soit ${energieKWh.toFixed(3)} kWh après conversion (1 kWh = 3 600 000 J).`,
  };

  return {
    id: idAleatoire("courte-plaque"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "st-um-puissance-energie",
    enonce: miseEnSituation,
    sousQuestions: [sousQuestionPuissance, sousQuestionEnergie],
  };
}

// ------------------------------------------------------------
// Concentration — C = m / V, puis recommandation selon un seuil
// (comme la question 19 : calcul, puis choix motivé par le résultat)
// ------------------------------------------------------------

async function genCourteConcentrationRecommandation(): Promise<QuestionCourte> {
  const masseGrammes = Math.floor(Math.random() * 190 + 10); // 10–199 g
  const volumeLitres = Number((Math.random() * 4 + 1).toFixed(1)); // 1.0–5.0 L
  const concentration = calculerConcentration(masseGrammes, volumeLitres);

  const SEUIL_BAS = 20;
  const SEUIL_HAUT = 60;
  const options: OptionChoix[] = [
    { id: "faible", texte: `Concentration faible (moins de ${SEUIL_BAS} g/L) : ne rien ajouter.` },
    { id: "moyenne", texte: `Concentration moyenne (entre ${SEUIL_BAS} et ${SEUIL_HAUT} g/L) : ajouter une petite quantité.` },
    { id: "elevee", texte: `Concentration élevée (plus de ${SEUIL_HAUT} g/L) : diluer la solution.` },
  ];
  const bonneOptionId = concentration < SEUIL_BAS ? "faible" : concentration <= SEUIL_HAUT ? "moyenne" : "elevee";

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur l'analyse d'une solution.",
    `La situation doit impliquer EXACTEMENT ${masseGrammes} grammes de soluté dissous dans une solution de EXACTEMENT ${volumeLitres} litres.`,
    "Choisis un contexte réaliste (laboratoire scolaire, agriculture, piscine, traitement de l'eau) — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune concentration, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);

  const sousQuestionConcentration: SousQuestionNumerique = {
    id: "concentration",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la concentration de cette solution ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "g/L",
    reponseAttendue: Number(concentration.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `C = m / V = ${masseGrammes} / ${volumeLitres} = ${concentration.toFixed(2)} g/L.`,
  };

  const sousQuestionRecommandation: SousQuestionChoixUnique = {
    id: "recommandation",
    typeReponse: "choix-unique",
    enonce: "Selon cette concentration, quelle recommandation devrait être faite ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId,
    explication: `Avec une concentration de ${concentration.toFixed(2)} g/L, la recommandation appropriée est : ${options.find((o) => o.id === bonneOptionId)!.texte}`,
  };

  return {
    id: idAleatoire("courte-concentration"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "st-um-concentration",
    enonce: miseEnSituation,
    sousQuestions: [sousQuestionConcentration, sousQuestionRecommandation],
  };
}

// ------------------------------------------------------------
// Sélecteur
// ------------------------------------------------------------

const GENERATEURS_DISPONIBLES = [genCourtePlaqueSignaletique, genCourteConcentrationRecommandation];

export async function genererQuestionCourte(): Promise<QuestionCourte> {
  const generateur =
    GENERATEURS_DISPONIBLES[Math.floor(Math.random() * GENERATEURS_DISPONIBLES.length)];
  return generateur();
}
