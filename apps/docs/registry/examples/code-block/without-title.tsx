import { CodeBlock } from "@paneui/ui/components/code-block"

const html = "<pre class=\"code-syntax\"><code><span class=\"line\"><span style=\"color:color-mix(in oklab, var(--chart-3) 65%, var(--foreground))\">mkdir </span>docs &amp;&amp; <span style=\"color:color-mix(in oklab, var(--chart-3) 65%, var(--foreground))\">cd </span>docs</span>\n<span class=\"line\"><span style=\"color:color-mix(in oklab, var(--chart-3) 65%, var(--foreground))\">npx </span>shadcn@latest init</span></code></pre>"

export default function CodeBlockWithoutTitle() {
  return <CodeBlock html={html} className="w-full max-w-lg" />
}
