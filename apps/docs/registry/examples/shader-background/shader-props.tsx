import { ShaderBackground } from "@paneui/ui/components/shader-background"

export default function ShaderBackgroundShaderProps() {
  return (
    <div className="grid w-full max-w-lg grid-cols-2 gap-3">
      <ShaderBackground
        variant="grain-gradient"
        shaderProps={{ shape: "ripple", intensity: 0.5 }}
        className="flex h-40 items-end rounded-2xl p-3 shadow-surface"
      >
        <span className="rounded-control-sm bg-card/80 px-2.5 py-0.5 text-xs font-medium shadow-chip">shape: ripple</span>
      </ShaderBackground>
      <ShaderBackground
        variant="dot-orbit"
        shaderProps={{ size: 0.5, spreading: 0.6 }}
        shaderClassName="opacity-60"
        className="flex h-40 items-end rounded-2xl p-3 shadow-surface"
      >
        <span className="rounded-control-sm bg-card/80 px-2.5 py-0.5 text-xs font-medium shadow-chip">opacity-60 layer</span>
      </ShaderBackground>
    </div>
  )
}
