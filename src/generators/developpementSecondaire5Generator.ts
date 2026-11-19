/**
 * developpementSecondaire5Generator.ts — module "Pratique" pour les
 * cours optionnels de 5e secondaire (Chimie, Physique)
 * ------------------------------------------------------------------
 * Ces deux cours n'ont pas d'épreuve ministérielle unique : pas de
 * sections A/B/C, pas de pondération par univers. Ce générateur
 * produit donc UNE SEULE forme de question — une mise en situation
 * suivie de sous-questions notées à crédit partiel, réutilisant le
 * type `QuestionCourte` déjà conçu pour ça (voir types/question.ts) —
 * et pige simplement, au hasard, parmi les générateurs des chapitres
 * sélectionnés par l'élève.
 *
 * Même principe que le reste de l'appli : la partie pure (valeurs,
 * calculs, bonne réponse) est déterminée ici, jamais par Gemini —
 * Gemini écrit seulement la mise en situation.
 * ------------------------------------------------------------------
 */

import type { QuestionCourte, SousQuestionNumerique, SousQuestionChoixUnique, OptionChoix } from "../types/question";
import type { CoursSecondaire5 } from "../types/curriculumSecondaire5";
import { demanderMiseEnSituation } from "../ai/geminiClient";
import {
  resoudreGazLoiGeneralePression,
  resoudrePressionGazParfait,
  resoudrePressionTotaleDalton,
  resoudrePressionPartielleManquante,
  calculerVolumeMolaire,
  usageGazAleatoire,
  BANQUE_REACTIVITE_GAZ,
} from "../engines/gazEngine";
import {
  genererDiagrammeEnergetique,
  calculerEnergieActivation,
  calculerVariationEnthalpie,
  classifierReaction,
  resoudreChaleurCalorimetre,
  resoudreChaleurMolaire,
} from "../engines/energieChimieEngine";
import { facteurVitesseAleatoire, BANQUE_FACTEURS_VITESSE, resoudreVitesseReaction } from "../engines/viteseReactionEngine";
import {
  calculerPH,
  calculerConcentrationOHDepuisH,
  calculerKa,
  calculerKpsBinaire,
  perturbationLeChatelierAleatoire,
} from "../engines/equilibreChimiqueEngine";
import {
  resoudreDeplacementMRU,
  resoudreAccelerationMRUA,
  resoudreDeplacementMRUA,
  resoudreChuteLibre,
  resoudreAccelerationPlanIncline,
  resoudreProjectileHorizontal,
  resoudreProjectileChuteVerticale,
} from "../engines/cinematiqueEngine";
import {
  resoudreForceNewton,
  exempleLoiNewtonAleatoire,
  resoudreForceFrottement,
  resoudreResultanteColineaire,
  resoudreEquilibrante,
  G_TERRESTRE as G_DYN,
  G_LUNAIRE,
} from "../engines/dynamiquePhysiqueEngine";
import {
  resoudreEnergieCinetique,
  resoudreEnergiePotentielle,
  resoudreVitesseParConservationEnergie,
  resoudreEnergieRessort,
  resoudrePuissanceMecanique,
} from "../engines/energiePhysiqueEngine";
import {
  resoudreIndiceRefraction,
  resoudreAngleRefraction,
  resoudreDistanceImage,
  resoudreGrandissement,
  resoudreHauteurImage,
  classifierTypeImage,
} from "../engines/optiqueGeometriqueEngine";

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

async function miseEnSituation(lignesContexte: string[]): Promise<string> {
  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 3 phrases), en français québécois neutre,",
    "pour une question de chimie ou de physique de 5e secondaire.",
    ...lignesContexte,
    "Varie ton choix de contexte à chaque fois — reste réaliste et concret.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");
  return demanderMiseEnSituation(prompt);
}

// ============================================================
// CHIMIE 5e — Gaz
// ============================================================

