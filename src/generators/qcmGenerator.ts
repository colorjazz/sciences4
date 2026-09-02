/**
 * qcmGenerator.ts — module "Questions rapides" (Section A, ST)
 * ------------------------------------------------------------------
 * Chaque appel interroge Gemini EN DIRECT pour la mise en situation :
 * aucun texte français n'est codé en dur ici. Gemini ne reçoit et ne
 * choisit jamais les valeurs numériques ou la bonne réponse — celles-
 * ci sont déjà déterminées par les moteurs avant l'appel réseau, et
 * la question technique posée à l'élève est toujours formulée par ce
 * code, dans le vocabulaire exact du programme.
 *
 * Le balancement d'équations reste une exception assumée : la
 * validité chimique d'une équation reste vérifiée via une table de
 * référence (chimieEngine.ts), pas laissée à l'invention libre de
 * Gemini — un risque d'erreur scientifique inacceptable ici.
 * ------------------------------------------------------------------
 */

import type { QuestionQCM, ChoixQCM } from "../types/question";
import { resoudreLoiOhm } from "../engines/electriciteEngine";
import {
  classifierPH,
  BANQUE_EQUATIONS,
  estBalancementCorrect,
  genererCoefficientsErrones,
  formaterEquation,
} from "../engines/chimieEngine";
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
// Univers matériel — Loi d'Ohm
// ------------------------------------------------------------

async function genQCMLoiOhm(): Promise<QuestionQCM> {
  const resistanceOhm = Math.floor(Math.random() * 20 + 5); // 5–24 Ω
  const courantA = Number((Math.random() * 2 + 0.5).toFixed(1)); // 0.5–2.5 A
  const { tensionV } = resoudreLoiOhm({ resistanceOhm, courantA });
  const bonneValeur = Number(tensionV.toFixed(2));

  const candidats = [
    Number((resistanceOhm / courantA).toFixed(2)),
    Number((bonneValeur + resistanceOhm).toFixed(2)),
    Number((bonneValeur - courantA).toFixed(2)),
    Number((resistanceOhm * courantA * 2).toFixed(2)),
    Number((courantA / resistanceOhm).toFixed(2)),
  ];
  const valeursRetenues = new Set<number>([bonneValeur]);
  for (const c of candidats) {
    if (valeursRetenues.size >= 4) break;
    if (!valeursRetenues.has(c) && c > 0) valeursRetenues.add(c);
  }
  let ecart = 1;
  while (valeursRetenues.size < 4) {
    const secours = Number((bonneValeur + ecart).toFixed(2));
    if (!valeursRetenues.has(secours)) valeursRetenues.add(secours);
    ecart++;
  }

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur un circuit électrique.",
    `Le circuit décrit doit comporter une résistance de EXACTEMENT ${resistanceOhm} ohms parcourue par un courant de EXACTEMENT ${courantA} ampères.`,
    "Choisis un appareil ou un montage réaliste (scolaire, domestique ou industriel léger) — varie ton choix à chaque fois, sois créatif.",
    "N'effectue AUCUN calcul, ne mentionne aucune tension, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);
  const enonce = `${miseEnSituation} Quelle est la différence de potentiel (tension) aux bornes de cette résistance ?`;

  const choixValeurs = melanger([...valeursRetenues]);
  const choix: ChoixQCM[] = choixValeurs.map((v, i) => ({
    id: String.fromCharCode(97 + i),
    texte: `${v} V`,
  }));
  const bonneReponseId = choix[choixValeurs.indexOf(bonneValeur)].id;

  return {
    id: idAleatoire("qcm-ohm"),
    type: "qcm",
    section: "A",
    univers: "materiel",
    conceptId: "st-um-loi-ohm",
    enonce,
    choix,
    bonneReponseId,
    explication: `U = R × I = ${resistanceOhm} × ${courantA} = ${bonneValeur} V.`,
  };
}

// ------------------------------------------------------------
// Univers matériel — Échelle pH
// ------------------------------------------------------------

