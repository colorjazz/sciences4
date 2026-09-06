/**
 * qcmGenerator.ts — module "Questions rapides" (Section A, ST)
 * ------------------------------------------------------------------
 * Chaque scénario est construit en DEUX temps : une partie pure (les
 * valeurs numériques, les choix et la bonne réponse — jamais décidés
 * par Gemini) puis une mise en situation écrite par Gemini. Les 15
 * scénarios d'un lot sont habillés en UN SEUL appel réseau
 * (demanderLotMisesEnSituation), comme la Section A réelle qui
 * compte exactement 15 questions — ça économise 14 appels API sur 15
 * par rapport à un appel séparé par question.
 *
 * Le balancement d'équations reste une exception assumée : la
 * validité chimique d'une équation reste vérifiée via une table de
 * référence (chimieEngine.ts), pas laissée à l'invention libre de
 * Gemini — un risque d'erreur scientifique inacceptable ici.
 *
 * Deux formats de question, comme l'épreuve réelle : à fait unique
 * (un seul fait par choix) et à tableau (plusieurs faits reliés
 * combinés dans une même grille A/B/C/D).
 * ------------------------------------------------------------------
 */

import type { QuestionQCM, ChoixQCM, ColonneQCMTableau, OptionQCMTableau } from "../types/question";
import type { Parcours, UniversEvalue } from "../types/curriculum";
import { getStructureEpreuve } from "../types/curriculum";
import { resoudreLoiOhm } from "../engines/electriciteEngine";
import {
  classifierPH,
  BANQUE_EQUATIONS,
  estBalancementCorrect,
  genererCoefficientsErrones,
  formaterEquation,
} from "../engines/chimieEngine";
import { genererTrainAleatoire, calculerSensRotation, calculerRapportVitesse } from "../engines/mecaniqueEngine";
import { resoudreForceGravitationnelle, resoudreVitesse } from "../engines/mecaniqueForcesEngine";
import { BANQUE_GAZ, classifierSystemeMeteo } from "../engines/terreEspaceEngine";
import { demanderLotMisesEnSituation } from "../ai/geminiClient";

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

/** Un scénario = une question déjà entièrement déterminée, sauf sa mise en situation. */
interface ScenarioQCM {
  promptScenario: string;
  construire: (miseEnSituation: string) => QuestionQCM;
}

// ------------------------------------------------------------
// Univers matériel — Loi d'Ohm (QCM simple)
// ------------------------------------------------------------

function construireScenarioLoiOhm(parcours: Parcours): ScenarioQCM {
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

  const promptScenario = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur un circuit électrique.",
    `Le circuit décrit doit comporter une résistance de EXACTEMENT ${resistanceOhm} ohms parcourue par un courant de EXACTEMENT ${courantA} ampères.`,
    "Choisis un appareil ou un montage réaliste (scolaire, domestique ou industriel léger) — varie ton choix à chaque fois, sois créatif.",
    "N'effectue AUCUN calcul, ne mentionne aucune tension, ne révèle aucune réponse.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
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
        conceptId: parcours === "ST" ? "st-um-loi-ohm" : "ats-um-loi-ohm",
        enonce: `${miseEnSituation} Quelle est la différence de potentiel (tension) aux bornes de cette résistance ?`,
        choix,
        bonneReponseId,
        explication: `U = R × I = ${resistanceOhm} × ${courantA} = ${bonneValeur} V.`,
      };
    },
  };
}

// ------------------------------------------------------------
// Univers matériel — Échelle pH (QCM simple)
// ------------------------------------------------------------

function construireScenarioPh(): ScenarioQCM {
  const valeurPH = Math.floor(Math.random() * 15); // 0–14
  const classe = classifierPH(valeurPH);

  const promptScenario = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur les propriétés d'une solution.",
    "Invente un liquide, une solution ou une expérience de laboratoire plausible (varie ton choix à chaque fois).",
    "Ne mentionne AUCUNE valeur de pH, ne révèle pas si la solution est acide, neutre ou basique.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
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
        enonce: `${miseEnSituation} Une analyse indique que cette solution a un pH de ${valeurPH}. Comment cette solution est-elle classée ?`,
        choix,
        bonneReponseId: classe,
        explication:
          valeurPH < 7
            ? `Un pH inférieur à 7 correspond à une solution acide (ici pH = ${valeurPH}).`
            : valeurPH === 7
              ? "Un pH de 7 correspond à une solution neutre."
              : `Un pH supérieur à 7 correspond à une solution basique (ici pH = ${valeurPH}).`,
      };
    },
  };
}

