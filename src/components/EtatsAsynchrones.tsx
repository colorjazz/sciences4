export function EtatChargement({ message }: { message: string }) {
  return (
    <div className="etat-chargement">
      <span className="spinner" aria-hidden="true" />
      {message}
    </div>
  );
}

export function EtatErreur({
  message,
  onReessayer,
}: {
  message: string;
  onReessayer: () => void;
}) {
  return (
    <div className="etat-erreur">
      <strong>La génération a échoué</strong>
      <p>{message}</p>
      <button type="button" className="ghost" onClick={onReessayer}>
        Réessayer
      </button>
    </div>
  );
}
