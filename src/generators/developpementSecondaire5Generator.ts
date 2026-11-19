/**
 * developpementSecondaire5Generator.ts — module "Pratique" pour les
 * cours optionnels de 5e secondaire (Chimie, Physique)
 * ------------------------------------------------------------------
 * Ces deux cours n'ont pas d'épreuve ministérielle unique : pas de
 * sections A/B/C, pas de pondération par univers. Trois formats de
 * question coexistent, pigés au hasard parmi les chapitres choisis,
 * pour varier l'expérience :
 *  - "courte" (QuestionCourte) : mise en situation + sous-questions à
 *    crédit partiel — numérique (problème à étapes) ou choix unique.
 *  - "courte" avec une sous-question "mots-banque" : appariement
 *    (associer des termes à leur définition/exemple/formule).
 *  - "qcm" (QuestionQCMSimple) : question rapide à 2 choix (vrai/faux).
 *
 * Le niveau de difficulté (facile/moyen/difficile, choisi par l'élève
 * via DifficulteSelector5) influence l'ampleur et la précision des
 * valeurs générées, et réduit les problèmes à étapes multiples à une
 * seule étape en mode facile — jamais la portée des concepts eux-mêmes.
 *
 * Même principe que le reste de l'appli : la partie pure (valeurs,
 * calculs, bonne réponse) est déterminée ici, jamais par Gemini —
 * Gemini écrit seulement la mise en situation.
 * ------------------------------------------------------------------
 */

import type {
  QuestionCourte,
  QuestionQCMSimple,
  ChoixQCM,
  SousQuestionNumerique,
  SousQuestionChoixUnique,
  SousQuestionMotsBanque,
  SousQuestionNotee,
  OptionChoix,
  ElementOptique,
} from "../types/question";
import type { CoursSecondaire5, Difficulte } from "../types/curriculumSecondaire5";
import { demanderMiseEnSituation } from "../ai/geminiClient";
import {
  resoudreGazLoiGeneralePression,
  resoudrePressionGazParfait,
  resoudrePressionTotaleDalton,
  resoudrePressionPartielleManquante,
  calculerVolumeMolaire,
  usageGazAleatoire,
  BANQUE_REACTIVITE_GAZ,
  affirmationTheorieCinetiqueAleatoire,
} from "../engines/gazEngine";
import {
  calculerEnergieActivation,
  calculerVariationEnthalpie,
  classifierReaction,
  resoudreChaleurCalorimetre,
  resoudreChaleurMolaire,
  type DiagrammeEnergetique,
} from "../engines/energieChimieEngine";
import { facteurVitesseAleatoire, BANQUE_FACTEURS_VITESSE, resoudreVitesseReaction } from "../engines/viteseReactionEngine";
import {
  calculerPH,
  calculerConcentrationOHDepuisH,
  calculerKa,
  calculerKpsBinaire,
  classifierForceAcide,
  perturbationLeChatelierAleatoire,
} from "../engines/equilibreChimiqueEngine";
import {
  resoudreDeplacementMRU,
  resoudreAccelerationMRUA,
  resoudreDeplacementMRUA,
  resoudreChuteLibre,
  resoudreAccelerationPlanIncline,
  resoudreProjectileHorizontal,
  resoudreProjectileTempsChute,
  affirmationVitesseMoyInstantAleatoire,
} from "../engines/cinematiqueEngine";
import {
  resoudreForceNewton,
  exempleLoiNewtonAleatoire,
  resoudreForceFrottement,
  resoudreResultanteColineaire,
  resoudreEquilibrante,
  affirmationForceCentripeteAleatoire,
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
  affirmationOptiqueAleatoire,
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

// ------------------------------------------------------------
// Difficulté — ampleur des valeurs générées et longueur des
// problèmes à étapes. "moyen" reproduit exactement le comportement
// d'origine (une seule plage par appel) ; "facile" tire dans le
// premier 40 % de cette plage, "difficile" dans une plage étendue
// jusqu'à 50 % au-delà du maximum d'origine.
// ------------------------------------------------------------

function nombreAleatoire(difficulte: Difficulte, min: number, max: number): number {
  const etendue = max - min;
  if (difficulte === "facile") return min + Math.random() * etendue * 0.4;
  if (difficulte === "difficile") return min + etendue * 0.5 + Math.random() * etendue;
  return min + Math.random() * etendue;
}

/** Réduit un problème à étapes multiples à sa seule première (et principale) sous-question en mode facile. */
function sousQuestionsParDifficulte<T>(difficulte: Difficulte, sousQuestions: T[]): T[] {
  if (difficulte === "facile" && sousQuestions.length > 1) return sousQuestions.slice(0, 1);
  return sousQuestions;
}

/** Nombre de distracteurs à garder pour une sous-question à choix unique basée sur une banque. */
function nombreDistracteurs(difficulte: Difficulte): number {
  return difficulte === "facile" ? 1 : 3;
}

// ------------------------------------------------------------
// Corrigé rigoureux — démarche exigée au Québec : données connues,
// formule, substitution, réponse finale à chiffres significatifs.
// Les calculs eux-mêmes restent en pleine précision (voir chaque
// gabarit) ; seule la PRÉSENTATION finale est arrondie, et seulement
// à la toute dernière étape.
// ------------------------------------------------------------

/** Arrondit à `chiffres` chiffres significatifs (3 par défaut). */
function arrondirSig(valeur: number, chiffres = 3): number {
  if (valeur === 0 || !Number.isFinite(valeur)) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(valeur)));
  const facteur = Math.pow(10, chiffres - 1 - magnitude);
  return Math.round(valeur * facteur) / facteur;
}

/** Formate un nombre à `chiffres` chiffres significatifs, en évitant la notation scientifique pour les valeurs usuelles. */
function formatSig(valeur: number, chiffres = 3): string {
  const arrondi = arrondirSig(valeur, chiffres);
  if (arrondi === 0) return "0";
  if (Math.abs(arrondi) >= 1e-3 && Math.abs(arrondi) < 1e7) {
    const magnitude = Math.floor(Math.log10(Math.abs(arrondi)));
    const decimales = Math.max(0, chiffres - 1 - magnitude);
    return arrondi.toFixed(decimales).replace(".", ",");
  }
  return arrondi.toExponential(chiffres - 1).replace(".", ",");
}

/**
 * Construit une explication en 4 temps (données connues, formule, substitution,
 * réponse finale encadrée) — la démarche attendue dans un corrigé de physique
 * ou de chimie au Québec. `chiffres` contrôle la précision de la réponse finale
 * affichée (3 par défaut) ; `donnees`/`substitution` restent du texte libre
 * déjà formaté par l'appelant (symboles, unités SI).
 */
function etapesCorrige(params: {
  donnees: string[];
  formule: string;
  substitution: string;
  reponseValeur: number;
  reponseUnite?: string;
  chiffres?: number;
}): string {
  const valeurFormatee = formatSig(params.reponseValeur, params.chiffres ?? 3);
  const reponse = params.reponseUnite ? `${valeurFormatee} ${params.reponseUnite}` : valeurFormatee;
  return [
    `Données connues : ${params.donnees.join(", ")}.`,
    `Formule : ${params.formule}`,
    `Substitution : ${params.substitution}`,
    `Réponse : ${reponse}`,
  ].join("\n");
}

