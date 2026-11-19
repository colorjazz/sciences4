interface Point {
  t: number;
  v: number;
}

interface DiagrammeVitesseTempsProps {
  points: Point[];
}

export default function DiagrammeVitesseTemps({ points }: DiagrammeVitesseTempsProps) {
  const largeur = 360;
  const hauteur = 240;
  const margeGauche = 50;
  const margeDroite = 20;
  const margeHaut = 20;
  const margeBas = 36;

  const tMax = Math.max(...points.map((p) => p.t)) * 1.05;
  const vMax = Math.max(...points.map((p) => p.v)) * 1.15;

  const zoneX = largeur - margeGauche - margeDroite;
  const zoneY = hauteur - margeHaut - margeBas;

  function px(t: number) {
    return margeGauche + (t / tMax) * zoneX;
  }
  function py(v: number) {
    return margeHaut + zoneY - (v / vMax) * zoneY;
  }

  const polylinePoints = points.map((p) => `${px(p.t)},${py(p.v)}`).join(" ");

  const graduationsT = Array.from({ length: 5 }, (_, i) => (tMax * (i + 1)) / 5);
  const graduationsV = Array.from({ length: 4 }, (_, i) => (vMax * (i + 1)) / 4);

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" style={{ maxWidth: 420 }} role="img" aria-label="Graphique vitesse en fonction du temps">
      {/* Grille */}
      {graduationsT.map((t, i) => (
        <line key={`gt-${i}`} x1={px(t)} y1={margeHaut} x2={px(t)} y2={margeHaut + zoneY} stroke="var(--line, #e8dcc0)" strokeWidth={1} />
      ))}
      {graduationsV.map((v, i) => (
        <line key={`gv-${i}`} x1={margeGauche} y1={py(v)} x2={margeGauche + zoneX} y2={py(v)} stroke="var(--line, #e8dcc0)" strokeWidth={1} />
      ))}

      {/* Axes */}
      <line x1={margeGauche} y1={margeHaut} x2={margeGauche} y2={margeHaut + zoneY} stroke="var(--ink, #241a10)" strokeWidth={2} />
      <line x1={margeGauche} y1={margeHaut + zoneY} x2={margeGauche + zoneX} y2={margeHaut + zoneY} stroke="var(--ink, #241a10)" strokeWidth={2} />

      {/* Étiquettes d'axes */}
      <text x={margeGauche + zoneX / 2} y={hauteur - 6} fontSize="12" fill="var(--graphite, #46392a)" textAnchor="middle">
        t (s)
      </text>
      <text x={14} y={margeHaut + zoneY / 2} fontSize="12" fill="var(--graphite, #46392a)" textAnchor="middle" transform={`rotate(-90 14 ${margeHaut + zoneY / 2})`}>
        v (m/s)
      </text>

      {/* Graduations numériques */}
      {graduationsT.map((t, i) => (
        <text key={`lt-${i}`} x={px(t)} y={margeHaut + zoneY + 16} fontSize="10" fill="var(--graphite-soft, #8a7860)" textAnchor="middle">
          {t.toFixed(0)}
        </text>
      ))}
      {graduationsV.map((v, i) => (
        <text key={`lv-${i}`} x={margeGauche - 8} y={py(v) + 3} fontSize="10" fill="var(--graphite-soft, #8a7860)" textAnchor="end">
          {v.toFixed(0)}
        </text>
      ))}

      {/* Aire sous la courbe */}
      <polygon
        points={`${margeGauche},${margeHaut + zoneY} ${polylinePoints} ${px(points[points.length - 1].t)},${margeHaut + zoneY}`}
        fill="var(--cobalt-soft, #fce2d1)"
        opacity={0.6}
      />

      {/* Courbe */}
      <polyline points={polylinePoints} fill="none" stroke="var(--cobalt, #e8622a)" strokeWidth={2.5} />

      {/* Points et étiquettes de coordonnées */}
      {points.map((p, i) => (
        <g key={`pt-${i}`}>
          <circle cx={px(p.t)} cy={py(p.v)} r={3.5} fill="var(--ink, #241a10)" />
          <text x={px(p.t)} y={py(p.v) - 8} fontSize="10" fill="var(--ink, #241a10)" textAnchor="middle" fontWeight={600}>
            ({p.t.toFixed(1)}, {p.v.toFixed(1)})
          </text>
        </g>
      ))}
    </svg>
  );
}
