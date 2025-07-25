export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>ElmiClan Portal Logo</title>
      <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />
      <path d="M12 22V12" />
      <path d="M12 12H3.5" />
      <path d="M12 12h8.5" />
      <path d="M12 12L6 9" />
      <path d="M12 12l6-3" />
    </svg>
  );
}
