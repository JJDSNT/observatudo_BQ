type SparklineProps = {
  values: number[];
  color: string;
  height?: number;
};

export function Sparkline({ values, color, height = 40 }: SparklineProps) {
  if (values.length < 2) return null;

  const W = 100;
  const H = height;
  const PAD = 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - 2 * PAD),
    y: H - PAD - ((v - min) / range) * (H - 2 * PAD),
  }));

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts.at(-1)!.x},${H - PAD} L${pts[0].x},${H - PAD} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={area} fill={color} fillOpacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
