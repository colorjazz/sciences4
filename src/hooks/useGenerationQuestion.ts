import { useCallback, useEffect, useRef, useState } from "react";

interface EtatGeneration<T> {
  donnee: T | null;
  chargement: boolean;
  erreur: string | null;
}

/**
 * Pilote un appel de génération asynchrone (question IA). Ignore les
 * réponses qui arrivent après qu'un nouvel appel a été lancé, pour
 * éviter d'afficher une question périmée si l'élève clique vite.
 */
export function useGenerationQuestion<T>(generateur: () => Promise<T>) {
  const [etat, setEtat] = useState<EtatGeneration<T>>({
    donnee: null,
    chargement: true,
    erreur: null,
  });
  const compteurAppel = useRef(0);

  const generer = useCallback(async () => {
    const idAppel = ++compteurAppel.current;
    setEtat({ donnee: null, chargement: true, erreur: null });
    try {
      const resultat = await generateur();
      if (idAppel === compteurAppel.current) {
        setEtat({ donnee: resultat, chargement: false, erreur: null });
      }
    } catch (e) {
      if (idAppel === compteurAppel.current) {
        const message = e instanceof Error ? e.message : "Erreur inconnue.";
        setEtat({ donnee: null, chargement: false, erreur: message });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    generer();
  }, [generer]);

  return { ...etat, regenerer: generer };
}
