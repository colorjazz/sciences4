interface FlecheVecteurProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  couleur: string;
  label?: string;
  pointilles?: boolean;
  epaisseur?: number;
}

/** Flèche vectorielle réutilisable (ligne + tête de flèche + étiquette), pour les diagrammes de physique. */
export default function FlecheVecteur({ x1, y1, x2, y2, couleur, label, pointilles, epaisseur }: FlecheVecteurProps) {
  const idMarqueur = `fleche-${couleur.replace(/[^a-zA-Z0-9]/g, "")}`;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const longueur = Math.sqrt(dx * dx + dy * dy);
  if (longueur < 1) return null;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const offsetLabelX = (-dy / longueur) * 12;
  const offsetLabelY = (dx / longueur) * 12;

  return (
    <g>
      <defs>
        <marker id={idMarqueur} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill={couleur} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={couleur}
        strokeWidth={epaisseur ?? 2.5}
        strokeDasharray={pointilles ? "5 4" : undefined}
        markerEnd={`url(#${idMarqueur})`}
      />
      {label && (
        <text x={midX + offsetLabelX} y={midY + offsetLabelY} fontSize="12" fontWeight={700} fill={couleur} textAnchor="middle" dominantBaseline="middle">
          {label}
        </text>
      )}
    </g>
  );
}
