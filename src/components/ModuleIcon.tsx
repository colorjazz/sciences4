interface IconProps {
  name: "eclair" | "regle" | "engrenage" | "cube";
}

/**
 * Icônes dessinées à la main (trait fin, 1.5px) pour rester cohérentes
 * avec le motif "lignes de cotation" plutôt que d'importer un pack
 * générique qui casserait l'identité visuelle.
 */
export function ModuleIcon({ name }: IconProps) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "eclair":
      return (
        <svg {...common}>
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
      );
    case "regle":
      return (
        <svg {...common}>
          <rect x="3" y="9" width="18" height="6" rx="1" />
          <path d="M7 9v3M11 9v3M15 9v3M19 9v3" />
        </svg>
      );
    case "engrenage":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05 4.93 4.93" />
        </svg>
      );
    case "cube":
      return (
        <svg {...common}>
          <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
          <path d="M4 7l8 4 8-4M12 11v10" />
        </svg>
      );
  }
}
