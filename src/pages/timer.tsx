import { useEffect, useRef, useState } from "react"
import { generate3x3Scramble } from "../utils/scramble"

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(
    centiseconds,
  ).padStart(2, "0")}`
}

export default function TimerPage() {
  const [holding, setHolding] = useState(false)
  const [ready, setReady] = useState(false)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const holdTimeoutRef = useRef<number | null>(null)
  const holdingRef = useRef<boolean>(false)
  const readyRef = useRef<boolean>(false)
  const runningRef = useRef<boolean>(false)
  const [scramble, setScramble] = useState(() => generate3x3Scramble())

  // animation loop for the timer
  useEffect(() => {
    if (!running) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    function tick() {
      if (startRef.current != null) {
        setElapsed(Date.now() - startRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [running])

  // keep refs in sync with state so handlers (registered once) read live values
  useEffect(() => {
    holdingRef.current = holding
  }, [holding])

  useEffect(() => {
    readyRef.current = ready
  }, [ready])

  useEffect(() => {
    runningRef.current = running
  }, [running])

  // keyboard handlers (register once) — avoids effect cleanup clearing the hold timeout
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") e.preventDefault()

      // Press 'N' to generate a new scramble
      if (e.key === "n" || e.key === "N") {
        setScramble(generate3x3Scramble())
        return
      }

      // if running, any key stops the timer and shows a new scramble
      if (runningRef.current) {
        setRunning(false)
        setHolding(false)
        setReady(false)
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current)
          holdTimeoutRef.current = null
        }
        // generate a new scramble when stopping
        setScramble(generate3x3Scramble())
        return
      }

      if (e.code === "Space" && !holdingRef.current) {
        if (e.repeat) return
        setHolding(true)
        setReady(false)

        // after 500ms the indicator becomes ready (green)
        holdTimeoutRef.current = window.setTimeout(() => {
          setReady(true)
          holdTimeoutRef.current = null
        }, 500)
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        if (holdingRef.current) {
          if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current)
            holdTimeoutRef.current = null
          }

          if (readyRef.current) {
            startRef.current = Date.now()
            setElapsed(0)
            setRunning(true)
          }

          setHolding(false)
          setReady(false)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current)
        holdTimeoutRef.current = null
      }
    }
  }, [])

  const textColor = running ? "text-green-400" : ready ? "text-green-400" : holding ? "text-red-400" : "text-white"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-6">
        <div aria-live="polite" role="button" className="text-center">
          <div className="mb-4">
            <div className="mt-1 text-lg font-mono text-zinc-800 dark:text-zinc-200">{scramble}</div>
          </div>

          <div
            className={`text-8xl tracking-tight ${textColor}`}
            style={{ fontFamily: "'Nova Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace" }}
          >
            {formatTime(elapsed)}
          </div>
        </div>
      </div>
    </div>
  )
}
