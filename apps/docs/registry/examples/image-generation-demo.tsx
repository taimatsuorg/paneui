/* eslint-disable shadcn/no-raw-colors -- illustrative sunset artwork, not UI chrome (see .agents/skills/paneui-design/references/icons.md) */
"use client"

import * as React from "react"

import { Button } from "@paneui/ui/components/button"
import { ImageGeneration, type ImageGenerationStatus } from "@paneui/ui/components/image-generation"

/** Inline SVG artwork standing in for a generated image (no external assets). */
function Artwork() {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="presentation">
      <defs>
        <linearGradient id="ig-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="0.55" stopColor="#c2410c" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <radialGradient id="ig-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff7ed" />
          <stop offset="1" stopColor="#fdba74" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#ig-sky)" />
      <circle cx="270" cy="210" r="56" fill="url(#ig-sun)" />
      <path d="M0 260 L70 190 L130 240 L210 150 L290 250 L340 205 L400 245 V400 H0Z" fill="#7c2d12" opacity="0.85" />
      <path d="M0 300 L90 245 L170 290 L250 230 L330 285 L400 260 V400 H0Z" fill="#431407" />
      <path d="M0 340 C80 320 140 360 220 338 S340 330 400 345 V400 H0Z" fill="#1c0a03" />
    </svg>
  )
}

const SEQUENCE: { status: ImageGenerationStatus; progress: number; wait: number }[] = [
  { status: "queued", progress: 0, wait: 1400 },
  { status: "generating", progress: 0.12, wait: 700 },
  { status: "generating", progress: 0.32, wait: 800 },
  { status: "refining", progress: 0.58, wait: 800 },
  { status: "refining", progress: 0.84, wait: 900 },
  { status: "complete", progress: 1, wait: 0 },
]

export default function ImageGenerationDemo() {
  const [step, setStep] = React.useState(0)
  const [run, setRun] = React.useState(0)

  React.useEffect(() => {
    setStep(0)
    let i = 0
    let t: number
    const next = () => {
      if (i >= SEQUENCE.length - 1) return
      t = window.setTimeout(() => {
        i += 1
        setStep(i)
        next()
      }, SEQUENCE[i].wait)
    }
    next()
    return () => window.clearTimeout(t)
  }, [run])

  const current = SEQUENCE[step]

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3">
      <ImageGeneration
        status={current.status}
        progress={current.progress}
        queuePosition={2}
        prompt="Layered desert ridges at golden hour, warm haze, minimalist poster"
        meta="1024 × 1024 · 4 steps"
        alt="Stylised desert ridges under a glowing sun"
        onRetry={() => setRun((r) => r + 1)}
        onDownload={() => {}}
      >
        <Artwork />
      </ImageGeneration>
      {current.status === "complete" ? (
        <Button size="sm" variant="secondary" onClick={() => setRun((r) => r + 1)}>
          Replay
        </Button>
      ) : null}
    </div>
  )
}
