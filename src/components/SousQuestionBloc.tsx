import { useMemo, useState } from "react";
import type { ResultatSousQuestion, SousQuestionNotee } from "../types/question";
import {
  noterNumerique,
  noterChoixUnique,
  noterCasesMultiples,
  noterMotsBanque,
} from "../engines/notationEngine";
import { corrigerReponseTexteLibre, GeminiRequestError, GeminiConfigError } from "../ai/geminiClient";

function melanger<T>(items: T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

interface SousQuestionBlocProps {
  sousQuestion: SousQuestionNotee;
  onNote: (resultat: ResultatSousQuestion) => void;
}

export default function SousQuestionBloc({ sousQuestion, onNote }: SousQuestionBlocProps) {
  const [verifie, setVerifie] = useState(false);
  const [resultat, setResultat] = useState<ResultatSousQuestion | null>(null);
  const [enCorrection, setEnCorrection] = useState(false);
  const [erreurCorrection, setErreurCorrection] = useState<string | null>(null);

  const [reponseNumerique, setReponseNumerique] = useState("");
  const [demarche, setDemarche] = useState("");
  const [choixUniqueId, setChoixUniqueId] = useState<string | null>(null);
  const [casesSelectionnees, setCasesSelectionnees] = useState<Set<string>>(new Set());
  const [motsChoisis, setMotsChoisis] = useState<Record<string, string>>({});
  const [texteReponse, setTexteReponse] = useState("");

  const banqueMelangee = useMemo(
    () => (sousQuestion.typeReponse === "mots-banque" ? melanger(sousQuestion.banqueMots) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sousQuestion.id]
  );

  function pretAVerifier(): boolean {
    switch (sousQuestion.typeReponse) {
      case "numerique":
        return reponseNumerique.trim() !== "" && (!sousQuestion.demandeDemarche || demarche.trim() !== "");
      case "choix-unique":
        return choixUniqueId !== null;
      case "cases-multiples":
        return casesSelectionnees.size > 0;
      case "mots-banque":
        return sousQuestion.emplacements.every((e) => (motsChoisis[e.id] ?? "") !== "");
      case "texte-libre":
        return texteReponse.trim() !== "";
    }
  }

  async function verifier() {
    if (verifie || !pretAVerifier()) return;

    if (sousQuestion.typeReponse === "numerique") {
      const valeur = reponseNumerique.trim() === "" ? null : Number(reponseNumerique.replace(",", "."));
      const r = noterNumerique(sousQuestion, Number.isNaN(valeur) ? null : valeur, demarche);
      setResultat(r);
      setVerifie(true);
      onNote(r);
      return;
    }
    if (sousQuestion.typeReponse === "choix-unique") {
      const r = noterChoixUnique(sousQuestion, choixUniqueId);
      setResultat(r);
      setVerifie(true);
      onNote(r);
      return;
    }
    if (sousQuestion.typeReponse === "cases-multiples") {
      const r = noterCasesMultiples(sousQuestion, [...casesSelectionnees]);
      setResultat(r);
      setVerifie(true);
      onNote(r);
      return;
    }
    if (sousQuestion.typeReponse === "mots-banque") {
      const r = noterMotsBanque(sousQuestion, motsChoisis);
      setResultat(r);
      setVerifie(true);
      onNote(r);
      return;
    }
    // texte-libre : seul cas nécessitant Gemini (jamais pour un fait scientifique,
    // voir la remarque dans geminiClient.ts et question.ts)
    setEnCorrection(true);
    setErreurCorrection(null);
    try {
      const correction = await corrigerReponseTexteLibre({
        enonce: sousQuestion.enonce,
        criteresCorrection: sousQuestion.criteresCorrection,
        reponseModele: sousQuestion.reponseModele,
        pointsMax: sousQuestion.bareme.pointsMax,
        reponseEleve: texteReponse,
      });
      const r: ResultatSousQuestion = {
        sousQuestionId: sousQuestion.id,
        points: correction.points,
        pointsMax: sousQuestion.bareme.pointsMax,
        retroaction: correction.retroaction,
      };
      setResultat(r);
      setVerifie(true);
      onNote(r);
    } catch (e) {
      const message =
        e instanceof GeminiConfigError || e instanceof GeminiRequestError
          ? e.message
          : "La correction a échoué. Réessaie.";
      setErreurCorrection(message);
    } finally {
      setEnCorrection(false);
    }
  }

  function toggleCase(id: string) {
    setCasesSelectionnees((prev) => {
      const copie = new Set(prev);
      if (copie.has(id)) copie.delete(id);
      else copie.add(id);
      return copie;
    });
  }

  return (
    <div className="sous-question-notee">
      <p className="enonce">{sousQuestion.enonce}</p>

      {!verifie && (
        <>
          {sousQuestion.typeReponse === "numerique" && (
            <>
              {sousQuestion.demandeDemarche && (
                <textarea
                  className="demarche-textarea"
                  placeholder="Montre ta démarche (formule, substitution)…"
                  value={demarche}
                  onChange={(e) => setDemarche(e.target.value)}
                  rows={3}
                />
              )}
              <div className="reponse-inline">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ta réponse"
                  value={reponseNumerique}
                  onChange={(e) => setReponseNumerique(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifier()}
                />
                {sousQuestion.uniteAttendue && <span className="unite">{sousQuestion.uniteAttendue}</span>}
              </div>
            </>
          )}

          {sousQuestion.typeReponse === "choix-unique" && (
            <div className="choix-liste">
              {sousQuestion.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`choix-bouton${choixUniqueId === o.id ? " selectionne" : ""}`}
                  onClick={() => setChoixUniqueId(o.id)}
                >
                  {o.texte}
                </button>
              ))}
            </div>
          )}

          {sousQuestion.typeReponse === "cases-multiples" && (
            <div className="cases-liste">
              {sousQuestion.options.map((o) => (
                <label key={o.id} className="case-option">
                  <input type="checkbox" checked={casesSelectionnees.has(o.id)} onChange={() => toggleCase(o.id)} />
                  {o.texte}
                </label>
              ))}
            </div>
          )}

          {sousQuestion.typeReponse === "mots-banque" && (
            <>
              <div className="banque-mots">
                {banqueMelangee.map((mot) => (
                  <span key={mot} className="mot-banque">
                    {mot}
                  </span>
                ))}
              </div>
              <div className="emplacements-mots">
                {sousQuestion.emplacements.map((emp) => (
                  <div key={emp.id} className="emplacement-mot">
                    <span>{emp.libelle}</span>
                    <select
                      value={motsChoisis[emp.id] ?? ""}
                      onChange={(e) => setMotsChoisis((prev) => ({ ...prev, [emp.id]: e.target.value }))}
                    >
                      <option value="" disabled>
                        Choisir…
                      </option>
                      {banqueMelangee.map((mot) => (
                        <option key={mot} value={mot}>
                          {mot}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}

          {sousQuestion.typeReponse === "texte-libre" && (
            <textarea
              className="demarche-textarea"
              placeholder="Écris ta réponse…"
              value={texteReponse}
              onChange={(e) => setTexteReponse(e.target.value)}
              rows={3}
            />
          )}

          {erreurCorrection && <p className="sous-question-erreur">{erreurCorrection}</p>}

          <button
            type="button"
            className="ghost"
            disabled={!pretAVerifier() || enCorrection}
            onClick={verifier}
            style={{ marginTop: "0.6rem" }}
          >
            {enCorrection ? "Correction en cours…" : "Vérifier"}
          </button>
        </>
      )}

      {verifie && resultat && (
        <div
          className={`feedback ${resultat.points === resultat.pointsMax ? "succes" : resultat.points === 0 ? "erreur" : "partiel"}`}
        >
          <strong>
            {resultat.points}/{resultat.pointsMax} point{resultat.pointsMax > 1 ? "s" : ""}
          </strong>
          <p style={{ margin: "0.35rem 0 0" }}>{resultat.retroaction}</p>
          <p style={{ margin: "0.35rem 0 0", color: "var(--graphite-soft)" }}>{sousQuestion.explication}</p>
        </div>
      )}
    </div>
  );
}