// ------------------------------------------------------------
// Univers matériel — Balancement d'équations chimiques (QCM simple)
// (équations vérifiées par table de référence, pas par Gemini)
// ------------------------------------------------------------

function construireScenarioBalancement(): ScenarioQCM {
  const equation = BANQUE_EQUATIONS[Math.floor(Math.random() * BANQUE_EQUATIONS.length)];

  const optionCorrecte = formaterEquation(equation, equation.coefficientsCorrects);
  const optionsErronees = new Set<string>();
  while (optionsErronees.size < 3) {
    const proposition = genererCoefficientsErrones(equation);
    if (!estBalancementCorrect(equation, proposition)) {
      optionsErronees.add(formaterEquation(equation, proposition));
    }
  }

  const promptScenario = [
    "Tu écris UNIQUEMENT une courte phrase d'introduction (1 phrase), en français québécois neutre,",
    "qui situe une réaction chimique dans un contexte concret (industriel, domestique ou naturel).",
    "Ne nomme PAS les réactifs ou produits précis, reste général sur le type de contexte (ex. combustion, fabrication, laboratoire).",
    "Ne présente aucune équation chimique toi-même.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
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
        enonce: `${miseEnSituation} Laquelle de ces équations chimiques est correctement balancée ?`,
        choix,
        bonneReponseId,
        explication: `L'équation balancée respecte la loi de conservation de la masse : ${optionCorrecte}`,
      };
    },
  };
}

// ------------------------------------------------------------
// Univers technologique — Train de deux roues dentées (QCM tableau)
// Grille à deux colonnes (sens de rotation ET rapport de vitesse),
// comme le format multi-faits de l'épreuve réelle.
// ------------------------------------------------------------

function construireScenarioTrainTableau(parcours: Parcours): ScenarioQCM {
  const train = genererTrainAleatoire(2);
  const sens = calculerSensRotation(train);
  const dentsA = train.engrenages[0].nombreDents;
  const dentsB = train.engrenages[1].nombreDents;
  const rapportCorrect = Number(calculerRapportVitesse(train, 0, 1).toFixed(2));
  const rapportErrone = Number((dentsB / dentsA).toFixed(2));
  const sensCorrectB = sens[1];
  const sensOpposeB = sensCorrectB === "horaire" ? "antihoraire" : "horaire";

  const promptScenario = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur un mécanisme à deux roues dentées en prise directe.",
    "Choisis un appareil ou une machine réaliste qui utilise un tel mécanisme — varie ton choix à chaque fois.",
    "Ne mentionne AUCUN nombre de dents, AUCUN sens de rotation, ne révèle aucune réponse.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
      const colonnes: ColonneQCMTableau[] = [
        { id: "sens", titre: "Sens de rotation de la roue B" },
        { id: "rapport", titre: "Rapport de vitesse entre A et B" },
      ];

      const combinaisons = melanger([
        { sens: sensCorrectB, rapport: rapportCorrect },
        { sens: sensOpposeB, rapport: rapportCorrect },
        { sens: sensCorrectB, rapport: rapportErrone },
        { sens: sensOpposeB, rapport: rapportErrone },
      ]);
      const options: OptionQCMTableau[] = combinaisons.map((c, i) => ({
        id: String.fromCharCode(97 + i),
        valeurs: { sens: c.sens, rapport: String(c.rapport) },
      }));
      const bonneOptionId = options.find(
        (o) => o.valeurs.sens === sensCorrectB && o.valeurs.rapport === String(rapportCorrect)
      )!.id;

      return {
        id: idAleatoire("qcm-tableau-train"),
        type: "qcm-tableau",
        section: "A",
        univers: "technologique",
        conceptId: parcours === "ST" ? "st-ut-transmission" : "ats-ut-transmission",
        enonce: `${miseEnSituation} La roue A compte ${dentsA} dents et tourne en sens ${train.sensRotationEntree}, engrenée directement avec la roue B qui compte ${dentsB} dents. Parmi les choix ci-dessous, lequel indique correctement le sens de rotation de la roue B et le rapport de vitesse entre A et B ?`,
        colonnes,
        options,
        bonneOptionId,
        explication: `Deux roues en prise directe tournent en sens opposés : B tourne donc en sens ${sensCorrectB}. Rapport de vitesse = dents(A) / dents(B) = ${dentsA} / ${dentsB} = ${rapportCorrect}.`,
      };
    },
  };
}

