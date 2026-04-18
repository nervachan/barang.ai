import DashboardSidebar from "./components/DashboardSidebar"

type CameraCard = {
  id: string
  title: string
  subtitle: string
  status: "LIVE" | "ALERT" | "OFF"
  detected: number
}

type AlertItem = {
  title: string
  location: string
  confidence: string
  time: string
  tone: "critical" | "warn" | "normal"
}

const cameraCards: CameraCard[] = [
  {
    id: "CAM-01",
    title: "BHC Waiting Area",
    subtitle: "Fall Detection",
    status: "LIVE",
    detected: 3,
  },
  {
    id: "CAM-02",
    title: "Covered Court",
    subtitle: "Crowd Monitor",
    status: "ALERT",
    detected: 8,
  },
  {
    id: "CAM-03",
    title: "Barangay Hall Lobby",
    subtitle: "Presence Detection",
    status: "LIVE",
    detected: 2,
  },
  {
    id: "CAM-04",
    title: "Public Plaza Gate",
    subtitle: "No Signal",
    status: "OFF",
    detected: 0,
  },
]

const alertItems: AlertItem[] = [
  {
    title: "Fall Detected",
    location: "Covered Court - CAM-02",
    confidence: "91% conf",
    time: "2 min ago",
    tone: "critical",
  },
  {
    title: "Crowd Anomaly",
    location: "Covered Court - CAM-02",
    confidence: "78% conf",
    time: "7 min ago",
    tone: "warn",
  },
  {
    title: "Fall Detected",
    location: "BHC Waiting Area - CAM-01",
    confidence: "95% conf",
    time: "1h ago",
    tone: "normal",
  },
  {
    title: "After-Hours Entry",
    location: "Covered Court - CAM-02",
    confidence: "82% conf",
    time: "Yesterday",
    tone: "normal",
  },
]

