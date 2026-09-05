import type { CircuitElectrique, SymboleCircuit } from "../../types/question";

/**
 * Schéma de circuit électrique en SVG — pas un rendu 3D : l'épreuve
 * réelle présente les circuits comme des schémas normalisés à traits
 * fins, pas des scènes 3D. Circuit à un seul chemin (boucle simple),
 * les composants sont disposés en ligne et reliés par des fils.
 */

const LARGEUR_SEGMENT = 110;
const HAUTEUR = 140;

function SymboleSVG({ symbole }: { symbole: SymboleCircuit }) {
  switch (symbole) {
    case "pile":
      return (
        <g stroke="currentColor" strokeWidth={2} fill="none">
          <line x1={-6} y1={-16} x2={-6} y2={16} strokeWidth={4} />
          <line x1={6} y1={-9} x2={6} y2={9} strokeWidth={2} />
        </g>
      );
    case "interrupteur-poussoir":
    case "interrupteur-levier":
      return (
        <g stroke="currentColor" strokeWidth={2} fill="none">
          <circle cx={-14} cy={0} r={2.5} fill="currentColor" />
          <circle cx={14} cy={0} r={2.5} fill="currentColor" />
          <line x1={-14} y1={0} x2={12} y2={-14} />
        </g>
      );
    case "fusible":
      return (
        <g stroke="currentColor" strokeWidth={2} fill="none">
          <rect x={-16} y={-8} width={32} height={16} rx={2} />
          <line x1={-16} y1={0} x2={16} y2={0} strokeDasharray="3 3" />
        </g>
      );
    case "moteur":
      return (
        <g stroke="currentColor" strokeWidth={2} fill="none">
          <circle cx={0} cy={0} r={16} />
          <text x={0} y={5} textAnchor="middle" fontSize={14} stroke="none" fill="currentColor">
            M
          </text>
        </g>
      );
    case "temoin-lumineux":
      return (
        <g stroke="currentColor" strokeWidth={2} fill="none">
          <circle cx={0} cy={0} r={16} />
          <line x1={-11} y1={-11} x2={11} y2={11} />
          <line x1={-11} y1={11} x2={11} y2={-11} />
        </g>
      );
  }
}

export default function CircuitViewer({ circuit }: { circuit: CircuitElectrique }) {
  const largeur = LARGEUR_SEGMENT * circuit.composants.length + 60;
  const y = HAUTEUR / 2;

  return (
    <svg
      viewBox={`0 0 ${largeur} ${HAUTEUR}`}
      width="100%"
      style={{ maxWidth: 560, display: "block", margin: "0 auto", color: "var(--ink)" }}
      role="img"
      aria-label="Schéma du circuit électrique"
    >
      {/* fil formant la boucle */}
      <line x1={30} y1={y} x2={largeur - 30} y2={y} stroke="currentColor" strokeWidth={2} fill="none" />
      <line x1={30} y1={y} x2={30} y2={y + 40} stroke="currentColor" strokeWidth={2} fill="none" />
      <line x1={largeur - 30} y1={y} x2={largeur - 30} y2={y + 40} stroke="currentColor" strokeWidth={2} fill="none" />
      <line x1={30} y1={y + 40} x2={largeur - 30} y2={y + 40} stroke="currentColor" strokeWidth={2} fill="none" />

      {circuit.composants.map((composant, i) => {
        const cx = 30 + LARGEUR_SEGMENT * (i + 0.5);
        return (
          <g key={composant.id} transform={`translate(${cx}, ${y})`}>
            <SymboleSVG symbole={composant.symbole} />
            <text x={0} y={-26} textAnchor="middle" fontSize={12} fill="var(--graphite-soft)">
              {composant.nom}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
