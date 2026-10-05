/** Results recorded per month (stacked: medal-winning vs other). Pure SVG, server-rendered. */
export function ResultsChart({ data }: { data: { month: string; count: number; medals: number }[] }) {
  const W = 640;
  const H = 220;
  const pad = { l: 28, r: 8, t: 22, b: 28 };
  const max = Math.max(4, ...data.map((d) => d.count));
  const niceMax = Math.ceil(max / 4) * 4;
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const slot = iw / data.length;
  const bw = Math.min(28, slot * 0.56);
  const y = (v: number) => pad.t + ih - (v / niceMax) * ih;
  const ticks = [0, niceMax / 4, niceMax / 2, (niceMax * 3) / 4, niceMax];
  const total = data.reduce((n, d) => n + d.count, 0);
  const medals = data.reduce((n, d) => n + d.medals, 0);
  const monthLabel = (m: string) => new Date(`${m}-15T00:00:00Z`).toLocaleString("en-GB", { month: "short", timeZone: "UTC" });

  return (
    <figure>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 px-5 pt-1">
        <div className="flex gap-8">
          <div>
            <p className="text-[2rem] font-extrabold leading-none text-ink-950 tabular [font-variation-settings:'wdth'_70]">{total}</p>
            <p className="mt-1 text-xs text-ink-500">results, last 12 months</p>
          </div>
          <div>
            <p className="text-[2rem] font-extrabold leading-none text-ink-950 tabular [font-variation-settings:'wdth'_70]">{medals}</p>
            <p className="mt-1 text-xs text-ink-500">medal-winning marks</p>
          </div>
        </div>
        <ul className="flex gap-4 text-xs text-ink-600">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[1px] bg-ink-900" aria-hidden /> Results
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[1px] bg-gold" aria-hidden /> With a medal
          </li>
        </ul>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby="chart-title chart-desc">
        <title id="chart-title">Results recorded per month</title>
        <desc id="chart-desc">{data.map((d) => `${monthLabel(d.month)}: ${d.count} results, ${d.medals} with a medal`).join("; ")}</desc>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-ink-300" : "stroke-line"} strokeWidth={1} strokeDasharray={t === 0 ? undefined : "2 3"} />
            <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-400 text-[10px] tabular">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + slot * i + (slot - bw) / 2;
          return (
            <g key={d.month}>
              {d.count > 0 && (
                <>
                  <rect x={x} y={y(d.count)} width={bw} height={y(d.medals) - y(d.count)} className="fill-ink-900" rx={1} />
                  {d.medals > 0 && <rect x={x} y={y(d.medals)} width={bw} height={y(0) - y(d.medals)} className="fill-gold" />}
                  <text x={x + bw / 2} y={y(d.count) - 6} textAnchor="middle" className="fill-ink-900 text-[11px] font-bold tabular">
                    {d.count}
                  </text>
                </>
              )}
              <text x={x + bw / 2} y={H - 8} textAnchor="middle" className={i === data.length - 1 ? "fill-ink-950 text-[10px] font-bold" : "fill-ink-500 text-[10px]"}>
                {monthLabel(d.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
