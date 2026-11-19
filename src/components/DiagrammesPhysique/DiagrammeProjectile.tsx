import FlecheVecteur from "./FlecheVecteur";

interface DiagrammeProjectileProps {
  horizontal: boolean;
  viMS: number;
  angleDegres: number;
  hauteurInitialeM: number;
  corrige?: { porteeM: number; tempsVolS: number; hauteurMaxM?: number };
}

const G = 9.8;

export default function DiagrammeProjectile({ horizontal, viMS, angleDegres, hauteurInitialeM, corrige }: DiagrammeProjectileProps) {
  const largeur = 380;
  const hauteurSvg = 240;
  const margeBas = 30;
  const margeGauche = 24;
  const solY = hauteurSvg - margeBas;

  // Durée de vol (pour tracer une trajectoire réaliste, même avant d'afficher les valeurs numériques).
  const dureeVol = horizontal
    ? Math.sqrt((2 * hauteurInitialeM) / G)
    : (2 * viMS * Math.sin((angleDegres * Math.PI) / 180)) / G;

  const angleRad = (angleDegres * Math.PI) / 180;
  const vix = horizontal ? viMS : viMS * Math.cos(angleRad);
  const viy = horizontal ? 0 : viMS * Math.sin(angleRad);

  function positionM(t: number) {
    const x = vix * t;
    const y = horizontal ? hauteurInitialeM - 0.5 * G * t * t : hauteurInitialeM + viy * t - 0.5 * G * t * t;
    return { x, y };
  }

  const porteeEstimeeM = positionM(dureeVol).x || 1;
  const hauteurMaxEstimeeM = horizontal ? hauteurInitialeM : hauteurInitialeM + (viy * viy) / (2 * G);

  const echelleX = (largeur - margeGauche - 40) / Math.max(porteeEstimeeM, 1);
  const echelleY = (solY - 24) / Math.max(hauteurMaxEstimeeM, 1);
  const echelle = Math.min(echelleX, echelleY);

  function versEcran(point: { x: number; y: number }) {
    return { x: margeGauche + point.x * echelle, y: solY - point.y * echelle };
  }

  const nbSegments = 24;
  const trajectoire = Array.from({ length: nbSegments + 1 }, (_, i) => {
    const t = (dureeVol * i) / nbSegments;
    return versEcran(positionM(t));
  });
  const pointsTrajectoire = trajectoire.map((p) => `${p.x},${p.y}`).join(" ");

  const origine = versEcran({ x: 0, y: hauteurInitialeM });
  const viLongueurPx = 40;

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteurSvg}`} width="100%" style={{ maxWidth: 440 }} role="img" aria-label="Trajectoire d'un projectile">
      {/* Sol */}
      <line x1={4} y1={solY} x2={largeur - 4} y2={solY} stroke="var(--ink, #241a10)" strokeWidth={2} />

      {/* Plateforme de lancement si tir horizontal depuis une hauteur */}
      {horizontal && hauteurInitialeM > 0 && (
        <rect x={margeGauche - 18} y={origine.y} width={30} height={solY - origine.y} fill="var(--brass-soft, #f6e8cd)" stroke="var(--ink, #241a10)" strokeWidth={1.5} />
      )}

      {/* Trajectoire pointillée */}
      <polyline points={pointsTrajectoire} fill="none" stroke="var(--cobalt, #e8622a)" strokeWidth={2} strokeDasharray="6 5" />

      {/* Vecteur vitesse initiale */}
      <FlecheVecteur
        x1={origine.x}
        y1={origine.y}
        x2={origine.x + viLongueurPx * Math.cos(horizontal ? 0 : -angleRad)}
        y2={origine.y + viLongueurPx * Math.sin(horizontal ? 0 : -angleRad)}
        couleur="#1a2130"
        label="vᵢ"
      />
      {!horizontal && (
        <text x={origine.x + 14} y={origine.y - 6} fontSize="11" fill="var(--graphite, #46392a)">
          {angleDegres}°
        </text>
      )}

      {/* Point de chute et portée, révélés seulement au corrigé */}
      {corrige && (
        <g>
          {(() => {
            const chute = versEcran({ x: corrige.porteeM, y: horizontal ? 0 : hauteurInitialeM });
            return (
              <>
                <circle cx={chute.x} cy={solY} r={4} fill="var(--signal, #c1442a)" />
                <line x1={origine.x} y1={solY + 10} x2={chute.x} y2={solY + 10} stroke="var(--signal, #c1442a)" strokeWidth={1.5} />
                <text x={(origine.x + chute.x) / 2} y={solY + 24} fontSize="11" fill="var(--signal, #c1442a)" textAnchor="middle" fontWeight={600}>
                  Δx = {corrige.porteeM.toFixed(2)} m
                </text>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}
