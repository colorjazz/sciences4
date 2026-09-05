interface AtelierProps {
  onRetour: () => void;
}

/**
 * L'Atelier des mécanismes vit dans son propre dépôt (sciences4_3d,
 * déployé sur Netlify) — application Three.js autonome, sans build
 * step. Embarquée ici en iframe plutôt que portée en composants R3F :
 * elle est déjà testée et fonctionnelle, et un deuxième moteur
 * Three.js dans le même bundle React entrerait en conflit avec
 * @react-three/fiber.
 */
const URL_ATELIER = "https://sciences3d.netlify.app";

export default function Atelier({ onRetour }: AtelierProps) {
  return (
    <div className="panel">
      <div className="module-header">
        <button className="retour-lien" onClick={onRetour} type="button">
          ← Modules
        </button>
      </div>

      <span className="eyebrow-label">Univers technologique</span>
      <h2 style={{ marginBottom: "1rem" }}>L'Atelier — banc d'essai des mécanismes</h2>
      <p className="lede" style={{ marginBottom: "1.25rem" }}>
        Explore des objets réels démontés en mécanismes 3D animés, ou
        assemble ton propre mécanisme dans le générateur.
      </p>

      <div className="atelier-frame-wrap">
        <iframe
          src={URL_ATELIER}
          title="Atelier des mécanismes"
          className="atelier-frame"
        />
      </div>
    </div>
  );
}
