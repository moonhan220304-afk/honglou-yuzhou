export default function Seal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex select-none items-center justify-center rounded-[4px] border border-gold/70 bg-seal/90 font-serif font-medium tracking-widest text-paper ${className}`}
    >
      {text}
    </span>
  );
}
