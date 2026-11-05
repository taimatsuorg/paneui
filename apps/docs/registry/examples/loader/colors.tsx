import { Loader } from "@paneui/ui/components/loader"

export default function LoaderColors() {
  return (
    <div className="flex items-center gap-6">
      <Loader variant="ring" className="text-primary-text" />
      <Loader variant="pulse" className="text-success-text" />
      <Loader variant="bars" className="text-warning-text" />
      <Loader variant="ripple" className="text-destructive-text" />
      <Loader variant="typing" className="text-muted-foreground" />
    </div>
  )
}
