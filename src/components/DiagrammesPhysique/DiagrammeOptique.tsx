import type { ElementOptique } from "../../types/question";

interface DiagrammeOptiqueProps {
  element: ElementOptique;
  fM: number;
  doM: number;
  hoM: number;
  corrige?: { diM: number; hiM: number };
}

export default function DiagrammeOptique({ element, fM, doM, hoM, corrige }: DiagrammeOptiqueProps) {
  const largeur = 400;
  const hauteur = 240;
  const axeY = hauteur / 2;
  const centreX = largeur / 2;

  // Échelle commune pour do, f, di (distances) — toujours positives à l'écran.
  const distanceMax = Math.max(doM, Math.abs(fM), Math.abs(corrige?.diM ?? 0)) * 1.15;
  const echelleX = (largeur / 2 - 30) / distanceMax;
  const echelleY = 45 / Math.max(hoM, Math.abs(corrige?.hiM ?? hoM));

  const estLentille = element === "lentille-convergente" || element === "lentille-divergente";

  const xObjet = centreX - doM * echelleX;
  const yObjetBase = axeY;
  const yObjetPointe = axeY - hoM * echelleY;

  const xF1 = centreX - fM * echelleX;
  const xF2 = centreX + fM * echelleX;

  const diM = corrige?.diM ?? 0;
  const hiM = corrige?.hiM ?? 0;
  const xImage = centreX + diM * echelleX;
  const yImagePointe = axeY - hiM * echelleY;

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" style={{ maxWidth: 460 }} role="img" aria-label="Schéma optique">
      {/* Axe principal */}
      <line x1={10} y1={axeY} x2={largeur - 10} y2={axeY} stroke="var(--graphite-soft, #8a7860)" strokeWidth={1} />

      {/* Élément optique (lentille ou miroir) */}
      {estLentille ? (
        <line x1={centreX} y1={axeY - 70} x2={centreX} y2={axeY + 70} stroke="var(--ink, #241a10)" strokeWidth={3} />
      ) : (
        <path
          d={
            element === "miroir-concave"
              ? `M ${centreX} ${axeY - 70} Q ${centreX + 20} ${axeY} ${centreX} ${axeY + 70}`
              : `M ${centreX} ${axeY - 70} Q ${centreX - 20} ${axeY} ${centreX} ${axeY + 70}`
          }
          fill="none"
          stroke="var(--ink, #241a10)"
          strokeWidth={3}
        />
      )}

      {/* Foyers */}
      <circle cx={xF1} cy={axeY} r={3} fill="var(--cobalt, #e8622a)" />
      <text x={xF1} y={axeY + 16} fontSize="11" fill="var(--cobalt, #e8622a)" textAnchor="middle">F</text>
      {estLentille && (
        <>
          <circle cx={xF2} cy={axeY} r={3} fill="var(--cobalt, #e8622a)" />
          <text x={xF2} y={axeY + 16} fontSize="11" fill="var(--cobalt, #e8622a)" textAnchor="middle">F</text>
        </>
      )}

      {/* Objet */}
      <line x1={xObjet} y1={yObjetBase} x2={xObjet} y2={yObjetPointe} stroke="var(--ink, #241a10)" strokeWidth={2.5} markerEnd="url(#pointe-objet)" />
      <defs>
        <marker id="pointe-objet" viewBox="0 0 10 10" refX="5" refY="0" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,10 L5,0 L10,10 Z" fill="var(--ink, #241a10)" />
        </marker>
        <marker id="pointe-image" viewBox="0 0 10 10" refX="5" refY="0" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,10 L5,0 L10,10 Z" fill="var(--cobalt, #e8622a)" />
        </marker>
      </defs>
      <text x={xObjet} y={yObjetPointe - 8} fontSize="11" fill="var(--ink, #241a10)" textAnchor="middle" fontWeight={600}>
        objet
      </text>

      {corrige && (
        <g>
          {/* Image (pointillée si virtuelle) */}
          <line
            x1={xImage}
            y1={axeY}
            x2={xImage}
            y2={yImagePointe}
            stroke="var(--cobalt, #e8622a)"
            strokeWidth={2.5}
            strokeDasharray={diM < 0 ? "5 4" : undefined}
            markerEnd="url(#pointe-image)"
          />
          <text x={xImage} y={diM >= 0 === hiM >= 0 ? yImagePointe - 8 : yImagePointe + 16} fontSize="11" fill="var(--cobalt, #e8622a)" textAnchor="middle" fontWeight={600}>
            image
          </text>

          {/* Rayon 1 : parallèle à l'axe puis passant par F */}
          <polyline
            points={`${xObjet},${yObjetPointe} ${centreX},${yObjetPointe} ${xImage},${yImagePointe}`}
            fill="none"
            stroke="var(--brass, #c98a2e)"
            strokeWidth={1.5}
            strokeDasharray={diM < 0 ? "4 3" : undefined}
          />
          {/* Rayon 2 : passant par le centre, non dévié */}
          <polyline points={`${xObjet},${yObjetPointe} ${centreX},${axeY} ${xImage},${yImagePointe}`} fill="none" stroke="var(--brass, #c98a2e)" strokeWidth={1.5} strokeDasharray={diM < 0 ? "4 3" : undefined} />
        </g>
      )}
    </svg>
  );
}
