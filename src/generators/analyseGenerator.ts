/**
 * analyseGenerator.ts — module "Analyse technique" (Section C, ST)
 * ------------------------------------------------------------------
 * Comme l'épreuve réelle (questions 21 à 25) : UN SEUL objet
 * technique, avec sa fonction globale, ses composants MÉCANIQUES et
 * ÉLECTRIQUES analysés ensemble, et une batterie de sous-questions de
 * types variés (choix unique, mots de banque, texte libre), chacune
 * notée à crédit partiel — pas juste des questions à révéler sans
 * notation comme avant.
 *
 * Un objet technique = DEUX mécanismes qui interagissent, comme un
 * vrai objet réel (ex. une perceuse : un réducteur qui transmet la
 * rotation du moteur, puis un mandrin qui la transforme en action de
 * perçage). Toujours un mécanisme de TRANSMISSION (rotation→rotation)
 * suivi d'un mécanisme de TRANSFORMATION (rotation→translation) — une
 * paire pédagogiquement cohérente qui couvre les deux concepts
 * prescrits de l'Univers technologique en une seule question.
 *
 * L'OBJET LUI-MÊME (son nom, sa fonction, le vocabulaire utilisé) est
 * entièrement inventé par Gemini à CHAQUE appel — aucune banque fixe
 * d'objets, pour que l'élève ne s'habitue jamais aux mêmes exemples.
 * Ce que Gemini ne décide JAMAIS :
 *   - les valeurs numériques et la cinématique de chaque mécanisme
 *     (moteurs déterministes, comme avant) ;
 *   - la nature de l'interaction entre les deux mécanismes (rotation
 *     → rotation → translation est structurellement garanti par la
 *     construction, jamais une invention de Gemini) ;
 *   - les caractéristiques de la liaison, du matériau et les fonctions
 *     électriques des composants (tables de référence vérifiées,
 *     comme avant).
 * ------------------------------------------------------------------
 */

import type {
  QuestionAnalyse,
  SousQuestionNotee,
  SousQuestionChoixUnique,
  SousQuestionNumerique,
  SousQuestionMotsBanque,
  SousQuestionTexteLibre,
  OptionChoix,
} from "../types/question";
import type { DonneesMecanisme } from "../types/mecanisme3D";
import {
  genererTrainAleatoire,
  calculerSensRotation,
  calculerRapportVitesse,
  trouverEngrenagePlusRapide,
  type SensRotation,
} from "../engines/mecaniqueEngine";
import { calculerTransmission, calculerVisSansFin } from "../engines/transmissionEngine";
import {
  calculerPignonCremaillere,
  calculerVisEcrou,
  calculerCourseCame,
  calculerCourseManivelle,
} from "../engines/transformationEngine";
import { choisirLiaisonAleatoire, type Liaison } from "../engines/liaisonsEngine";
import { choisirMateriauAleatoire } from "../engines/materiauxEngine";
import { construireCircuitSimple, LIBELLE_FONCTION_ELECTRIQUE } from "../engines/circuitEngine";
import { demanderObjetCompose, demanderContexteApplication } from "../ai/geminiClient";
import { choisirObjetAssembleAleatoire } from "../data/objetsAssembles";
import type { CircuitElectrique } from "../types/question";

function idAleatoire(prefixe: string): string {
  return `${prefixe}-${Math.random().toString(36).slice(2, 9)}`;
}

function melanger<T>(items: T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimales = 1): number {
  const v = Math.random() * (max - min) + min;
  const facteur = 10 ** decimales;
  return Math.round(v * facteur) / facteur;
}

function versEchelleScene(valeurCm: number): number {
  return valeurCm * 0.15;
}