async function genQCMPh(): Promise<QuestionQCM> {
  const valeurPH = Math.floor(Math.random() * 15); // 0–14
  const classe = classifierPH(valeurPH);

  const prompt = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur les propriétés d'une solution.",
    "Invente un liquide, une solution ou une expérience de laboratoire plausible (varie ton choix à chaque fois).",
    "Ne mentionne AUCUNE valeur de pH, ne révèle pas si la solution est acide, neutre ou basique.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);
  const enonce = `${miseEnSituation} Une analyse indique que cette solution a un pH de ${valeurPH}. Comment cette solution est-elle classée ?`;

  const choix: ChoixQCM[] = melanger([
    { id: "acide", texte: "Acide" },
    { id: "neutre", texte: "Neutre" },
    { id: "basique", texte: "Basique" },
  ]);

  return {
    id: idAleatoire("qcm-ph"),
    type: "qcm",
    section: "A",
    univers: "materiel",
    conceptId: "st-um-echelle-ph",
    enonce,
    choix,
    bonneReponseId: classe,
    explication:
      valeurPH < 7
        ? `Un pH inférieur à 7 correspond à une solution acide (ici pH = ${valeurPH}).`
        : valeurPH === 7
          ? "Un pH de 7 correspond à une solution neutre."
          : `Un pH supérieur à 7 correspond à une solution basique (ici pH = ${valeurPH}).`,
  };
}

// ------------------------------------------------------------
// Univers matériel — Balancement d'équations chimiques
// (équations vérifiées par table de référence, pas par Gemini)
// ------------------------------------------------------------

async function genQCMBalancement(): Promise<QuestionQCM> {
  const equation = BANQUE_EQUATIONS[Math.floor(Math.random() * BANQUE_EQUATIONS.length)];

  const optionCorrecte = formaterEquation(equation, equation.coefficientsCorrects);
  const optionsErronees = new Set<string>();
  while (optionsErronees.size < 3) {
    const proposition = genererCoefficientsErrones(equation);
    if (!estBalancementCorrect(equation, proposition)) {
      optionsErronees.add(formaterEquation(equation, proposition));
    }
  }

  const prompt = [
    "Tu écris UNIQUEMENT une courte phrase d'introduction (1 phrase), en français québécois neutre,",
    "qui situe une réaction chimique dans un contexte concret (industriel, domestique ou naturel).",
    "Ne nomme PAS les réactifs ou produits précis, reste général sur le type de contexte (ex. combustion, fabrication, laboratoire).",
    "Ne présente aucune équation chimique toi-même.",
    'Réponds uniquement avec un JSON strict de la forme {"miseEnSituation": "..."}, sans aucun autre texte.',
  ].join("\n");

  const miseEnSituation = await demanderMiseEnSituation(prompt);
  const enonce = `${miseEnSituation} Laquelle de ces équations chimiques est correctement balancée ?`;

  const toutesLesOptions = melanger([optionCorrecte, ...optionsErronees]);
  const choix: ChoixQCM[] = toutesLesOptions.map((texte, i) => ({
    id: String.fromCharCode(97 + i),
    texte,
  }));
  const bonneReponseId = choix[toutesLesOptions.indexOf(optionCorrecte)].id;

  return {
    id: idAleatoire("qcm-balancement"),
    type: "qcm",
    section: "A",
    univers: "materiel",
    conceptId: "st-um-balancement",
    enonce,
    choix,
    bonneReponseId,
    explication: `L'équation balancée respecte la loi de conservation de la masse : ${optionCorrecte}`,
  };
}

// ------------------------------------------------------------
// Sélecteur
// ------------------------------------------------------------

const GENERATEURS_DISPONIBLES = [genQCMLoiOhm, genQCMPh, genQCMBalancement];

export async function genererQuestionQCM(): Promise<QuestionQCM> {
  const generateur =
    GENERATEURS_DISPONIBLES[Math.floor(Math.random() * GENERATEURS_DISPONIBLES.length)];
  return generateur();
}
