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
import type { Parcours, UniversEvalue } from "../types/curriculum";
import { getStructureEpreuve } from "../types/curriculum";
import {
  calculerEnergieJoules,
  joulesVersKilowattheures,
  resoudrePuissance,
  type UniteTemps,
} from "../engines/electriciteEngine";
import { calculerConcentration } from "../engines/chimieEngine";
import { resoudreForceGravitationnelle } from "../engines/mecaniqueForcesEngine";
import { genererTrainAleatoire, calculerSensRotation, calculerRapportVitesse } from "../engines/mecaniqueEngine";
import {
  BANQUE_RESSOURCES_ENERGETIQUES,
  CONCEPT_SUFFIXE_PAR_SPHERE,
  LIBELLE_SPHERE,
  classifierSalinite,
} from "../engines/terreEspaceEngine";
import { demanderMiseEnSituation } from "../ai/geminiClient";

function melanger<T>(items: T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function idAleatoire(prefixe: string): string {
  return `${prefixe}-${Math.random().toString(36).slice(2, 9)}`;
}

// ------------------------------------------------------------
// Énergie électrique — plaque signalétique : P = U I, puis E = P Δt
// (comme la question 18 : calcul de la puissance, puis de l'énergie)
// ------------------------------------------------------------

async function genCourtePlaqueSignaletique(parcours: Parcours): Promise<QuestionCourte> {
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
    conceptId: parcours === "ST" ? "st-um-puissance-energie" : "ats-um-puissance-energie",
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
// Force gravitationnelle — Fg = mg, puis recommandation selon un seuil
// (même structure que concentration+recommandation : calcul, puis
// choix motivé par le résultat). Sous-thème "Forces et mouvements",
// propre au parcours ATS.
// ------------------------------------------------------------

async function genCourteForceRecommandation(): Promise<QuestionCourte> {
  const masseKg = Number((Math.random() * 195 + 5).toFixed(1)); // 5–200 kg
  const { forceN } = resoudreForceGravitationnelle({ masseKg });

  const SEUIL_BAS = 500;
  const SEUIL_HAUT = 1500;
  const options: OptionChoix[] = [
    { id: "faible", texte: `Force faible (moins de ${SEUIL_BAS} N) : levage manuel sécuritaire.` },
    { id: "moyenne", texte: `Force moyenne (entre ${SEUIL_BAS} et ${SEUIL_HAUT} N) : aide mécanique recommandée.` },
    { id: "elevee", texte: `Force élevée (plus de ${SEUIL_HAUT} N) : équipement de levage obligatoire.` },
  ];
  const bonneOptionId = forceN < SEUIL_BAS ? "faible" : forceN <= SEUIL_HAUT ? "moyenne" : "elevee";

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur le levage d'une charge.",
    `La situation doit impliquer EXACTEMENT une charge de ${masseKg} kg à soulever.`,
    "Choisis un contexte réaliste (chantier, entrepôt, déménagement, atelier) — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune force, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);

  const sousQuestionForce: SousQuestionNumerique = {
    id: "force",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la force gravitationnelle exercée sur cette charge ? (g = 9,8 N/kg)",
    bareme: { pointsMax: 3 },
    uniteAttendue: "N",
    reponseAttendue: Number(forceN.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `Fg = mg = ${masseKg} × 9,8 = ${forceN.toFixed(2)} N.`,
  };

  const sousQuestionRecommandation: SousQuestionChoixUnique = {
    id: "recommandation",
    typeReponse: "choix-unique",
    enonce: "Selon cette force, quelle recommandation de sécurité devrait être faite ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId,
    explication: `Avec une force gravitationnelle de ${forceN.toFixed(2)} N, la recommandation appropriée est : ${options.find((o) => o.id === bonneOptionId)!.texte}`,
  };

  return {
    id: idAleatoire("courte-force"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "ats-um-force",
    enonce: miseEnSituation,
    sousQuestions: [sousQuestionForce, sousQuestionRecommandation],
  };
}

// ------------------------------------------------------------
// Univers technologique — Rapport de vitesse d'un train d'engrenages,
// puis sens de rotation (comme la Section A, mais en résolution
// guidée à crédit partiel). Concepts partagés ST/ATS.
// ------------------------------------------------------------

async function genCourteTrainVitesse(parcours: Parcours): Promise<QuestionCourte> {
  const train = genererTrainAleatoire(2);
  const dentsA = train.engrenages[0].nombreDents;
  const dentsB = train.engrenages[1].nombreDents;
  const rapport = calculerRapportVitesse(train, 0, 1);
  const sens = calculerSensRotation(train);
  const sensB = sens[1];

  const options: OptionChoix[] = melanger([
    { id: "horaire", texte: "Horaire" },
    { id: "antihoraire", texte: "Antihoraire" },
  ]);

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur un mécanisme à deux roues dentées en prise directe.",
    "Choisis un appareil ou une machine réaliste qui utilise un tel mécanisme — varie ton choix à chaque fois.",
    "Ne mentionne AUCUN nombre de dents, AUCUN sens de rotation, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);

  const sousQuestionRapport: SousQuestionNumerique = {
    id: "rapport",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `La roue menante compte ${dentsA} dents et engrène directement avec la roue menée qui en compte ${dentsB}. Quel est le rapport de vitesse entre les deux roues ?`,
    bareme: { pointsMax: 2 },
    reponseAttendue: Number(rapport.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `Rapport de vitesse = dents(menante) / dents(menée) = ${dentsA} / ${dentsB} = ${rapport.toFixed(2)}.`,
  };

  const sousQuestionSens: SousQuestionChoixUnique = {
    id: "sens",
    typeReponse: "choix-unique",
    enonce: `La roue menante tourne en sens ${train.sensRotationEntree}. Dans quel sens tourne la roue menée ?`,
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: sensB,
    explication: `Deux roues dentées en prise directe tournent en sens opposés : la roue menée tourne donc en sens ${sensB}.`,
  };

  return {
    id: idAleatoire("courte-train"),
    type: "courte",
    section: "B",
    univers: "technologique",
    conceptId: parcours === "ST" ? "st-ut-transmission" : "ats-ut-transmission",
    enonce: miseEnSituation,
    sousQuestions: [sousQuestionRapport, sousQuestionSens],
  };
}

// ------------------------------------------------------------
// Terre et espace — Ressources énergétiques : renouvelable ou non,
// puis sphère associée (lithosphère/hydrosphère/atmosphère). Concept
// partagé ST/ATS (répété à l'identique dans les deux arbres).
// ------------------------------------------------------------

async function genCourteRessourceEnergetique(parcours: Parcours): Promise<QuestionCourte> {
  const ressource = BANQUE_RESSOURCES_ENERGETIQUES[Math.floor(Math.random() * BANQUE_RESSOURCES_ENERGETIQUES.length)];

  const optionsRenouvelable: OptionChoix[] = melanger([
    { id: "renouvelable", texte: "Renouvelable" },
    { id: "non-renouvelable", texte: "Non renouvelable" },
  ]);
  const optionsSphere: OptionChoix[] = melanger([
    { id: "lithosphere", texte: "La lithosphère" },
    { id: "hydrosphere", texte: "L'hydrosphère" },
    { id: "atmosphere", texte: "L'atmosphère" },
  ]);

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    `pour une question de sciences de 4e secondaire sur une centrale ou une installation qui exploite ${ressource.nom} comme source d'énergie.`,
    "Choisis un contexte réaliste (région, usage) — varie ton choix à chaque fois.",
    "Ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);

  const sousQuestionRenouvelable: SousQuestionChoixUnique = {
    id: "renouvelable",
    typeReponse: "choix-unique",
    enonce: `${ressource.nom[0].toUpperCase()}${ressource.nom.slice(1)} est-elle une ressource énergétique renouvelable ou non renouvelable ?`,
    bareme: { pointsMax: 1 },
    options: optionsRenouvelable,
    bonneOptionId: ressource.renouvelable ? "renouvelable" : "non-renouvelable",
    explication: `${ressource.nom} est ${ressource.renouvelable ? "renouvelable : elle se régénère à l'échelle humaine" : "non renouvelable : ses réserves s'épuisent à l'échelle humaine"}.`,
  };

  const sousQuestionSphere: SousQuestionChoixUnique = {
    id: "sphere",
    typeReponse: "choix-unique",
    enonce: `À quelle sphère de la Terre associe-t-on principalement ${ressource.nom} ?`,
    bareme: { pointsMax: 1 },
    options: optionsSphere,
    bonneOptionId: ressource.sphere,
    explication: `${ressource.nom} est associée à ${LIBELLE_SPHERE[ressource.sphere]}.`,
  };

  return {
    id: idAleatoire("courte-ressource"),
    type: "courte",
    section: "B",
    univers: "terreEspace",
    conceptId: `${parcours === "ST" ? "st" : "ats"}-${CONCEPT_SUFFIXE_PAR_SPHERE[ressource.sphere]}`,
    enonce: miseEnSituation,
    sousQuestions: [sousQuestionRenouvelable, sousQuestionSphere],
  };
}

// ------------------------------------------------------------
// Salinité — C = m / V appliquée à l'eau salée, puis classification
// (comme concentration+recommandation). Sous-thème Hydrosphère,
// propre au parcours ST (absent de l'arbre ATS).
// ------------------------------------------------------------

async function genCourteSalinite(): Promise<QuestionCourte> {
  const masseGrammes = Number((Math.random() * 45 + 0.2).toFixed(1)); // 0.2–45.2 g de sel
  const volumeLitres = Number((Math.random() * 4 + 1).toFixed(1)); // 1.0–5.0 L
  const salinite = calculerConcentration(masseGrammes, volumeLitres);
  const classe = classifierSalinite(salinite);

  const options: OptionChoix[] = [
    { id: "douce", texte: "Eau douce (moins de 0,5 g/L)" },
    { id: "saumatre", texte: "Eau saumâtre (entre 0,5 et 30 g/L)" },
    { id: "salee", texte: "Eau salée (plus de 30 g/L)" },
  ];

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur un échantillon d'eau prélevé et analysé en laboratoire.",
    `L'échantillon doit contenir EXACTEMENT ${masseGrammes} grammes de sel dissous dans EXACTEMENT ${volumeLitres} litres d'eau.`,
    "Choisis un lieu de prélèvement réaliste (rivière, estuaire, lac, océan) — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune salinité, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);

  const sousQuestionSalinite: SousQuestionNumerique = {
    id: "salinite",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la salinité de cet échantillon d'eau ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "g/L",
    reponseAttendue: Number(salinite.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `Salinité = m / V = ${masseGrammes} / ${volumeLitres} = ${salinite.toFixed(2)} g/L.`,
  };

  const sousQuestionClasse: SousQuestionChoixUnique = {
    id: "classe",
    typeReponse: "choix-unique",
    enonce: "Selon cette salinité, comment cette eau est-elle classée ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: classe,
    explication: `Avec une salinité de ${salinite.toFixed(2)} g/L, cette eau est classée : ${options.find((o) => o.id === classe)!.texte}`,
  };

  return {
    id: idAleatoire("courte-salinite"),
    type: "courte",
    section: "B",
    univers: "terreEspace",
    conceptId: "st-te-salinite",
    enonce: miseEnSituation,
    sousQuestions: [sousQuestionSalinite, sousQuestionClasse],
  };
}

// ------------------------------------------------------------
// Sélecteur — respecte les proportions par univers de
// STRUCTURE_EPREUVE_ST/ATS (section B), comme la Section A.
// ------------------------------------------------------------

interface GenerateurDisponible {
  parcours: Parcours[];
  univers: UniversEvalue;
  generer: (parcours: Parcours) => Promise<QuestionCourte>;
}

const GENERATEURS_DISPONIBLES: GenerateurDisponible[] = [
  { parcours: ["ST", "ATS"], univers: "materiel", generer: genCourtePlaqueSignaletique },
  { parcours: ["ST"], univers: "materiel", generer: () => genCourteConcentrationRecommandation() },
  { parcours: ["ATS"], univers: "materiel", generer: () => genCourteForceRecommandation() },
  { parcours: ["ST", "ATS"], univers: "technologique", generer: genCourteTrainVitesse },
  { parcours: ["ST", "ATS"], univers: "terreEspace", generer: genCourteRessourceEnergetique },
  { parcours: ["ST"], univers: "terreEspace", generer: () => genCourteSalinite() },
];

function universVoulu(parcours: Parcours): UniversEvalue | undefined {
  const structure = getStructureEpreuve(parcours);
  const sectionB = structure.sections.find((s) => s.section === "B");
  const repartition = sectionB?.repartitionUnivers ?? {};
  const univers = (Object.keys(repartition) as UniversEvalue[]).filter((u) => (repartition[u] ?? 0) > 0);
  if (univers.length === 0) return undefined;
  // Pondère le tirage par le nombre réel de questions prévu par univers
  // (ex. ATS section B : 1 Terre-espace, 2 matériel, 1 technologique).
  const file: UniversEvalue[] = [];
  univers.forEach((u) => {
    for (let i = 0; i < (repartition[u] ?? 0); i++) file.push(u);
  });
  return file[Math.floor(Math.random() * file.length)];
}

export async function genererQuestionCourte(parcours: Parcours = "ST"): Promise<QuestionCourte> {
  const disponibles = GENERATEURS_DISPONIBLES.filter((g) => g.parcours.includes(parcours));
  const voulu = universVoulu(parcours);
  const pourCetUnivers = voulu ? disponibles.filter((g) => g.univers === voulu) : [];
  const pool = pourCetUnivers.length > 0 ? pourCetUnivers : disponibles;
  const entree = pool[Math.floor(Math.random() * pool.length)];
  return entree.generer(parcours);
}
