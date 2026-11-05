import { CodeBlock, CodeGroup } from "@paneui/ui/components/code-block"

const ts = "<pre class=\"code-syntax\"><code><span class=\"line\"><span style=\"color:color-mix(in oklab, var(--chart-5) 65%, var(--foreground))\">import </span>{ <span style=\"color:color-mix(in oklab, var(--chart-3) 65%, var(--foreground))\">Button </span>} <span style=\"color:color-mix(in oklab, var(--chart-5) 65%, var(--foreground))\">from </span><span style=\"color:color-mix(in oklab, var(--success) 65%, var(--foreground))\">&quot;@/components/ui/button&quot;</span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color:color-mix(in oklab, var(--chart-5) 65%, var(--foreground))\">export default function </span><span style=\"color:color-mix(in oklab, var(--chart-3) 65%, var(--foreground))\">Page</span>() {</span>\n<span class=\"line\">  <span style=\"color:color-mix(in oklab, var(--chart-5) 65%, var(--foreground))\">return </span>&lt;<span style=\"color:color-mix(in oklab, var(--success) 65%, var(--foreground))\">Button</span>&gt;Deploy&lt;/<span style=\"color:color-mix(in oklab, var(--success) 65%, var(--foreground))\">Button</span>&gt;</span>\n<span class=\"line\">}</span></code></pre>"
const css = "<pre class=\"code-syntax\"><code><span class=\"line\"><span style=\"color:color-mix(in oklab, var(--chart-5) 65%, var(--foreground))\">@import </span><span style=\"color:color-mix(in oklab, var(--success) 65%, var(--foreground))\">&quot;tailwindcss&quot;</span>;</span>\n<span class=\"line\"><span style=\"color:color-mix(in oklab, var(--chart-5) 65%, var(--foreground))\">@import </span><span style=\"color:color-mix(in oklab, var(--success) 65%, var(--foreground))\">&quot;./typeset.css&quot;</span>;</span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color:color-mix(in oklab, var(--chart-3) 65%, var(--foreground))\">:root </span>{</span>\n<span class=\"line\">  --radius: <span style=\"color:color-mix(in oklab, var(--chart-1) 65%, var(--foreground))\">0.625rem</span>;</span>\n<span class=\"line\">}</span></code></pre>"

export default function CodeBlockRememberTab() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <CodeGroup storageKey="example-code-group">
        <CodeBlock title="TypeScript" language="tsx" html={ts} />
        <CodeBlock title="CSS" language="css" html={css} />
      </CodeGroup>
      <CodeGroup storageKey="example-code-group">
        <CodeBlock title="TypeScript" language="tsx" html={ts} />
        <CodeBlock title="CSS" language="css" html={css} />
      </CodeGroup>
    </div>
  )
}
