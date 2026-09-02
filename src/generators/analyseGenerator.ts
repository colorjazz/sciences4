/**
 * analyseGenerator.ts — module "Analyse technique" (Section C, ST)
 * ------------------------------------------------------------------
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
 *   - les caractéristiques de la liaison et du matériau (tables de
 *     référence vérifiées, comme avant).
 * ------------------------------------------------------------------
 */

import type { QuestionAnalyse, SousQuestionAnalyse } from "../types/question";
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
import { choisirLiaisonAleatoire } from "../engines/liaisonsEngine";
import { choisirMateriauAleatoire } from "../engines/materiauxEngine";
import { demanderObjetCompose, demanderContexteApplication } from "../ai/geminiClient";
import { choisirObjetAssembleAleatoire } from "../data/objetsAssembles";

function idAleatoire(prefixe: string): string {
  return `${prefixe}-${Math.random().toString(36).slice(2, 9)}`;
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
  sousQuestions: SousQuestionAnalyse[];
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

  const sousQuestions: SousQuestionAnalyse[] = [
    {
      id: "m1-sens-rotation",
      enonce: `Dans quel sens tourne la roue ${train.engrenages[dernierIndex].id} ?`,
      reponseAttendue: sens[dernierIndex],
      explication:
        train.engrenages.length === 2
          ? `Deux roues en prise directe tournent toujours en sens opposés : la roue ${train.engrenages[dernierIndex].id} tourne donc en sens ${sens[dernierIndex]}.`
          : `Chaque engrènement direct inverse le sens de rotation. Après ${dernierIndex} engrènements, la roue ${train.engrenages[dernierIndex].id} tourne en sens ${sens[dernierIndex]}.`,
    },
    {
      id: "m1-rapport-vitesse",
      enonce: `Quel est le rapport de vitesse entre la roue ${train.engrenages[0].id} (entrée) et la roue ${train.engrenages[dernierIndex].id} (sortie) ?`,
      reponseAttendue: rapport.toFixed(2),
      explication: `Rapport de vitesse = dents(entrée) / dents(sortie) = ${train.engrenages[0].nombreDents} / ${train.engrenages[dernierIndex].nombreDents} = ${rapport.toFixed(2)}.`,
    },
    {
      id: "m1-roue-plus-rapide",
      enonce: "Laquelle des roues de ce mécanisme tourne le plus vite ?",
      reponseAttendue: `Roue ${plusRapide.id}`,
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
      {
        id: "m1-sens-sortie",
        enonce: "Dans quel sens tourne la roue B ?",
        reponseAttendue: sensTexte(resultat.sensSortie),
        explication: `Deux roues de friction en contact tournent toujours en sens opposés : A tourne en sens ${sensTexte(sensA)}, donc B tourne en sens ${sensTexte(resultat.sensSortie)}.`,
      },
      {
        id: "m1-rapport-vitesse",
        enonce: `La roue A a un rayon de ${rayonA} cm et la roue B un rayon de ${rayonB} cm. Quel est le rapport de vitesse entre A et B ?`,
        reponseAttendue: resultat.rapportVitesse.toFixed(2),
        explication: `Rapport de vitesse = rayon(A) / rayon(B) = ${rayonA} / ${rayonB} = ${resultat.rapportVitesse.toFixed(2)}.`,
      },
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
      {
        id: "m1-sens-sortie",
        enonce: "Dans quel sens tourne la poulie B ?",
        reponseAttendue: sensTexte(resultat.sensSortie),
        explication: `Une courroie relie les deux poulies dans le MÊME sens de rotation : A tourne en sens ${sensTexte(sensA)}, donc B tourne aussi en sens ${sensTexte(resultat.sensSortie)}.`,
      },
      {
        id: "m1-rapport-vitesse",
        enonce: `La poulie A a un rayon de ${rayonA} cm et la poulie B un rayon de ${rayonB} cm. Quel est le rapport de vitesse entre A et B ?`,
        reponseAttendue: resultat.rapportVitesse.toFixed(2),
        explication: `Rapport de vitesse = rayon(A) / rayon(B) = ${rayonA} / ${rayonB} = ${resultat.rapportVitesse.toFixed(2)}.`,
      },
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
      {
        id: "m1-sens-sortie",
        enonce: "Dans quel sens tourne la roue B ?",
        reponseAttendue: sensTexte(resultat.sensSortie),
        explication: `Une chaîne relie les deux roues dans le MÊME sens de rotation (comme une courroie) : A tourne en sens ${sensTexte(sensA)}, donc B tourne aussi en sens ${sensTexte(resultat.sensSortie)}.`,
      },
      {
        id: "m1-rapport-vitesse",
        enonce: `La roue A compte ${dentsA} dents et la roue B compte ${dentsB} dents. Quel est le rapport de vitesse entre A et B ?`,
        reponseAttendue: resultat.rapportVitesse.toFixed(2),
        explication: `Rapport de vitesse = dents(A) / dents(B) = ${dentsA} / ${dentsB} = ${resultat.rapportVitesse.toFixed(2)}.`,
      },
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
        enonce: `Cette roue compte ${dentsRoue} dents et la vis a un seul filet. Combien de tours de vis faut-il pour faire faire un tour complet à la roue ?`,
        reponseAttendue: `${resultat.rapportReduction.toFixed(0)} tours`,
        explication: `Chaque tour de vis avance la roue d'une seule dent (1 filet). Il faut donc ${dentsRoue} tours de vis pour un tour complet de la roue à ${dentsRoue} dents.`,
      },
      {
        id: "m1-reversibilite",
        enonce: "Peut-on faire tourner la vis en entraînant la roue (mécanisme réversible) ?",
        reponseAttendue: "Non",
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
        enonce: `Le pignon a un rayon de ${rayonPignon} cm et tourne à une vitesse angulaire de ${vitesseAngulaire} rad/s. Quelle est la vitesse linéaire de la crémaillère ?`,
        reponseAttendue: `${resultat.vitesseLineaire.toFixed(2)} cm/s`,
        explication: `v = ω × r = ${vitesseAngulaire} × ${rayonPignon} = ${resultat.vitesseLineaire.toFixed(2)} cm/s.`,
      },
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
        enonce: `Cette vis a un pas de ${pasMm} mm. Quel est le déplacement de l'écrou après ${nombreTours} tours complets ?`,
        reponseAttendue: `${resultat.deplacementMm} mm`,
        explication: `Déplacement = pas × nombre de tours = ${pasMm} × ${nombreTours} = ${resultat.deplacementMm} mm.`,
      },
      {
        id: "m2-reversibilite",
        enonce: "Ce mécanisme est-il réversible ?",
        reponseAttendue: "Généralement non",
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
        enonce: `Cette came a une excentricité de ${excentricite} cm. Quelle est la course totale (déplacement maximal) du poussoir ?`,
        reponseAttendue: `${course.toFixed(1)} cm`,
        explication: `Pour une came circulaire excentrique, la course = 2 × excentricité = 2 × ${excentricite} = ${course.toFixed(1)} cm.`,
      },
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
        enonce: "Quel type de mouvement ce mécanisme produit-il au niveau du piston ?",
        reponseAttendue: "Rectiligne alternatif (va-et-vient)",
        explication: "La bielle transforme le mouvement circulaire de la manivelle en un mouvement rectiligne alternatif du piston.",
      },
      {
        id: "m2-course",
        enonce: `La manivelle a un rayon de ${rayonManivelle} cm. Quelle est la course totale du piston ?`,
        reponseAttendue: `${course.toFixed(1)} cm`,
        explication: `Course = 2 × rayon de la manivelle = 2 × ${rayonManivelle} = ${course.toFixed(1)} cm.`,
      },
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
    "Sois très créatif et varié dans ton choix d'objet à CHAQUE appel : évite de toujours proposer les",
    "exemples les plus évidents (vélo, perceuse) — explore des objets réels moins attendus (électroménagers,",
    "outils, jouets mécaniques, équipement de sport ou de camping, machines agricoles, appareils de bureau,",
    "dispositifs de plein air, etc.), du moment que la combinaison des deux mécanismes reste plausible.",
    `Cet objet doit aussi comporter une pièce assemblée par ${liaisonNom} et une pièce fabriquée en ${materiauNom}.`,
    "Ne mentionne AUCUNE valeur numérique, aucun calcul, aucune caractéristique technique précise",
    "(dimensions, vitesses, nombre de dents) — ça sera traité séparément.",
    "Réponds uniquement avec un JSON strict de cette forme, sans aucun autre texte :",
    '{"nomObjet": "...", "descriptionGenerale": "...", "descriptionMecanisme1": "...", "descriptionMecanisme2": "...", "piecePourLiaison": "...", "piecePourMateriau": "..."}',
  ].join("\n");

  return demanderObjetCompose(prompt);
}