// ------------------------------------------------------------
// Univers matériel — Force gravitationnelle, Fg = mg (QCM simple)
// Sous-thème "Forces et mouvements", propre au parcours ATS.
// ------------------------------------------------------------

function construireScenarioForceGravitationnelle(): ScenarioQCM {
  const masseKg = Number((Math.random() * 140 + 5).toFixed(1)); // 5–145 kg
  const { forceN } = resoudreForceGravitationnelle({ masseKg });
  const bonneValeur = Number(forceN.toFixed(1));

  const candidats = [
    Number((masseKg * 10).toFixed(1)),
    Number((masseKg / 9.8).toFixed(1)),
    Number((bonneValeur + masseKg).toFixed(1)),
    Number((bonneValeur - masseKg).toFixed(1)),
  ];
  const valeursRetenues = new Set<number>([bonneValeur]);
  for (const c of candidats) {
    if (valeursRetenues.size >= 4) break;
    if (!valeursRetenues.has(c) && c > 0) valeursRetenues.add(c);
  }
  let ecart = 5;
  while (valeursRetenues.size < 4) {
    const secours = Number((bonneValeur + ecart).toFixed(1));
    if (!valeursRetenues.has(secours)) valeursRetenues.add(secours);
    ecart += 5;
  }

  const promptScenario = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur la force gravitationnelle exercée sur un objet.",
    `L'objet décrit doit avoir EXACTEMENT une masse de ${masseKg} kg.`,
    "Choisis un objet ou une charge réaliste (levage, transport, sport, chantier) — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune force, ne révèle aucune réponse.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
      const choixValeurs = melanger([...valeursRetenues]);
      const choix: ChoixQCM[] = choixValeurs.map((v, i) => ({
        id: String.fromCharCode(97 + i),
        texte: `${v} N`,
      }));
      const bonneReponseId = choix[choixValeurs.indexOf(bonneValeur)].id;

      return {
        id: idAleatoire("qcm-force-grav"),
        type: "qcm",
        section: "A",
        univers: "materiel",
        conceptId: "ats-um-force",
        enonce: `${miseEnSituation} Quelle est la force gravitationnelle exercée sur cet objet ? (g = 9,8 N/kg)`,
        choix,
        bonneReponseId,
        explication: `Fg = mg = ${masseKg} × 9,8 = ${bonneValeur} N.`,
      };
    },
  };
}

// ------------------------------------------------------------
// Univers matériel — Vitesse constante, v = d/Δt (QCM simple)
// Sous-thème "Forces et mouvements", propre au parcours ATS.
// ------------------------------------------------------------

function construireScenarioVitesse(): ScenarioQCM {
  const distanceM = Math.floor(Math.random() * 480 + 20); // 20–499 m
  const tempsS = Math.floor(Math.random() * 58 + 2); // 2–59 s
  const { vitesseMS } = resoudreVitesse({ distanceM, tempsS });
  const bonneValeur = Number(vitesseMS.toFixed(2));

  const candidats = [
    Number((tempsS / distanceM).toFixed(2)),
    Number((distanceM * tempsS).toFixed(2)),
    Number((bonneValeur + tempsS).toFixed(2)),
    Number((bonneValeur - tempsS / 4).toFixed(2)),
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

  const promptScenario = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur un déplacement à vitesse constante.",
    `Le déplacement décrit doit couvrir EXACTEMENT ${distanceM} mètres en EXACTEMENT ${tempsS} secondes.`,
    "Choisis un contexte réaliste (véhicule, sport, convoyeur industriel) — varie ton choix à chaque fois.",
    "N'effectue AUCUN calcul, ne mentionne aucune vitesse, ne révèle aucune réponse.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
      const choixValeurs = melanger([...valeursRetenues]);
      const choix: ChoixQCM[] = choixValeurs.map((v, i) => ({
        id: String.fromCharCode(97 + i),
        texte: `${v} m/s`,
      }));
      const bonneReponseId = choix[choixValeurs.indexOf(bonneValeur)].id;

      return {
        id: idAleatoire("qcm-vitesse"),
        type: "qcm",
        section: "A",
        univers: "materiel",
        conceptId: "ats-um-vitesse-distance-temps",
        enonce: `${miseEnSituation} Quelle est la vitesse de ce déplacement, en supposant qu'elle est constante ?`,
        choix,
        bonneReponseId,
        explication: `v = d / Δt = ${distanceM} / ${tempsS} = ${bonneValeur} m/s.`,
      };
    },
  };
}