function construireQcmVraiFaux(params: {
  idPrefixe: string;
  conceptId: string;
  enonce: string;
  correcte: boolean;
  explication: string;
}): QuestionQCMSimple {
  const choix: ChoixQCM[] = melanger([
    { id: "vrai", texte: "Vrai" },
    { id: "faux", texte: "Faux" },
  ]);
  return {
    id: idAleatoire(params.idPrefixe),
    type: "qcm",
    section: "A",
    univers: "materiel",
    conceptId: params.conceptId,
    enonce: params.enonce,
    choix,
    bonneReponseId: params.correcte ? "vrai" : "faux",
    explication: params.explication,
  };
}

/** Pige un sous-ensemble de paires (appariement) dont la taille dépend du niveau de difficulté. */
function pairesParDifficulte<T>(difficulte: Difficulte, toutes: T[]): T[] {
  const n = difficulte === "facile" ? 2 : difficulte === "difficile" ? toutes.length : Math.min(3, toutes.length);
  return melanger(toutes).slice(0, Math.min(n, toutes.length));
}

function construireAppariement(params: {
  conceptId: string;
  consigne: string;
  paires: { libelle: string; motAttendu: string }[];
}): SousQuestionMotsBanque {
  return {
    id: "appariement",
    typeReponse: "mots-banque",
    enonce: params.consigne,
    bareme: { pointsMax: params.paires.length },
    banqueMots: params.paires.map((p) => p.motAttendu),
    emplacements: params.paires.map((p, i) => ({ id: `emp-${i}`, libelle: p.libelle, motAttendu: p.motAttendu })),
    explication: params.paires.map((p) => `${p.libelle} → ${p.motAttendu}`).join(" ; "),
  };
}

// ============================================================
// CHIMIE 5e — Gaz
// ============================================================

async function genCourteLoiGenerale(difficulte: Difficulte): Promise<QuestionCourte> {
  const p1 = Math.round(nombreAleatoire(difficulte, 80, 230)); // kPa
  const v1 = Number(nombreAleatoire(difficulte, 2, 8).toFixed(1)); // L
  const t1C = Math.round(nombreAleatoire(difficulte, 10, 40)); // °C
  const t2C = Math.round(nombreAleatoire(difficulte, -20, 40)); // °C
  const v2 = Number(nombreAleatoire(difficulte, 2, 8).toFixed(1));
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
    explication: etapesCorrige({
      donnees: [`p₁ = ${p1} kPa`, `V₁ = ${v1} L`, `T₁ = ${t1C} °C + 273 = ${t1K} K`, `V₂ = ${v2} L`, `T₂ = ${t2C} °C + 273 = ${t2K} K`],
      formule: "p₁V₁/T₁ = p₂V₂/T₂ (n constant, contenant fermé)",
      substitution: `p₂ = (${p1} × ${v1} × ${t2K}) / (${t1K} × ${v2})`,
      reponseValeur: p2KPa,
      reponseUnite: "kPa",
    }),
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
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionPression, sousQuestionRaison]),
  };
}

async function genCourteGazParfaits(difficulte: Difficulte): Promise<QuestionCourte> {
  const n = Number(nombreAleatoire(difficulte, 0.2, 2.2).toFixed(2));
  const tC = Math.round(nombreAleatoire(difficulte, 5, 65));
  const tK = tC + 273;
  const v = Number(nombreAleatoire(difficulte, 2, 17).toFixed(1));
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
    explication: etapesCorrige({
      donnees: [`n = ${n} mol`, `T = ${tC} °C + 273 = ${tK} K`, `V = ${v} L`, "R = 8,314 kPa·L/(mol·K)"],
      formule: "pV = nRT, donc p = nRT / V",
      substitution: `p = (${n} × 8,314 × ${tK}) / ${v}`,
      reponseValeur: pKPa,
      reponseUnite: "kPa",
    }),
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
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionPression, sousQuestionProportion]),
  };
}

async function genCourteDalton(difficulte: Difficulte): Promise<QuestionCourte> {
  const pA = Math.round(nombreAleatoire(difficulte, 10, 50));
  const pB = Math.round(nombreAleatoire(difficulte, 10, 50));
  const pC = Math.round(nombreAleatoire(difficulte, 10, 50));
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
    explication: etapesCorrige({
      donnees: [`p(A) = ${pA} kPa`, `p(B) = ${pB} kPa`, `p(C) = ${pC} kPa`],
      formule: "p(totale) = p(A) + p(B) + p(C) (loi de Dalton)",
      substitution: `p(totale) = ${pA} + ${pB} + ${pC}`,
      reponseValeur: pTotaleKPa,
      reponseUnite: "kPa",
    }),
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
    explication: etapesCorrige({
      donnees: [`p(totale) = ${pTotaleKPa} kPa`, `p(A) = ${pA} kPa`, `p(B) = ${pB} kPa`],
      formule: "p(C) = p(totale) - p(A) - p(B)",
      substitution: `p(C) = ${pTotaleKPa} - ${pA} - ${pB}`,
      reponseValeur: pManquanteKPa,
      reponseUnite: "kPa",
    }),
  };

  return {
    id: idAleatoire("dev-dalton"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-loi-dalton",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionTotale, sousQuestionManquante]),
  };
}

async function genCourteVolumeMolaire(difficulte: Difficulte): Promise<QuestionCourte> {
  const tC = Math.round(nombreAleatoire(difficulte, -5, 35));
  const tK = tC + 273;
  const pKPa = Math.round(nombreAleatoire(difficulte, 95, 115));
  const { vmLParMol } = calculerVolumeMolaire({ tK, pKPa });
  const nMol = Number(nombreAleatoire(difficulte, 0.5, 2.5).toFixed(2));
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
    explication: etapesCorrige({
      donnees: [`T = ${tC} °C + 273 = ${tK} K`, `p = ${pKPa} kPa`, "R = 8,314 kPa·L/(mol·K)"],
      formule: "Vm = RT / p",
      substitution: `Vm = (8,314 × ${tK}) / ${pKPa}`,
      reponseValeur: vmLParMol,
      reponseUnite: "L/mol",
    }),
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
    explication: etapesCorrige({
      donnees: [`n = ${nMol} mol`, `Vm = ${formatSig(vmLParMol, 3)} L/mol`],
      formule: "V = n × Vm",
      substitution: `V = ${nMol} × ${vmLParMol.toFixed(4)}`,
      reponseValeur: volumeEchantillonL,
      reponseUnite: "L",
    }),
  };

  return {
    id: idAleatoire("dev-volume-molaire"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-volume-molaire",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionVm, sousQuestionVolume]),
  };
}

