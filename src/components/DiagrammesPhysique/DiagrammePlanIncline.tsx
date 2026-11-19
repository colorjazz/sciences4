import FlecheVecteur from "./FlecheVecteur";

interface DiagrammePlanInclineProps {
  angleDegres: number;
  forceMotriceN?: number;
  corrige?: { fgxN: number; fgyN: number; fNN: number; ffN: number };
}

const COULEUR_FG = "#c1442a";
const COULEUR_FN = "#1a2130";
const COULEUR_FF = "#c98a2e";
const COULEUR_FM = "#2a6fc1";

export default function DiagrammePlanIncline({ angleDegres, forceMotriceN, corrige }: DiagrammePlanInclineProps) {
  const largeur = 340;
  const hauteur = 230;
  const baseX = 36;
  const baseY = hauteur - 34;
  const longueurRampePx = 240;
  const angleRad = (angleDegres * Math.PI) / 180;

  // Vecteur unitaire le long de la rampe, vers le haut de la pente (coordonnées écran : y vers le bas).
  const u = { x: Math.cos(angleRad), y: -Math.sin(angleRad) };
  // Normale à la rampe, pointant à l'opposé de la surface (où repose le bloc).
  const n = { x: -Math.sin(angleRad), y: -Math.cos(angleRad) };

  const sommetX = baseX + longueurRampePx * u.x;
  const sommetY = baseY + longueurRampePx * u.y;

  // Bloc positionné au milieu de la rampe, posé sur la surface (décalé le long de la normale).
  const milieuX = (baseX + sommetX) / 2;
  const milieuY = (baseY + sommetY) / 2;
  const demiBloc = 15;
  const blocCentreX = milieuX + demiBloc * n.x;
  const blocCentreY = milieuY + demiBloc * n.y;

  const echelleVecteur = corrige ? 48 / Math.max(corrige.fgxN + corrige.fgyN, corrige.fNN, corrige.ffN, forceMotriceN ?? 0, 1) : 0;

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" style={{ maxWidth: 420 }} role="img" aria-label={`Plan incliné à ${angleDegres} degrés`}>
      {/* Sol */}
      <line x1={8} y1={baseY} x2={largeur - 8} y2={baseY} stroke="var(--line, #e8dcc0)" strokeWidth={2} />
      {/* Rampe */}
      <polygon points={`${baseX},${baseY} ${sommetX},${sommetY} ${sommetX},${baseY}`} fill="var(--brass-soft, #f6e8cd)" stroke="var(--ink, #241a10)" strokeWidth={2} />
      {/* Arc d'angle */}
      <path
        d={`M ${baseX + 30} ${baseY} A 30 30 0 0 0 ${baseX + 30 * Math.cos(angleRad)} ${baseY - 30 * Math.sin(angleRad)}`}
        fill="none"
        stroke="var(--graphite-soft, #8a7860)"
        strokeWidth={1.5}
      />
      <text x={baseX + 40} y={baseY - 10} fontSize="13" fill="var(--graphite, #46392a)" fontWeight={600}>
        {angleDegres}°
      </text>
      {/* Bloc */}
      <rect
        x={blocCentreX - demiBloc}
        y={blocCentreY - demiBloc}
        width={demiBloc * 2}
        height={demiBloc * 2}
        fill="var(--cobalt, #e8622a)"
        stroke="var(--ink, #241a10)"
        strokeWidth={1.5}
        transform={`rotate(${-angleDegres} ${blocCentreX} ${blocCentreY})`}
      />

      {corrige && (
        <g>
          <FlecheVecteur
            x1={blocCentreX}
            y1={blocCentreY}
            x2={blocCentreX}
            y2={blocCentreY + echelleVecteur * Math.sqrt(corrige.fgxN * corrige.fgxN + corrige.fgyN * corrige.fgyN)}
            couleur={COULEUR_FG}
            label="Fg"
          />
          <FlecheVecteur
            x1={blocCentreX}
            y1={blocCentreY}
            x2={blocCentreX + n.x * echelleVecteur * corrige.fNN}
            y2={blocCentreY + n.y * echelleVecteur * corrige.fNN}
            couleur={COULEUR_FN}
            label="FN"
          />
          <FlecheVecteur
            x1={blocCentreX}
            y1={blocCentreY}
            x2={blocCentreX + u.x * echelleVecteur * corrige.ffN}
            y2={blocCentreY + u.y * echelleVecteur * corrige.ffN}
            couleur={COULEUR_FF}
            label="Ff"
          />
          {forceMotriceN !== undefined && (
            <FlecheVecteur
              x1={blocCentreX}
              y1={blocCentreY}
              x2={blocCentreX - u.x * echelleVecteur * forceMotriceN}
              y2={blocCentreY - u.y * echelleVecteur * forceMotriceN}
              couleur={COULEUR_FM}
              label="Fm"
            />
          )}
        </g>
      )}
    </svg>
  );
}
