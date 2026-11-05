"use client"

import * as React from "react"

import { TextCascade } from "@paneui/ui/components/text-cascade"

const VERBS = ["Plan", "Book", "Track", "Relax"]

export default function TextCascadeHeadline() {
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % VERBS.length), 2200)
    return () => window.clearInterval(id)
  }, [])
  return (
    <h3 className="text-3xl font-semibold tracking-tight text-balance">
      <TextCascade text={VERBS[i]} className="text-primary-text" /> your next trip.
    </h3>
  )
}
