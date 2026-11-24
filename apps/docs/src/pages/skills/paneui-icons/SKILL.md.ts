import fs from "node:fs"

import { repoPath } from "@/lib/repo-path"

// Raw download of the paneui-icons agent skill. Single source: .agents/skills/paneui-icons/SKILL.md
// (also what `npx skills add taimatsuorg/paneui --skill paneui-icons` installs).
export const prerender = true

export function GET() {
  const body = fs.readFileSync(repoPath(".agents/skills/paneui-icons/SKILL.md"), "utf8")
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } })
}
