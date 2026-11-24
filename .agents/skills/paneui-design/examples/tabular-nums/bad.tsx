// Proportional digits: "111" is narrower than "888", so the label jumps while it counts.
export function UploadProgress({ progress, total }: { progress: number; total: number }) {
  return (
    <p className="text-ui text-muted-foreground">
      {progress} of {total} files
    </p>
  )
}