async function genCourteReactiviteGaz(difficulte: Difficulte): Promise<QuestionCourte> {
  const bon = usageGazAleatoire();
  const autres = melanger(BANQUE_REACTIVITE_GAZ.filter((g) => g.id !== bon.id)).slice(0, nombreDistracteurs(difficulte));
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

async function genQcmTheorieCinetique(): Promise<QuestionQCMSimple> {
  const a = affirmationTheorieCinetiqueAleatoire();
  const enonce = await miseEnSituation([
    "La situation doit évoquer un contexte où l'on observe le comportement d'un gaz (laboratoire, cuisine, atelier).",
    "Ne révèle aucune réponse.",
  ]);
  return construireQcmVraiFaux({
    idPrefixe: "qcm-theorie-cinetique",
    conceptId: "chi5-gaz-theorie-cinetique",
    enonce: `${enonce} Affirmation à évaluer : « ${a.affirmation} » Vrai ou faux ?`,
    correcte: a.correcte,
    explication: a.explication,
  });
}

async function genAppariementGaz(difficulte: Difficulte): Promise<QuestionCourte> {
  const paires = pairesParDifficulte(
    difficulte,
    BANQUE_REACTIVITE_GAZ.map((g) => ({ libelle: g.application[0].toUpperCase() + g.application.slice(1), motAttendu: g.gaz }))
  );

  const enonce = await miseEnSituation([
    "La situation doit évoquer un cours de chimie où l'on révise différentes applications industrielles ou domestiques de gaz.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-gaz"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-gaz-reactivite",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "chi5-gaz-reactivite",
        consigne: "Associe chaque application au gaz qui lui correspond le mieux.",
        paires,
      }),
    ],
  };
}

// ============================================================
// CHIMIE 5e — Aspect énergétique des transformations
// ============================================================

async function genCourteDiagrammeEnergetique(difficulte: Difficulte): Promise<QuestionCourte> {
  const energieReactifsKJ = Math.round(nombreAleatoire(difficulte, 50, 200));
  const energieProduitsKJ = Math.round(nombreAleatoire(difficulte, 20, 170));
  const plusHaute = Math.max(energieReactifsKJ, energieProduitsKJ);
  const energieMaxKJ = plusHaute + Math.round(nombreAleatoire(difficulte, 20, 100));
  const d: DiagrammeEnergetique = { energieReactifsKJ, energieProduitsKJ, energieMaxKJ };
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
    explication: etapesCorrige({
      donnees: [`énergie des réactifs = ${d.energieReactifsKJ} kJ`, `énergie au sommet = ${d.energieMaxKJ} kJ`],
      formule: "Ea = énergie au sommet - énergie des réactifs",
      substitution: `Ea = ${d.energieMaxKJ} - ${d.energieReactifsKJ}`,
      reponseValeur: eaKJ,
      reponseUnite: "kJ",
    }),
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
    explication: etapesCorrige({
      donnees: [`énergie des produits = ${d.energieProduitsKJ} kJ`, `énergie des réactifs = ${d.energieReactifsKJ} kJ`],
      formule: "ΔH = énergie des produits - énergie des réactifs",
      substitution: `ΔH = ${d.energieProduitsKJ} - ${d.energieReactifsKJ}`,
      reponseValeur: deltaHKJ,
      reponseUnite: "kJ",
    }),
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
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionEa, sousQuestionDeltaH, sousQuestionClasse]),
  };
}

async function genCourteCalorimetre(difficulte: Difficulte): Promise<QuestionCourte> {
  const masseEauG = Math.round(nombreAleatoire(difficulte, 100, 300));
  const deltaT = Number(nombreAleatoire(difficulte, 2, 17).toFixed(1));
  const nMol = Number(nombreAleatoire(difficulte, 0.05, 0.45).toFixed(3));
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
    explication: etapesCorrige({
      donnees: [`m = ${masseEauG} g`, `c = 4,19 J/(g·°C) (eau)`, `ΔT = ${deltaT} °C`],
      formule: "Q = mcΔT",
      substitution: `Q = ${masseEauG} × 4,19 × ${deltaT}`,
      reponseValeur: chaleurJ,
      reponseUnite: "J",
    }),
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
    explication: etapesCorrige({
      donnees: [`Q = ${formatSig(chaleurJ, 3)} J`, `n = ${nMol} mol (réactif limitant)`],
      formule: "Chaleur molaire = (Q / 1000) / n",
      substitution: `Chaleur molaire = (${chaleurJ.toFixed(2)} / 1000) / ${nMol}`,
      reponseValeur: chaleurMolaireKJParMol,
      reponseUnite: "kJ/mol",
    }),
  };

  return {
    id: idAleatoire("dev-calorimetre"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-energie-chaleur-molaire",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionChaleur, sousQuestionMolaire]),
  };
}

async function genAppariementEnergieChimie(difficulte: Difficulte): Promise<QuestionCourte> {
  const BANQUE: { libelle: string; motAttendu: string }[] = [
    { libelle: "Représente le bilan énergétique d'une réaction sous forme de courbe", motAttendu: "Diagramme énergétique" },
    { libelle: "Énergie minimale nécessaire pour amorcer une réaction", motAttendu: "Énergie d'activation" },
    { libelle: "Différence d'énergie entre les produits et les réactifs", motAttendu: "Variation d'enthalpie" },
    { libelle: "Quantité de chaleur dégagée ou absorbée par mole de réactif limitant", motAttendu: "Chaleur molaire" },
  ];
  const paires = pairesParDifficulte(difficulte, BANQUE);

  const enonce = await miseEnSituation([
    "La situation doit évoquer une révision en classe de chimie sur l'aspect énergétique des réactions.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-energie-chimie"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-energie-diagramme",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "chi5-energie-diagramme",
        consigne: "Associe chaque description au terme qui lui correspond.",
        paires,
      }),
    ],
  };
}

// ============================================================
// CHIMIE 5e — Vitesse de réaction
// ============================================================

async function genCourteFacteursVitesse(difficulte: Difficulte): Promise<QuestionCourte> {
  const bon = facteurVitesseAleatoire();
  const autres = melanger(BANQUE_FACTEURS_VITESSE.filter((f) => f.id !== bon.id)).slice(0, nombreDistracteurs(difficulte));
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

async function genCourteLoiVitesses(difficulte: Difficulte): Promise<QuestionCourte> {
  const k = Number(nombreAleatoire(difficulte, 0.5, 4.5).toFixed(2));
  const concentration = Number(nombreAleatoire(difficulte, 0.2, 1.7).toFixed(2));
  const ordre = difficulte === "facile" ? 1 : difficulte === "difficile" ? 2 : Math.random() < 0.5 ? 1 : 2;
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
    explication: etapesCorrige({
      donnees: [`k = ${k}`, `[A] = ${concentration} mol/L`],
      formule: `v = k[A]${ordre === 1 ? "" : "²"}`,
      substitution: ordre === 1 ? `v = ${k} × ${concentration}` : `v = ${k} × ${concentration}² = ${k} × ${(concentration * concentration).toFixed(4)}`,
      reponseValeur: vitesse,
      reponseUnite: "",
    }),
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
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionVitesse, sousQuestionEffet]),
  };
}

async function genQcmCatalyseur(): Promise<QuestionQCMSimple> {
  const enonce = await miseEnSituation([
    "La situation doit évoquer une expérience de chimie où l'on utilise un catalyseur pour accélérer une réaction.",
    "Ne révèle aucune réponse.",
  ]);
  return construireQcmVraiFaux({
    idPrefixe: "qcm-catalyseur",
    conceptId: "chi5-vitesse-facteurs",
    enonce: `${enonce} Affirmation à évaluer : « Un catalyseur est consommé au fur et à mesure qu'il accélère une réaction chimique. » Vrai ou faux ?`,
    correcte: false,
    explication: "Faux : un catalyseur abaisse l'énergie d'activation nécessaire à la réaction et l'accélère, mais il n'est pas consommé — il se retrouve intact à la fin de la réaction.",
  });
}

