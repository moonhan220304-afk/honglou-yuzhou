export default function Seal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex select-none items-center justify-center rounded-[3px] border border-gold/60 bg-primary font-serif font-medium tracking-[0.35em] text-paper shadow-sm ${className}`}
    >
      {text}
    </span>
  );
}
