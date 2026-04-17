"use client"

import { useEffect, useRef, useState, useCallback } from "react"

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

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [detected, setDetected] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const handleDetection = useCallback(() => {
    playAlertSound()
    setAlertCount((n: number) => n + 1)
    setDetected(true)
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 p-6">
      <header className="flex flex-col items-center gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Automated Peril Alert</h1>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`h-2 w-2 rounded-full transition-colors ${
              connected ? "bg-green-400" : "bg-red-500"
            }`}
          />
          <span className="text-zinc-400">
            {connected ? "Backend connected" : "Reconnecting…"}
          </span>
        </div>
      </header>

      <div
        className={`relative w-full max-w-3xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden border-2 transition-colors duration-300 ${
          detected ? "border-green-400" : "border-zinc-800"
        }`}
      >
        {/* MJPEG stream — plain <img> required; next/image doesn't support streaming sources */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BACKEND}/video_feed`}
          alt="CCTV feed"
          className="w-full h-full object-contain"
        />

        {detected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-green-500 text-black font-black text-3xl px-8 py-4 rounded-2xl animate-pulse shadow-2xl">
              Pose Detected!
            </span>
          </div>
        )}
      </div>

      <p className="text-zinc-500 text-sm">
        Alerts triggered:{" "}
        <span className="font-mono text-white">{alertCount}</span>
      </p>

      <p className="text-xs text-zinc-600 max-w-sm text-center">
        Raise both arms and cross your wrists above your shoulders to trigger the
        alert. Set{" "}
        <code className="bg-zinc-800 px-1 rounded">RTSP_URL</code> on the
        backend to use a camera stream.
      </p>
    </div>
  )
}
