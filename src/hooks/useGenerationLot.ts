import { useCallback, useEffect, useRef, useState } from "react";

interface EtatGenerationLot<T> {
  donnees: T[] | null;
  chargement: boolean;
  erreur: string | null;
}

/**
 * Variante de useGenerationQuestion pour un LOT de questions généré en un
 * seul appel réseau (voir genererLotQuestionsQCM) — la Section A affiche
 * ses 15 questions comme l'épreuve réelle, au lieu de régénérer une
 * question à la fois.
 */
export function useGenerationLot<T>(generateur: () => Promise<T[]>) {
  const [etat, setEtat] = useState<EtatGenerationLot<T>>({
    donnees: null,
    chargement: true,
    erreur: null,
  });
  const compteurAppel = useRef(0);

  const generer = useCallback(async () => {
    const idAppel = ++compteurAppel.current;
    setEtat({ donnees: null, chargement: true, erreur: null });
    try {
      const resultat = await generateur();
      if (idAppel === compteurAppel.current) {
        setEtat({ donnees: resultat, chargement: false, erreur: null });
      }
    } catch (e) {
      if (idAppel === compteurAppel.current) {
        const message = e instanceof Error ? e.message : "Erreur inconnue.";
        setEtat({ donnees: null, chargement: false, erreur: message });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    generer();
  }, [generer]);

  return { ...etat, regenerer: generer };
}
