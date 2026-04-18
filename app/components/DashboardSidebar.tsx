import Link from "next/link"

type SidebarKey = "overview" | "incidents" | "cameras" | "analytics"

type DashboardSidebarProps = {
  active: SidebarKey
}

export default function DashboardSidebar({ active }: DashboardSidebarProps) {
  const itemClass = (key: SidebarKey) =>
    key === active
      ? "bg-white/6 text-white ring-1 ring-white/8"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"

  return (
    <aside className="hidden w-55 shrink-0 flex-col rounded-2xl border border-zinc-900 bg-[#090d14] p-4 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400/95 text-black">
          <div className="h-3 w-3 rounded-full border-2 border-black" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none">BrgyEye</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-lime-400">Online</p>
        </div>
      </div>

      <nav className="space-y-1 text-sm">
        <Link href="/" className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 ${itemClass("overview")}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${active === "overview" ? "bg-lime-400" : "bg-zinc-600"}`} />
          Overview
        </Link>

        <Link
          href="/incidents"
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 ${itemClass("incidents")}`}
        >
          <span>Incidents</span>
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">2</span>
        </Link>

        <Link href="/cameras" className={`flex w-full items-center rounded-xl px-3 py-2.5 ${itemClass("cameras")}`}>
          Cameras
        </Link>

        <button
          type="button"
          className={`flex w-full items-center rounded-xl px-3 py-2.5 cursor-default ${itemClass("analytics")}`}
        >
          Analytics
        </button>
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-lime-500/20 bg-linear-to-br from-lime-500/20 via-lime-300/5 to-transparent p-4">
          <p className="text-sm font-semibold text-lime-300">Privacy-First</p>
          <p className="mt-1 text-xs text-zinc-300/80">No faces captured. Pose keypoints only.</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
          <p className="text-sm font-semibold">Maria Reyes</p>
          <p className="text-xs text-zinc-500">BHW - Brgy. Burnham</p>
        </div>
      </div>
    </aside>
  )
}