async function genAppariementVitesse(difficulte: Difficulte): Promise<QuestionCourte> {
  const paires = pairesParDifficulte(
    difficulte,
    BANQUE_FACTEURS_VITESSE.map((f) => ({ libelle: f.effetAugmentation[0].toUpperCase() + f.effetAugmentation.slice(1), motAttendu: f.facteur }))
  );

  const enonce = await miseEnSituation([
    "La situation doit évoquer une révision en classe sur les facteurs qui influencent la vitesse d'une réaction chimique.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-vitesse"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-vitesse-facteurs",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "chi5-vitesse-facteurs",
        consigne: "Associe chaque effet observé au facteur qui l'explique.",
        paires,
      }),
    ],
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

async function genCourtePH(difficulte: Difficulte): Promise<QuestionCourte> {
  const mantisse = Number(nombreAleatoire(difficulte, 1, 10).toFixed(1));
  const exposant = Math.floor(nombreAleatoire(difficulte, 2, 7));
  const concentrationH = mantisse * Math.pow(10, -exposant);
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
    explication: etapesCorrige({
      donnees: [`[H₃O⁺] = ${concentrationH.toExponential(2)} mol/L`],
      formule: "pH = -log₁₀[H₃O⁺]",
      substitution: `pH = -log₁₀(${concentrationH.toExponential(2)})`,
      reponseValeur: ph,
      reponseUnite: "",
    }),
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
    explication: etapesCorrige({
      donnees: [`[H₃O⁺] = ${concentrationH.toExponential(2)} mol/L`, "Ke = [H₃O⁺][OH⁻] = 1,0 × 10⁻¹⁴ (à 25 °C)"],
      formule: "[OH⁻] = Ke / [H₃O⁺]",
      substitution: `[OH⁻] = (1,0 × 10⁻¹⁴) / (${concentrationH.toExponential(2)})`,
      reponseValeur: concentrationOHMolL,
      reponseUnite: "mol/L",
    }),
  };

  return {
    id: idAleatoire("dev-ph"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-equilibre-ph",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionPH, sousQuestionOH]),
  };
}

async function genCourteKa(difficulte: Difficulte): Promise<QuestionCourte> {
  const concHA = Number(nombreAleatoire(difficulte, 0.1, 0.5).toFixed(2));
  const fractionDissociee = nombreAleatoire(difficulte, 0.01, 0.05);
  const concH = Number((concHA * fractionDissociee).toExponential(2));
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
    explication: etapesCorrige({
      donnees: [`[HA] = ${concHA} mol/L`, `[H₃O⁺] = [A⁻] = ${concH.toExponential(2)} mol/L`],
      formule: "Ka = [H₃O⁺][A⁻] / [HA]",
      substitution: `Ka = (${concH.toExponential(2)} × ${concH.toExponential(2)}) / ${concHA}`,
      reponseValeur: ka,
      reponseUnite: "",
    }),
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

async function genCourteKps(difficulte: Difficulte): Promise<QuestionCourte> {
  const mantisse = Number(nombreAleatoire(difficulte, 1, 10).toFixed(1));
  const exposant = Math.floor(nombreAleatoire(difficulte, 3, 7));
  const solubilite = mantisse * Math.pow(10, -exposant);
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
    explication: etapesCorrige({
      donnees: [`AB ⇌ A⁺ + B⁻`, `à l'équilibre [A⁺] = [B⁻] = s = ${solubilite.toExponential(2)} mol/L`],
      formule: "Kps = [A⁺][B⁻] = s²",
      substitution: `Kps = (${solubilite.toExponential(2)})²`,
      reponseValeur: kps,
      reponseUnite: "",
    }),
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

async function genQcmForceAcide(difficulte: Difficulte): Promise<QuestionQCMSimple> {
  // Fait exprès de NE PAS utiliser nombreAleatoire ici : la difficulté porte sur
  // la distance au seuil de classification (Ka = 1), pas sur l'ampleur de Ka — sinon
  // "facile" serait toujours un acide faible et "difficile" toujours un acide fort.
  const estFort = Math.random() < 0.5;
  const ka = estFort
    ? difficulte === "difficile"
      ? 1 + Math.random() * 4
      : Math.pow(10, Math.random() * 4 + 1)
    : difficulte === "difficile"
      ? 0.1 + Math.random() * 0.8
      : Math.pow(10, -(Math.random() * 6 + 4));
  const classe = classifierForceAcide(ka);
  const enonce = await miseEnSituation([
    `La situation doit décrire un acide dont la constante d'acidité mesurée en laboratoire est EXACTEMENT Ka = ${ka.toExponential(2)}.`,
    "Ne révèle aucune réponse.",
  ]);
  const choix: ChoixQCM[] = melanger([
    { id: "fort", texte: "Un acide fort" },
    { id: "faible", texte: "Un acide faible" },
  ]);
  return {
    id: idAleatoire("qcm-force-acide"),
    type: "qcm",
    section: "A",
    univers: "materiel",
    conceptId: "chi5-equilibre-ka-kb",
    enonce: `${enonce} Avec Ka = ${ka.toExponential(2)}, cet acide est-il... ?`,
    choix,
    bonneReponseId: classe,
    explication: `Un acide avec une constante d'acidité Ka ${classe === "fort" ? "élevée (> 1)" : "petite (< 1)"} se dissocie ${classe === "fort" ? "presque totalement" : "très peu"} dans l'eau : c'est un acide ${classe}.`,
  };
}

async function genAppariementEquilibre(difficulte: Difficulte): Promise<QuestionCourte> {
  const BANQUE: { libelle: string; motAttendu: string }[] = [
    { libelle: "Mesure la force d'un acide ou d'une base à l'équilibre", motAttendu: "Ka ou Kb" },
    { libelle: "Mesure la solubilité d'un sel peu soluble", motAttendu: "Kps" },
    { libelle: "Constante d'équilibre de l'ionisation de l'eau, à 25 °C", motAttendu: "Ke" },
    { libelle: "Prédit le sens de déplacement d'un équilibre perturbé", motAttendu: "Principe de Le Chatelier" },
  ];
  const paires = pairesParDifficulte(difficulte, BANQUE);

  const enonce = await miseEnSituation([
    "La situation doit évoquer une révision en classe de chimie sur l'équilibre chimique.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-equilibre"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "chi5-equilibre-le-chatelier",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "chi5-equilibre-le-chatelier",
        consigne: "Associe chaque description à la constante ou au principe correspondant.",
        paires,
      }),
    ],
  };
}

// ============================================================
// PHYSIQUE 5e — Cinématique
// ============================================================

