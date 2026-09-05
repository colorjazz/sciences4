import { createPortal } from "react-dom";

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
 *
 * Rendu en portail dans document.body (pas dans .app-shell) : l'Atelier
 * a besoin de tout le viewport, mais .app-shell anime `transform`
 * (fade-up au montage), ce qui en fait un containing block pour tout
 * `position: fixed` descendant — sans le portail, le plein écran se
 * retrouverait coincé dans la carte de 880px du reste du site.
 */
const URL_ATELIER = "https://sciences3d.netlify.app";

export default function Atelier({ onRetour }: AtelierProps) {
  return createPortal(
    <div className="atelier-fullscreen">
      <div className="atelier-topbar">
        <button className="retour-lien" onClick={onRetour} type="button">
          ← Modules
        </button>
      </div>
      <iframe src={URL_ATELIER} title="Atelier des mécanismes" className="atelier-frame-full" />
    </div>,
    document.body,
  );
}