// ------------------------------------------------------------
// Terre et espace — Effet de serre (ST) / Cyclone et anticyclone (ATS)
// (QCM simple, classification par table de référence). Sous-thème
// Atmosphère — jusqu'ici le seul univers sans AUCUN scénario, malgré
// une vraie pondération prévue dans STRUCTURE_EPREUVE_ST/ATS.
// ------------------------------------------------------------

function construireScenarioEffetDeSerre(): ScenarioQCM {
  const gaz = BANQUE_GAZ[Math.floor(Math.random() * BANQUE_GAZ.length)];

  const promptScenario = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur la composition de l'atmosphère.",
    `La situation doit mentionner ${gaz.nom} comme gaz étudié, sans dire s'il s'agit d'un gaz à effet de serre ou non.`,
    "Choisis un contexte réaliste (mesure atmosphérique, laboratoire, procédé industriel) — varie ton choix à chaque fois.",
    "Ne révèle aucune réponse.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
      const choix: ChoixQCM[] = melanger([
        { id: "ges", texte: "C'est un gaz à effet de serre." },
        { id: "non-ges", texte: "Ce n'est pas un gaz à effet de serre." },
      ]);

      return {
        id: idAleatoire("qcm-effet-serre"),
        type: "qcm",
        section: "A",
        univers: "terreEspace",
        conceptId: "st-te-effet-serre",
        enonce: `${miseEnSituation} ${gaz.nom[0].toUpperCase()}${gaz.nom.slice(1)} fait-il partie des gaz à effet de serre ?`,
        choix,
        bonneReponseId: gaz.classe,
        explication:
          gaz.classe === "ges"
            ? `${gaz.nom} absorbe le rayonnement infrarouge terrestre : c'est un gaz à effet de serre.`
            : `${gaz.nom} n'absorbe pas significativement le rayonnement infrarouge terrestre : ce n'est pas un gaz à effet de serre.`,
      };
    },
  };
}

function construireScenarioCycloneAnticyclone(): ScenarioQCM {
  const pression: "basse" | "haute" = Math.random() < 0.5 ? "basse" : "haute";
  const classe = classifierSystemeMeteo(pression);
  const sensRotation = pression === "basse" ? "convergent en spirale vers son centre" : "divergent en spirale depuis son centre";

  const promptScenario = [
    "Tu écris UNIQUEMENT une mise en situation courte (1 à 2 phrases), en français québécois neutre,",
    "pour une question de sciences de 4e secondaire sur un système météorologique observé par satellite.",
    "Choisis une région ou un contexte réaliste — varie ton choix à chaque fois.",
    "Ne mentionne AUCUNE pression (basse ou haute), ne révèle aucune réponse.",
  ].join("\n");

  return {
    promptScenario,
    construire: (miseEnSituation) => {
      const choix: ChoixQCM[] = melanger([
        { id: "cyclone", texte: "Un cyclone (dépression)" },
        { id: "anticyclone", texte: "Un anticyclone" },
      ]);

      return {
        id: idAleatoire("qcm-cyclone"),
        type: "qcm",
        section: "A",
        univers: "terreEspace",
        conceptId: "ats-te-cyclone-anticyclone",
        enonce: `${miseEnSituation} Les vents y ont un mouvement ${sensRotation}, autour d'une zone de ${pression} pression. Quel type de système météorologique est-ce ?`,
        choix,
        bonneReponseId: classe,
        explication:
          classe === "cyclone"
            ? "Une zone de basse pression attire l'air en spirale vers son centre : c'est un cyclone (dépression)."
            : "Une zone de haute pression repousse l'air en spirale depuis son centre : c'est un anticyclone.",
      };
    },
  };
}