async function genCourteMRU(difficulte: Difficulte): Promise<QuestionCourte> {
  const v = Number(nombreAleatoire(difficulte, 2, 27).toFixed(1));
  const t = Math.round(nombreAleatoire(difficulte, 3, 28));
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
    explication: etapesCorrige({
      donnees: [`v = ${v} m/s`, `Δt = ${t} s`],
      formule: "Δs = vΔt",
      substitution: `Δs = ${v} × ${t}`,
      reponseValeur: deplacementM,
      reponseUnite: "m",
    }),
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

async function genCourteMRUA(difficulte: Difficulte): Promise<QuestionCourte> {
  const vi = Number(nombreAleatoire(difficulte, 0, 8).toFixed(1));
  const vf = Number((vi + nombreAleatoire(difficulte, 2, 22)).toFixed(1));
  const t = Math.round(nombreAleatoire(difficulte, 2, 10));
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
    explication: etapesCorrige({
      donnees: [`vᵢ = ${vi} m/s`, `v_f = ${vf} m/s`, `Δt = ${t} s`],
      formule: "a = Δv / Δt",
      substitution: `a = (${vf} - ${vi}) / ${t}`,
      reponseValeur: accelerationMS2,
      reponseUnite: "m/s²",
    }),
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
    explication: etapesCorrige({
      donnees: [`vᵢ = ${vi} m/s`, `a = ${formatSig(accelerationMS2, 3)} m/s² (valeur exacte conservée pour le calcul)`, `Δt = ${t} s`],
      formule: "Δs = vᵢΔt + ½aΔt²",
      substitution: `Δs = (${vi} × ${t}) + 0,5 × ${accelerationMS2.toFixed(4)} × ${t}²`,
      reponseValeur: deplacementM,
      reponseUnite: "m",
    }),
  };

  return {
    id: idAleatoire("dev-mrua"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-mrua-acceleration",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionAccel, sousQuestionDistance]),
  };
}

async function genCourteChuteLibre(difficulte: Difficulte): Promise<QuestionCourte> {
  const t = Number(nombreAleatoire(difficulte, 0.5, 3.5).toFixed(1));
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
    explication: etapesCorrige({
      donnees: [`vᵢ = 0 m/s (lâché sans élan)`, `g = 9,8 m/s²`, `Δt = ${t} s`],
      formule: "v_f = vᵢ + gΔt",
      substitution: `v_f = 0 + 9,8 × ${t}`,
      reponseValeur: vfMS,
      reponseUnite: "m/s",
    }),
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
    explication: etapesCorrige({
      donnees: [`vᵢ = 0 m/s`, `g = 9,8 m/s²`, `Δt = ${t} s`],
      formule: "Δs = vᵢΔt + ½gΔt²",
      substitution: `Δs = 0 + 0,5 × 9,8 × ${t}²`,
      reponseValeur: deplacementM,
      reponseUnite: "m",
    }),
  };

  return {
    id: idAleatoire("dev-chute-libre"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-chute-libre",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionVitesse, sousQuestionHauteur]),
  };
}

async function genCourtePlanIncline(difficulte: Difficulte): Promise<QuestionCourte> {
  const angle = Math.round(nombreAleatoire(difficulte, 10, 60));
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
    explication: etapesCorrige({
      donnees: [`θ = ${angle}°`, `g = 9,8 m/s²`, "frottement négligeable"],
      formule: "a = g·sin(θ)",
      substitution: `a = 9,8 × sin(${angle}°)`,
      reponseValeur: accelerationMS2,
      reponseUnite: "m/s²",
    }),
  };

  return {
    id: idAleatoire("dev-plan-incline"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-plan-incline",
    enonce,
    sousQuestions: [sousQuestion],
    diagramme: { type: "plan-incline", angleDegres: angle },
  };
}

async function genCourteProjectile(difficulte: Difficulte): Promise<QuestionCourte> {
  const vHorizontale = Number(nombreAleatoire(difficulte, 3, 18).toFixed(1));
  const hauteurInitialeM = Number(nombreAleatoire(difficulte, 1.5, 25).toFixed(1));
  const { dureeS } = resoudreProjectileTempsChute({ hauteurInitialeM });
  const { distanceHorizontaleM } = resoudreProjectileHorizontal({ vitesseHorizontaleMS: vHorizontale, dureeS });

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet lancé horizontalement (ex. une balle du bord d'une table, un ballon d'une falaise) avec une vitesse horizontale de EXACTEMENT ${vHorizontale} m/s, depuis une hauteur de EXACTEMENT ${hauteurInitialeM} m au-dessus du sol.`,
    "N'effectue AUCUN calcul, ne mentionne aucun temps de vol ni distance, ne révèle aucune réponse.",
  ]);

  const sousQuestionTemps: SousQuestionNumerique = {
    id: "temps-vol",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Combien de temps cet objet reste-t-il en l'air avant de toucher le sol ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "s",
    reponseAttendue: Number(dureeS.toFixed(2)),
    toleranceRelative: 0.02,
    explication: etapesCorrige({
      donnees: [`h = ${hauteurInitialeM} m`, "vertical initial nul (lancement horizontal)", "g = 9,8 m/s²"],
      formule: "Δt = √(2h / g)",
      substitution: `Δt = √(2 × ${hauteurInitialeM} / 9,8)`,
      reponseValeur: dureeS,
      reponseUnite: "s",
    }),
  };

  const sousQuestionHorizontale: SousQuestionNumerique = {
    id: "distance-horizontale",
    typeReponse: "numerique",
    demandeDemarche: true,
    enonce: "Quelle distance horizontale (portée) cet objet a-t-il parcourue avant de toucher le sol ?",
    bareme: { pointsMax: 2 },
    uniteAttendue: "m",
    reponseAttendue: Number(distanceHorizontaleM.toFixed(2)),
    toleranceRelative: 0.02,
    explication: etapesCorrige({
      donnees: [`v_x = ${vHorizontale} m/s (constante)`, `Δt = ${formatSig(dureeS, 3)} s (calculé à la partie précédente, valeur exacte conservée)`],
      formule: "Δx = v_xΔt",
      substitution: `Δx = ${vHorizontale} × ${dureeS.toFixed(4)}`,
      reponseValeur: distanceHorizontaleM,
      reponseUnite: "m",
    }),
  };

  return {
    id: idAleatoire("dev-projectile"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-projectiles",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionTemps, sousQuestionHorizontale]),
    diagramme: {
      type: "projectile",
      horizontal: true,
      viMS: vHorizontale,
      angleDegres: 0,
      hauteurInitialeM,
      corrige: { porteeM: distanceHorizontaleM, tempsVolS: dureeS },
    },
  };
}

async function genQcmVitesseMoyInstant(): Promise<QuestionQCMSimple> {
  const a = affirmationVitesseMoyInstantAleatoire();
  const enonce = await miseEnSituation([
    "La situation doit évoquer un déplacement observé ou mesuré (sport, transport, laboratoire).",
    "Ne révèle aucune réponse.",
  ]);
  return construireQcmVraiFaux({
    idPrefixe: "qcm-vitesse-moy-instant",
    conceptId: "phy5-cine-vitesse-moy-instant",
    enonce: `${enonce} Affirmation à évaluer : « ${a.affirmation} » Vrai ou faux ?`,
    correcte: a.correcte,
    explication: a.explication,
  });
}

async function genAppariementCinematique(difficulte: Difficulte): Promise<QuestionCourte> {
  const BANQUE: { libelle: string; motAttendu: string }[] = [
    { libelle: "Δs = vΔt", motAttendu: "Mouvement rectiligne uniforme" },
    { libelle: "a = Δv/Δt", motAttendu: "Accélération" },
    { libelle: "Δs = vᵢΔt + ½aΔt²", motAttendu: "Distance en MRUA" },
    { libelle: "v = √(2gh)", motAttendu: "Vitesse finale en chute libre" },
  ];
  const paires = pairesParDifficulte(difficulte, BANQUE);

  const enonce = await miseEnSituation([
    "La situation doit évoquer une révision en classe de physique sur les relations mathématiques du mouvement.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-cinematique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-cine-mru-position",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "phy5-cine-mru-position",
        consigne: "Associe chaque relation mathématique au mouvement qu'elle décrit.",
        paires,
      }),
    ],
  };
}

// ============================================================
// PHYSIQUE 5e — Dynamique
// ============================================================

async function genCourteLoisNewton(difficulte: Difficulte): Promise<QuestionCourte> {
  const masse = Number(nombreAleatoire(difficulte, 50, 1250).toFixed(0));
  const acceleration = Number(nombreAleatoire(difficulte, 0.5, 6.5).toFixed(2));
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
    explication: etapesCorrige({
      donnees: [`m = ${masse} kg`, `a = ${acceleration} m/s²`],
      formule: "F = ma",
      substitution: `F = ${masse} × ${acceleration}`,
      reponseValeur: forceN,
      reponseUnite: "N",
    }),
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
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionForce, sousQuestionLoi]),
  };
}

async function genCourteFrottement(difficulte: Difficulte): Promise<QuestionCourte> {
  const forceMotrice = Math.round(nombreAleatoire(difficulte, 100, 500));
  const forceResultante = Math.round(forceMotrice * nombreAleatoire(difficulte, 0.4, 0.8));
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
    explication: etapesCorrige({
      donnees: [`F motrice = ${forceMotrice} N`, `F résultante (mesurée) = ${forceResultante} N`],
      formule: "F frottement = F motrice - F résultante",
      substitution: `F frottement = ${forceMotrice} - ${forceResultante}`,
      reponseValeur: forceFrottementN,
      reponseUnite: "N",
    }),
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

async function genCourteResultanteEquilibrante(difficulte: Difficulte): Promise<QuestionCourte> {
  const f1 = Math.round(nombreAleatoire(difficulte, 50, 200));
  const f2 = Math.round(nombreAleatoire(difficulte, 50, 200));
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
    explication: etapesCorrige({
      donnees: [`F₁ = ${f1} N (droite)`, `F₂ = ${f2} N (gauche)`],
      formule: "F résultante = |F₁ - F₂|, orientée vers la force la plus grande",
      substitution: `F résultante = |${f1} - ${f2}|, orientée ${sensTexte(resultante.sens)}`,
      reponseValeur: resultante.resultanteN,
      reponseUnite: "N",
    }),
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
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionResultante, sousQuestionEquilibrante]),
  };
}

async function genCourteAccelerationGravitationnelle(difficulte: Difficulte): Promise<QuestionCourte> {
  const masse = Math.round(nombreAleatoire(difficulte, 10, 100));
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
    explication: etapesCorrige({
      donnees: [`m = ${masse} kg`, "g (Terre) = 9,8 N/kg"],
      formule: "Fg = mg",
      substitution: `Fg = ${masse} × 9,8`,
      reponseValeur: poidsTerre,
      reponseUnite: "N",
    }),
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
    explication: etapesCorrige({
      donnees: [`m = ${masse} kg (la masse ne change pas d'un astre à l'autre)`, "g (Lune) = 1,6 N/kg (environ 6 fois plus faible que sur Terre)"],
      formule: "Fg = mg",
      substitution: `Fg = ${masse} × 1,6`,
      reponseValeur: poidsLune,
      reponseUnite: "N",
    }),
  };

  return {
    id: idAleatoire("dev-accel-gravitationnelle"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-dyn-accel-gravitationnelle",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionTerre, sousQuestionLune]),
  };
}

async function genQcmForceCentripete(): Promise<QuestionQCMSimple> {
  const a = affirmationForceCentripeteAleatoire();
  const enonce = await miseEnSituation([
    "La situation doit évoquer un objet en mouvement circulaire (manège, voiture dans une courbe, satellite).",
    "Ne révèle aucune réponse.",
  ]);
  return construireQcmVraiFaux({
    idPrefixe: "qcm-force-centripete",
    conceptId: "phy5-dyn-force-centripete",
    enonce: `${enonce} Affirmation à évaluer : « ${a.affirmation} » Vrai ou faux ?`,
    correcte: a.correcte,
    explication: a.explication,
  });
}

async function genAppariementDynamique(difficulte: Difficulte): Promise<QuestionCourte> {
  const paires = pairesParDifficulte(
    difficulte,
    [
      { libelle: "Les passagers d'une voiture sont projetés vers l'avant quand elle freine brusquement", motAttendu: "Principe d'inertie (1re loi)" },
      { libelle: "On peut retirer rapidement une nappe sans faire tomber la vaisselle", motAttendu: "Principe d'inertie (1re loi)" },
      { libelle: "Une fusée est propulsée vers le haut en éjectant des gaz vers le bas", motAttendu: "Principe d'action-réaction (3e loi)" },
      { libelle: "Un nageur avance en poussant l'eau vers l'arrière", motAttendu: "Principe d'action-réaction (3e loi)" },
    ]
  );

  const enonce = await miseEnSituation([
    "La situation doit évoquer une révision en classe de physique sur les lois de Newton.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-dynamique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-dyn-lois-newton",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "phy5-dyn-lois-newton",
        consigne: "Associe chaque situation à la loi de Newton qui l'explique.",
        paires,
      }),
    ],
  };
}

// ============================================================
// PHYSIQUE 5e — Transformation de l'énergie
// ============================================================

async function genCourteEnergieMecanique(difficulte: Difficulte): Promise<QuestionCourte> {
  const masse = Number(nombreAleatoire(difficulte, 5, 65).toFixed(1));
  const hauteur = Number(nombreAleatoire(difficulte, 2, 17).toFixed(1));
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
    explication: etapesCorrige({
      donnees: [`m = ${masse} kg`, `h = ${hauteur} m`, "g = 9,8 m/s²"],
      formule: "Ep = mgh",
      substitution: `Ep = ${masse} × 9,8 × ${hauteur}`,
      reponseValeur: energiePotentielleJ,
      reponseUnite: "J",
    }),
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
    explication: etapesCorrige({
      donnees: [`Ep initiale = ${formatSig(energiePotentielleJ, 3)} J`, "aucun frottement (énergie mécanique conservée)"],
      formule: "Ek finale = Ep initiale (conservation de l'énergie mécanique)",
      substitution: `Ek = ${energiePotentielleJ.toFixed(4)} J (ce qui correspond à v = √(2gh) ≈ ${vitesseFinaleMS.toFixed(2)} m/s au sol)`,
      reponseValeur: energieCinetiqueJ,
      reponseUnite: "J",
    }),
  };

  return {
    id: idAleatoire("dev-energie-mecanique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-energ-mecanique",
    enonce,
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionEp, sousQuestionEk]),
  };
}

async function genCourteHooke(difficulte: Difficulte): Promise<QuestionCourte> {
  const k = Math.round(nombreAleatoire(difficulte, 50, 500));
  const deltaL = Number(nombreAleatoire(difficulte, 0.03, 0.28).toFixed(3));
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
    explication: etapesCorrige({
      donnees: [`k = ${k} N/m`, `Δℓ = ${deltaL} m`],
      formule: "E = ½kΔℓ²",
      substitution: `E = 0,5 × ${k} × ${deltaL}²`,
      reponseValeur: energieJ,
      reponseUnite: "J",
    }),
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

async function genCourtePuissanceMecanique(difficulte: Difficulte): Promise<QuestionCourte> {
  const travail = Math.round(nombreAleatoire(difficulte, 500, 4500));
  const temps = Number(nombreAleatoire(difficulte, 2, 20).toFixed(1));
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
    explication: etapesCorrige({
      donnees: [`W = ${travail} J`, `Δt = ${temps} s`],
      formule: "P = W / Δt",
      substitution: `P = ${travail} / ${temps}`,
      reponseValeur: puissanceW,
      reponseUnite: "W",
    }),
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

async function genQcmHookeProportion(): Promise<QuestionQCMSimple> {
  const enonce = await miseEnSituation([
    "La situation doit évoquer un ressort hélicoïdal étiré en laboratoire.",
    "Ne révèle aucune réponse.",
  ]);
  const choix: ChoixQCM[] = melanger([
    { id: "x4", texte: "Elle serait multipliée par 4" },
    { id: "x2", texte: "Elle serait multipliée par 2" },
  ]);
  return {
    id: idAleatoire("qcm-hooke-proportion"),
    type: "qcm",
    section: "A",
    univers: "materiel",
    conceptId: "phy5-energ-hooke",
    enonce: `${enonce} Si on double l'allongement d'un ressort par rapport à sa longueur au repos, que devient son énergie potentielle élastique (E = ½kΔℓ²) ?`,
    choix,
    bonneReponseId: "x4",
    explication: "L'énergie potentielle élastique dépend du CARRÉ de la variation de longueur (Δℓ²) : doubler Δℓ multiplie donc l'énergie par 2² = 4.",
  };
}

async function genAppariementEnergiePhysique(difficulte: Difficulte): Promise<QuestionCourte> {
  const BANQUE: { libelle: string; motAttendu: string }[] = [
    { libelle: "Ek = ½mv²", motAttendu: "Énergie cinétique" },
    { libelle: "Ep = mgh", motAttendu: "Énergie potentielle gravitationnelle" },
    { libelle: "E = ½kΔℓ²", motAttendu: "Énergie potentielle élastique (loi de Hooke)" },
    { libelle: "P = W/Δt", motAttendu: "Puissance" },
  ];
  const paires = pairesParDifficulte(difficulte, BANQUE);

  const enonce = await miseEnSituation([
    "La situation doit évoquer une révision en classe de physique sur les formes d'énergie.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-energie-physique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-energ-mecanique",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "phy5-energ-mecanique",
        consigne: "Associe chaque formule à la grandeur qu'elle permet de calculer.",
        paires,
      }),
    ],
  };
}

// ============================================================
// PHYSIQUE 5e — Optique géométrique
// ============================================================

async function genCourteIndiceRefraction(difficulte: Difficulte): Promise<QuestionCourte> {
  const vitesseMilieu = Math.round(nombreAleatoire(difficulte, 1.3e8, 2.5e8));
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
    explication: etapesCorrige({
      donnees: [`c = 3,0 × 10⁸ m/s (vitesse de la lumière dans le vide)`, `v = ${(vitesseMilieu / 1e8).toFixed(2)} × 10⁸ m/s (vitesse dans le milieu)`],
      formule: "n = c / v",
      substitution: `n = (3,0 × 10⁸) / (${(vitesseMilieu / 1e8).toFixed(2)} × 10⁸)`,
      reponseValeur: indice,
      reponseUnite: "",
    }),
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

async function genCourteRefraction(difficulte: Difficulte): Promise<QuestionCourte> {
  const n1 = Number(nombreAleatoire(difficulte, 1.0, 1.4).toFixed(2));
  const n2 = Number((n1 + nombreAleatoire(difficulte, 0.1, 0.5)).toFixed(2));
  const angle1 = Math.round(nombreAleatoire(difficulte, 10, 60));
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
    explication: etapesCorrige({
      donnees: [`n₁ = ${n1}`, `θ₁ = ${angle1}°`, `n₂ = ${n2}`],
      formule: "n₁sinθ₁ = n₂sinθ₂",
      substitution: `sinθ₂ = (${n1} × sin${angle1}°) / ${n2} = ${((n1 * Math.sin((angle1 * Math.PI) / 180)) / n2).toFixed(4)}, donc θ₂ = arcsin(${((n1 * Math.sin((angle1 * Math.PI) / 180)) / n2).toFixed(4)})`,
      reponseValeur: angle2Degres,
      reponseUnite: "°",
    }),
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

async function genCourteImages(difficulte: Difficulte): Promise<QuestionCourte> {
  const f = Number(nombreAleatoire(difficulte, 0.1, 0.5).toFixed(2));
  const distanceObjet = Number((f + nombreAleatoire(difficulte, 0.1, 1.6)).toFixed(2));
  const hauteurObjet = Number(nombreAleatoire(difficulte, 0.02, 0.17).toFixed(2));
  const { distanceImageM } = resoudreDistanceImage({ distanceObjetM: distanceObjet, distanceFocaleM: f });
  const { grandissement } = resoudreGrandissement({ distanceImageM, distanceObjetM: distanceObjet });
  const { hauteurImageM } = resoudreHauteurImage({ grandissement, hauteurObjetM: hauteurObjet });
  const type = classifierTypeImage(distanceImageM);

  const element: ElementOptique = Math.random() < 0.5 ? "lentille-convergente" : "miroir-concave";
  const nomElement = element === "lentille-convergente" ? "lentille convergente" : "miroir concave";

  const enonce = await miseEnSituation([
    `La situation doit décrire un objet de EXACTEMENT ${hauteurObjet} m de hauteur, placé à EXACTEMENT ${distanceObjet} m d'une ${nomElement} dont la distance focale est de EXACTEMENT ${f} m.`,
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
    explication: etapesCorrige({
      donnees: [`f = ${f} m`, `dₒ = ${distanceObjet} m`],
      formule: "1/f = 1/dᵢ + 1/dₒ",
      substitution: `dᵢ = 1 / (1/${f} - 1/${distanceObjet})`,
      reponseValeur: distanceImageM,
      reponseUnite: "m",
    }),
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
    explication: etapesCorrige({
      donnees: [`dᵢ = ${formatSig(distanceImageM, 3)} m`, `dₒ = ${distanceObjet} m`, `hₒ = ${hauteurObjet} m`],
      formule: "Gr = -dᵢ/dₒ, puis hᵢ = Gr × hₒ",
      substitution: `Gr = -${distanceImageM.toFixed(4)}/${distanceObjet} = ${grandissement.toFixed(4)}, puis hᵢ = ${grandissement.toFixed(4)} × ${hauteurObjet}`,
      reponseValeur: hauteurImageM,
      reponseUnite: "m",
    }),
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
    sousQuestions: sousQuestionsParDifficulte(difficulte, [sousQuestionDistance, sousQuestionHauteur, sousQuestionType]),
    diagramme: {
      type: "optique",
      element,
      fM: f,
      doM: distanceObjet,
      hoM: hauteurObjet,
      corrige: { diM: distanceImageM, hiM: hauteurImageM },
    },
  };
}

