/**
 * notationEngine.ts
 * ------------------------------------------------------------------
 * Correction déterministe des sous-questions notées (Sections B et
 * C), à crédit partiel comme l'épreuve réelle. PUR TypeScript, sans
 * appel réseau : ce moteur EST la source de vérité pour tout ce qui
 * a une réponse objectivement vraie ou fausse (numérique, choix,
 * mots de banque). Seule "texte-libre" (voir geminiClient.ts) demande
 * un appel à Gemini, et seulement pour juger la QUALITÉ d'une
 * explication écrite par rapport à des critères déjà déterminés ici
 * — jamais pour trancher un fait scientifique.
 * ------------------------------------------------------------------
 */

import type {
  SousQuestionNumerique,
  SousQuestionChoixUnique,
  SousQuestionCasesMultiples,
  SousQuestionMotsBanque,
  ResultatSousQuestion,
} from "../types/question";

function ecartRelatif(valeur: number, attendue: number): number {
  return attendue === 0 ? Math.abs(valeur) : Math.abs((valeur - attendue) / attendue);
}

/** Une démarche est jugée "présente" si l'élève y a écrit au moins une formule/un calcul plausible. */
function demarchePlausible(demarche: string): boolean {
  const texte = demarche.trim();
  if (texte.length < 8) return false;
  return /[0-9]/.test(texte) && /[=×x*/÷+-]/.test(texte);
}

/**
 * Numérique : la réponse finale est vérifiée par tolérance relative. Si
 * une démarche est demandée et que le barème vaut plus d'un point, le
 * score est réparti entre démarche plausible et réponse finale exacte —
 * approximation déterministe du crédit partiel réel, sans jamais
 * confier ce jugement à Gemini.
 */
export function noterNumerique(
  sq: SousQuestionNumerique,
  reponseElseve: number | null,
  demarcheElseve: string
): ResultatSousQuestion {
  const pointsMax = sq.bareme.pointsMax;
  const reponseValide = reponseElseve !== null && !Number.isNaN(reponseElseve);
  const reponseCorrecte = reponseValide && ecartRelatif(reponseElseve as number, sq.reponseAttendue) <= sq.toleranceRelative;

  let points: number;
  let retroaction: string;

  if (!sq.demandeDemarche || pointsMax <= 1) {
    points = reponseCorrecte ? pointsMax : 0;
    retroaction = reponseCorrecte
      ? "Réponse exacte."
      : `Réponse attendue : ${sq.reponseAttendue}${sq.uniteAttendue ? " " + sq.uniteAttendue : ""}.`;
  } else {
    const demarcheOk = demarchePlausible(demarcheElseve);
    if (reponseCorrecte && demarcheOk) {
      points = pointsMax;
      retroaction = "Démarche et réponse finale correctes.";
    } else if (reponseCorrecte && !demarcheOk) {
      points = Math.max(pointsMax - 1, 0);
      retroaction = "Réponse finale correcte, mais la démarche (formule et substitution) n'est pas clairement montrée.";
    } else if (!reponseCorrecte && demarcheOk) {
      points = Math.max(pointsMax - 1, 0);
      retroaction = `Démarche présente, mais la réponse finale est hors tolérance (attendu : ${sq.reponseAttendue}${sq.uniteAttendue ? " " + sq.uniteAttendue : ""}).`;
    } else {
      points = 0;
      retroaction = `Démarche absente et réponse finale incorrecte (attendu : ${sq.reponseAttendue}${sq.uniteAttendue ? " " + sq.uniteAttendue : ""}).`;
    }
  }

  return { sousQuestionId: sq.id, points, pointsMax, retroaction };
}

export function noterChoixUnique(sq: SousQuestionChoixUnique, choixId: string | null): ResultatSousQuestion {
  const correct = choixId !== null && choixId === sq.bonneOptionId;
  return {
    sousQuestionId: sq.id,
    points: correct ? sq.bareme.pointsMax : 0,
    pointsMax: sq.bareme.pointsMax,
    retroaction: correct
      ? "Réponse exacte."
      : `Réponse attendue : ${sq.options.find((o) => o.id === sq.bonneOptionId)?.texte ?? sq.bonneOptionId}.`,
  };
}

export function noterCasesMultiples(sq: SousQuestionCasesMultiples, choixIds: string[]): ResultatSousQuestion {
  const attendu = new Set(sq.bonnesOptionIds);
  const choisi = new Set(choixIds);
  const exact = attendu.size === choisi.size && [...attendu].every((id) => choisi.has(id));
  return {
    sousQuestionId: sq.id,
    points: exact ? sq.bareme.pointsMax : 0,
    pointsMax: sq.bareme.pointsMax,
    retroaction: exact
      ? "Sélection exacte."
      : `Sélection attendue : ${sq.options.filter((o) => attendu.has(o.id)).map((o) => o.texte).join(", ")}.`,
  };
}

/** Crédit partiel proportionnel au nombre d'emplacements correctement remplis, comme l'épreuve réelle. */
export function noterMotsBanque(sq: SousQuestionMotsBanque, reponsesElseve: Record<string, string>): ResultatSousQuestion {
  const total = sq.emplacements.length;
  const corrects = sq.emplacements.filter((e) => (reponsesElseve[e.id] ?? "") === e.motAttendu).length;
  const points = Math.round((corrects / total) * sq.bareme.pointsMax);
  return {
    sousQuestionId: sq.id,
    points,
    pointsMax: sq.bareme.pointsMax,
    retroaction:
      corrects === total
        ? "Toutes les réponses sont exactes."
        : `${corrects}/${total} emplacements exacts. Réponses attendues : ${sq.emplacements.map((e) => `${e.libelle} → ${e.motAttendu}`).join("; ")}.`,
  };
}
