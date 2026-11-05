"use client"

import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@paneui/ui/components/alert"
import { CodeBlock, CodeGroup } from "@paneui/ui/components/code-block"

import { installBun, installNpm, installPnpm, policy } from "./code"
import type { OutlineItem } from "@paneui/ui/components/outline"

export const toc: OutlineItem[] = [
  { id: "how-it-works", title: "How approvals work", depth: 2 },
  { id: "risk-levels", title: "Risk levels", depth: 3 },
  { id: "configure", title: "Configure a policy", depth: 2 },
  { id: "install-cli", title: "Install the CLI", depth: 3 },
  { id: "policy-file", title: "Write tessel.toml", depth: 3 },
  { id: "remembered", title: "Remembered decisions", depth: 2 },
  { id: "audit", title: "Auditing decisions", depth: 2 },
]

/**
 * Article body. Long-form text uses `typeset typeset-docs`; components inside carry `not-typeset`.
 * It fills the article column, so the title, the prose, the callouts and the pager share one right edge.
 */
export function Article() {
  return (
    <div className="typeset typeset-docs max-w-none">
      <p>
        Tessel runs every session in a sandbox, but some actions reach outside it: pushing a branch, opening a pull request, calling a
        paid API. Approval policies decide which of those run on their own, which wait for a person and which are never allowed.
      </p>
      <p>
        Policies live in <code>tessel.toml</code> next to your code, so they are reviewed like any other change. Workspace admins can
        add an org-wide floor that repositories can tighten but never loosen.
      </p>

      <h2 id="how-it-works">How approvals work</h2>
      <p>
        Before a tool call leaves the sandbox, Tessel matches it against your rules from top to bottom. The first rule that matches
        wins. When nothing matches, the <code>default</code> applies.
      </p>
      <ol>
        <li>The agent proposes a call with its exact arguments.</li>
        <li>Tessel looks up the decision for that tool and those arguments.</li>
        <li>
          An <strong>ask</strong> decision pauses the session and shows an approval card in the workspace, Slack and the PR thread.
        </li>
      </ol>

      <div className="not-typeset">
        <Alert variant="info">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Sessions keep working while they wait</AlertTitle>
            <AlertDescription>A pending approval only blocks the step that needs it. Tessel continues with independent steps of the plan.</AlertDescription>
          </AlertContent>
        </Alert>
      </div>

      <h3 id="risk-levels">Risk levels</h3>
      <p>Each built-in tool carries a risk level that sets how the approval card looks and who may approve it.</p>
      <table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Examples</th>
            <th>Who can approve</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Low</td>
            <td>Read files, run tests</td>
            <td>Anyone on the repo</td>
          </tr>
          <tr>
            <td>Medium</td>
            <td>Push a branch, open a PR</td>
            <td>Session owner</td>
          </tr>
          <tr>
            <td>High</td>
            <td>Delete files, force-push, paid APIs</td>
            <td>Repo maintainers</td>
          </tr>
        </tbody>
      </table>

      <h2 id="configure">Configure a policy</h2>
      <p>You need the CLI to validate a policy locally before you commit it.</p>

      <h3 id="install-cli">Install the CLI</h3>
      <div className="not-typeset">
        <CodeGroup storageKey="package-manager">
          <CodeBlock title="pnpm" language="bash" html={installPnpm} />
          <CodeBlock title="npm" language="bash" html={installNpm} />
          <CodeBlock title="bun" language="bash" html={installBun} />
        </CodeGroup>
      </div>

      <h3 id="policy-file">Write tessel.toml</h3>
      <p>
        This policy lets Tessel run tests and builds freely, asks before anything touches <code>main</code> and blocks destructive
        shell commands outright.
      </p>
      <div className="not-typeset">
        <CodeBlock title="tessel.toml" language="toml" html={policy} lineNumbers maxHeight={560} />
      </div>
      <p>
        Check it with <code>tessel policy check</code>. The command prints each rule with the calls from your last ten sessions it
        would have matched.
      </p>

      <div className="not-typeset">
        <Alert variant="warning">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Order matters</AlertTitle>
            <AlertDescription>Put deny rules above broad allow rules. A later deny never overrides an earlier allow.</AlertDescription>
          </AlertContent>
        </Alert>
      </div>

      <h2 id="remembered">Remembered decisions</h2>
      <p>
        Choosing <strong>Always allow</strong> on an approval card writes a remembered rule scoped to the repository and tool. You can
        review and revoke remembered rules under <a href="#">Settings → Approvals</a>.
      </p>
      <blockquote>
        <p>Remembered rules never apply to high-risk tools. Those ask every time, by design.</p>
      </blockquote>

      <h2 id="audit">Auditing decisions</h2>
      <p>
        Every decision is recorded with the approver, the arguments and the policy line that matched. Export the log as CSV, or stream
        it to your SIEM with the <a href="#">audit webhook</a>.
      </p>
      <ul>
        <li>Logs are kept for 400 days on Team and indefinitely on Enterprise.</li>
        <li>Denied calls include the agent&apos;s next step, so you can see how it recovered.</li>
      </ul>
    </div>
  )
}
