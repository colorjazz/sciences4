/**
 * geminiClient.ts
 * ------------------------------------------------------------------
 * Point d'entrée unique et réel vers l'API Gemini (plus de templates
 * français codés en dur dans les générateurs). Gemini reçoit
 * uniquement pour tâche d'écrire une mise en situation courte —
 * jamais de calculer une valeur, jamais de décider d'une vérité
 * scientifique. Les générateurs lui fournissent les valeurs
 * numériques déjà déterminées par les moteurs, et lui demandent de
 * les habiller dans un contexte varié à chaque appel.
 * ------------------------------------------------------------------
 */

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {}

const DELAI_MAX_MS = 15000;

function construireEndpoint(): { url: string; cle: string } {
  const cle = import.meta.env.VITE_GEMINI_API_KEY;
  const modele = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.6-flash";

  if (!cle) {
    throw new GeminiConfigError(
      "Clé API Gemini manquante (VITE_GEMINI_API_KEY). Copier .env.example vers .env et renseigner la clé."
    );
  }

  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`,
    cle,
  };
}

async function appellerGemini(prompt: string): Promise<unknown> {
  const { url, cle } = construireEndpoint();

  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

  let reponse: Response;
  try {
    reponse = await fetch(`${url}?key=${cle}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controleur.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 1.0,
        },
      }),
    });
  } catch (erreur) {
    if (controleur.signal.aborted) {
      throw new GeminiRequestError("Délai dépassé en attendant Gemini.");
    }
    throw new GeminiRequestError("Impossible de joindre l'API Gemini (problème réseau).");
  } finally {
    clearTimeout(minuteur);
  }

  if (!reponse.ok) {
    throw new GeminiRequestError(`Erreur API Gemini : ${reponse.status} ${reponse.statusText}`);
  }

  const donnees = await reponse.json();
  const texte: string | undefined = donnees?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!texte) {
    throw new GeminiRequestError("Réponse Gemini vide ou mal formée.");
  }

  try {
    return JSON.parse(texte);
  } catch {
    throw new GeminiRequestError("Réponse Gemini non conforme au format JSON attendu.");
  }
}

/**
 * Demande à Gemini une mise en situation courte (1-2 phrases), sans aucune
 * valeur numérique calculée par lui — les valeurs à intégrer sont fournies
 * dans le prompt et doivent être reprises telles quelles.
 */
export async function demanderMiseEnSituation(prompt: string): Promise<string> {
  const resultat = await appellerGemini(prompt);

  if (
    typeof resultat !== "object" ||
    resultat === null ||
    typeof (resultat as Record<string, unknown>).miseEnSituation !== "string" ||
    ((resultat as Record<string, unknown>).miseEnSituation as string).trim().length < 5
  ) {
    throw new GeminiRequestError("Réponse Gemini incomplète : champ « miseEnSituation » manquant.");
  }

  return ((resultat as Record<string, unknown>).miseEnSituation as string).trim();
}

/** Variante pour la Section C : Gemini propose seulement l'application concrète du mécanisme. */
export async function demanderContexteApplication(prompt: string): Promise<string> {
  const resultat = await appellerGemini(prompt);

  if (
    typeof resultat !== "object" ||
    resultat === null ||
    typeof (resultat as Record<string, unknown>).contexteApplication !== "string" ||
    ((resultat as Record<string, unknown>).contexteApplication as string).trim().length < 5
  ) {
    throw new GeminiRequestError("Réponse Gemini incomplète : champ « contexteApplication » manquant.");
  }

  return ((resultat as Record<string, unknown>).contexteApplication as string).trim();
}

/**
 * Objet technique inventé par Gemini, composé de deux mécanismes fournis
 * par l'appelant. Gemini choisit librement l'objet et son vocabulaire —
 * jamais les caractéristiques techniques (celles-ci restent déterminées
 * par les moteurs et les tables de référence).
 */
export interface DescriptionObjetCompose {
  nomObjet: string;
  descriptionGenerale: string;
  descriptionMecanisme1: string;
  descriptionMecanisme2: string;
  piecePourLiaison: string;
  piecePourMateriau: string;
}

const CHAMPS_OBJET_COMPOSE: (keyof DescriptionObjetCompose)[] = [
  "nomObjet",
  "descriptionGenerale",
  "descriptionMecanisme1",
  "descriptionMecanisme2",
  "piecePourLiaison",
  "piecePourMateriau",
];

export async function demanderObjetCompose(prompt: string): Promise<DescriptionObjetCompose> {
  const resultat = await appellerGemini(prompt);

  if (typeof resultat !== "object" || resultat === null) {
    throw new GeminiRequestError("Réponse Gemini mal formée : objet JSON attendu.");
  }

  for (const champ of CHAMPS_OBJET_COMPOSE) {
    const valeur = (resultat as Record<string, unknown>)[champ];
    if (typeof valeur !== "string" || valeur.trim().length < 2) {
      throw new GeminiRequestError(`Réponse Gemini incomplète : champ « ${champ} » manquant ou trop court.`);
    }
  }

  return resultat as DescriptionObjetCompose;
}
