interface RadarChartProps {
  attributes: { label: string; score: number }[]
  size?: number
  max?: number
}

// A hexagon-style radar/spider chart drawn as plain SVG — one series, so no
// legend is needed (the title next to it names it). Grid and axis lines stay
// recessive; the single data series carries the accent color.
export default function RadarChart({ attributes, size = 260, max = 100 }: RadarChartProps) {
  const center = size / 2
  const radius = size / 2 - 36 // leave room for axis labels
  const angleStep = (Math.PI * 2) / attributes.length
  const rings = [0.25, 0.5, 0.75, 1]

  const pointAt = (index: number, fraction: number) => {
    const angle = angleStep * index - Math.PI / 2
    return {
      x: center + radius * fraction * Math.cos(angle),
      y: center + radius * fraction * Math.sin(angle),
    }
  }

  const toPolygon = (fraction: (index: number) => number) =>
    attributes.map((_, i) => pointAt(i, fraction(i))).map((p) => `${p.x},${p.y}`).join(' ')

  const dataPolygon = toPolygon((i) => Math.max(0, Math.min(1, attributes[i].score / max)))

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Attribute radar: ${attributes.map((a) => `${a.label} ${a.score}`).join(', ')}`}
    >
      {/* grid rings */}
      {rings.map((fraction) => (
        <polygon
          key={fraction}
          points={toPolygon(() => fraction)}
          fill="none"
          stroke="#2a3036" // line: recessive grid
          strokeWidth={1}
        />
      ))}

      {/* axis lines */}
      {attributes.map((_, i) => {
        const p = pointAt(i, 1)
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#2a3036" strokeWidth={1} />
        )
      })}

      {/* data series */}
      <polygon points={dataPolygon} fill="#de1b21" fillOpacity={0.25} stroke="#de1b21" strokeWidth={2} />
      {attributes.map((a, i) => {
        const p = pointAt(i, Math.max(0, Math.min(1, a.score / max)))
        return <circle key={a.label} cx={p.x} cy={p.y} r={4} fill="#de1b21" />
      })}

      {/* axis labels */}
      {attributes.map((a, i) => {
        const p = pointAt(i, 1.22)
        return (
          <text
            key={a.label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-soft text-[11px] font-medium"
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
