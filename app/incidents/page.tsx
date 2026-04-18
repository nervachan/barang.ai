import DashboardSidebar from "../components/DashboardSidebar"

type IncidentStatus = "Unresolved" | "Monitoring" | "Resolved" | "False Alarm"

type IncidentItem = {
  title: string
  location: string
  status: IncidentStatus
  confidence: number
  responseTime: string
  assignee: string
  loggedAt: string
}

const incidents: IncidentItem[] = [
  {
    title: "Fall Detected",
    location: "Covered Court - CAM-02",
    status: "Unresolved",
    confidence: 91,
    responseTime: "-",
    assignee: "-",
    loggedAt: "Today, 10:38 AM",
  },
  {
    title: "Crowd Anomaly",
    location: "Covered Court - CAM-02",
    status: "Monitoring",
    confidence: 78,
    responseTime: "-",
    assignee: "-",
    loggedAt: "Today, 10:35 AM",
  },
  {
    title: "Fall Detected",
    location: "BHC Waiting Area - CAM-01",
    status: "Resolved",
    confidence: 95,
    responseTime: "2m 14s",
    assignee: "J. Santos",
    loggedAt: "Today, 09:12 AM",
  },
  {
    title: "Fall Detected",
    location: "Senior Citizen Center - CAM-03",
    status: "Resolved",
    confidence: 88,
    responseTime: "1m 52s",
    assignee: "M. Reyes",
    loggedAt: "Apr 15, 4:47 PM",
  },
  {
    title: "After-Hours Entry",
    location: "Covered Court - CAM-02",
    status: "Resolved",
    confidence: 82,
    responseTime: "5m 30s",
    assignee: "Tanod Patrol",
    loggedAt: "Apr 14, 9:02 PM",
  },
  {
    title: "Fall Detected",
    location: "BHC Waiting Area - CAM-01",
    status: "Resolved",
    confidence: 93,
    responseTime: "1m 45s",
    assignee: "J. Santos",
    loggedAt: "Apr 13, 2:19 PM",
  },
  {
    title: "Crowd Anomaly",
    location: "Covered Court - CAM-02",
    status: "False Alarm",
    confidence: 65,
    responseTime: "-",
    assignee: "System",
    loggedAt: "Apr 12, 6:30 PM",
  },
]

function statusPillClass(status: IncidentStatus) {
  if (status === "Unresolved") return "bg-red-500/18 text-red-300"
  if (status === "Monitoring") return "bg-amber-500/18 text-amber-300"
  if (status === "Resolved") return "bg-lime-500/18 text-lime-300"
  return "bg-zinc-700/45 text-zinc-300"
}

function rowToneClass(status: IncidentStatus) {
  if (status === "Unresolved") return "border-red-500/30 bg-linear-to-r from-red-950/45 to-zinc-900/85"
  if (status === "Monitoring") return "border-amber-500/22 bg-linear-to-r from-amber-950/20 to-zinc-900/85"
  return "border-zinc-800 bg-zinc-900/70"
}

export default function IncidentsPage() {
  return (
    <main className="min-h-screen bg-[#070a0f] text-zinc-100">
      <div className="mx-auto flex w-full max-w-full gap-4 px-3 py-3 md:px-4 md:py-4">
        <DashboardSidebar active="incidents" />

        <section className="min-w-0 flex-1 rounded-2xl border border-zinc-900 bg-[#090c13]/90 p-4 md:p-6">
          <header className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Incidents</h1>
              <p className="mt-2 text-sm text-zinc-500">
                7 total <span className="text-zinc-700">|</span>{" "}
                <span className="text-red-400">1 unresolved</span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-400">
                Brgy. Burnham, Baguio City
              </div>
              <button className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                Export
              </button>
            </div>
          </header>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="flex w-full max-w-md items-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400">
              <span className="mr-2">⌕</span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-600 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button className="rounded-full bg-lime-500/22 px-3 py-1.5 font-medium text-lime-300 ring-1 ring-lime-500/25">
                All
              </button>
              <button className="rounded-full px-3 py-1.5 text-zinc-500 hover:text-zinc-300">Unresolved</button>
              <button className="rounded-full px-3 py-1.5 text-zinc-500 hover:text-zinc-300">Monitoring</button>
              <button className="rounded-full px-3 py-1.5 text-zinc-500 hover:text-zinc-300">Resolved</button>
              <button className="rounded-full px-3 py-1.5 text-zinc-500 hover:text-zinc-300">False Alarm</button>
            </div>
          </div>

          <div className="space-y-2.5">
            {incidents.map((incident) => (
              <article
                key={`${incident.title}-${incident.loggedAt}`}
                className={`grid grid-cols-1 gap-3 rounded-2xl border px-4 py-3 md:grid-cols-[minmax(270px,1.6fr)_0.5fr_0.5fr_0.7fr_0.7fr] md:items-center ${rowToneClass(incident.status)}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] ring-1 ${
                        incident.status === "Unresolved"
                          ? "bg-red-500/18 text-red-300 ring-red-500/30"
                          : incident.status === "Monitoring"
                            ? "bg-amber-500/18 text-amber-300 ring-amber-500/30"
                            : incident.status === "Resolved"
                              ? "bg-lime-500/18 text-lime-300 ring-lime-500/30"
                              : "bg-zinc-700/45 text-zinc-300 ring-zinc-600/45"
                      }`}
                    >
                      •
                    </span>

                    <p className="truncate text-lg font-semibold text-zinc-100">{incident.title}</p>

                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${statusPillClass(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>

                  <p className="mt-1 truncate pl-10 text-sm text-zinc-500">{incident.location}</p>
                </div>

                <div className="md:text-center">
                  <p className="text-xl font-semibold text-zinc-100">{incident.confidence}%</p>
                  <p className="text-xs text-zinc-500">conf</p>
                </div>

                <div className="md:text-center">
                  <p className="text-sm text-zinc-300">{incident.responseTime}</p>
                  <p className="text-xs text-zinc-500">response</p>
                </div>

                <div className="md:text-center">
                  <p className="text-sm text-zinc-400">{incident.assignee}</p>
                </div>

                <div className="md:text-right">
                  <p className="text-sm text-zinc-500">{incident.loggedAt}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}