function StatusBadge({ status }: { status: CameraCard["status"] }) {
  const styles =
    status === "LIVE"
      ? "bg-lime-500/20 text-lime-300 ring-lime-500/30"
      : status === "ALERT"
        ? "bg-red-500/20 text-red-300 ring-red-500/30"
        : "bg-zinc-500/20 text-zinc-300 ring-zinc-500/30"

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-wider ring-1 ${styles}`}>
      {status}
    </span>
  )
}

function PoseNodes() {
  return (
    <svg viewBox="0 0 120 120" className="h-16 w-16 text-lime-400/90" aria-hidden>
      <circle cx="30" cy="20" r="4" fill="currentColor" />
      <circle cx="30" cy="35" r="3" fill="currentColor" />
      <circle cx="18" cy="50" r="3" fill="currentColor" />
      <circle cx="42" cy="50" r="3" fill="currentColor" />
      <circle cx="30" cy="62" r="3" fill="currentColor" />
      <circle cx="24" cy="78" r="3" fill="currentColor" />
      <circle cx="36" cy="78" r="3" fill="currentColor" />
      <line x1="30" y1="24" x2="30" y2="60" stroke="currentColor" strokeWidth="1.7" />
      <line x1="30" y1="38" x2="18" y2="50" stroke="currentColor" strokeWidth="1.7" />
      <line x1="30" y1="38" x2="42" y2="50" stroke="currentColor" strokeWidth="1.7" />
      <line x1="30" y1="60" x2="24" y2="78" stroke="currentColor" strokeWidth="1.7" />
      <line x1="30" y1="60" x2="36" y2="78" stroke="currentColor" strokeWidth="1.7" />

      <circle cx="84" cy="26" r="4" fill="currentColor" opacity="0.55" />
      <circle cx="84" cy="40" r="3" fill="currentColor" opacity="0.55" />
      <circle cx="72" cy="54" r="3" fill="currentColor" opacity="0.55" />
      <circle cx="96" cy="54" r="3" fill="currentColor" opacity="0.55" />
      <circle cx="84" cy="68" r="3" fill="currentColor" opacity="0.55" />
      <circle cx="78" cy="84" r="3" fill="currentColor" opacity="0.55" />
      <circle cx="90" cy="84" r="3" fill="currentColor" opacity="0.55" />
      <line x1="84" y1="30" x2="84" y2="66" stroke="currentColor" strokeWidth="1.7" opacity="0.55" />
      <line x1="84" y1="42" x2="72" y2="54" stroke="currentColor" strokeWidth="1.7" opacity="0.55" />
      <line x1="84" y1="42" x2="96" y2="54" stroke="currentColor" strokeWidth="1.7" opacity="0.55" />
      <line x1="84" y1="66" x2="78" y2="84" stroke="currentColor" strokeWidth="1.7" opacity="0.55" />
      <line x1="84" y1="66" x2="90" y2="84" stroke="currentColor" strokeWidth="1.7" opacity="0.55" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070a0f] text-zinc-100">
      <div className="mx-auto flex w-full max-w-full gap-4 px-3 py-3 md:px-4 md:py-4">
        <DashboardSidebar active="overview" />

        <section className="min-w-0 flex-1 rounded-2xl border border-zinc-900 bg-[#090c13]/90 p-4 md:p-6">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-500">Good morning, Maria</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Barangay Overview
              </h1>
            </div>
            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-400">
              Brgy. Burnham, Baguio City
            </div>
          </header>

          <div className="mb-6 grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_0.85fr_1.05fr]">
            <article className="relative overflow-hidden rounded-3xl border border-lime-500/20 bg-linear-to-tr from-[#131a2a] via-[#1b2b15] to-[#121728] p-5">
              <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-72 rotate-12 bg-lime-400/25 blur-3xl" />
              <p className="text-sm text-zinc-400">Active Cameras</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-6xl font-bold leading-none text-zinc-100">3</span>
                <span className="pb-1 text-2xl text-zinc-500">/4</span>
              </div>
              <p className="mt-3 text-sm font-medium text-lime-300">All systems nominal</p>
            </article>

            <article className="rounded-3xl border border-red-500/20 bg-[#141520] p-5">
              <p className="text-sm text-zinc-400">Unresolved Alerts</p>
              <p className="mt-2 text-6xl font-bold leading-none text-red-400">2</p>
              <p className="mt-3 text-sm text-zinc-500">Requires immediate action</p>
            </article>

            <div className="grid gap-3">
              <article className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
                <p className="text-sm text-zinc-500">This Week</p>
                <p className="mt-2 text-4xl font-bold leading-none text-zinc-100">7</p>
                <p className="mt-2 text-sm text-zinc-400">incidents</p>
              </article>
              <article className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
                <p className="text-sm text-zinc-500">Response Rate</p>
                <p className="mt-2 text-4xl font-bold leading-none text-zinc-100">94%</p>
                <p className="mt-2 text-sm font-medium text-lime-300">Excellent</p>
              </article>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.85fr_0.95fr]">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Live Feeds</h2>
                <p className="text-xs text-zinc-500">Pose estimation · Privacy mode active</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {cameraCards.map((camera) => (
                  <article
                    key={camera.id}
                    className={`overflow-hidden rounded-3xl border bg-[#090c14] ${
                      camera.status === "ALERT"
                        ? "border-red-500/30"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="relative flex h-56 items-center justify-center bg-[#060912]">
                      {camera.status === "ALERT" && (
                        <div className="absolute inset-8 rounded-full border border-red-500/20" />
                      )}

                      {camera.status === "OFF" ? (
                        <p className="text-sm text-zinc-600">No Signal</p>
                      ) : (
                        <PoseNodes />
                      )}

                      <div className="absolute left-3 top-3">
                        <StatusBadge status={camera.status} />
                      </div>
                      <p className="absolute right-3 top-3 text-[11px] text-zinc-600">{camera.id}</p>
                      <p className="absolute bottom-3 left-3 text-xs text-zinc-500">
                        {camera.detected} detected
                      </p>
                    </div>

                    <div className="border-t border-zinc-800 bg-zinc-900/70 px-4 py-3">
                      <p className="text-base font-semibold text-zinc-100">{camera.title}</p>
                      <p className="text-sm text-zinc-500">{camera.subtitle}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Alert Feed</h2>
                <p className="text-xs text-zinc-500">Live</p>
              </div>

              <div className="space-y-3">
                {alertItems.map((alert) => {
                  const toneClass =
                    alert.tone === "critical"
                      ? "border-red-500/30 bg-red-950/30"
                      : alert.tone === "warn"
                        ? "border-amber-500/25 bg-amber-950/20"
                        : "border-zinc-800 bg-zinc-900/70"

                  const titleClass =
                    alert.tone === "critical"
                      ? "text-red-300"
                      : alert.tone === "warn"
                        ? "text-amber-300"
                        : "text-lime-300"

                  return (
                    <article key={`${alert.title}-${alert.time}`} className={`rounded-2xl border p-4 ${toneClass}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-lg font-semibold ${titleClass}`}>{alert.title}</p>
                          <p className="text-sm text-zinc-500">{alert.location}</p>
                          <span className="mt-2 inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-400">
                            {alert.confidence}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{alert.time}</p>
                      </div>

                      {alert.tone === "critical" && (
                        <button className="mt-4 w-full rounded-xl bg-red-700/80 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors">
                          Respond Now
                        </button>
                      )}
                    </article>
                  )
                })}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
