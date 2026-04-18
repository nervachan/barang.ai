import DashboardSidebar from "../components/DashboardSidebar"

const weeklyIncidents = [1, 2, 0, 3, 1, 0, 0]
const weeklyResolved = [1, 2, 0, 3, 1, 0, 0]
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const responseRate = [85, 88, 91, 94]
const responseWeeks = ["W1", "W2", "W3", "W4"]

const responseTime = [2.1, 1.8, 0, 2.5, 1.9, 0, 0]

function Polyline({ points, color }: { points: string; color: string }) {
  return <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} strokeLinecap="round" />
}

export default function AnalyticsPage() {
  const donutParts = [
    { label: "Fall Detection", value: 5, color: "#b8f227" },
    { label: "Crowd Activity", value: 2, color: "#ffb100" },
    { label: "After-Hours", value: 1, color: "#8148f5" },
  ]

  const total = donutParts.reduce((sum, part) => sum + part.value, 0)
  const angles = donutParts.map((part) => (part.value / total) * 360)

  return (
    <main className="min-h-screen bg-[#070a0f] text-zinc-100">
      <div className="mx-auto flex w-full max-w-full gap-4 px-3 py-3 md:px-4 md:py-4">
        <DashboardSidebar active="analytics" />

        <section className="min-w-0 flex-1 rounded-2xl border border-zinc-900 bg-[#090c13]/90 p-4 md:p-6">
          <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Analytics</h1>
              <p className="mt-2 text-sm text-zinc-500">Performance overview · April 11-17, 2026</p>
            </div>

            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-400">
              Brgy. Burnham, Baguio City
            </div>
          </header>

          <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-500">Total Incidents</p>
              <p className="mt-3 text-5xl font-semibold leading-none">7</p>
              <p className="mt-2 text-sm text-zinc-600">This week</p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-500">Resolved</p>
              <p className="mt-3 text-5xl font-semibold leading-none">6</p>
              <p className="mt-2 text-sm text-zinc-600">85.7% rate</p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-500">Avg Response</p>
              <p className="mt-3 text-5xl font-semibold leading-none">2:08</p>
              <p className="mt-2 text-sm text-zinc-600">minutes</p>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-linear-to-r from-zinc-900/80 to-lime-950/10 p-5">
              <p className="text-sm text-zinc-500">False Alarms</p>
              <p className="mt-3 text-5xl font-semibold leading-none">1</p>
              <p className="mt-2 text-sm text-zinc-600">14% rate</p>
            </article>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.9fr_0.95fr]">
            <article className="rounded-3xl border border-zinc-800 bg-zinc-900/65 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-semibold tracking-tight">Weekly Incidents</h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <span className="h-2 w-2 rounded-full bg-lime-400" />
                    Incidents
                  </span>
                  <span className="flex items-center gap-2 text-zinc-600">
                    <span className="h-2 w-2 rounded-full bg-lime-700" />
                    Resolved
                  </span>
                </div>
              </div>

              <div className="grid h-62 grid-cols-7 items-end gap-4 rounded-2xl border border-zinc-800/80 bg-[#0b0f18] px-5 pb-8 pt-5">
                {weeklyIncidents.map((value, idx) => (
                  <div key={days[idx]} className="flex flex-col items-center gap-2">
                    <div className="relative flex h-44 w-8 items-end rounded-md bg-zinc-900/70">
                      <div
                        className="w-full rounded-md bg-linear-to-t from-lime-500 to-lime-300"
                        style={{ height: `${(value / 3) * 100}%` }}
                      />
                      {weeklyResolved[idx] > 0 && (
                        <div
                          className="pointer-events-none absolute bottom-0 left-0 w-full rounded-md border-t border-lime-200/35"
                          style={{ height: `${(weeklyResolved[idx] / 3) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">{days[idx]}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-linear-to-r from-zinc-900/80 to-lime-950/10 p-5">
              <h2 className="text-3xl font-semibold tracking-tight">By Type</h2>

              <div className="mt-3 flex justify-center">
                <svg viewBox="0 0 220 220" className="h-48 w-48" aria-hidden>
                  <g transform="translate(110 110)">
                    {angles.reduce((acc, angle, index) => {
                      const start = acc.current
                      const end = start + angle
                      const largeArc = angle > 180 ? 1 : 0
                      const r = 64

                      const x1 = r * Math.cos((Math.PI / 180) * (start - 90))
                      const y1 = r * Math.sin((Math.PI / 180) * (start - 90))
                      const x2 = r * Math.cos((Math.PI / 180) * (end - 90))
                      const y2 = r * Math.sin((Math.PI / 180) * (end - 90))

                      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`

                      acc.current = end
                      acc.paths.push(
                        <path
                          key={donutParts[index].label}
                          d={d}
                          stroke={donutParts[index].color}
                          strokeWidth="22"
                          fill="none"
                          strokeLinecap="butt"
                        />,
                      )

                      return acc
                    }, { current: 0, paths: [] as React.ReactElement[] }).paths}
                  </g>
                </svg>
              </div>

              <div className="space-y-2 text-sm">
                {donutParts.map((part) => (
                  <div key={part.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-zinc-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: part.color }} />
                      {part.label}
                    </span>
                    <span className="font-semibold text-zinc-200">{part.value}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="rounded-3xl border border-zinc-800 bg-zinc-900/65 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">Response Rate</h2>
                  <p className="text-sm text-zinc-500">Monthly trend</p>
                </div>
                <span className="rounded-full bg-lime-500/18 px-3 py-1 text-xs font-semibold text-lime-300">+6%</span>
              </div>

              <div className="h-52 rounded-2xl border border-zinc-800/80 bg-[#0b0f18] p-4">
                <svg viewBox="0 0 500 190" className="h-full w-full" aria-hidden>
                  <defs>
                    <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b8f227" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#b8f227" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 15 160 L 165 135 L 325 110 L 485 85 L 485 170 L 15 170 Z" fill="url(#rateFill)" />
                  <Polyline points="15,160 165,135 325,110 485,85" color="#b8f227" />

                  {responseWeeks.map((label, idx) => (
                    <text key={label} x={20 + idx * 155} y={186} fill="#596273" fontSize="12">
                      {label}
                    </text>
                  ))}

                  {responseRate.map((value, idx) => (
                    <text key={`r-${value}-${idx}`} x={4} y={165 - idx * 25} fill="#3e4655" fontSize="11">
                      {idx === 0 ? 80 : value}
                    </text>
                  ))}
                </svg>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900/65 p-5">
              <div className="mb-3">
                <h2 className="text-3xl font-semibold tracking-tight">Response Time</h2>
                <p className="text-sm text-zinc-500">Average minutes per day</p>
              </div>

              <div className="h-52 rounded-2xl border border-zinc-800/80 bg-[#0b0f18] p-4">
                <svg viewBox="0 0 500 190" className="h-full w-full" aria-hidden>
                  <Polyline points="15,65 95,80 175,170 255,45 335,75 415,170 485,170" color="#7f8cff" />
                  {responseTime.map((_, idx) => (
                    <circle
                      key={`point-${days[idx]}`}
                      cx={15 + idx * 78}
                      cy={[65, 80, 170, 45, 75, 170, 170][idx]}
                      r="4"
                      fill="#8e98ff"
                    />
                  ))}

                  {days.map((label, idx) => (
                    <text key={`day-${label}`} x={8 + idx * 78} y={186} fill="#596273" fontSize="12">
                      {label}
                    </text>
                  ))}
                </svg>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}