function capitaliser(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const sensTexte = (s: 1 | -1) => (s === 1 ? "horaire" : "antihoraire");

function choixSensRotation(id: string, enonce: string, bonSens: SensRotation, pointsMax = 1): SousQuestionChoixUnique {
  const options: OptionChoix[] = [
    { id: "horaire", texte: "Horaire" },
    { id: "antihoraire", texte: "Antihoraire" },
  ];
  return {
    id,
    typeReponse: "choix-unique",
    enonce,
    bareme: { pointsMax },
    options,
    bonneOptionId: bonSens,
    explication: `Le sens de rotation correct est : ${bonSens}.`,
  };
}

// ============================================================
// Les 9 mécanismes, répartis en deux familles
// ============================================================

type CleMecanisme =
  | "trainEngrenages"
  | "rouesFriction"
  | "poulieCourroie"
  | "roueChaine"
  | "visSansFin"
  | "pignonCremaillere"
  | "visEcrou"
  | "came"
  | "bielleManivelle";

const MECANISMES_TRANSMISSION: CleMecanisme[] = [
  "trainEngrenages",
  "rouesFriction",
  "poulieCourroie",
  "roueChaine",
  "visSansFin",
];

const MECANISMES_TRANSFORMATION: CleMecanisme[] = ["pignonCremaillere", "visEcrou", "came", "bielleManivelle"];

/** Libellé descriptif transmis à Gemini pour qu'il invente un objet cohérent autour de ce rôle. */
const LIBELLE_ROLE_MECANISME: Record<CleMecanisme, string> = {
  trainEngrenages: "un train d'engrenages qui transmet et adapte une vitesse de rotation",
  rouesFriction: "des roues de friction qui transmettent une rotation par contact direct",
  poulieCourroie: "un système de poulies reliées par une courroie qui transmet une rotation à distance",
  roueChaine: "un système de roues dentées reliées par une chaîne qui transmet une rotation à distance",
  visSansFin: "un système roue et vis sans fin qui réduit fortement une vitesse de rotation",
  pignonCremaillere: "un système pignon-crémaillère qui transforme une rotation en déplacement linéaire",
  visEcrou: "un système vis-écrou qui transforme une rotation en déplacement linéaire précis",
  came: "une came qui transforme une rotation en mouvement de va-et-vient irrégulier",
  bielleManivelle: "un système bielle-manivelle qui transforme une rotation en mouvement de va-et-vient",
};

const CONCEPT_ID_PAR_MECANISME: Record<CleMecanisme, string> = {
  trainEngrenages: "st-ut-transmission",
  rouesFriction: "st-ut-transmission",
  poulieCourroie: "st-ut-transmission",
  roueChaine: "st-ut-transmission",
  visSansFin: "st-ut-transmission",
  pignonCremaillere: "st-ut-transformation-mvt",
  visEcrou: "st-ut-transformation-mvt",
  came: "st-ut-transformation-mvt",
  bielleManivelle: "st-ut-transformation-mvt",
};

// ============================================================
// Construction pure de chaque mécanisme — aucun appel réseau ici.
// ============================================================

interface ConstructionMecanisme {
  phraseTechnique: string;
  sousQuestions: SousQuestionNotee[];
  mecanisme3D: DonneesMecanisme;
}

function construireTrainEngrenages(): ConstructionMecanisme {
  const nombreEngrenages = Math.random() < 0.5 ? 2 : 3;
  const train = genererTrainAleatoire(nombreEngrenages as 2 | 3);
  const sens = calculerSensRotation(train);
  const dernierIndex = train.engrenages.length - 1;
  const rapport = calculerRapportVitesse(train, 0, dernierIndex);
  const plusRapide = trouverEngrenagePlusRapide(train);

  const vitesses = [1];
  for (let i = 1; i < train.engrenages.length; i++) {
    vitesses.push(vitesses[i - 1] * (train.engrenages[i - 1].nombreDents / train.engrenages[i].nombreDents));
  }
  const versDirection = (s: SensRotation): 1 | -1 => (s === "horaire" ? 1 : -1);

  const noms = train.engrenages.map((e) => `roue ${e.id} (${e.nombreDents} dents)`);
  const phraseTechnique =
    `Ce mécanisme comprend ${noms.length} roues dentées en prise directe, ` +
    `dans l'ordre suivant : ${noms.join(", ")}. La roue ${train.engrenages[0].id} tourne dans le sens ${train.sensRotationEntree}.`;

  const optionsRoues: OptionChoix[] = train.engrenages.map((e) => ({ id: e.id, texte: `Roue ${e.id}` }));

  const sousQuestions: SousQuestionNotee[] = [
    choixSensRotation(
      "m1-sens-rotation",
      `Dans quel sens tourne la roue ${train.engrenages[dernierIndex].id} ?`,
      sens[dernierIndex]
    ),
    {
      id: "m1-rapport-vitesse",
      typeReponse: "numerique",
      demandeDemarche: false,
      enonce: `Quel est le rapport de vitesse entre la roue ${train.engrenages[0].id} (entrée) et la roue ${train.engrenages[dernierIndex].id} (sortie) ?`,
      bareme: { pointsMax: 1 },
      reponseAttendue: Number(rapport.toFixed(2)),
      toleranceRelative: 0.02,
      explication: `Rapport de vitesse = dents(entrée) / dents(sortie) = ${train.engrenages[0].nombreDents} / ${train.engrenages[dernierIndex].nombreDents} = ${rapport.toFixed(2)}.`,
    } as SousQuestionNumerique,
    {
      id: "m1-roue-plus-rapide",
      typeReponse: "choix-unique",
      enonce: "Laquelle des roues de ce mécanisme tourne le plus vite ?",
      bareme: { pointsMax: 1 },
      options: optionsRoues,
      bonneOptionId: plusRapide.id,
      explication: `La roue ayant le moins de dents (roue ${plusRapide.id}, ${plusRapide.nombreDents} dents) tourne toujours le plus vite dans un train en prise directe.`,
    },
  ];

  return {
    phraseTechnique,
    sousQuestions,
    mecanisme3D: {
      type: "trainEngrenages",
      data: {
        gears: train.engrenages.map((e, i) => ({
          id: e.id,
          teeth: e.nombreDents,
          speed: vitesses[i],
          direction: versDirection(sens[i]),
        })),
      },
    },
  };
}

function construireRouesFriction(): ConstructionMecanisme {
  const rayonA = randFloat(4, 9, 1);
  const rayonB = randFloat(4, 9, 1);
  const sensA: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const resultat = calculerTransmission("contact-direct", rayonA, rayonB, sensA);

  return {
    phraseTechnique: `Ce mécanisme comprend deux roues de friction (cylindres lisses) en contact direct, notées A (${rayonA} cm de rayon) et B (${rayonB} cm de rayon).`,
    sousQuestions: [
      choixSensRotation("m1-sens-sortie", "Dans quel sens tourne la roue B ?", sensTexte(resultat.sensSortie)),
      {
        id: "m1-rapport-vitesse",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `La roue A a un rayon de ${rayonA} cm et la roue B un rayon de ${rayonB} cm. Quel est le rapport de vitesse entre A et B ?`,
        bareme: { pointsMax: 1 },
        reponseAttendue: Number(resultat.rapportVitesse.toFixed(2)),
        toleranceRelative: 0.02,
        explication: `Rapport de vitesse = rayon(A) / rayon(B) = ${rayonA} / ${rayonB} = ${resultat.rapportVitesse.toFixed(2)}.`,
      } as SousQuestionNumerique,
    ],
    mecanisme3D: {
      type: "transmissionSimple",
      data: {
        liaison: "roues-friction",
        entree: { id: "A", rayon: versEchelleScene(rayonA), sens: sensA },
        sortie: { id: "B", rayon: versEchelleScene(rayonB) },
      },
    },
  };
}

function construirePoulieCourroie(): ConstructionMecanisme {
  const rayonA = randFloat(4, 10, 1);
  const rayonB = randFloat(4, 10, 1);
  const sensA: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const resultat = calculerTransmission("lien-souple", rayonA, rayonB, sensA);

  return {
    phraseTechnique: `Ce mécanisme comprend deux poulies reliées par une courroie, notées A (${rayonA} cm de rayon) et B (${rayonB} cm de rayon).`,
    sousQuestions: [
      choixSensRotation("m1-sens-sortie", "Dans quel sens tourne la poulie B ?", sensTexte(resultat.sensSortie)),
      {
        id: "m1-rapport-vitesse",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `La poulie A a un rayon de ${rayonA} cm et la poulie B un rayon de ${rayonB} cm. Quel est le rapport de vitesse entre A et B ?`,
        bareme: { pointsMax: 1 },
        reponseAttendue: Number(resultat.rapportVitesse.toFixed(2)),
        toleranceRelative: 0.02,
        explication: `Rapport de vitesse = rayon(A) / rayon(B) = ${rayonA} / ${rayonB} = ${resultat.rapportVitesse.toFixed(2)}.`,
      } as SousQuestionNumerique,
    ],
    mecanisme3D: {
      type: "transmissionSimple",
      data: {
        liaison: "poulie-courroie",
        entree: { id: "A", rayon: versEchelleScene(rayonA), sens: sensA },
        sortie: { id: "B", rayon: versEchelleScene(rayonB) },
      },
    },
  };
}

function construireRoueChaine(): ConstructionMecanisme {
  const dentsA = randInt(16, 44);
  const dentsB = randInt(16, 44);
  const sensA: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const resultat = calculerTransmission("lien-souple", dentsA, dentsB, sensA);

  return {
    phraseTechnique: `Ce mécanisme comprend deux roues dentées reliées par une chaîne, notées A (${dentsA} dents) et B (${dentsB} dents).`,
    sousQuestions: [
      choixSensRotation("m1-sens-sortie", "Dans quel sens tourne la roue B ?", sensTexte(resultat.sensSortie)),
      {
        id: "m1-rapport-vitesse",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `La roue A compte ${dentsA} dents et la roue B compte ${dentsB} dents. Quel est le rapport de vitesse entre A et B ?`,
        bareme: { pointsMax: 1 },
        reponseAttendue: Number(resultat.rapportVitesse.toFixed(2)),
        toleranceRelative: 0.02,
        explication: `Rapport de vitesse = dents(A) / dents(B) = ${dentsA} / ${dentsB} = ${resultat.rapportVitesse.toFixed(2)}.`,
      } as SousQuestionNumerique,
    ],
    mecanisme3D: {
      type: "transmissionSimple",
      data: {
        liaison: "roue-chaine",
        entree: { id: "A", rayon: dentsA * 0.045, dents: dentsA, sens: sensA },
        sortie: { id: "B", rayon: dentsB * 0.045, dents: dentsB },
      },
    },
  };
}

function construireVisSansFin(): ConstructionMecanisme {
  const dentsRoue = randInt(24, 60);
  const nombreFilets = 1;
  const sensVis: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const resultat = calculerVisSansFin(dentsRoue, nombreFilets);

  return {
    phraseTechnique: `Ce mécanisme comprend une vis sans fin à un seul filet entraînant une roue dentée de ${dentsRoue} dents, montée perpendiculairement.`,
    sousQuestions: [
      {
        id: "m1-rapport-reduction",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `Cette roue compte ${dentsRoue} dents et la vis a un seul filet. Combien de tours de vis faut-il pour faire faire un tour complet à la roue ?`,
        bareme: { pointsMax: 1 },
        uniteAttendue: "tours",
        reponseAttendue: resultat.rapportReduction,
        toleranceRelative: 0.02,
        explication: `Chaque tour de vis avance la roue d'une seule dent (1 filet). Il faut donc ${dentsRoue} tours de vis pour un tour complet de la roue à ${dentsRoue} dents.`,
      } as SousQuestionNumerique,
      {
        id: "m1-reversibilite",
        typeReponse: "choix-unique",
        enonce: "Peut-on faire tourner la vis en entraînant la roue (mécanisme réversible) ?",
        bareme: { pointsMax: 1 },
        options: [
          { id: "oui", texte: "Oui" },
          { id: "non", texte: "Non" },
        ],
        bonneOptionId: "non",
        explication: "Le système roue et vis sans fin est auto-bloquant : impossible d'entraîner la vis à partir de la roue.",
      },
    ],
    mecanisme3D: { type: "visSansFin", data: { dentsRoue, nombreFilets, sensVis } },
  };
}

function construirePignonCremaillere(): ConstructionMecanisme {
  const rayonPignon = randFloat(3, 7, 1);
  const dentsPignon = randInt(10, 20);
  const vitesseAngulaire = randFloat(1, 3, 1);
  const sensRotation: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const resultat = calculerPignonCremaillere(rayonPignon, vitesseAngulaire);

  return {
    phraseTechnique: `Ce mécanisme comprend un pignon de ${rayonPignon} cm de rayon (${dentsPignon} dents) engrenant une crémaillère droite.`,
    sousQuestions: [
      {
        id: "m2-vitesse-lineaire",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `Le pignon a un rayon de ${rayonPignon} cm et tourne à une vitesse angulaire de ${vitesseAngulaire} rad/s. Quelle est la vitesse linéaire de la crémaillère ?`,
        bareme: { pointsMax: 1 },
        uniteAttendue: "cm/s",
        reponseAttendue: Number(resultat.vitesseLineaire.toFixed(2)),
        toleranceRelative: 0.02,
        explication: `v = ω × r = ${vitesseAngulaire} × ${rayonPignon} = ${resultat.vitesseLineaire.toFixed(2)} cm/s.`,
      } as SousQuestionNumerique,
    ],
    mecanisme3D: {
      type: "pignonCremaillere",
      data: { rayonPignon: versEchelleScene(rayonPignon), dentsPignon, vitesseAngulaire, sensRotation },
    },
  };
}

function construireVisEcrou(): ConstructionMecanisme {
  const pasMm = randInt(1, 4);
  const nombreTours = randInt(3, 10);
  const resultat = calculerVisEcrou(pasMm, nombreTours);

  return {
    phraseTechnique: `Ce mécanisme comprend une vis dont le pas est de ${pasMm} mm, engagée dans un écrou.`,
    sousQuestions: [
      {
        id: "m2-deplacement",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `Cette vis a un pas de ${pasMm} mm. Quel est le déplacement de l'écrou après ${nombreTours} tours complets ?`,
        bareme: { pointsMax: 1 },
        uniteAttendue: "mm",
        reponseAttendue: resultat.deplacementMm,
        toleranceRelative: 0.02,
        explication: `Déplacement = pas × nombre de tours = ${pasMm} × ${nombreTours} = ${resultat.deplacementMm} mm.`,
      } as SousQuestionNumerique,
      {
        id: "m2-reversibilite",
        typeReponse: "choix-unique",
        enonce: "Ce mécanisme est-il réversible ?",
        bareme: { pointsMax: 1 },
        options: [
          { id: "oui", texte: "Oui" },
          { id: "non", texte: "Non, généralement auto-bloquant" },
        ],
        bonneOptionId: "non",
        explication: "Un filet standard est généralement auto-bloquant par friction : pousser l'écrou ne fait pas tourner la vis.",
      },
    ],
    mecanisme3D: { type: "visEcrou", data: { pasMm, nombreTours, vitesseAngulaireAnimation: 2 } },
  };
}

function construireCame(): ConstructionMecanisme {
  const rayonCame = randFloat(3, 6, 1);
  const excentricite = randFloat(0.6, Math.min(2, rayonCame * 0.4), 1);
  const course = calculerCourseCame(excentricite);

  return {
    phraseTechnique: `Ce mécanisme comprend une came circulaire excentrique (rayon ${rayonCame} cm, excentricité ${excentricite} cm) en contact avec un poussoir vertical.`,
    sousQuestions: [
      {
        id: "m2-course",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `Cette came a une excentricité de ${excentricite} cm. Quelle est la course totale (déplacement maximal) du poussoir ?`,
        bareme: { pointsMax: 1 },
        uniteAttendue: "cm",
        reponseAttendue: Number(course.toFixed(1)),
        toleranceRelative: 0.03,
        explication: `Pour une came circulaire excentrique, la course = 2 × excentricité = 2 × ${excentricite} = ${course.toFixed(1)} cm.`,
      } as SousQuestionNumerique,
    ],
    mecanisme3D: {
      type: "came",
      data: {
        rayonCame: versEchelleScene(rayonCame),
        excentricite: versEchelleScene(excentricite),
        vitesseAngulaireAnimation: 1.4,
      },
    },
  };
}

function construireBielleManivelle(): ConstructionMecanisme {
  const rayonManivelle = randFloat(2, 5, 1);
  const longueurBielle = randFloat(rayonManivelle * 3, rayonManivelle * 5, 1);
  const course = calculerCourseManivelle(rayonManivelle);

  return {
    phraseTechnique: `Ce mécanisme comprend une manivelle de ${rayonManivelle} cm de rayon reliée à un piston par une bielle de ${longueurBielle} cm.`,
    sousQuestions: [
      {
        id: "m2-type-mouvement",
        typeReponse: "choix-unique",
        enonce: "Quel type de mouvement ce mécanisme produit-il au niveau du piston ?",
        bareme: { pointsMax: 1 },
        options: [
          { id: "rectiligne-alternatif", texte: "Rectiligne alternatif (va-et-vient)" },
          { id: "rotation-continue", texte: "Rotation continue" },
          { id: "rectiligne-uniforme", texte: "Rectiligne uniforme (une seule direction)" },
        ],
        bonneOptionId: "rectiligne-alternatif",
        explication: "La bielle transforme le mouvement circulaire de la manivelle en un mouvement rectiligne alternatif du piston.",
      },
      {
        id: "m2-course",
        typeReponse: "numerique",
        demandeDemarche: false,
        enonce: `La manivelle a un rayon de ${rayonManivelle} cm. Quelle est la course totale du piston ?`,
        bareme: { pointsMax: 1 },
        uniteAttendue: "cm",
        reponseAttendue: Number(course.toFixed(1)),
        toleranceRelative: 0.03,
        explication: `Course = 2 × rayon de la manivelle = 2 × ${rayonManivelle} = ${course.toFixed(1)} cm.`,
      } as SousQuestionNumerique,
    ],
    mecanisme3D: {
      type: "bielleManivelle",
      data: {
        rayonManivelle: versEchelleScene(rayonManivelle),
        longueurBielle: versEchelleScene(longueurBielle),
        vitesseAngulaireAnimation: 1.6,
      },
    },
  };
}

const CONSTRUCTEURS: Record<CleMecanisme, () => ConstructionMecanisme> = {
  trainEngrenages: construireTrainEngrenages,
  rouesFriction: construireRouesFriction,
  poulieCourroie: construirePoulieCourroie,
  roueChaine: construireRoueChaine,
  visSansFin: construireVisSansFin,
  pignonCremaillere: construirePignonCremaillere,
  visEcrou: construireVisEcrou,
  came: construireCame,
  bielleManivelle: construireBielleManivelle,
};

// ============================================================
// Circuit électrique de l'objet — table de référence vérifiée
// (voir engines/circuitEngine.ts), jamais inventée par Gemini.
// ============================================================

function construireSousQuestionsCircuit(circuit: CircuitElectrique): SousQuestionNotee[] {
  const composantsInterroges = melanger([...circuit.composants]).slice(0, 2);

  return composantsInterroges.map((composant, i) => {
    const bonneReponse = LIBELLE_FONCTION_ELECTRIQUE[composant.fonctionElectrique];
    const distracteurs = melanger(
      Object.values(LIBELLE_FONCTION_ELECTRIQUE).filter((f) => f !== bonneReponse)
    ).slice(0, 3);
    const banqueMots = melanger([bonneReponse, ...distracteurs]);

    return {
      id: `circuit-fonction-${i}`,
      typeReponse: "mots-banque",
      enonce: `Dans ce circuit, quelle est la fonction électrique du composant « ${composant.nom} » ?`,
      bareme: { pointsMax: 1 },
      banqueMots,
      emplacements: [{ id: "fonction", libelle: composant.nom, motAttendu: bonneReponse }],
      explication: `Le ${composant.nom} assure la fonction « ${bonneReponse} » dans ce circuit.`,
    } as SousQuestionMotsBanque;
  });
}

// ============================================================
// Orchestrateur — un seul appel Gemini invente l'objet complet
// ============================================================

async function genererObjetCompose(
  cle1: CleMecanisme,
  cle2: CleMecanisme,
  liaisonNom: string,
  materiauNom: string
) {
  const prompt = [
    "Tu inventes un objet technique réel et concret, en français québécois neutre,",
    "pour une question de sciences de 4e secondaire.",
    "Cet objet doit contenir EXACTEMENT ces deux mécanismes, qui travaillent ensemble :",
    `- Mécanisme 1 : ${LIBELLE_ROLE_MECANISME[cle1]}`,
    `- Mécanisme 2 : ${LIBELLE_ROLE_MECANISME[cle2]}`,
    "Le mécanisme 1 doit entraîner le mécanisme 2 (la sortie du premier alimente l'entrée du second).",
    "L'objet doit être alimenté par un moteur électrique qui entraîne le mécanisme 1 (jamais manuel) :",
    "l'objet comporte donc aussi un circuit électrique simple (pile, interrupteur, moteur).",
    "Sois très créatif et varié dans ton choix d'objet à CHAQUE appel : évite de toujours proposer les",
    "exemples les plus évidents (vélo, perceuse) — explore des objets réels moins attendus (électroménagers,",
    "outils, jouets mécaniques, équipement de sport ou de camping, machines agricoles, appareils de bureau,",
    "dispositifs de plein air, etc.), du moment que la combinaison des deux mécanismes reste plausible.",
    `Cet objet doit aussi comporter une pièce assemblée par ${liaisonNom} et une pièce fabriquée en ${materiauNom}.`,
    "Ne mentionne AUCUNE valeur numérique, aucun calcul, aucune caractéristique technique précise",
    "(dimensions, vitesses, nombre de dents) — ça sera traité séparément.",
    "Réponds uniquement avec un JSON strict de cette forme, sans aucun autre texte :",
    '{"nomObjet": "...", "fonctionGlobale": "...", "descriptionGenerale": "...", "descriptionMecanisme1": "...", "descriptionMecanisme2": "...", "piecePourLiaison": "...", "piecePourMateriau": "..."}',
  ].join("\n");

  return demanderObjetCompose(prompt);
}

function construireSousQuestionInteraction(): SousQuestionTexteLibre {
  return {
    id: "interaction",
    typeReponse: "texte-libre",
    enonce: "Comment le mouvement produit par le premier mécanisme est-il utilisé par le second ?",
    bareme: { pointsMax: 2 },
    criteresCorrection: [
      "la sortie du premier mécanisme (rotation) devient l'entrée du second",
      "le second mécanisme transforme cette rotation en un mouvement de translation (ou de va-et-vient)",
    ],
    reponseModele:
      "La rotation produite par le premier mécanisme entraîne directement le second, qui la transforme en un mouvement de translation.",
    explication:
      "Un système de transmission (comme le premier mécanisme) conserve un mouvement de rotation, à une vitesse ou dans un sens différent. Un système de transformation (comme le second) prend cette rotation en entrée et la convertit en un déplacement en ligne droite ou en va-et-vient. La sortie du premier mécanisme devient donc directement l'entrée du second.",
  };
}

function construireSousQuestionLiaison(piece: string, liaison: Liaison): SousQuestionMotsBanque {
  return {
    id: "liaison",
    typeReponse: "mots-banque",
    enonce: `${capitaliser(piece)} est assemblé(e) par ${liaison.nom}. Complète les deux caractéristiques de cette liaison.`,
    bareme: { pointsMax: 2 },
    banqueMots: ["démontable", "indémontable", "rigide", "élastique"],
    emplacements: [
      {
        id: "montage",
        libelle: "Cette liaison est",
        motAttendu: liaison.caracteristiques.demontable ? "démontable" : "indémontable",
      },
      {
        id: "rigidite",
        libelle: "et elle est",
        motAttendu: liaison.caracteristiques.rigide ? "rigide" : "élastique",
      },
    ],
    explication: liaison.justification,
  };
}

function construireSousQuestionMateriau(piece: string, materiauNom: string, proprieteCle: string): SousQuestionTexteLibre {
  return {
    id: "materiau",
    typeReponse: "texte-libre",
    enonce: `${capitaliser(piece)} de cet objet est fabriqué(e) en ${materiauNom}. Nomme une propriété de ce matériau qui justifie ce choix.`,
    bareme: { pointsMax: 1 },
    criteresCorrection: [proprieteCle],
    reponseModele: proprieteCle,
    explication: `Propriété clé de ce matériau : ${proprieteCle}.`,
  };
}

export async function genererQuestionAnalyseComposee(): Promise<QuestionAnalyse> {
  const cle1 = MECANISMES_TRANSMISSION[Math.floor(Math.random() * MECANISMES_TRANSMISSION.length)];
  const cle2 = MECANISMES_TRANSFORMATION[Math.floor(Math.random() * MECANISMES_TRANSFORMATION.length)];

  const construction1 = CONSTRUCTEURS[cle1]();
  const construction2 = CONSTRUCTEURS[cle2]();

  const liaison = choisirLiaisonAleatoire();
  const materiau = choisirMateriauAleatoire();
  const circuit = construireCircuitSimple({ sortie: "moteur", avecFusible: Math.random() < 0.4 });

  const objet = await genererObjetCompose(cle1, cle2, liaison.nom, materiau.nom);

  const descriptionObjet = [
    `${capitaliser(objet.nomObjet)}.`,
    objet.descriptionGenerale,
    `Mécanisme 1 — ${objet.descriptionMecanisme1} ${construction1.phraseTechnique}`,
    `Mécanisme 2 — ${objet.descriptionMecanisme2} ${construction2.phraseTechnique}`,
  ].join(" ");

  return {
    id: idAleatoire("analyse-objet"),
    type: "analyse",
    section: "C",
    univers: "technologique",
    // Remarque : l'objet mélange toujours transmission (mécanisme 1) et
    // transformation (mécanisme 2) ; on tague ici sur le premier, faute
    // d'un modèle à concepts multiples pour l'instant.
    conceptId: CONCEPT_ID_PAR_MECANISME[cle1],
    enonce: "Analyse l'objet technique suivant : décris ses composants mécaniques et électriques et explique comment ils interagissent.",
    fonctionGlobale: objet.fonctionGlobale,
    descriptionObjet,
    sousQuestions: [
      ...construction1.sousQuestions,
      ...construction2.sousQuestions,
      construireSousQuestionInteraction(),
      construireSousQuestionLiaison(objet.piecePourLiaison, liaison),
      construireSousQuestionMateriau(objet.piecePourMateriau, materiau.nom, materiau.proprietesCles[0]),
      ...construireSousQuestionsCircuit(circuit),
    ],
    mecanismes3D: [construction1.mecanisme3D, construction2.mecanisme3D],
    circuitElectrique: circuit,
  };
}

// ============================================================
// Objets assemblés (banque riche à géométrie fixe)
// ============================================================

/**
 * Gemini invente une mise en situation variée pour un objet DÉJÀ CHOISI
 * (nom fixe, connu à l'avance) — contrairement à genererObjetCompose, il
 * ne décide ni de l'objet ni de sa géométrie, seulement du contexte
 * d'usage. C'est ce qui permet à cette banque de rester "rafraîchie"
 * malgré un nombre limité d'objets disponibles.
 */
async function genererMiseEnSituationAssemblage(nomObjet: string): Promise<string> {
  const prompt = [
    "Tu écris UNIQUEMENT une phrase (1 à 2 phrases), en français québécois neutre,",
    `qui situe l'usage de ${nomObjet} dans un contexte concret et varié`,
    "(domestique, commercial, scolaire, extérieur — selon ce qui convient à cet objet).",
    "Varie le contexte à CHAQUE appel : ne répète jamais la même situation.",
    "Ne mentionne aucune valeur numérique, ne décris pas le mécanisme interne, ne révèle aucune réponse.",
    'Réponds uniquement avec un JSON strict de la forme {"contexteApplication": "..."}, sans aucun autre texte.',
  ].join("\n");
  return demanderContexteApplication(prompt);
}

async function genAnalyseAssemblage(): Promise<QuestionAnalyse> {
  const objet = choisirObjetAssembleAleatoire();
  const contexte = await genererMiseEnSituationAssemblage(objet.nom);

  const sousQuestionsCircuit = objet.circuitElectrique ? construireSousQuestionsCircuit(objet.circuitElectrique) : [];

  return {
    id: idAleatoire("analyse-assemblage"),
    type: "analyse",
    section: "C",
    univers: "technologique",
    conceptId: "st-ut-transmission",
    enonce: "Analyse l'objet technique suivant : inspecte chaque étage du mécanisme et réponds aux questions.",
    fonctionGlobale: objet.fonctionGlobale,
    descriptionObjet: `${capitaliser(objet.nom)}. ${contexte}`,
    sousQuestions: [...objet.questions, ...sousQuestionsCircuit],
    assemblage: { objectId: objet.id, etapes: objet.etapes },
    circuitElectrique: objet.circuitElectrique,
  };
}

// ============================================================
// Dispatcheur — alterne entre la composition procédurale (variété
// infinie de mécanismes) et la banque riche à géométrie fixe (détail
// visuel supérieur, choix limité mais mise en situation renouvelée).
// Ajuste ce ratio librement selon ce que tu observes en pratique.
// ============================================================

const PROBABILITE_ASSEMBLAGE_RICHE = 0.5;

export async function genererQuestionAnalyse(): Promise<QuestionAnalyse> {
  if (Math.random() < PROBABILITE_ASSEMBLAGE_RICHE) {
    return genAnalyseAssemblage();
  }
  return genererQuestionAnalyseComposee();
}