export async function genererQuestionAnalyseComposee(): Promise<QuestionAnalyse> {
  const cle1 = MECANISMES_TRANSMISSION[Math.floor(Math.random() * MECANISMES_TRANSMISSION.length)];
  const cle2 = MECANISMES_TRANSFORMATION[Math.floor(Math.random() * MECANISMES_TRANSFORMATION.length)];

  const construction1 = CONSTRUCTEURS[cle1]();
  const construction2 = CONSTRUCTEURS[cle2]();

  const liaison = choisirLiaisonAleatoire();
  const materiau = choisirMateriauAleatoire();

  const objet = await genererObjetCompose(cle1, cle2, liaison.nom, materiau.nom);

  const sousQuestionInteraction: SousQuestionAnalyse = {
    id: "interaction",
    enonce: "Comment le mouvement produit par le premier mécanisme est-il utilisé par le second ?",
    reponseAttendue:
      "La rotation produite par le premier mécanisme entraîne directement le second, qui la transforme en un mouvement de translation.",
    explication:
      "Un système de transmission (comme le premier mécanisme) conserve un mouvement de rotation, à une vitesse ou dans un sens différent. Un système de transformation (comme le second) prend cette rotation en entrée et la convertit en un déplacement en ligne droite ou en va-et-vient. La sortie du premier mécanisme devient donc directement l'entrée du second.",
  };

  const sousQuestionLiaison: SousQuestionAnalyse = {
    id: "liaison",
    enonce: `${capitaliser(objet.piecePourLiaison)} est assemblé(e) par ${liaison.nom}. Cette liaison est-elle démontable ou indémontable ? Rigide ou élastique ?`,
    reponseAttendue: `${liaison.caracteristiques.demontable ? "Démontable" : "Indémontable"}, ${liaison.caracteristiques.rigide ? "rigide" : "élastique"}`,
    explication: liaison.justification,
  };

  const sousQuestionMateriau: SousQuestionAnalyse = {
    id: "materiau",
    enonce: `${capitaliser(objet.piecePourMateriau)} de cet objet est fabriqué(e) en ${materiau.nom}. Nomme une propriété de ce matériau qui justifie ce choix.`,
    reponseAttendue: materiau.proprietesCles[0],
    explication: `Propriétés de ce matériau : ${materiau.proprietesCles.join(", ")}. Utilisation typique : ${materiau.exempleUsage}.`,
  };

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
    enonce: "Analyse l'objet technique suivant : décris chacun de ses mécanismes et explique comment ils interagissent.",
    descriptionObjet,
    sousQuestions: [
      ...construction1.sousQuestions,
      ...construction2.sousQuestions,
      sousQuestionInteraction,
      sousQuestionLiaison,
      sousQuestionMateriau,
    ],
    mecanismes3D: [construction1.mecanisme3D, construction2.mecanisme3D],
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

  return {
    id: idAleatoire("analyse-assemblage"),
    type: "analyse",
    section: "C",
    univers: "technologique",
    conceptId: "st-ut-transmission",
    enonce: "Analyse l'objet technique suivant : inspecte chaque étage du mécanisme et réponds aux questions.",
    descriptionObjet: `${capitaliser(objet.nom)}. ${contexte}`,
    sousQuestions: objet.questions,
    assemblage: { objectId: objet.id, etapes: objet.etapes },
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
