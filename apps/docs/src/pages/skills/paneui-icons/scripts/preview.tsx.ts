import fs from "node:fs"

import { repoPath } from "@/lib/repo-path"

// Raw download of the skill's preview script. Single source: .agents/skills/paneui-icons/scripts/preview.tsx
export const prerender = true

export function GET() {
  const body = fs.readFileSync(repoPath(".agents/skills/paneui-icons/scripts/preview.tsx"), "utf8")
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } })
}
