/** Signature visuelle : nœud de circuit relié à une amorce de ligne de cotation. */
export function Logomark() {
  return (
    <svg
      className="mark"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="17" cy="17" r="15" stroke="var(--line)" strokeWidth="1.2" />
      <circle cx="17" cy="17" r="3.5" fill="var(--cobalt)" />
      <path
        d="M17 5v6M17 23v6M5 17h6M23 17h6"
        stroke="var(--brass)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