async function genQcmOptique(): Promise<QuestionQCMSimple> {
  const a = affirmationOptiqueAleatoire();
  const enonce = await miseEnSituation([
    "La situation doit évoquer une expérience ou une observation en optique (laboratoire, miroir, lentille, fibre optique).",
    "Ne révèle aucune réponse.",
  ]);
  return construireQcmVraiFaux({
    idPrefixe: "qcm-optique",
    conceptId: "phy5-opt-reflexion-rayons",
    enonce: `${enonce} Affirmation à évaluer : « ${a.affirmation} » Vrai ou faux ?`,
    correcte: a.correcte,
    explication: a.explication,
  });
}

async function genAppariementOptique(difficulte: Difficulte): Promise<QuestionCourte> {
  const BANQUE: { libelle: string; motAttendu: string }[] = [
    { libelle: "Sur une surface lisse, les rayons parallèles sont réfléchis parallèlement entre eux", motAttendu: "Réflexion spéculaire" },
    { libelle: "Sur une surface rugueuse, les rayons réfléchis repartent dans des directions désordonnées", motAttendu: "Réflexion diffuse" },
    { libelle: "Rapport entre la vitesse de la lumière dans le vide et sa vitesse dans un milieu", motAttendu: "Indice de réfraction" },
    { libelle: "Principe qui permet à la lumière de rester guidée à l'intérieur d'une fibre optique", motAttendu: "Réflexion totale interne" },
  ];
  const paires = pairesParDifficulte(difficulte, BANQUE);

  const enonce = await miseEnSituation([
    "La situation doit évoquer une révision en classe de physique sur l'optique géométrique.",
    "Ne révèle aucune réponse.",
  ]);

  return {
    id: idAleatoire("dev-appariement-optique"),
    type: "courte",
    section: "B",
    univers: "materiel",
    conceptId: "phy5-opt-reflexion-rayons",
    enonce,
    sousQuestions: [
      construireAppariement({
        conceptId: "phy5-opt-reflexion-rayons",
        consigne: "Associe chaque description au concept correspondant.",
        paires,
      }),
    ],
  };
}

