type KbdProps = {
  keys: string[];
  size?: "sm" | "xs";
};

export function Kbd({ keys, size = "sm" }: KbdProps) {
  const sizeClass = size === "xs" ? "text-[10px] px-1 py-0.5" : "text-xs px-1.5 py-0.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className={`${sizeClass} rounded border border-zinc-700 bg-zinc-800 font-mono text-zinc-400 leading-none`}
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