// ------------------------------------------------------------
// Génération par lot — un seul appel réseau pour tout le lot
// ------------------------------------------------------------

interface ScenarioDisponible {
  /** Parcours pour lesquels ce scénario est admissible (voir curriculum.ts). */
  parcours: Parcours[];
  univers: UniversEvalue;
  construire: (parcours: Parcours) => ScenarioQCM;
}

const CONSTRUCTEURS_SCENARIO: ScenarioDisponible[] = [
  { parcours: ["ST", "ATS"], univers: "materiel", construire: construireScenarioLoiOhm },
  { parcours: ["ST"], univers: "materiel", construire: () => construireScenarioPh() },
  { parcours: ["ST"], univers: "materiel", construire: () => construireScenarioBalancement() },
  { parcours: ["ST", "ATS"], univers: "technologique", construire: construireScenarioTrainTableau },
  { parcours: ["ATS"], univers: "materiel", construire: () => construireScenarioForceGravitationnelle() },
  { parcours: ["ATS"], univers: "materiel", construire: () => construireScenarioVitesse() },
  { parcours: ["ST"], univers: "terreEspace", construire: () => construireScenarioEffetDeSerre() },
  { parcours: ["ATS"], univers: "terreEspace", construire: () => construireScenarioCycloneAnticyclone() },
];

/**
 * Construit la file des univers à piger pour un lot, dans les
 * proportions EXACTES prévues par l'épreuve réelle
 * (STRUCTURE_EPREUVE_ST/ATS.sections[A].repartitionUnivers), mélangée
 * pour ne pas grouper les questions par univers.
 */
function fileUniversPourSectionA(parcours: Parcours, nombreQuestions: number): UniversEvalue[] {
  const structure = getStructureEpreuve(parcours);
  const sectionA = structure.sections.find((s) => s.section === "A");
  const repartition = sectionA?.repartitionUnivers ?? {};
  const total = Object.values(repartition).reduce((a, b) => a + (b ?? 0), 0);

  const file: UniversEvalue[] = [];
  if (total > 0) {
    (Object.entries(repartition) as [UniversEvalue, number | undefined][]).forEach(([univers, n]) => {
      for (let i = 0; i < (n ?? 0); i++) file.push(univers);
    });
    // Ajuste le nombre de questions demandé (NOMBRE_QUESTIONS côté appelant)
    // à la vraie taille de la répartition officielle : répète ou tronque la
    // file plutôt que d'halluciner une proportion qui n'existe pas.
    while (file.length < nombreQuestions) file.push(file[file.length % total]);
    file.length = nombreQuestions;
  }
  return melanger(file);
}

export async function genererLotQuestionsQCM(nombreQuestions = 15, parcours: Parcours = "ST"): Promise<QuestionQCM[]> {
  const disponibles = CONSTRUCTEURS_SCENARIO.filter((c) => c.parcours.includes(parcours));
  const fileUnivers = fileUniversPourSectionA(parcours, nombreQuestions);

  const scenarios: ScenarioQCM[] = [];
  for (let i = 0; i < nombreQuestions; i++) {
    const universVoulu = fileUnivers[i];
    // Repli sur l'ensemble des scénarios admissibles si cet univers n'a
    // (encore) aucun scénario écrit pour ce parcours — mieux vaut une
    // question hors proportion qu'une génération qui échoue.
    const pourCetUnivers = universVoulu ? disponibles.filter((c) => c.univers === universVoulu) : [];
    const pool = pourCetUnivers.length > 0 ? pourCetUnivers : disponibles;
    const entree = pool[Math.floor(Math.random() * pool.length)];
    scenarios.push(entree.construire(parcours));
  }

  const misesEnSituation = await demanderLotMisesEnSituation(scenarios.map((s) => s.promptScenario));
  return scenarios.map((s, i) => s.construire(misesEnSituation[i]));
}
