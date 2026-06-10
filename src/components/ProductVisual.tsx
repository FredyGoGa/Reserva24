type ProductVisualProps = {
  name: string
  accent: string
  compact?: boolean
}

export default function ProductVisual({
  name,
  accent,
  compact = false,
}: ProductVisualProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[2rem] ${
        compact ? "h-24 w-20" : "h-72 w-full"
      }`}
      style={{ backgroundColor: `${accent}18` }}
    >
      <div
        className={`absolute bottom-0 rounded-t-full opacity-15 ${
          compact ? "h-16 w-16" : "h-48 w-48"
        }`}
        style={{ backgroundColor: accent }}
      />
      <div
        className={`relative rounded-t-[2rem] rounded-b-xl shadow-xl ${
          compact ? "h-16 w-8" : "h-44 w-20"
        }`}
        style={{ backgroundColor: accent }}
      >
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-t-md bg-[#292d26] ${
            compact ? "-top-4 h-5 w-3" : "-top-8 h-10 w-8"
          }`}
        />
        <div
          className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-sm bg-[#f5f1e8] font-display font-bold text-[#1d211c] ${
            compact ? "h-6 w-7 text-[8px]" : "h-14 w-16 text-lg"
          }`}
        >
          {initials}
        </div>
      </div>
    </div>
  )
}
