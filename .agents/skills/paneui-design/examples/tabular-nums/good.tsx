// Changing numbers sit on equal-width digits, so the row doesn't shift as they tick.
export function UploadProgress({ progress, total }: { progress: number; total: number }) {
  return (
    <p className="text-ui text-muted-foreground tabular-nums">
      {progress} of {total} files
    </p>
  )
}