// ============================================================
// Sélecteur — pige simplement parmi les générateurs des chapitres
// sélectionnés, sans pondération par univers (pas d'épreuve
// ministérielle à respecter pour ces deux cours à option). Trois
// formats coexistent (problème à étapes, appariement, QCM rapide)
// pour varier l'expérience, comme demandé.
// ============================================================

type ResultatGenerateur5 = QuestionCourte | QuestionQCMSimple;

interface GenerateurSecondaire5 {
  cours: CoursSecondaire5[];
  /** Chapitre (voir curriculumSecondaire5.ts) auquel ce générateur appartient. */
  chapitreId: string;
  generer: (difficulte: Difficulte) => Promise<ResultatGenerateur5>;
}

const GENERATEURS_SECONDAIRE5: GenerateurSecondaire5[] = [
  // --- Chimie 5e — Gaz ---
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteLoiGenerale },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteGazParfaits },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteDalton },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteVolumeMolaire },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genCourteReactiviteGaz },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genQcmTheorieCinetique },
  { cours: ["CHIMIE5"], chapitreId: "gaz", generer: genAppariementGaz },
  // --- Chimie 5e — Aspect énergétique des transformations ---
  { cours: ["CHIMIE5"], chapitreId: "energie-transformations", generer: genCourteDiagrammeEnergetique },
  { cours: ["CHIMIE5"], chapitreId: "energie-transformations", generer: genCourteCalorimetre },
  { cours: ["CHIMIE5"], chapitreId: "energie-transformations", generer: genAppariementEnergieChimie },
  // --- Chimie 5e — Vitesse de réaction ---
  { cours: ["CHIMIE5"], chapitreId: "vitesse-reaction", generer: genCourteFacteursVitesse },
  { cours: ["CHIMIE5"], chapitreId: "vitesse-reaction", generer: genCourteLoiVitesses },
  { cours: ["CHIMIE5"], chapitreId: "vitesse-reaction", generer: genQcmCatalyseur },
  { cours: ["CHIMIE5"], chapitreId: "vitesse-reaction", generer: genAppariementVitesse },
  // --- Chimie 5e — Équilibre chimique ---
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourteLeChatelier },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourtePH },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourteKa },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genCourteKps },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genQcmForceAcide },
  { cours: ["CHIMIE5"], chapitreId: "equilibre-chimique", generer: genAppariementEquilibre },
  // --- Physique 5e — Cinématique ---
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteMRU },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteMRUA },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteChuteLibre },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourtePlanIncline },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genCourteProjectile },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genQcmVitesseMoyInstant },
  { cours: ["PHYSIQUE5"], chapitreId: "cinematique", generer: genAppariementCinematique },
  // --- Physique 5e — Dynamique ---
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteLoisNewton },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteFrottement },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteResultanteEquilibrante },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genCourteAccelerationGravitationnelle },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genQcmForceCentripete },
  { cours: ["PHYSIQUE5"], chapitreId: "dynamique", generer: genAppariementDynamique },
  // --- Physique 5e — Transformation de l'énergie ---
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genCourteEnergieMecanique },
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genCourteHooke },
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genCourtePuissanceMecanique },
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genQcmHookeProportion },
  { cours: ["PHYSIQUE5"], chapitreId: "energie-physique", generer: genAppariementEnergiePhysique },
  // --- Physique 5e — Optique géométrique ---
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genCourteIndiceRefraction },
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genCourteRefraction },
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genCourteImages },
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genQcmOptique },
  { cours: ["PHYSIQUE5"], chapitreId: "optique-geometrique", generer: genAppariementOptique },
];

/**
 * @param chapitresSelectionnes ids de chapitres (voir curriculumSecondaire5.ts)
 * sur lesquels restreindre le tirage. `undefined` = aucune restriction.
 */
export async function genererQuestionDeveloppementSecondaire5(
  cours: CoursSecondaire5,
  chapitresSelectionnes: Set<string> | undefined,
  difficulte: Difficulte
): Promise<ResultatGenerateur5> {
  const admissiblesCours = GENERATEURS_SECONDAIRE5.filter((g) => g.cours.includes(cours));
  const disponibles = chapitresSelectionnes
    ? admissiblesCours.filter((g) => chapitresSelectionnes.has(g.chapitreId))
    : admissiblesCours;

  if (disponibles.length === 0) {
    throw new Error("Aucune question disponible pour les chapitres sélectionnés.");
  }

  const entree = disponibles[Math.floor(Math.random() * disponibles.length)];
  return entree.generer(difficulte);
}

export type { ResultatGenerateur5, SousQuestionNotee };
