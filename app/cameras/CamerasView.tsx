"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import DashboardSidebar from "../components/DashboardSidebar"

const BACKEND = "http://localhost:8000"
const WS_URL = "ws://localhost:8000/ws"

function playAlertSound() {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = "square"
  osc.frequency.setValueAtTime(880, ctx.currentTime)
  osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15)
  osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3)

  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.5)
}

type CameraCard = {
  id: string
  name: string
  mode: string
  status: "LIVE" | "ALERT" | "OFF"
  fps: string
  uptime: string
  persons: number
  lastEvent: string
}

const cameraCards: CameraCard[] = [
  {
    id: "CAM-01",
    name: "BHC Waiting Area",
    mode: "Fall Detection",
    status: "LIVE",
    fps: "28",
    uptime: "99.8%",
    persons: 3,
    lastEvent: "Today",
  },
  {
    id: "CAM-02",
    name: "Covered Court",
    mode: "Crowd Monitor",
    status: "ALERT",
    fps: "26",
    uptime: "97.2%",
    persons: 8,
    lastEvent: "Today",
  },
  {
    id: "CAM-03",
    name: "Senior Citizen Center",
    mode: "Fall Detection",
    status: "LIVE",
    fps: "30",
    uptime: "99.5%",
    persons: 2,
    lastEvent: "Apr 15",
  },
  {
    id: "CAM-04",
    name: "Main Gate",
    mode: "Presence Detection",
    status: "OFF",
    fps: "-",
    uptime: "82.1%",
    persons: 0,
    lastEvent: "Apr 14",
  },
]

function statusClass(status: CameraCard["status"]) {
  if (status === "LIVE") return "bg-lime-500/20 text-lime-300 ring-lime-500/30"
  if (status === "ALERT") return "bg-red-500/20 text-red-300 ring-red-500/30"
  return "bg-zinc-500/20 text-zinc-400 ring-zinc-500/30"
}

function PoseNodes({ faint = false }: { faint?: boolean }) {
  const opacity = faint ? "opacity-35" : ""
  return (
    <svg viewBox="0 0 120 120" className={`h-15 w-15 text-lime-400/90 ${opacity}`} aria-hidden>
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
    </svg>
  )
}

function CameraCardShell({
  card,
  children,
}: {
  card: CameraCard
  children: React.ReactNode
}) {
  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-[#090d14] ${
        card.status === "ALERT" ? "border-red-500/35" : "border-zinc-800"
      }`}
    >
      <div className="relative h-74 overflow-hidden border-b border-zinc-800 bg-[#060a12]">
        <div className="absolute left-3 top-3 z-10">
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-wider ring-1 ${statusClass(card.status)}`}>
            {card.status}
          </span>
        </div>
        <p className="absolute right-3 top-3 z-10 text-[11px] text-zinc-600">{card.id}</p>
        <p className="absolute bottom-3 left-3 z-10 text-xs text-zinc-600">Privacy Mode</p>
        {children}
      </div>

      <div className="bg-linear-to-r from-zinc-900/90 to-zinc-900/60 px-5 py-4">
        <p className="text-3xl font-semibold tracking-tight text-zinc-100">{card.name}</p>
        <p className="mt-1 text-base text-zinc-500">{card.mode}</p>

        <div className="mt-4 grid grid-cols-4 gap-3 border-t border-zinc-800 pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-600">FPS</p>
            <p className="mt-1 text-xl font-semibold text-zinc-200">{card.fps}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-600">Uptime</p>
            <p className="mt-1 text-xl font-semibold text-lime-300">{card.uptime}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-600">Persons</p>
            <p className="mt-1 text-xl font-semibold text-zinc-200">{card.persons}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-600">Last Event</p>
            <p className="mt-1 text-xl font-semibold text-zinc-200">{card.lastEvent}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function CamerasView() {
  const [connected, setConnected] = useState(false)
  const [detected, setDetected] = useState(false)
  const [personsDetected, setPersonsDetected] = useState(3)
  const [lastEvent, setLastEvent] = useState("Today")
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const handleDetection = useCallback(() => {
    playAlertSound()
    setDetected(true)
    setPersonsDetected((n: number) => Math.min(9, n + 1))
    setLastEvent("Now")
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setDetected(false), 2500)
  }, [])

  useEffect(() => {
    let cancelled = false

    function connect() {
      if (cancelled) return
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => setConnected(true)
      ws.onclose = () => {
        setConnected(false)
        setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.type === "x_pose") handleDetection()
      }
    }

    connect()

    return () => {
      cancelled = true
      wsRef.current?.close()
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [handleDetection])

  const liveCard = {
    ...cameraCards[0],
    status: connected ? cameraCards[0].status : "OFF",
    persons: personsDetected,
    lastEvent,
  } as CameraCard

  const secondCard = cameraCards[1]
  const thirdCard = cameraCards[2]
  const fourthCard = cameraCards[3]

  return (
    <main className="min-h-screen bg-[#070a0f] text-zinc-100">
      <div className="mx-auto flex w-full max-w-full gap-4 px-3 py-3 md:px-4 md:py-4">
        <DashboardSidebar active="cameras" />

        <section className="min-w-0 flex-1 rounded-2xl border border-zinc-900 bg-[#090c13]/90 p-4 md:p-6">
          <header className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Cameras</h1>
              <p className="mt-2 text-sm text-zinc-500">3 online · 1 offline</p>
            </div>

            <div className="rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-400">
              Brgy. Burnham, Baguio City
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <CameraCardShell card={liveCard}>
              {/* MJPEG stream requires plain img; next/image does not support streaming source */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BACKEND}/video_feed`}
                alt="BHC Waiting Area live CCTV feed"
                className="h-full w-full object-cover opacity-90"
              />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#05080f] via-transparent to-[#05080f]/20" />

              {detected && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-xl border border-lime-400/40 bg-lime-500/20 px-4 py-2 text-sm font-semibold text-lime-200 shadow-xl shadow-lime-400/10">
                    Pose Detected
                  </div>
                </div>
              )}
            </CameraCardShell>

            <CameraCardShell card={secondCard}>
              <div className="absolute inset-0 flex items-center justify-center gap-6">
                <PoseNodes />
                <PoseNodes faint />
                <PoseNodes faint />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-red-950/8 to-transparent" />
            </CameraCardShell>

            <CameraCardShell card={thirdCard}>
              <div className="absolute inset-0 flex items-center justify-center gap-8">
                <PoseNodes />
                <PoseNodes faint />
              </div>
            </CameraCardShell>

            <CameraCardShell card={fourthCard}>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg text-zinc-600">Camera Offline</p>
              </div>
            </CameraCardShell>
          </div>
        </section>
      </div>
    </main>
  )
}