async function genCourteLoiGenerale(): Promise<QuestionCourte> {
  const p1 = Math.round(Math.random() * 150 + 80); // 80–230 kPa
  const v1 = Number((Math.random() * 6 + 2).toFixed(1)); // 2.0–8.0 L
  const t1C = Math.round(Math.random() * 30 + 10); // 10–40 °C
  const t2C = Math.round(Math.random() * 60 - 20); // -20–40 °C
  const v2 = Number((Math.random() * 6 + 2).toFixed(1));
  const t1K = t1C + 273;
  const t2K = t2C + 273;
  const { p2KPa } = resoudreGazLoiGeneralePression({ p1KPa: p1, v1L: v1, t1K, v2L: v2, t2K });

  const enonce = await miseEnSituation([
    `La situation doit décrire un gaz enfermé dans un contenant fermé (ex. pneu, bonbonne, ballon de baudruche, aérosol), qui passe d'un état 1 (pression ${p1} kPa, volume ${v1} L, température ${t1C} °C) à un état 2 (volume ${v2} L, température ${t2C} °C), sans que du gaz entre ou sorte.`,
    "N'effectue AUCUN calcul, ne mentionne aucune pression pour l'état 2, ne révèle aucune réponse.",
  ]);

  const sousQuestionPression: SousQuestionNumerique = {
    id: "p2",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `Quelle est la pression du gaz dans l'état 2 ?`,
    bareme: { pointsMax: 3 },
    uniteAttendue: "kPa",
    reponseAttendue: Number(p2KPa.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `En convertissant les températures en kelvins (T₁ = ${t1C} + 273 = ${t1K} K, T₂ = ${t2C} + 273 = ${t2K} K) et en appliquant p₁V₁/T₁ = p₂V₂/T₂ (n constant, car le contenant est fermé) : p₂ = (${p1} × ${v1} × ${t2K}) / (${t1K} × ${v2}) ≈ ${p2KPa.toFixed(1)} kPa.`,
  };

  const options: OptionChoix[] = [
    { id: "ferme", texte: "Le contenant est fermé : aucune particule de gaz n'entre ni ne sort, donc la quantité de matière reste constante." },
    { id: "temperature", texte: "La température ne change pas assez pour influencer la quantité de matière." },
  ];
  const sousQuestionRaison: SousQuestionChoixUnique = {
    id: "raison-n-constant",
    typeReponse: "choix-unique",
    enonce: "Pourquoi peut-on considérer que la quantité de matière (n) du gaz reste constante entre les deux états ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: "ferme",
    explication: "La loi générale des gaz suppose n constant : c'est valide ici parce que le contenant est fermé, donc aucune particule de gaz n'y entre ni n'en sort.",
  };

  return {
    id: idAleatoire("dev-loi-generale"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-loi-generale",
    enonce,
    sousQuestions: [sousQuestionPression, sousQuestionRaison],
  };
}

async function genCourteGazParfaits(): Promise<QuestionCourte> {
  const n = Number((Math.random() * 2 + 0.2).toFixed(2)); // 0.2–2.2 mol
  const tC = Math.round(Math.random() * 60 + 5); // 5–65 °C
  const tK = tC + 273;
  const v = Number((Math.random() * 15 + 2).toFixed(1)); // 2–17 L
  const { pKPa } = resoudrePressionGazParfait({ nMol: n, tK, vL: v });

  const enonce = await miseEnSituation([
    `La situation doit décrire un gaz enfermé dans un contenant rigide de ${v} L, contenant EXACTEMENT ${n} mol de gaz à une température de EXACTEMENT ${tC} °C.`,
    "N'effectue AUCUN calcul, ne mentionne aucune pression, ne révèle aucune réponse.",
  ]);

  const sousQuestionPression: SousQuestionNumerique = {
    id: "pression",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la pression de ce gaz ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "kPa",
    reponseAttendue: Number(pKPa.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `T = ${tC} + 273 = ${tK} K. Avec pV = nRT : p = nRT / V = (${n} × 8,314 × ${tK}) / ${v} ≈ ${pKPa.toFixed(1)} kPa.`,
  };

  const options: OptionChoix[] = [
    { id: "double", texte: "La pression doublerait aussi." },
    { id: "inchangee", texte: "La pression resterait inchangée." },
  ];
  const sousQuestionProportion: SousQuestionChoixUnique = {
    id: "proportion",
    typeReponse: "choix-unique",
    enonce: "Si on doublait la température (en kelvins) de ce gaz, sans changer le volume ni la quantité de matière, qu'arriverait-il à sa pression ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: "double",
    explication: "Selon pV = nRT, à volume et quantité de matière constants, la pression est directement proportionnelle à la température (en kelvins) : doubler T double p.",
  };

  return {
    id: idAleatoire("dev-gaz-parfaits"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-gaz-parfaits",
    enonce,
    sousQuestions: [sousQuestionPression, sousQuestionProportion],
  };
}

async function genCourteDalton(): Promise<QuestionCourte> {
  const pA = Math.round(Math.random() * 40 + 10);
  const pB = Math.round(Math.random() * 40 + 10);
  const pC = Math.round(Math.random() * 40 + 10);
  const { pTotaleKPa } = resoudrePressionTotaleDalton([pA, pB, pC]);

  const enonce = await miseEnSituation([
    `La situation doit décrire un mélange de trois gaz différents dans un même contenant, dont les pressions partielles sont EXACTEMENT ${pA} kPa, ${pB} kPa et ${pC} kPa.`,
    "N'effectue AUCUN calcul, ne mentionne aucune pression totale, ne révèle aucune réponse.",
  ]);

  const sousQuestionTotale: SousQuestionNumerique = {
    id: "pression-totale",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la pression totale de ce mélange gazeux ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "kPa",
    reponseAttendue: pTotaleKPa,
    toleranceRelative: 0.01,
    explication: `Selon la loi de Dalton, p(totale) = p(A) + p(B) + p(C) = ${pA} + ${pB} + ${pC} = ${pTotaleKPa} kPa.`,
  };

  const { pManquanteKPa } = resoudrePressionPartielleManquante(pTotaleKPa, [pA, pB]);
  const sousQuestionManquante: SousQuestionNumerique = {
    id: "pression-manquante",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `Si la pression totale est de ${pTotaleKPa} kPa et que deux des trois gaz ont des pressions partielles de ${pA} kPa et ${pB} kPa, quelle est la pression partielle du troisième gaz ?`,
    bareme: { pointsMax: 2 },
    uniteAttendue: "kPa",
    reponseAttendue: pManquanteKPa,
    toleranceRelative: 0.01,
    explication: `p(C) = p(totale) - p(A) - p(B) = ${pTotaleKPa} - ${pA} - ${pB} = ${pManquanteKPa} kPa.`,
  };

  return {
    id: idAleatoire("dev-dalton"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-loi-dalton",
    enonce,
    sousQuestions: [sousQuestionTotale, sousQuestionManquante],
  };
}

async function genCourteVolumeMolaire(): Promise<QuestionCourte> {
  const tC = Math.round(Math.random() * 40 - 5); // -5–35 °C
  const tK = tC + 273;
  const pKPa = Math.round(Math.random() * 20 + 95); // 95–115 kPa
  const { vmLParMol } = calculerVolumeMolaire({ tK, pKPa });
  const nMol = Number((Math.random() * 2 + 0.5).toFixed(2));
  const volumeEchantillonL = nMol * vmLParMol;

  const enonce = await miseEnSituation([
    `La situation doit décrire un échantillon de gaz à une température de EXACTEMENT ${tC} °C et une pression de EXACTEMENT ${pKPa} kPa.`,
    "N'effectue AUCUN calcul, ne mentionne aucun volume molaire, ne révèle aucune réponse.",
  ]);

  const sousQuestionVm: SousQuestionNumerique = {
    id: "volume-molaire",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quel est le volume molaire de ce gaz dans ces conditions ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "L/mol",
    reponseAttendue: Number(vmLParMol.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `T = ${tC} + 273 = ${tK} K. Volume molaire Vm = RT / p = (8,314 × ${tK}) / ${pKPa} ≈ ${vmLParMol.toFixed(2)} L/mol.`,
  };

  const sousQuestionVolume: SousQuestionNumerique = {
    id: "volume-echantillon",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `Quel est le volume occupé par un échantillon de ${nMol} mol de ce gaz, dans les mêmes conditions ?`,
    bareme: { pointsMax: 2 },
    uniteAttendue: "L",
    reponseAttendue: Number(volumeEchantillonL.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `V = n × Vm = ${nMol} × ${vmLParMol.toFixed(2)} ≈ ${volumeEchantillonL.toFixed(2)} L.`,
  };

  return {
    id: idAleatoire("dev-volume-molaire"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-volume-molaire",
    enonce,
    sousQuestions: [sousQuestionVm, sousQuestionVolume],
  };
}

async function genCourteReactiviteGaz(): Promise<QuestionCourte> {
  const bon = usageGazAleatoire();
  const autres = melanger(BANQUE_REACTIVITE_GAZ.filter((g) => g.id !== bon.id)).slice(0, 3);
  const options: OptionChoix[] = melanger([
    { id: bon.id, texte: bon.raisonReactivite },
    ...autres.map((g) => ({ id: g.id, texte: g.raisonReactivite })),
  ]);

  const enonce = await miseEnSituation([
    `La situation doit porter sur ${bon.application}, qui utilise ${bon.gaz}.`,
    "Ne révèle aucune réponse, ne mentionne pas la raison de ce choix.",
  ]);

  const sousQuestion: SousQuestionChoixUnique = {
    id: "raison-reactivite",
    typeReponse: "choix-unique",
    enonce: `Pourquoi utilise-t-on ${bon.gaz} pour ${bon.application} ?`,
    bareme: { pointsMax: 2 },
    options,
    bonneOptionId: bon.id,
    explication: `${bon.gaz[0].toUpperCase()}${bon.gaz.slice(1)} est utilisé pour ${bon.application} parce qu'${bon.raisonReactivite}.`,
  };

  return {
    id: idAleatoire("dev-reactivite-gaz"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-reactivite",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

// ============================================================
// CHIMIE 5e — Aspect énergétique des transformations
// ============================================================

async function genCourteDiagrammeEnergetique(): Promise<QuestionCourte> {
  const d = genererDiagrammeEnergetique();
  const { eaKJ } = calculerEnergieActivation(d);
  const { deltaHKJ } = calculerVariationEnthalpie(d);
  const classe = classifierReaction(deltaHKJ);

  const enonce = await miseEnSituation([
    `La situation doit décrire une transformation chimique étudiée en laboratoire, dont le diagramme énergétique montre : énergie des réactifs = ${d.energieReactifsKJ} kJ, énergie au sommet (état de transition) = ${d.energieMaxKJ} kJ, énergie des produits = ${d.energieProduitsKJ} kJ.`,
    "N'effectue AUCUN calcul, ne révèle aucune réponse.",
  ]);

  const sousQuestionEa: SousQuestionNumerique = {
    id: "energie-activation",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `D'après ce diagramme énergétique (réactifs à ${d.energieReactifsKJ} kJ, sommet à ${d.energieMaxKJ} kJ, produits à ${d.energieProduitsKJ} kJ), quelle est l'énergie d'activation de cette réaction ?`,
    bareme: { pointsMax: 2 },
    uniteAttendue: "kJ",
    reponseAttendue: eaKJ,
    toleranceRelative: 0.01,
    explication: `L'énergie d'activation est l'écart entre l'énergie des réactifs et le sommet du diagramme : Ea = ${d.energieMaxKJ} - ${d.energieReactifsKJ} = ${eaKJ} kJ.`,
  };

  const sousQuestionDeltaH: SousQuestionNumerique = {
    id: "variation-enthalpie",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la variation d'enthalpie (ΔH) de cette réaction ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "kJ",
    reponseAttendue: deltaHKJ,
    toleranceRelative: 0.01,
    explication: `ΔH = énergie des produits - énergie des réactifs = ${d.energieProduitsKJ} - ${d.energieReactifsKJ} = ${deltaHKJ} kJ.`,
  };

  const options: OptionChoix[] = melanger([
    { id: "exothermique", texte: "Exothermique (elle dégage de l'énergie vers le milieu)." },
    { id: "endothermique", texte: "Endothermique (elle absorbe de l'énergie du milieu)." },
  ]);
  const sousQuestionClasse: SousQuestionChoixUnique = {
    id: "classification",
    typeReponse: "choix-unique",
    enonce: "Selon cette variation d'enthalpie, comment cette réaction est-elle classée ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: classe,
    explication: `Avec ΔH = ${deltaHKJ} kJ (${deltaHKJ < 0 ? "négatif" : "positif"}), cette réaction est ${classe === "exothermique" ? "exothermique : les produits ont moins d'énergie que les réactifs, l'excédent est dégagé" : "endothermique : les produits ont plus d'énergie que les réactifs, le milieu doit en fournir"}.`,
  };

  return {
    id: idAleatoire("dev-diagramme-energetique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-energie-diagramme",
    enonce,
    sousQuestions: [sousQuestionEa, sousQuestionDeltaH, sousQuestionClasse],
  };
}

async function genCourteCalorimetre(): Promise<QuestionCourte> {
  const masseEauG = Math.round(Math.random() * 200 + 100); // 100–300 g
  const deltaT = Number((Math.random() * 15 + 2).toFixed(1)); // 2.0–17.0 °C
  const nMol = Number((Math.random() * 0.4 + 0.05).toFixed(3)); // 0.05–0.45 mol
  const { chaleurJ } = resoudreChaleurCalorimetre({ masseEauG, deltaTCelsius: deltaT });
  const { chaleurMolaireKJParMol } = resoudreChaleurMolaire({ chaleurJ, nMolReagi: nMol });

  const enonce = await miseEnSituation([
    `La situation doit décrire une réaction chimique réalisée dans un calorimètre contenant EXACTEMENT ${masseEauG} g d'eau, dont la température augmente de EXACTEMENT ${deltaT} °C, à la suite de la réaction complète de EXACTEMENT ${nMol} mol de réactif limitant.`,
    "N'effectue AUCUN calcul, ne révèle aucune réponse.",
  ]);

  const sousQuestionChaleur: SousQuestionNumerique = {
    id: "chaleur",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle quantité de chaleur a été dégagée par cette réaction ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "J",
    reponseAttendue: Number(chaleurJ.toFixed(0)),
    toleranceRelative: 0.02,
    explication: `Q = mcΔT = ${masseEauG} × 4,19 × ${deltaT} ≈ ${chaleurJ.toFixed(0)} J (capacité thermique massique de l'eau : 4,19 J/(g·°C)).`,
  };

  const sousQuestionMolaire: SousQuestionNumerique = {
    id: "chaleur-molaire",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `Quelle est la chaleur molaire de cette réaction (sachant que ${nMol} mol de réactif limitant ont réagi) ?`,
    bareme: { pointsMax: 2 },
    uniteAttendue: "kJ/mol",
    reponseAttendue: Number(chaleurMolaireKJParMol.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `Chaleur molaire = Q / n = (${chaleurJ.toFixed(0)} / 1000) / ${nMol} ≈ ${chaleurMolaireKJParMol.toFixed(1)} kJ/mol.`,
  };

  return {
    id: idAleatoire("dev-calorimetre"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-energie-chaleur-molaire",
    enonce,
    sousQuestions: [sousQuestionChaleur, sousQuestionMolaire],
  };
}

// ============================================================
// CHIMIE 5e — Vitesse de réaction
// ============================================================

async function genCourteFacteursVitesse(): Promise<QuestionCourte> {
  const bon = facteurVitesseAleatoire();
  const autres = melanger(BANQUE_FACTEURS_VITESSE.filter((f) => f.id !== bon.id)).slice(0, 3);
  const options: OptionChoix[] = melanger([
    { id: bon.id, texte: bon.facteur },
    ...autres.map((f) => ({ id: f.id, texte: f.facteur })),
  ]);

  const enonce = await miseEnSituation([
    `La situation doit décrire une expérience de chimie où l'on observe que ${bon.effetAugmentation}, sans nommer directement le facteur en cause.`,
    "Ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionChoixUnique = {
    id: "facteur",
    typeReponse: "choix-unique",
    enonce: "Quel facteur explique le mieux cette observation ?",
    bareme: { pointsMax: 2 },
    options,
    bonneOptionId: bon.id,
    explication: `C'est ${bon.facteur} : ${bon.effetAugmentation}.`,
  };

  return {
    id: idAleatoire("dev-facteurs-vitesse"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-vitesse-facteurs",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourteLoiVitesses(): Promise<QuestionCourte> {
  const k = Number((Math.random() * 4 + 0.5).toFixed(2));
  const concentration = Number((Math.random() * 1.5 + 0.2).toFixed(2));
  const ordre = Math.random() < 0.5 ? 1 : 2;
  const { vitesse } = resoudreVitesseReaction({ k, concentrationMolL: concentration, ordre });

  const enonce = await miseEnSituation([
    `La situation doit décrire une réaction chimique en laboratoire dont la vitesse suit la loi v = k[A]${ordre === 1 ? "" : "²"}, avec une constante de vitesse k = ${k} et une concentration de réactif [A] = ${concentration} mol/L.`,
    "N'effectue AUCUN calcul, ne révèle aucune réponse.",
  ]);

  const sousQuestionVitesse: SousQuestionNumerique = {
    id: "vitesse",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: `Avec k = ${k} et [A] = ${concentration} mol/L, quelle est la vitesse de cette réaction, selon la loi v = k[A]${ordre === 1 ? "" : "²"} ?`,
    bareme: { pointsMax: 2 },
    reponseAttendue: Number(vitesse.toFixed(3)),
    toleranceRelative: 0.02,
    explication: `v = k[A]${ordre === 1 ? "" : "²"} = ${k} × ${concentration}${ordre === 1 ? "" : "²"} ≈ ${vitesse.toFixed(3)}.`,
  };

  const options: OptionChoix[] = ordre === 2
    ? [
        { id: "x4", texte: "Elle serait multipliée par 4." },
        { id: "x2", texte: "Elle serait multipliée par 2." },
      ]
    : [
        { id: "x2", texte: "Elle serait multipliée par 2." },
        { id: "x4", texte: "Elle serait multipliée par 4." },
      ];
  const sousQuestionEffet: SousQuestionChoixUnique = {
    id: "effet-doublement",
    typeReponse: "choix-unique",
    enonce: `Si on doublait la concentration [A], que deviendrait la vitesse de cette réaction (toujours selon v = k[A]${ordre === 1 ? "" : "²"}) ?`,
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: ordre === 2 ? "x4" : "x2",
    explication: ordre === 2
      ? "Puisque la vitesse dépend du carré de la concentration, doubler [A] multiplie la vitesse par 2² = 4."
      : "Puisque la vitesse dépend directement de la concentration (ordre 1), doubler [A] double la vitesse.",
  };

  return {
    id: idAleatoire("dev-loi-vitesses"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-vitesse-loi",
    enonce,
    sousQuestions: [sousQuestionVitesse, sousQuestionEffet],
  };
}

// ============================================================
// CHIMIE 5e — Équilibre chimique
// ============================================================

async function genCourteLeChatelier(): Promise<QuestionCourte> {
  const bon = perturbationLeChatelierAleatoire();
  const options: OptionChoix[] = melanger([
    { id: "produits", texte: "Vers les produits" },
    { id: "reactifs", texte: "Vers les réactifs" },
  ]);
  const bonneOptionId = bon.sensDeplacement.includes("produits") ? "produits" : "reactifs";

  const enonce = await miseEnSituation([
    `La situation doit décrire un système chimique à l'équilibre dans un laboratoire, auquel on applique la perturbation suivante : ${bon.perturbation}.`,
    "Ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionChoixUnique = {
    id: "sens-deplacement",
    typeReponse: "choix-unique",
    enonce: `Selon le principe de Le Chatelier, dans quel sens l'équilibre de ce système va-t-il se déplacer à la suite de ${bon.perturbation} ?`,
    bareme: { pointsMax: 2 },
    options,
    bonneOptionId,
    explication: bon.explication,
  };

  return {
    id: idAleatoire("dev-le-chatelier"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-equilibre-le-chatelier",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourtePH(): Promise<QuestionCourte> {
  const concentrationH = Number((Math.random() * 9 + 1).toFixed(1)) * Math.pow(10, -(Math.floor(Math.random() * 5) + 2)); // ex. 3.2e-4
  const { ph } = calculerPH(concentrationH);
  const { concentrationOHMolL } = calculerConcentrationOHDepuisH(concentrationH);

  const enonce = await miseEnSituation([
    `La situation doit décrire une solution aqueuse analysée en laboratoire, dont la concentration en ions hydronium [H₃O⁺] est EXACTEMENT ${concentrationH.toExponential(2)} mol/L.`,
    "N'effectue AUCUN calcul, ne mentionne aucun pH, ne révèle aucune réponse.",
  ]);

  const sousQuestionPH: SousQuestionNumerique = {
    id: "ph",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quel est le pH de cette solution ?",
    bareme: { pointsMax: 2 },
    reponseAttendue: Number(ph.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `pH = -log₁₀[H₃O⁺] = -log₁₀(${concentrationH.toExponential(2)}) ≈ ${ph.toFixed(2)}.`,
  };

  const sousQuestionOH: SousQuestionNumerique = {
    id: "oh",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la concentration molaire en ions hydroxyde [OH⁻] de cette solution, à 25 °C ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "mol/L",
    reponseAttendue: Number(concentrationOHMolL.toExponential(2)),
    toleranceRelative: 0.05,
    explication: `À 25 °C, Ke = [H₃O⁺][OH⁻] = 1,0 × 10⁻¹⁴. Donc [OH⁻] = Ke / [H₃O⁺] = (1,0 × 10⁻¹⁴) / (${concentrationH.toExponential(2)}) ≈ ${concentrationOHMolL.toExponential(2)} mol/L.`,
  };

  return {
    id: idAleatoire("dev-ph"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-equilibre-ph",
    enonce,
    sousQuestions: [sousQuestionPH, sousQuestionOH],
  };
}

async function genCourteKa(): Promise<QuestionCourte> {
  const concHA = Number((Math.random() * 0.4 + 0.1).toFixed(2));
  const concH = Number((concHA * (Math.random() * 0.04 + 0.01)).toExponential(2)); // petite dissociation (acide faible)
  const { ka } = calculerKa({ concHMolL: concH, concAMolL: concH, concHAMolL: concHA });

  const enonce = await miseEnSituation([
    `La situation doit décrire une solution d'acide faible à l'équilibre, analysée en laboratoire, dont les concentrations à l'équilibre sont : [HA] = ${concHA} mol/L, [H₃O⁺] = [A⁻] = ${concH.toExponential(2)} mol/L.`,
    "N'effectue AUCUN calcul, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "ka",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la constante d'acidité (Ka) de cet acide, dans ces conditions ?",
    bareme: { pointsMax: 3 },
    reponseAttendue: Number(ka.toExponential(2)),
    toleranceRelative: 0.05,
    explication: `Ka = [H₃O⁺][A⁻] / [HA] = (${concH.toExponential(2)} × ${concH.toExponential(2)}) / ${concHA} ≈ ${ka.toExponential(2)}.`,
  };

  return {
    id: idAleatoire("dev-ka"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-equilibre-ka-kb",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourteKps(): Promise<QuestionCourte> {
  const solubilite = Number((Math.random() * 9 + 1).toFixed(1)) * Math.pow(10, -(Math.floor(Math.random() * 4) + 3)); // ex. 4.2e-5
  const { kps } = calculerKpsBinaire(solubilite);

  const enonce = await miseEnSituation([
    `La situation doit décrire un sel peu soluble (binaire, type AB) dissous dans l'eau, dont la solubilité mesurée en laboratoire est EXACTEMENT ${solubilite.toExponential(2)} mol/L.`,
    "N'effectue AUCUN calcul, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "kps",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la constante du produit de solubilité (Kps) de ce sel ?",
    bareme: { pointsMax: 3 },
    reponseAttendue: Number(kps.toExponential(2)),
    toleranceRelative: 0.05,
    explication: `Pour un sel binaire AB ⇌ A⁺ + B⁻, à l'équilibre [A⁺] = [B⁻] = s = ${solubilite.toExponential(2)} mol/L. Kps = [A⁺][B⁻] = s² = (${solubilite.toExponential(2)})² ≈ ${kps.toExponential(2)}.`,
  };

  return {
    id: idAleatoire("dev-kps"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-equilibre-kps",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

// ============================================================
// PHYSIQUE 5e — Cinématique
// ============================================================

async function genCourteMRU(): Promise<QuestionCourte> {
  const v = Number((Math.random() * 25 + 2).toFixed(1)); // 2–27 m/s
  const t = Math.round(Math.random() * 25 + 3); // 3–28 s
  const { deplacementM } = resoudreDeplacementMRU({ vitesseMS: v, dureeS: t });

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet (véhicule, cycliste, train, convoyeur) qui se déplace à une vitesse constante de EXACTEMENT ${v} m/s pendant EXACTEMENT ${t} secondes, en ligne droite.`,
    "N'effectue AUCUN calcul, ne mentionne aucun déplacement, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "deplacement",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quel est le déplacement de cet objet pendant cet intervalle de temps ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m",
    reponseAttendue: Number(deplacementM.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `Δs = vΔt = ${v} × ${t} = ${deplacementM.toFixed(1)} m.`,
  };

  return {
    id: idAleatoire("dev-mru"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-mru-position",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourteMRUA(): Promise<QuestionCourte> {
  const vi = Number((Math.random() * 8).toFixed(1)); // 0–8 m/s
  const vf = Number((vi + Math.random() * 20 + 2).toFixed(1));
  const t = Math.round(Math.random() * 8 + 2); // 2–10 s
  const { accelerationMS2 } = resoudreAccelerationMRUA({ viMS: vi, vfMS: vf, dureeS: t });
  const { deplacementM } = resoudreDeplacementMRUA({ viMS: vi, accelerationMS2, dureeS: t });

  const enonce = await miseEnSituation([
    `La situation doit décrire un véhicule ou un objet qui accélère uniformément : sa vitesse passe de EXACTEMENT ${vi} m/s à EXACTEMENT ${vf} m/s en EXACTEMENT ${t} secondes.`,
    "N'effectue AUCUN calcul, ne mentionne aucune accélération ni distance, ne révèle aucune réponse.",
  ]);

  const sousQuestionAccel: SousQuestionNumerique = {
    id: "acceleration",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est l'accélération de cet objet ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m/s²",
    reponseAttendue: Number(accelerationMS2.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `a = Δv / Δt = (${vf} - ${vi}) / ${t} ≈ ${accelerationMS2.toFixed(2)} m/s².`,
  };

  const sousQuestionDistance: SousQuestionNumerique = {
    id: "deplacement",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle distance cet objet a-t-il parcourue pendant cette accélération ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "m",
    reponseAttendue: Number(deplacementM.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `Δs = vᵢΔt + ½aΔt² = (${vi} × ${t}) + 0,5 × ${accelerationMS2.toFixed(2)} × ${t}² ≈ ${deplacementM.toFixed(1)} m.`,
  };

  return {
    id: idAleatoire("dev-mrua"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-mrua-acceleration",
    enonce,
    sousQuestions: [sousQuestionAccel, sousQuestionDistance],
  };
}

async function genCourteChuteLibre(): Promise<QuestionCourte> {
  const t = Number((Math.random() * 3 + 0.5).toFixed(1)); // 0.5–3.5 s
  const { vfMS, deplacementM } = resoudreChuteLibre({ viMS: 0, dureeS: t });

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet lâché sans vitesse initiale (chute libre, résistance de l'air négligée) qui tombe pendant EXACTEMENT ${t} secondes.`,
    "N'effectue AUCUN calcul, ne mentionne aucune vitesse ni distance, ne révèle aucune réponse.",
  ]);

  const sousQuestionVitesse: SousQuestionNumerique = {
    id: "vitesse-finale",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la vitesse de cet objet juste avant qu'il touche le sol ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m/s",
    reponseAttendue: Number(vfMS.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `En chute libre, vf = vi + gΔt = 0 + 9,8 × ${t} ≈ ${vfMS.toFixed(2)} m/s.`,
  };

  const sousQuestionHauteur: SousQuestionNumerique = {
    id: "hauteur",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "De quelle hauteur cet objet est-il tombé ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m",
    reponseAttendue: Number(deplacementM.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `Δs = viΔt + ½gΔt² = 0 + 0,5 × 9,8 × ${t}² ≈ ${deplacementM.toFixed(2)} m.`,
  };

  return {
    id: idAleatoire("dev-chute-libre"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-chute-libre",
    enonce,
    sousQuestions: [sousQuestionVitesse, sousQuestionHauteur],
  };
}

async function genCourtePlanIncline(): Promise<QuestionCourte> {
  const angle = Math.round(Math.random() * 50 + 10); // 10–60°
  const { accelerationMS2 } = resoudreAccelerationPlanIncline({ angleDegres: angle });

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet (ballon, chariot, bloc) qui glisse sans frottement sur un plan incliné faisant un angle de EXACTEMENT ${angle}° avec l'horizontale.`,
    "N'effectue AUCUN calcul, ne mentionne aucune accélération, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "acceleration",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est l'accélération de cet objet le long du plan incliné ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "m/s²",
    reponseAttendue: Number(accelerationMS2.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `La composante de l'accélération gravitationnelle parallèle au plan est a = g·sin(θ) = 9,8 × sin(${angle}°) ≈ ${accelerationMS2.toFixed(2)} m/s².`,
  };

  return {
    id: idAleatoire("dev-plan-incline"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-plan-incline",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourteProjectile(): Promise<QuestionCourte> {
  const vHorizontale = Number((Math.random() * 15 + 3).toFixed(1)); // 3–18 m/s
  const t = Number((Math.random() * 2 + 0.3).toFixed(1)); // 0.3–2.3 s
  const { distanceHorizontaleM } = resoudreProjectileHorizontal({ vitesseHorizontaleMS: vHorizontale, dureeS: t });
  const { chuteVerticaleM } = resoudreProjectileChuteVerticale({ dureeS: t });

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet lancé horizontalement (ex. une balle du bord d'une table, un ballon d'une falaise) avec une vitesse horizontale de EXACTEMENT ${vHorizontale} m/s, qui reste en l'air pendant EXACTEMENT ${t} secondes avant de toucher le sol.`,
    "N'effectue AUCUN calcul, ne mentionne aucune distance ni hauteur, ne révèle aucune réponse.",
  ]);

  const sousQuestionHorizontale: SousQuestionNumerique = {
    id: "distance-horizontale",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle distance horizontale cet objet a-t-il parcourue avant de toucher le sol ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m",
    reponseAttendue: Number(distanceHorizontaleM.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `La composante horizontale du mouvement est un MRU : distance = vΔt = ${vHorizontale} × ${t} ≈ ${distanceHorizontaleM.toFixed(2)} m.`,
  };

  const sousQuestionVerticale: SousQuestionNumerique = {
    id: "chute-verticale",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "De quelle hauteur cet objet est-il tombé (composante verticale du mouvement) ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m",
    reponseAttendue: Number(chuteVerticaleM.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `La composante verticale du mouvement est une chute libre (vitesse verticale initiale nulle) : chute = ½gΔt² = 0,5 × 9,8 × ${t}² ≈ ${chuteVerticaleM.toFixed(2)} m.`,
  };

  return {
    id: idAleatoire("dev-projectile"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-projectiles",
    enonce,
    sousQuestions: [sousQuestionHorizontale, sousQuestionVerticale],
  };
}

// ============================================================
// PHYSIQUE 5e — Dynamique
// ============================================================

async function genCourteLoisNewton(): Promise<QuestionCourte> {
  const masse = Number((Math.random() * 1200 + 50).toFixed(0)); // 50–1250 kg
  const acceleration = Number((Math.random() * 6 + 0.5).toFixed(2)); // 0.5–6.5 m/s²
  const { forceN } = resoudreForceNewton({ masseKg: masse, accelerationMS2: acceleration });

  const enonce = await miseEnSituation([
    `La situation doit décrire un véhicule ou un objet de EXACTEMENT ${masse} kg qui subit une accélération de EXACTEMENT ${acceleration} m/s².`,
    "N'effectue AUCUN calcul, ne mentionne aucune force, ne révèle aucune réponse.",
  ]);

  const sousQuestionForce: SousQuestionNumerique = {
    id: "force",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Selon la 2e loi de Newton, quelle est la force appliquée sur cet objet pour produire cette accélération ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "N",
    reponseAttendue: Number(forceN.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `F = ma = ${masse} × ${acceleration} = ${forceN.toFixed(1)} N.`,
  };

  const exemple = exempleLoiNewtonAleatoire();
  const options: OptionChoix[] = melanger([
    { id: "1re", texte: "Le principe d'inertie (1re loi)" },
    { id: "3e", texte: "Le principe d'action-réaction (3e loi)" },
  ]);
  const sousQuestionLoi: SousQuestionChoixUnique = {
    id: "identification-loi",
    typeReponse: "choix-unique",
    enonce: `Quelle loi de Newton explique le mieux la situation suivante : « ${exemple.exemple} » ?`,
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: exemple.loi === "2e" ? "1re" : exemple.loi,
    explication: exemple.explication,
  };

  return {
    id: idAleatoire("dev-lois-newton"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-dyn-lois-newton",
    enonce,
    sousQuestions: [sousQuestionForce, sousQuestionLoi],
  };
}

async function genCourteFrottement(): Promise<QuestionCourte> {
  const forceMotrice = Math.round(Math.random() * 400 + 100); // 100–500 N
  const forceResultante = Math.round(forceMotrice * (Math.random() * 0.4 + 0.4)); // 40–80% de la motrice
  const { forceFrottementN } = resoudreForceFrottement({ forceMotriceN: forceMotrice, forceResultanteN: forceResultante });

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet poussé ou tiré sur une surface avec une force motrice de EXACTEMENT ${forceMotrice} N, et dont la force résultante mesurée est de EXACTEMENT ${forceResultante} N (du fait du frottement avec la surface).`,
    "N'effectue AUCUN calcul, ne mentionne aucune force de frottement, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "frottement",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la force de frottement qui s'exerce sur cet objet ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "N",
    reponseAttendue: forceFrottementN,
    toleranceRelative: 0.01,
    explication: `Force de frottement = force motrice - force résultante = ${forceMotrice} - ${forceResultante} = ${forceFrottementN} N.`,
  };

  return {
    id: idAleatoire("dev-frottement"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-dyn-force-frottement",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourteResultanteEquilibrante(): Promise<QuestionCourte> {
  const f1 = Math.round(Math.random() * 150 + 50);
  const f2 = Math.round(Math.random() * 150 + 50);
  const resultante = resoudreResultanteColineaire([
    { grandeurN: f1, sens: "positif" },
    { grandeurN: f2, sens: "negatif" },
  ]);
  const equilibrante = resoudreEquilibrante(resultante);
  const sensTexte = (s: "positif" | "negatif") => (s === "positif" ? "vers la droite" : "vers la gauche");

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet soumis à deux forces agissant sur la même droite (ex. jeu de tir à la corde, objet tiré des deux côtés) : une force de EXACTEMENT ${f1} N vers la droite, et une force de EXACTEMENT ${f2} N vers la gauche.`,
    "N'effectue AUCUN calcul, ne révèle aucune réponse.",
  ]);

  const sousQuestionResultante: SousQuestionNumerique = {
    id: "resultante",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la grandeur de la force résultante de ce système ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "N",
    reponseAttendue: resultante.resultanteN,
    toleranceRelative: 0.01,
    explication: `Les deux forces agissent en sens opposés sur la même droite : résultante = |${f1} - ${f2}| = ${resultante.resultanteN} N, orientée ${sensTexte(resultante.sens)}.`,
  };

  const options: OptionChoix[] = melanger([
    { id: "droite", texte: "Vers la droite" },
    { id: "gauche", texte: "Vers la gauche" },
  ]);
  const sousQuestionEquilibrante: SousQuestionChoixUnique = {
    id: "equilibrante",
    typeReponse: "choix-unique",
    enonce: "Dans quelle direction devrait agir la force équilibrante pour que ce système soit en équilibre ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: equilibrante.sens === "positif" ? "droite" : "gauche",
    explication: `La force équilibrante a la même grandeur que la résultante (${equilibrante.equilibranteN} N) mais agit en sens opposé, soit ${sensTexte(equilibrante.sens)}.`,
  };

  return {
    id: idAleatoire("dev-resultante-equilibrante"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-dyn-equilibre-resultante",
    enonce,
    sousQuestions: [sousQuestionResultante, sousQuestionEquilibrante],
  };
}

async function genCourteAccelerationGravitationnelle(): Promise<QuestionCourte> {
  const masse = Math.round(Math.random() * 90 + 10); // 10–100 kg
  const poidsTerre = masse * G_DYN;
  const poidsLune = masse * G_LUNAIRE;

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet ou un astronaute de EXACTEMENT ${masse} kg, dont on compare le poids sur Terre et sur la Lune.`,
    "N'effectue AUCUN calcul, ne mentionne aucun poids, ne révèle aucune réponse.",
  ]);

  const sousQuestionTerre: SousQuestionNumerique = {
    id: "poids-terre",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quel est le poids de cet objet sur Terre ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "N",
    reponseAttendue: Number(poidsTerre.toFixed(1)),
    toleranceRelative: 0.01,
    explication: `Sur Terre, g ≈ 9,8 m/s² : poids = mg = ${masse} × 9,8 = ${poidsTerre.toFixed(1)} N.`,
  };

  const sousQuestionLune: SousQuestionNumerique = {
    id: "poids-lune",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quel serait le poids de ce même objet sur la Lune ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "N",
    reponseAttendue: Number(poidsLune.toFixed(1)),
    toleranceRelative: 0.01,
    explication: `Sur la Lune, g ≈ 1,6 m/s² (environ 6 fois plus faible que sur Terre) : poids = mg = ${masse} × 1,6 = ${poidsLune.toFixed(1)} N. Notez que la masse de l'objet, elle, ne change pas.`,
  };

  return {
    id: idAleatoire("dev-accel-gravitationnelle"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-dyn-accel-gravitationnelle",
    enonce,
    sousQuestions: [sousQuestionTerre, sousQuestionLune],
  };
}

// ============================================================
// PHYSIQUE 5e — Transformation de l'énergie
// ============================================================

async function genCourteEnergieMecanique(): Promise<QuestionCourte> {
  const masse = Number((Math.random() * 60 + 5).toFixed(1)); // 5–65 kg
  const hauteur = Number((Math.random() * 15 + 2).toFixed(1)); // 2–17 m
  const { energiePotentielleJ } = resoudreEnergiePotentielle({ masseKg: masse, hauteurM: hauteur });
  const { vitesseFinaleMS } = resoudreVitesseParConservationEnergie({ hauteurM: hauteur });
  const { energieCinetiqueJ } = resoudreEnergieCinetique({ masseKg: masse, vitesseMS: vitesseFinaleMS });

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet de EXACTEMENT ${masse} kg (ex. wagon de montagnes russes, skieur, objet suspendu) qui part du repos à une hauteur de EXACTEMENT ${hauteur} m et glisse jusqu'au sol sans frottement.`,
    "N'effectue AUCUN calcul, ne mentionne aucune énergie ni vitesse, ne révèle aucune réponse.",
  ]);

  const sousQuestionEp: SousQuestionNumerique = {
    id: "energie-potentielle",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est l'énergie potentielle gravitationnelle de cet objet à sa hauteur initiale ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "J",
    reponseAttendue: Number(energiePotentielleJ.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `Ep = mgh = ${masse} × 9,8 × ${hauteur} ≈ ${energiePotentielleJ.toFixed(1)} J.`,
  };

  const sousQuestionEk: SousQuestionNumerique = {
    id: "energie-cinetique",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "En l'absence de frottement, quelle est l'énergie cinétique de cet objet juste avant qu'il touche le sol ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "J",
    reponseAttendue: Number(energieCinetiqueJ.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `Par conservation de l'énergie mécanique (sans frottement), toute l'énergie potentielle initiale se transforme en énergie cinétique : Ek = Ep = ${energiePotentielleJ.toFixed(1)} J (on retrouve la même valeur, aux arrondis près, via Ek = ½mv² avec v = √(2gh) ≈ ${vitesseFinaleMS.toFixed(2)} m/s).`,
  };

  return {
    id: idAleatoire("dev-energie-mecanique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-energ-mecanique",
    enonce,
    sousQuestions: [sousQuestionEp, sousQuestionEk],
  };
}

async function genCourteHooke(): Promise<QuestionCourte> {
  const k = Math.round(Math.random() * 450 + 50); // 50–500 N/m
  const deltaL = Number((Math.random() * 0.25 + 0.03).toFixed(3)); // 0.03–0.28 m
  const { energieJ } = resoudreEnergieRessort({ constanteElasticiteNParM: k, variationLongueurM: deltaL });

  const enonce = await miseEnSituation([
    `La situation doit décrire un ressort hélicoïdal (ex. matelas, amortisseur, jouet à ressort) de constante d'élasticité EXACTEMENT ${k} N/m, étiré ou comprimé de EXACTEMENT ${deltaL} m par rapport à sa longueur au repos.`,
    "N'effectue AUCUN calcul, ne mentionne aucune énergie, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "energie-ressort",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est l'énergie potentielle élastique emmagasinée dans ce ressort ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "J",
    reponseAttendue: Number(energieJ.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `E = ½kΔℓ² = 0,5 × ${k} × ${deltaL}² ≈ ${energieJ.toFixed(2)} J.`,
  };

  return {
    id: idAleatoire("dev-hooke"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-energ-hooke",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourtePuissanceMecanique(): Promise<QuestionCourte> {
  const travail = Math.round(Math.random() * 4000 + 500); // 500–4500 J
  const temps = Number((Math.random() * 18 + 2).toFixed(1)); // 2–20 s
  const { puissanceW } = resoudrePuissanceMecanique({ travailJ: travail, dureeS: temps });

  const enonce = await miseEnSituation([
    `La situation doit décrire une machine ou une personne qui accomplit un travail de EXACTEMENT ${travail} J en EXACTEMENT ${temps} secondes (ex. monter une charge, pousser un objet sur une distance).`,
    "N'effectue AUCUN calcul, ne mentionne aucune puissance, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "puissance",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la puissance développée dans cette situation ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "W",
    reponseAttendue: Number(puissanceW.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `P = W / Δt = ${travail} / ${temps} ≈ ${puissanceW.toFixed(1)} W.`,
  };

  return {
    id: idAleatoire("dev-puissance-mecanique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-energ-puissance-travail",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

// ============================================================
// PHYSIQUE 5e — Optique géométrique
// ============================================================

async function genCourteIndiceRefraction(): Promise<QuestionCourte> {
  const vitesseMilieu = Math.round((Math.random() * 1.2 + 1.3) * 1e8); // 1.3e8–2.5e8 m/s
  const { indice } = resoudreIndiceRefraction({ vitesseMilieuMS: vitesseMilieu });

  const enonce = await miseEnSituation([
    `La situation doit décrire une expérience où l'on mesure que la lumière se propage à EXACTEMENT ${(vitesseMilieu / 1e8).toFixed(2)} × 10⁸ m/s dans un milieu transparent (ex. eau, verre, plastique).`,
    "N'effectue AUCUN calcul, ne mentionne aucun indice de réfraction, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "indice",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quel est l'indice de réfraction de ce milieu ?",
    bareme: { pointsMax: 2 },
    reponseAttendue: Number(indice.toFixed(2)),
    toleranceRelative: 0.02,
    explication: `n = c / v = (3,0 × 10⁸) / (${(vitesseMilieu / 1e8).toFixed(2)} × 10⁸) ≈ ${indice.toFixed(2)}.`,
  };

  return {
    id: idAleatoire("dev-indice-refraction"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-opt-indice-refraction",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourteRefraction(): Promise<QuestionCourte> {
  const n1 = Number((Math.random() * 0.4 + 1.0).toFixed(2)); // 1.00–1.40
  const n2 = Number((n1 + Math.random() * 0.4 + 0.1).toFixed(2)); // toujours > n1 : solution garantie
  const angle1 = Math.round(Math.random() * 50 + 10); // 10–60°
  const { angle2Degres } = resoudreAngleRefraction({ n1, angle1Degres: angle1, n2 });

  const enonce = await miseEnSituation([
    `La situation doit décrire un rayon lumineux qui passe d'un premier milieu transparent (indice de réfraction ${n1}) à un second milieu plus réfringent (indice de réfraction ${n2}), en frappant la surface avec un angle d'incidence de EXACTEMENT ${angle1}°.`,
    "N'effectue AUCUN calcul, ne mentionne aucun angle de réfraction, ne révèle aucune réponse.",
  ]);

  const sousQuestion: SousQuestionNumerique = {
    id: "angle-refraction",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quel est l'angle de réfraction de ce rayon dans le second milieu ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "°",
    reponseAttendue: Number(angle2Degres.toFixed(1)),
    toleranceRelative: 0.02,
    explication: `Selon la loi de Snell-Descartes, n₁sinθ₁ = n₂sinθ₂ : sinθ₂ = (${n1} × sin${angle1}°) / ${n2}, donc θ₂ ≈ ${angle2Degres.toFixed(1)}°.`,
  };

  return {
    id: idAleatoire("dev-refraction"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-opt-indice-refraction",
    enonce,
    sousQuestions: [sousQuestion],
  };
}

async function genCourteImages(): Promise<QuestionCourte> {
  const f = Number((Math.random() * 0.4 + 0.1).toFixed(2)); // 0.10–0.50 m
  const distanceObjet = Number((f + Math.random() * 1.5 + 0.1).toFixed(2)); // toujours > f
  const hauteurObjet = Number((Math.random() * 0.15 + 0.02).toFixed(2)); // 0.02–0.17 m
  const { distanceImageM } = resoudreDistanceImage({ distanceObjetM: distanceObjet, distanceFocaleM: f });
  const { grandissement } = resoudreGrandissement({ distanceImageM, distanceObjetM: distanceObjet });
  const { hauteurImageM } = resoudreHauteurImage({ grandissement, hauteurObjetM: hauteurObjet });
  const type = classifierTypeImage(distanceImageM);

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet de EXACTEMENT ${hauteurObjet} m de hauteur, placé à EXACTEMENT ${distanceObjet} m d'une lentille (ou d'un miroir) dont la distance focale est de EXACTEMENT ${f} m.`,
    "N'effectue AUCUN calcul, ne révèle aucune réponse.",
  ]);

  const sousQuestionDistance: SousQuestionNumerique = {
    id: "distance-image",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "À quelle distance se forme l'image ?",
    bareme: { pointsMax: 3 },
    uniteAttendue: "m",
    reponseAttendue: Number(distanceImageM.toFixed(2)),
    toleranceRelative: 0.03,
    explication: `1/f = 1/dᵢ + 1/dₒ, donc dᵢ = 1 / (1/${f} - 1/${distanceObjet}) ≈ ${distanceImageM.toFixed(2)} m.`,
  };

  const sousQuestionHauteur: SousQuestionNumerique = {
    id: "hauteur-image",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle est la hauteur de l'image obtenue ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m",
    reponseAttendue: Number(hauteurImageM.toFixed(3)),
    toleranceRelative: 0.03,
    explication: `Le grandissement Gr = -dᵢ/dₒ = -${distanceImageM.toFixed(2)}/${distanceObjet} ≈ ${grandissement.toFixed(2)}. Hauteur de l'image = Gr × hauteur de l'objet = ${grandissement.toFixed(2)} × ${hauteurObjet} ≈ ${hauteurImageM.toFixed(3)} m.`,
  };

  const options: OptionChoix[] = melanger([
    { id: "reelle", texte: "Réelle" },
    { id: "virtuelle", texte: "Virtuelle" },
  ]);
  const sousQuestionType: SousQuestionChoixUnique = {
    id: "type-image",
    typeReponse: "choix-unique",
    enonce: "Quel type d'image est obtenu dans cette situation ?",
    bareme: { pointsMax: 1 },
    options,
    bonneOptionId: type,
    explication: `Avec dᵢ ${distanceImageM >= 0 ? "positif" : "négatif"} (${distanceImageM.toFixed(2)} m), l'image obtenue est ${type === "reelle" ? "réelle" : "virtuelle"}.`,
  };

  return {
    id: idAleatoire("dev-images"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-opt-images-caracteristiques",
    enonce,
    sousQuestions: [sousQuestionDistance, sousQuestionHauteur, sousQuestionType],
  };
}

// ============================================================
// Sélecteur — pige simplement parmi les générateurs des chapitres
// sélectionnés, sans pondération par univers (pas d'épreuve
// ministérielle à respecter pour ces deux cours à option).
// ============================================================

interface GenerateurSecondaire5 {
  cours: CoursSecondaire5[];
  /** Chapitre (voir curriculumSecondaire5.ts) auquel ce générateur appartient. */
  chapitreId: string;
  generer: () => Promise<QuestionCourte>;
}

const GENERATEURS_SECONDAIRE5: GenerateurSecondaire5[] = [
  // --- Chimie 5e ---
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteLoiGenerale },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteGazParfaits },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteDalton },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteVolumeMolaire },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteReactiviteGaz },
  { cours: ["CHIMIE5"], chapitreId: "energie-transformations", generer: genCourteDiagrammeEnergetique },
  { cours: ["CHIMIE5"], chapitreId: "energie-transformations", generer: genCourteCalorimetre },
  { cours: ["CHIMIE5"], chapitreId: "vitesse-reaction", generer: genCourteFacteursVitesse },
  { cours: ["CHIMIE5"], chapitreId: "vitesse-reaction", generer: genCourteLoiVitesses },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourteLeChatelier },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourtePH },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourteKa },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourteKps },
  // --- Physique 5e ---
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteMRU },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteMRUA },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteChuteLibre },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourtePlanIncline },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteProjectile },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteLoisNewton },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteFrottement },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteResultanteEquilibrante },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteAccelerationGravitationnelle },
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genCourteEnergieMecanique },
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genCourteHooke },
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genCourtePuissanceMecanique },
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genCourteIndiceRefraction },
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genCourteRefraction },
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genCourteImages },
];

/**
 * @param chapitresSelectionnes ids de chapitres (voir curriculumSecondaire5.ts)
 * sur lesquels restreindre le tirage. `undefined` = aucune restriction.
 */
export async function genererQuestionDeveloppementSecondaire5(
  cours: CoursSecondaire5,
  chapitresSelectionnes?: Set<string>
): Promise<QuestionCourte> {
  const admissiblesCours = GENERATEURS_SECONDAIRE5.filter((g) => g.cours.includes(cours));
  const disponibles = chapitresSelectionnes
    ? admissiblesCours.filter((g) => chapitresSelectionnes.has(g.chapitreId))
    : admissiblesCours;

  if (disponibles.length === 0) {
    throw new Error("Aucune question disponible pour les chapitres sélectionnés.");
  }

  const entree = disponibles[Math.floor(Math.random() * disponibles.length)];
  return entree.generer();
}
