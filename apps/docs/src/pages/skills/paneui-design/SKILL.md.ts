import fs from "node:fs"

import { repoPath } from "@/lib/repo-path"

// Raw download of the paneui-design agent skill. Single source: .agents/skills/paneui-design/SKILL.md
// (also what `npx skills add taimatsuorg/paneui --skill paneui-design` installs).
export const prerender = true

export function GET() {
  const body = fs.readFileSync(repoPath(".agents/skills/paneui-design/SKILL.md"), "utf8")
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } })
}
